import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { getDb, urls } from "@/lib/db";

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
    .returning({ id: urls.id });

  return NextResponse.json({ deleted: deleted.length });
}
