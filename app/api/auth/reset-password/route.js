import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(request) {
  const { email } = await request.json();
  const client = await clientPromise;
  const db = client.db("urlShortener");

  // Generate a unique token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpires = Date.now() + 3600000;

  try {
    // Update user with reset token and expiration
    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires,
        },
      }
    );

    if (result.matchedCount > 0) {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${resetToken}`;

      return NextResponse.json({
        message: "Password reset link sent to email",
      });
    } else {
      return NextResponse.json(
        { error: "No account with that email address exists." },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
export async function GET() {
  return new Response("Reset password route", { status: 200 });
}
