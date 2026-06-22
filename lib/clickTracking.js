import clientPromise from "./mongodb";
import { isBotUserAgent } from "./bots";

export async function recordClick(urlEntry, request) {
  const userAgent = request.headers.get("user-agent") || "";
  if (isBotUserAgent(userAgent)) {
    return;
  }

  const clickData = {
    urlId: urlEntry._id,
    shortCode: urlEntry.shortCode,
    timestamp: new Date(),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent,
    referer: request.headers.get("referer") || null,
  };

  const client = await clientPromise;
  const db = client.db("urlShortener");

  await Promise.all([
    db.collection("urls").updateOne(
      { _id: urlEntry._id },
      {
        $inc: { clicks: 1 },
        $set: { lastClickedAt: new Date() },
      }
    ),
    db.collection("clicks").insertOne(clickData),
  ]);
}

export function recordClickAsync(urlEntry, request) {
  recordClick(urlEntry, request).catch((error) => {
    console.error("Failed to record click:", error);
  });
}
