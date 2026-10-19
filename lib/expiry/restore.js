import { eq, inArray } from "drizzle-orm";
import { EVENTS, trackEvent } from "@/lib/analytics";
import { urls } from "@/lib/db";
import { computeExpiresAt, getPlan } from "@/lib/plans";
import { invalidateCachedRedirect } from "@/lib/redirectCache";
import { ARCHIVE_REASONS, PLAN_RANK } from "./constants";

export function isPaidPlan(planId) {
  return planId === "pro" || planId === "business";
}

export function wasPaidActive(user) {
  if (!user || !isPaidPlan(user.plan)) {
    return false;
  }
  const status = user.paymentStatus;
  return status == null || status === "active" || status === "trialing";
}

/**
 * Checkout always applies the paid plan to existing links.
 * A subscription update applies it when billing becomes active, or when the
 * plan tier increases. A renewal of the same active plan does not.
 */
export function subscriptionMightRestore(nextPlan, nextStatus) {
  return isPaidPlan(nextPlan) && (nextStatus === "active" || nextStatus === "trialing");
}

export function shouldRestoreOnUpgrade({ source, previousUser, nextPlan, nextStatus }) {
  if (!isPaidPlan(nextPlan)) {
    return false;
  }
  if (source === "checkout") {
    return true;
  }
  if (source !== "subscription") {
    return false;
  }
  if (nextStatus !== "active" && nextStatus !== "trialing") {
    return false;
  }
  if (!previousUser?.id) {
    return false;
  }
  if (!wasPaidActive(previousUser)) {
    return true;
  }
  return (PLAN_RANK[nextPlan] || 0) > (PLAN_RANK[previousUser.plan] || 0);
}

/**
 * Decide what an upgrade does to one link.
 * Expired archives come back. Live links with an expiry are extended when the
 * new plan default is later, so a pre-expiry upgrade actually keeps them working.
 * User and admin archives, legacy archives with no reason, and never-expire links stay as they are.
 */
export function upgradeLinkPatch(link, userId, expiresAt) {
  if (!link || link.userId !== userId || link.isAnonymous) {
    return null;
  }

  if (link.archiveReason === ARCHIVE_REASONS.user || link.archiveReason === ARCHIVE_REASONS.admin) {
    return null;
  }

  if (link.archiveReason === ARCHIVE_REASONS.expired) {
    return { restored: true, expiresAt };
  }

  if (link.archivedAt) {
    return null;
  }

  if (!link.expiresAt) {
    return null;
  }

  const current = new Date(link.expiresAt);
  if (Number.isNaN(current.getTime()) || current >= expiresAt) {
    return null;
  }

  return { extended: true, expiresAt };
}

const linkColumns = {
  id: urls.id,
  shortCode: urls.shortCode,
  userId: urls.userId,
  expiresAt: urls.expiresAt,
  archivedAt: urls.archivedAt,
  archiveReason: urls.archiveReason,
  isAnonymous: urls.isAnonymous,
};

export async function restoreLinksAfterUpgrade(db, userId, planId, deps = {}) {
  const plan = getPlan(planId);
  if (!isPaidPlan(plan.id)) {
    return { count: 0, extended: 0 };
  }

  const expiresAt = computeExpiresAt(plan.defaultExpiryDays);
  const invalidate = deps.invalidate || invalidateCachedRedirect;
  const track = deps.track || trackEvent;

  const rows = await db.select(linkColumns).from(urls).where(eq(urls.userId, userId));
  const restored = [];
  const extended = [];

  for (const row of rows) {
    const patch = upgradeLinkPatch(row, userId, expiresAt);
    if (!patch) {
      continue;
    }
    if (patch.restored) {
      restored.push(row);
    } else {
      extended.push(row);
    }
  }

  if (restored.length > 0) {
    await db
      .update(urls)
      .set({ archivedAt: null, archiveReason: null, expiresAt })
      .where(inArray(urls.id, restored.map((row) => row.id)));
  }

  if (extended.length > 0) {
    await db
      .update(urls)
      .set({ expiresAt })
      .where(inArray(urls.id, extended.map((row) => row.id)));
  }

  const touched = [...restored, ...extended];
  await Promise.all(touched.map((row) => invalidate(row.shortCode)));

  if (restored.length > 0) {
    await track(EVENTS.restoreAfterUpgrade, { count: restored.length });
  }

  return { count: restored.length, extended: extended.length };
}
