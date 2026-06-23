import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb, clicks } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assertUrlOwner } from "@/lib/auth";
import { isValidUuid } from "@/lib/validation";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid URL id" }, { status: 400 });
  }

  const ownership = await assertUrlOwner(id, session.user.id);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const db = getDb();
  const clickData = await db
    .select()
    .from(clicks)
    .where(eq(clicks.urlId, id))
    .orderBy(desc(clicks.timestamp))
    .limit(500);

  return NextResponse.json({
    ...ownership.url,
    clickData,
  });
}
