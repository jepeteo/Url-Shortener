require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not defined in the environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

async function seedDemo() {
  try {
    await client.connect();
    const db = client.db("urlShortener");

    const userId = new ObjectId();
    const hashedPassword = await bcrypt.hash("demopassword", 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const demoUser = {
      _id: userId,
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      plan: "free",
      emailVerified: new Date(),
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(demoUser);

    const sampleUrls = [
      {
        originalUrl: "https://www.example.com",
        shortCode: "demo1",
        clicks: 10,
        userId: userId.toString(),
        createdAt: new Date(),
        expiresAt,
        isAnonymous: false,
      },
      {
        originalUrl: "https://www.google.com",
        shortCode: "demo2",
        clicks: 5,
        userId: userId.toString(),
        createdAt: new Date(),
        expiresAt,
        isAnonymous: false,
      },
      {
        originalUrl: "https://www.github.com",
        shortCode: "demo3",
        clicks: 15,
        userId: userId.toString(),
        createdAt: new Date(),
        expiresAt,
        isAnonymous: false,
      },
    ];

    await db.collection("urls").insertMany(sampleUrls);

    console.log("Demo account and sample URLs created successfully");
  } finally {
    await client.close();
  }
}

seedDemo().catch(console.error);
