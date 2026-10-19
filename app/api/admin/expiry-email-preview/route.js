import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { expiryReminderTemplate } from "@/lib/email/templates/expiry-reminder";
import { EXPIRY_EMAIL_STAGE_LIST } from "@/lib/expiry/constants";

const AUDIENCES = new Set(["free", "pro", "business", "lapsed-pro", "lapsed-business"]);

function isAdmin(email) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const stage = url.searchParams.get("stage") || "upcoming";
  const audience = url.searchParams.get("audience") || "free";
  if (!EXPIRY_EMAIL_STAGE_LIST.includes(stage) || !AUDIENCES.has(audience)) {
    return NextResponse.json({ error: "Unknown stage or audience" }, { status: 400 });
  }

  const sample = expiryReminderTemplate({
    stage,
    audience,
    links: [
      {
        id: "preview",
        shortCode: "preview",
        originalUrl: "https://example.com/printed-qr",
        expiresAt: new Date("2026-11-01T12:00:00.000Z"),
      },
    ],
    unsubscribeUrl: "https://mikrouli.link/api/email/preferences?token=preview",
  });

  if (url.searchParams.get("format") === "text") {
    return new NextResponse(`Preview only. Nothing was sent.\n\n${sample.text}`, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(
    `<p style="font-family:sans-serif;padding:12px 16px;background:#fef3c7;">Preview only (${stage}, ${audience}). Nothing was sent.</p>${sample.html}`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
