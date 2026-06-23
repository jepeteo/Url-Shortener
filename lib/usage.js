import { and, count, eq, gte } from "drizzle-orm";
import { getDb, urls } from "./db";
import { getPlan } from "./plans";

export const UNVERIFIED_LINK_LIMIT = 2;

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
  const plan = getPlan(user?.plan || "free");
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

  const plan = getPlan(user.plan || "free");
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
