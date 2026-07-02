import { and, count, eq, gte } from "drizzle-orm";
import { getEffectivePlan } from "./billing";
import { getDb, urls } from "./db";
import { getPlan } from "./plans";
import { checkRateLimit } from "./rateLimit";

export const UNVERIFIED_LINK_LIMIT = 2;
export const ANONYMOUS_MONTHLY_LINK_CAP = 20;

function getMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getMonthlyLinkCount(userId) {
  const db = getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: count() })
    .from(urls)
    .where(and(eq(urls.userId, userId), gte(urls.createdAt, startOfMonth)));

  return result?.count ?? 0;
}

export function getEffectiveLinkLimit(user) {
  const plan = getPlan(getEffectivePlan(user));
  if (!Number.isFinite(plan.linksPerMonth)) {
    return plan.linksPerMonth;
  }
  if (!user?.emailVerified) {
    return UNVERIFIED_LINK_LIMIT;
  }
  return plan.linksPerMonth;
}

export async function canCreateLink(user) {
  if (!user?.id) {
    return { allowed: true, reason: null };
  }

  const plan = getPlan(getEffectivePlan(user));
  const limit = getEffectiveLinkLimit(user);

  if (!Number.isFinite(limit)) {
    return { allowed: true, reason: null, verified: Boolean(user.emailVerified) };
  }

  const linkCount = await getMonthlyLinkCount(user.id);
  if (linkCount >= limit) {
    const reason = user.emailVerified
      ? `Monthly link limit reached (${limit}). Upgrade your plan.`
      : `Unverified accounts are limited to ${UNVERIFIED_LINK_LIMIT} links per month. Verify your email to unlock ${plan.linksPerMonth} links.`;

    return {
      allowed: false,
      reason,
      count: linkCount,
      limit,
      verified: Boolean(user.emailVerified),
    };
  }

  return {
    allowed: true,
    reason: null,
    count: linkCount,
    limit,
    verified: Boolean(user.emailVerified),
  };
}

export async function canCreateAnonymousLink(ip) {
  if (!ip || ip === "unknown") {
    return { allowed: true, reason: null };
  }

  const monthKey = getMonthKey();
  const identifier = `anon-links:${ip}:${monthKey}`;
  const allowed = await checkRateLimit(identifier, {
    limit: ANONYMOUS_MONTHLY_LINK_CAP,
    windowMs: 31 * 24 * 60 * 60 * 1000,
  });

  if (!allowed) {
    return {
      allowed: false,
      reason: `Anonymous link limit reached (${ANONYMOUS_MONTHLY_LINK_CAP} per month). Create an account for more.`,
      limit: ANONYMOUS_MONTHLY_LINK_CAP,
    };
  }

  return { allowed: true, reason: null };
}
