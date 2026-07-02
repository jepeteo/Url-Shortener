import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getEffectivePlan, isBillingActive } from "./billing";
import { getDb, users } from "./db";

export function hashApiKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey() {
  return `mkl_${crypto.randomBytes(24).toString("hex")}`;
}

export async function getUserByApiKey(apiKey) {
  if (!apiKey) {
    return null;
  }

  const db = getDb();
  const keyHash = hashApiKey(apiKey);

  const user = await db.query.users.findFirst({
    where: eq(users.apiKeyHash, keyHash),
  });

  if (!user || !isBillingActive(user) || getEffectivePlan(user) !== "business") {
    return null;
  }

  return user;
}
