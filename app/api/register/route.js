import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(`register:${ip}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const existingUser = await db.collection("users").findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingUser) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await hash(password, 12);

  const result = await db.collection("users").insertOne({
    _id: new ObjectId(),
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    plan: "free",
    createdAt: new Date(),
  });

  return NextResponse.json({
    message: "User created successfully",
    userId: result.insertedId,
  });
}
