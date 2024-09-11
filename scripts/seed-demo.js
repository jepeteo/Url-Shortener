require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
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

    // Create demo user
    const hashedPassword = await bcrypt.hash("demopassword", 10);
    const demoUser = {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    };

    await db.collection("users").insertOne(demoUser);

    // Create sample shortened URLs
    const sampleUrls = [
      {
        originalUrl: "https://www.example.com",
        shortCode: "demo1",
        clicks: 10,
        userId: demoUser._id,
      },
      {
        originalUrl: "https://www.google.com",
        shortCode: "demo2",
        clicks: 5,
        userId: demoUser._id,
      },
      {
        originalUrl: "https://www.github.com",
        shortCode: "demo3",
        clicks: 15,
        userId: demoUser._id,
      },
    ];

    await db.collection("urls").insertMany(sampleUrls);

    console.log("Demo account and sample URLs created successfully");
  } finally {
    await client.close();
  }
}

seedDemo().catch(console.error);
