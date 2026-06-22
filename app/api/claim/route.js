import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { shortCode } = await request.json();
  if (!shortCode) {
    return NextResponse.json({ error: "shortCode required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const result = await db.collection("urls").updateOne(
    { shortCode, userId: null, isAnonymous: true },
    { $set: { userId: session.user.id, isAnonymous: false, claimedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Link not found or already claimed" }, { status: 404 });
  }

  return NextResponse.json({ message: "Link claimed successfully" });
}
