import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const rawLimit = parseInt(searchParams.get("limit"), 10) || 10;
  const limit = Math.min(Math.max(1, rawLimit), 100);

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const client = await clientPromise;
  const db = client.db("urlShortener");
  const skip = (page - 1) * limit;

  const urls = await db
    .collection("urls")
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const activeLinks = await db.collection("urls").countDocuments({
    userId,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  });

  const totalClicksResult = await db
    .collection("urls")
    .aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalClicks: { $sum: "$clicks" } } },
    ])
    .toArray();

  const totalClicks =
    totalClicksResult.length > 0 ? totalClicksResult[0].totalClicks : 0;

  const total = await db.collection("urls").countDocuments({ userId });

  return NextResponse.json({ urls, total, activeLinks, totalClicks });
}
