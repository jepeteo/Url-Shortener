import crypto from "crypto";
import clientPromise from "./mongodb";

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

  const client = await clientPromise;
  const db = client.db("urlShortener");
  const keyHash = hashApiKey(apiKey);

  return db.collection("users").findOne({
    apiKeyHash: keyHash,
    plan: "business",
  });
}
