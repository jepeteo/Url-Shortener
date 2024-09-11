
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { token, password } = await request.json();
  const client = await clientPromise;
  const db = client.db("urlShortener");

  try {
    const user = await db.collection("users").findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: "Password reset token is invalid or has expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined
        }
      }
    );

    return NextResponse.json({ message: "Password has been reset" });
  } catch (error) {
    console.error('Reset password confirmation error:', error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
