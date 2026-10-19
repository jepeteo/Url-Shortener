import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import {
  preferenceResultHtml,
  preferenceUrl,
  verifyEmailPreference,
} from "@/lib/expiry/preferences";

function page(html, status = 200) {
  return new NextResponse(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

async function applyPreference(request) {
  const token = new URL(request.url).searchParams.get("token");
  const preference = verifyEmailPreference(token);
  if (!preference) {
    return page(
      "<!DOCTYPE html><html lang=\"en\"><body><p>This link is invalid.</p></body></html>",
      400
    );
  }

  const db = getDb();
  await db
    .update(users)
    .set({ emailPreferences: preference.enabled })
    .where(eq(users.id, preference.userId));

  let otherUrl = null;
  try {
    otherUrl = preferenceUrl({ userId: preference.userId, enabled: !preference.enabled });
  } catch {
    otherUrl = null;
  }

  return page(preferenceResultHtml({ enabled: preference.enabled, otherUrl }));
}

export async function GET(request) {
  return applyPreference(request);
}

export async function POST(request) {
  return applyPreference(request);
}
