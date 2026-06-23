import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { count, desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb, clicks, urls, users } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();

  const [urlRows, userCount, clicksResult] = await Promise.all([
    db.select().from(urls).orderBy(desc(urls.createdAt)).limit(100),
    db.select({ count: count() }).from(users),
    db.select({ total: sql`coalesce(sum(${urls.clicks}), 0)` }).from(urls),
  ]);

  return NextResponse.json({
    stats: {
      users: userCount[0]?.count ?? 0,
      links: urlRows.length,
      totalClicks: Number(clicksResult[0]?.total ?? 0),
    },
    urls: urlRows,
  });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shortCode } = await request.json();
  const db = getDb();

  await db.delete(urls).where(eq(urls.shortCode, shortCode));
  await db.delete(clicks).where(eq(clicks.shortCode, shortCode));

  return NextResponse.json({ message: "Link removed" });
}
