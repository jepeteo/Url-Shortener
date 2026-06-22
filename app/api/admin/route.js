import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const [urls, users, totalClicks] = await Promise.all([
    db.collection("urls").find({}).sort({ createdAt: -1 }).limit(100).toArray(),
    db.collection("users").countDocuments(),
    db
      .collection("urls")
      .aggregate([{ $group: { _id: null, total: { $sum: "$clicks" } } }])
      .toArray(),
  ]);

  return NextResponse.json({
    stats: {
      users,
      links: urls.length,
      totalClicks: totalClicks[0]?.total || 0,
    },
    urls,
  });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shortCode } = await request.json();
  const client = await clientPromise;
  const db = client.db("urlShortener");

  await db.collection("urls").deleteOne({ shortCode });
  await db.collection("clicks").deleteMany({ shortCode });

  return NextResponse.json({ message: "Link removed" });
}
