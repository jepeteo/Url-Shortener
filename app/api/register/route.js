import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import {
  isHoneypotTriggered,
  REGISTRATION_SUCCESS_MESSAGE,
  verifyTurnstile,
} from "@/lib/botProtection";
import { validateCsrf } from "@/lib/csrf";
import { getDb, users } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { sendVerificationEmail } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await checkRateLimit(`register:${ip}`, RATE_LIMITS.register))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();

  if (isHoneypotTriggered(body)) {
    return NextResponse.json({ message: REGISTRATION_SUCCESS_MESSAGE });
  }

  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }

  const { name, email, password } = body;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = email?.toLowerCase().trim();

  if (!trimmedName || !normalizedEmail || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (trimmedName.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (!(await checkRateLimit(`register:email:${normalizedEmail}`, RATE_LIMITS.registerEmail))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const db = getDb();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (existingUser) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await hash(password, 12);
  const verificationToken = crypto.randomBytes(20).toString("hex");
  const verificationExpires = Date.now() + VERIFICATION_TTL_MS;

  await db.insert(users).values({
    name: trimmedName,
    email: normalizedEmail,
    password: hashedPassword,
    plan: "free",
    emailVerified: null,
    verificationToken,
    verificationExpires,
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${verificationToken}`;
  try {
    await sendVerificationEmail({ email: normalizedEmail, verifyUrl });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  return NextResponse.json({
    message: REGISTRATION_SUCCESS_MESSAGE,
  });
}
