import { NextResponse } from "next/server";
import { and, isNull, lt } from "drizzle-orm";
import { getDb, urls } from "@/lib/db";
import { invalidateCachedRedirect } from "@/lib/redirectCache";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();

  const archived = await db
    .update(urls)
    .set({ archivedAt: now })
    .where(and(lt(urls.expiresAt, now), isNull(urls.archivedAt)))
    .returning({ shortCode: urls.shortCode });

  await Promise.all(
    archived.map((row) => invalidateCachedRedirect(row.shortCode))
  );

  return NextResponse.json({ archived: archived.length });
}
