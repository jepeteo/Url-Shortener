import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, count, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { getDb, urls } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const rawLimit = parseInt(searchParams.get("limit"), 10) || 10;
  const limit = Math.min(Math.max(1, rawLimit), 100);

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const db = getDb();
  const offset = (page - 1) * limit;
  const now = new Date();

  const [urlRows, activeResult, clicksResult, totalResult] = await Promise.all([
    db
      .select()
      .from(urls)
      .where(eq(urls.userId, userId))
      .orderBy(desc(urls.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(urls)
      .where(
        and(
          eq(urls.userId, userId),
          or(gt(urls.expiresAt, now), isNull(urls.expiresAt))
        )
      ),
    db
      .select({ totalClicks: sql`coalesce(sum(${urls.clicks}), 0)` })
      .from(urls)
      .where(eq(urls.userId, userId)),
    db.select({ count: count() }).from(urls).where(eq(urls.userId, userId)),
  ]);

  return NextResponse.json({
    urls: urlRows,
    total: totalResult[0]?.count ?? 0,
    activeLinks: activeResult[0]?.count ?? 0,
    totalClicks: Number(clicksResult[0]?.totalClicks ?? 0),
  });
}
