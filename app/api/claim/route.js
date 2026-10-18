import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq, isNull } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb, urls } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { CREATOR_COOKIE_NAME, creatorTokenMatches } from "@/lib/creatorToken";

export async function POST(request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { shortCode } = await request.json();
  if (!shortCode) {
    return NextResponse.json({ error: "shortCode required" }, { status: 400 });
  }

  const db = getDb();
  const link = await db.query.urls.findFirst({
    where: and(
      eq(urls.shortCode, shortCode),
      isNull(urls.userId),
      eq(urls.isAnonymous, true),
      isNull(urls.archivedAt)
    ),
  });

  const cookie = request.cookies.get(CREATOR_COOKIE_NAME)?.value;
  if (!link || !creatorTokenMatches(cookie, link.creatorTokenHash)) {
    return NextResponse.json(
      { error: "Link not found or already claimed" },
      { status: 404 }
    );
  }

  const claimed = await db
    .update(urls)
    .set({
      userId: session.user.id,
      isAnonymous: false,
      claimedAt: new Date(),
      creatorTokenHash: null,
    })
    .where(and(eq(urls.id, link.id), isNull(urls.userId)))
    .returning({ id: urls.id });

  if (claimed.length === 0) {
    return NextResponse.json(
      { error: "Link not found or already claimed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Link claimed successfully" });
}
