import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb, clicks, urls, users } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email) {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();

  const [
    userCount,
    linkCount,
    clicksResult,
    unverifiedCount,
    zeroLinkUserCount,
    userRows,
    urlRows,
    clickRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(urls),
    db.select({ total: sql`coalesce(sum(${urls.clicks}), 0)` }).from(urls),
    db.select({ count: count() }).from(users).where(isNull(users.emailVerified)),
    db
      .select({ count: count() })
      .from(users)
      .where(
        sql`not exists (select 1 from ${urls} where ${urls.userId} = ${users.id})`
      ),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        plan: users.plan,
        emailVerified: users.emailVerified,
        githubId: users.githubId,
        createdAt: users.createdAt,
        linkCount: count(urls.id),
      })
      .from(users)
      .leftJoin(urls, eq(urls.userId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(200),
    db
      .select({
        id: urls.id,
        originalUrl: urls.originalUrl,
        shortCode: urls.shortCode,
        clicks: urls.clicks,
        isAnonymous: urls.isAnonymous,
        createdAt: urls.createdAt,
        expiresAt: urls.expiresAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(urls)
      .leftJoin(users, eq(urls.userId, users.id))
      .orderBy(desc(urls.createdAt))
      .limit(200),
    db
      .select({
        id: clicks.id,
        shortCode: clicks.shortCode,
        timestamp: clicks.timestamp,
        ip: clicks.ip,
        userAgent: clicks.userAgent,
        referer: clicks.referer,
      })
      .from(clicks)
      .orderBy(desc(clicks.timestamp))
      .limit(100),
  ]);

  const suspiciousUsers = userRows.filter(
    (user) => !user.emailVerified && Number(user.linkCount) === 0
  ).length;

  return NextResponse.json({
    stats: {
      users: userCount[0]?.count ?? 0,
      links: linkCount[0]?.count ?? 0,
      totalClicks: Number(clicksResult[0]?.total ?? 0),
      unverifiedUsers: unverifiedCount[0]?.count ?? 0,
      zeroLinkUsers: zeroLinkUserCount[0]?.count ?? 0,
      suspiciousUsers,
    },
    users: userRows,
    urls: urlRows,
    clicks: clickRows,
  });
}

export async function DELETE(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const db = getDb();

  if (body.userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, body.userId),
      columns: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (isAdmin(user.email)) {
      return NextResponse.json({ error: "Cannot delete admin user" }, { status: 403 });
    }

    const userUrls = await db
      .select({ id: urls.id })
      .from(urls)
      .where(eq(urls.userId, body.userId));

    const urlIds = userUrls.map((row) => row.id);
    if (urlIds.length > 0) {
      await db.delete(clicks).where(inArray(clicks.urlId, urlIds));
      await db.delete(urls).where(eq(urls.userId, body.userId));
    }

    await db.delete(users).where(eq(users.id, body.userId));
    return NextResponse.json({ message: "User removed" });
  }

  if (body.shortCode) {
    await db.delete(urls).where(eq(urls.shortCode, body.shortCode));
    await db.delete(clicks).where(eq(clicks.shortCode, body.shortCode));
    return NextResponse.json({ message: "Link removed" });
  }

  return NextResponse.json({ error: "shortCode or userId required" }, { status: 400 });
}
