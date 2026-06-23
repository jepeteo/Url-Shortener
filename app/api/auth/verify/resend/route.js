import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb, users } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Email is already verified." });
  }

  const email = user.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "No email on file" }, { status: 400 });
  }

  if (!(await checkRateLimit(`verify-resend:${email}`, RATE_LIMITS.verifyResend))) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const verificationExpires = Date.now() + VERIFICATION_TTL_MS;

  await db
    .update(users)
    .set({ verificationToken, verificationExpires })
    .where(eq(users.id, user.id));

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${verificationToken}`;
  await sendVerificationEmail({ email, verifyUrl });

  return NextResponse.json({ message: "Verification email sent." });
}
