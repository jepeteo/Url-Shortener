import clientPromise from "./mongodb";
import { getPlan } from "./plans";

export async function getMonthlyLinkCount(userId) {
  const client = await clientPromise;
  const db = client.db("urlShortener");
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return db.collection("urls").countDocuments({
    userId,
    createdAt: { $gte: startOfMonth },
  });
}

export async function canCreateLink(user) {
  if (!user?.id) {
    return { allowed: true, reason: null };
  }

  const plan = getPlan(user.plan || "free");
  if (!Number.isFinite(plan.linksPerMonth)) {
    return { allowed: true, reason: null };
  }

  const count = await getMonthlyLinkCount(user.id);
  if (count >= plan.linksPerMonth) {
    return {
      allowed: false,
      reason: `Monthly link limit reached (${plan.linksPerMonth}). Upgrade your plan.`,
      count,
      limit: plan.linksPerMonth,
    };
  }

  return { allowed: true, reason: null, count, limit: plan.linksPerMonth };
}
