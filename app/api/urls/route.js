import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const userId = searchParams.get("userId");

  console.log("API received userId:", userId);

  const session = await getServerSession(authOptions);
  console.log("Session user:", session?.user);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const skip = (page - 1) * limit;

  console.log("Querying URLs for userId:", userId);

  const urls = await db
    .collection("urls")
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  console.log("Found URLs:", urls.length);

  const activeLinks = await db.collection("urls").countDocuments({
    userId: session.user.id,
    expiresAt: { $gt: new Date() },
  });
  const totalClicksResult = await db
    .collection("urls")
    .aggregate([
      { $match: { userId: session.user.id } },
      { $group: { _id: null, totalClicks: { $sum: "$clicks" } } },
    ])
    .toArray();
  const totalClicks =
    totalClicksResult.length > 0 ? totalClicksResult[0].totalClicks : 0;

  const total = await db
    .collection("urls")
    .countDocuments({ userId: session.user.id });

  return NextResponse.json({ urls, total, activeLinks, totalClicks });
}