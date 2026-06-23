import { eq, sql } from "drizzle-orm";
import { getDb, urls, clicks } from "./db";
import { isBotUserAgent } from "./bots";

/**
 * Anonymizes an IP address for privacy/GDPR compliance by dropping host bits:
 * IPv4 keeps the /24 (last octet zeroed), IPv6 keeps the /48 (first 3 groups).
 */
export function anonymizeIp(ip) {
  if (!ip || ip === "unknown") {
    return "unknown";
  }
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
    return ip;
  }
  if (ip.includes(":")) {
    const groups = ip.split(":").filter(Boolean).slice(0, 3);
    return `${groups.join(":")}::`;
  }
  return ip;
}

export async function recordClick(urlEntry, request) {
  const userAgent = request.headers.get("user-agent") || "";
  if (isBotUserAgent(userAgent)) {
    return;
  }

  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const urlId = urlEntry.id ?? urlEntry._id;
  const db = getDb();

  await Promise.all([
    db
      .update(urls)
      .set({
        clicks: sql`${urls.clicks} + 1`,
        lastClickedAt: new Date(),
      })
      .where(eq(urls.id, urlId)),
    db.insert(clicks).values({
      urlId,
      shortCode: urlEntry.shortCode,
      ip: anonymizeIp(rawIp),
      userAgent,
      referer: request.headers.get("referer") || null,
    }),
  ]);
}

export function recordClickAsync(urlEntry, request) {
  recordClick(urlEntry, request).catch((error) => {
    console.error("Failed to record click:", error);
  });
}
