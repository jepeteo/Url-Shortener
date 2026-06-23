import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq } from "drizzle-orm";
import { getDb, urls } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isValidUuid } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { validateCsrf } from "@/lib/csrf";
import { invalidateCachedRedirect } from "@/lib/redirectCache";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid URL id" }, { status: 400 });
  }

  const db = getDb();
  const url = await db.query.urls.findFirst({
    where: and(eq(urls.id, id), eq(urls.userId, session.user.id)),
  });

  if (!url) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
  }

  return NextResponse.json(url);
}

export async function DELETE(request, { params }) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid URL id" }, { status: 400 });
  }

  if (
    !(await checkRateLimit(`delete:${session.user.id}`, RATE_LIMITS.deleteUrl))
  ) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const db = getDb();
  const url = await db.query.urls.findFirst({
    where: and(eq(urls.id, id), eq(urls.userId, session.user.id)),
  });

  if (!url) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
  }

  const deleted = await db
    .delete(urls)
    .where(and(eq(urls.id, id), eq(urls.userId, session.user.id)))
    .returning({ id: urls.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
  }

  await invalidateCachedRedirect(url.shortCode);

  return NextResponse.json({ message: "URL deleted successfully" });
}
