import { createHmac, timingSafeEqual } from "crypto";
import { escapeHtml, getBaseUrl } from "@/lib/email/templates/utils";

const PURPOSE = "expiry-email-pref";

function secret() {
  return process.env.NEXTAUTH_SECRET || "";
}

function signPayload(payload, key) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function signEmailPreference({ userId, enabled }, key = secret()) {
  if (!key) {
    throw new Error("NEXTAUTH_SECRET is required to sign email preference links");
  }
  const payload = Buffer.from(
    JSON.stringify({
      purpose: PURPOSE,
      userId,
      enabled: Boolean(enabled),
    }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${signPayload(payload, key)}`;
}

export function verifyEmailPreference(token, key = secret()) {
  if (!key || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const dot = token.indexOf(".");
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = signPayload(payload, key);
  const actualBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.purpose !== PURPOSE || typeof data.userId !== "string" || typeof data.enabled !== "boolean") {
      return null;
    }
    return { userId: data.userId, enabled: data.enabled };
  } catch {
    return null;
  }
}

export function preferenceUrl({ userId, enabled, baseUrl = getBaseUrl() }) {
  const token = signEmailPreference({ userId, enabled });
  return `${baseUrl}/api/email/preferences?token=${encodeURIComponent(token)}`;
}

export function preferenceResultHtml({ enabled, otherUrl }) {
  const heading = enabled ? "Expiry reminders are on" : "Expiry reminders are off";
  const detail = enabled
    ? "We will email you when links on your account are about to expire, on the day they expire, and after they have been archived."
    : "We will not email you about expiring links. Expiry dates still show on your dashboard.";
  const otherLabel = enabled ? "Turn reminders off" : "Turn reminders back on";
  const other = otherUrl
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(otherUrl)}">${otherLabel}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;color:#18181b;">
  <main style="max-width:32rem;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:32px;">
    <h1 style="margin:0 0 12px;font-size:24px;">${heading}</h1>
    <p style="margin:0;line-height:1.5;color:#3f3f46;">${detail}</p>
    ${other}
    <p style="margin:24px 0 0;"><a href="/dashboard">Back to your dashboard</a></p>
  </main>
</body>
</html>`;
}
