import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { runExpiryMaintenance } from "@/lib/expiry/maintenance";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun =
    new URL(request.url).searchParams.get("dryRun") === "1" ||
    process.env.EXPIRY_EMAIL_DRY_RUN === "1";

  const result = await runExpiryMaintenance({
    db: getDb(),
    dryRun,
  });

  return NextResponse.json(result, { status: result.failed > 0 ? 500 : 200 });
}
