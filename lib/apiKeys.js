import crypto from "crypto";
import { and, eq } from "drizzle-orm";
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

  return db.query.users.findFirst({
    where: and(eq(users.apiKeyHash, keyHash), eq(users.plan, "business")),
  });
}
