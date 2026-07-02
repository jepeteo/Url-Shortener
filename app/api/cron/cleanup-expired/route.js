import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
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

  const deleted = await db
    .delete(urls)
    .where(lt(urls.expiresAt, now))
    .returning({ shortCode: urls.shortCode });

  await Promise.all(
    deleted.map((row) => invalidateCachedRedirect(row.shortCode))
  );

  return NextResponse.json({ deleted: deleted.length });
}
