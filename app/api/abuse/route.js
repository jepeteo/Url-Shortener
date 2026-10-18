import { NextResponse } from "next/server";
import { ABUSE_REPORT_RECEIVED, parseAbuseReport } from "@/lib/abuseReport";
import { isHoneypotTriggered, verifyTurnstile } from "@/lib/botProtection";
import { validateCsrf } from "@/lib/csrf";
import { sendAbuseReportEmail } from "@/lib/email";
import { OPERATOR } from "@/lib/operator";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await checkRateLimit(`abuse:${ip}`, RATE_LIMITS.abuse))) {
    return NextResponse.json(
      {
        error: `Too many reports from this network. Email ${OPERATOR.abuseEmail} instead.`,
      },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  if (isHoneypotTriggered(body)) {
    return NextResponse.json({ message: ABUSE_REPORT_RECEIVED });
  }

  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  const parsed = parseAbuseReport(body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await sendAbuseReportEmail(parsed.report);
    if (!result.sent && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: `We could not send the report just now. Email ${OPERATOR.abuseEmail} instead.`,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Failed to send abuse report:", error);
    return NextResponse.json(
      {
        error: `We could not send the report just now. Email ${OPERATOR.abuseEmail} instead.`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: ABUSE_REPORT_RECEIVED });
}
