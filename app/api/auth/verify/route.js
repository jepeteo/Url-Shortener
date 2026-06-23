import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { getDb, users } from "@/lib/db";

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || typeof token !== "string") {
    return NextResponse.redirect(
      new URL("/auth/signin?error=invalid-token", request.url)
    );
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.verificationToken, token),
      gt(users.verificationExpires, Date.now())
    ),
  });

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=invalid-token", request.url)
    );
  }

  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      verificationToken: null,
      verificationExpires: null,
    })
    .where(eq(users.id, user.id));

  return NextResponse.redirect(new URL("/dashboard?verified=1", request.url));
}
