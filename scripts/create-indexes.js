import clientPromise from "../lib/mongodb.js";

async function createIndexes() {
  const client = await clientPromise;
  const db = client.db("urlShortener");

  await db.collection("urls").createIndex({ shortCode: 1 }, { unique: true });
  await db.collection("urls").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("urls").createIndex({ shortCode: 1, expiresAt: 1 });
  await db.collection("urls").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: "date" } } }
  );
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("clicks").createIndex({ urlId: 1, timestamp: -1 });
  await db.collection("clicks").createIndex({ shortCode: 1, timestamp: -1 });

  console.log("Indexes created successfully");
  process.exit(0);
}

createIndexes().catch((error) => {
  console.error(error);
  process.exit(1);
});
