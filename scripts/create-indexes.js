require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not defined in the environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

async function createIndexes() {
  try {
    await client.connect();
    const db = client.db("urlShortener");

    console.log("Creating index on shortCode field...");
    await db.collection("urls").createIndex({ shortCode: 1 }, { unique: true });

    console.log("Index created successfully");
  } finally {
    await client.close();
  }
}

createIndexes().catch(console.error);
