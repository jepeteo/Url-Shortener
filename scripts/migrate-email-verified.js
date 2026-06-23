/**
 * Backfill emailVerified for users created before verification was introduced.
 * Run once: npm run migrate-email-verified
 */
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("urlShortener");

  const result = await db.collection("users").updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: new Date() } }
  );

  console.log(`Updated ${result.modifiedCount} user(s) with emailVerified.`);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
