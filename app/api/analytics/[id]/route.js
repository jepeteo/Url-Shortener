import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb, clicks } from "@/lib/db";
import { getSessionUser, assertUrlOwner } from "@/lib/auth";
import { getUserFeatures } from "@/lib/plans";
import { isValidUuid } from "@/lib/validation";

export async function GET(request, { params }) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid URL id" }, { status: 400 });
  }

  const ownership = await assertUrlOwner(id, user.id);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const features = getUserFeatures(user);
  let clickData = [];

  if (features.analyticsCharts) {
    const db = getDb();
    clickData = await db
      .select()
      .from(clicks)
      .where(eq(clicks.urlId, id))
      .orderBy(desc(clicks.timestamp))
      .limit(500);
  }

  return NextResponse.json({
    ...ownership.url,
    clickData,
    features: {
      charts: features.analyticsCharts,
      csvExport: features.csvExport,
    },
  });
}
