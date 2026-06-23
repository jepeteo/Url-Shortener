import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { createShortUrl } from "@/lib/shorten";
import { getUserByApiKey } from "@/lib/apiKeys";

export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  const user = await getUserByApiKey(apiKey);

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "api";

  if (!(await checkRateLimit(`api:${user._id.toString()}`, { limit: 60, windowMs: 60_000 }))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const result = await createShortUrl({
    originalUrl: body.url,
    user: {
      id: user._id.toString(),
      plan: user.plan || "business",
    },
    alias: body.alias,
    expiryDays: body.expiryDays,
    utm: body.utm,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    shortUrl: result.shortUrl,
    shortCode: result.shortCode,
    expiresAt: result.expiresAt,
  });
}
