import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assertUrlOwner } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const ownership = await assertUrlOwner(id, session.user.id);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const db = await getDatabase();
  const clicks = await db
    .collection("clicks")
    .find({ urlId: new ObjectId(id) })
    .sort({ timestamp: -1 })
    .limit(500)
    .toArray();

  const analytics = {
    ...ownership.url,
    clickData: clicks,
  };

  return NextResponse.json(analytics);
}
