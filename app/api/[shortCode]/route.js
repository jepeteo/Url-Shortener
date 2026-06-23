import { NextResponse } from "next/server";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { getDb, urls } from "@/lib/db";
import { recordClickAsync } from "@/lib/clickTracking";
import {
  getCachedRedirect,
  setCachedRedirect,
} from "@/lib/redirectCache";

export async function GET(request, { params }) {
  const { shortCode } = await params;

  try {
    const cached = await getCachedRedirect(shortCode);
    if (cached) {
      recordClickAsync({ id: cached.urlId, shortCode }, request);
      return NextResponse.redirect(cached.originalUrl, 307);
    }

    const db = getDb();
    const now = new Date();

    const urlEntry = await db.query.urls.findFirst({
      where: and(
        eq(urls.shortCode, shortCode),
        or(gt(urls.expiresAt, now), isNull(urls.expiresAt))
      ),
    });

    if (urlEntry) {
      await setCachedRedirect(shortCode, urlEntry.originalUrl, urlEntry.id);
      recordClickAsync(urlEntry, request);

      const status = urlEntry.expiresAt === null ? 308 : 307;
      return NextResponse.redirect(urlEntry.originalUrl, status);
    }

    return NextResponse.redirect(
      new URL("/link-not-found", request.url).toString()
    );
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(
      new URL("/link-not-found", request.url).toString()
    );
  }
}
