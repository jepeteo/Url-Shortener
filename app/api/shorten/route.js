import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { createShortUrl } from "@/lib/shorten";
import { getSessionUser } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

export async function POST(request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { url, alias, expiryDays, utm, anonymous } = body;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  let user = null;
  if (session) {
    user = await getSessionUser();
  }

  const rateLimitId = user?.id ? `shorten:user:${user.id}` : `shorten:${ip}`;
  if (!(await checkRateLimit(rateLimitId, RATE_LIMITS.shorten))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!session && !anonymous) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await createShortUrl({
    originalUrl: url,
    user,
    alias,
    expiryDays,
    utm,
    ip,
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
