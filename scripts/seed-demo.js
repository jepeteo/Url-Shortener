require("dotenv").config({ path: ".env.local" });
const bcrypt = require("bcryptjs");

async function seedDemo() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not defined in the environment variables");
    process.exit(1);
  }

  const { eq } = await import("drizzle-orm");
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { users, urls } = await import("../db/schema.js");

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema: { users, urls } });

  const existing = await db.query.users.findFirst({
    where: eq(users.email, "demo@example.com"),
  });

  if (existing) {
    console.log("Demo account already exists — skipping seed");
    return;
  }

  const hashedPassword = await bcrypt.hash("demopassword", 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const [demoUser] = await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      plan: "free",
      emailVerified: new Date(),
    })
    .returning({ id: users.id });

  await db.insert(urls).values([
    {
      originalUrl: "https://www.example.com",
      shortCode: "demo1",
      clicks: 10,
      userId: demoUser.id,
      expiresAt,
      isAnonymous: false,
    },
    {
      originalUrl: "https://www.google.com",
      shortCode: "demo2",
      clicks: 5,
      userId: demoUser.id,
      expiresAt,
      isAnonymous: false,
    },
    {
      originalUrl: "https://www.github.com",
      shortCode: "demo3",
      clicks: 15,
      userId: demoUser.id,
      expiresAt,
      isAnonymous: false,
    },
  ]);

  console.log("Demo account and sample URLs created successfully");
}

seedDemo().catch((error) => {
  console.error(error);
  process.exit(1);
});
