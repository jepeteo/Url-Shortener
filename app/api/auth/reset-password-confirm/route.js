import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { getDb, users } from "@/lib/db";

export async function POST(request) {
  const { token, password } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Password reset token is invalid or has expired" }, { status: 400 });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const db = getDb();

  try {
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.resetPasswordToken, token),
        gt(users.resetPasswordExpires, Date.now())
      ),
    });

    if (!user) {
      return NextResponse.json({ error: "Password reset token is invalid or has expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset password confirmation error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
