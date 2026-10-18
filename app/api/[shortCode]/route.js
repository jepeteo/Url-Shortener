import { linkNotFoundTarget } from "@/lib/abuseReport";
import { getDb } from "@/lib/db";
import { recordClickAsync } from "@/lib/clickTracking";
import { getCachedRedirect, setCachedRedirect } from "@/lib/redirectCache";
import { temporaryRedirect } from "@/lib/redirectResponse";
import { redirectableWhere } from "@/lib/urlVisibility";

export async function GET(request, { params }) {
  const { shortCode } = await params;

  try {
    const cached = await getCachedRedirect(shortCode);
    if (cached) {
      recordClickAsync({ id: cached.urlId, shortCode }, request);
      return temporaryRedirect(cached.originalUrl);
    }

    const db = getDb();
    const now = new Date();

    const urlEntry = await db.query.urls.findFirst({
      where: redirectableWhere(shortCode, now),
    });

    if (urlEntry) {
      await setCachedRedirect(
        shortCode,
        urlEntry.originalUrl,
        urlEntry.id,
        urlEntry.expiresAt
      );
      recordClickAsync(urlEntry, request);
      return temporaryRedirect(urlEntry.originalUrl);
    }

    return temporaryRedirect(linkNotFoundTarget(request.url, shortCode));
  } catch (error) {
    console.error("Redirect error:", error);
    return temporaryRedirect(linkNotFoundTarget(request.url, shortCode));
  }
}
