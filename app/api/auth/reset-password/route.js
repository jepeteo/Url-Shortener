import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!(await checkRateLimit(`reset:${normalizedEmail}`, RATE_LIMITS.resetPassword))) {
    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpires = Date.now() + 3600000;

  try {
    const result = await db.collection("users").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires,
        },
      }
    );

    if (result.matchedCount > 0) {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${resetToken}`;
      await sendPasswordResetEmail({ email: normalizedEmail, resetUrl });
    }

    return NextResponse.json({
      message: "If an account exists, a reset link was sent.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
