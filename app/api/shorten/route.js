import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { checkRateLimit } from "@/lib/rateLimit";
import { createShortUrl } from "@/lib/shorten";
import { getSessionUser } from "@/lib/auth";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { url, alias, expiryDays, utm, anonymous } = body;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await checkRateLimit(ip))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let user = null;
  if (session) {
    user = await getSessionUser();
  } else if (!anonymous) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await createShortUrl({
    originalUrl: url,
    user,
    alias,
    expiryDays,
    utm,
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
