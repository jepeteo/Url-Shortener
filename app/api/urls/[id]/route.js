import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { validateCsrf } from "@/lib/csrf";
import { invalidateCachedRedirect } from "@/lib/redirectCache";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid URL id" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const url = await db.collection("urls").findOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (!url) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
  }

  return NextResponse.json(url);
}

export async function DELETE(request, { params }) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid URL id" }, { status: 400 });
  }

  if (
    !(await checkRateLimit(`delete:${session.user.id}`, RATE_LIMITS.deleteUrl))
  ) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const url = await db.collection("urls").findOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (!url) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
  }

  const result = await db.collection("urls").deleteOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
  }

  await invalidateCachedRedirect(url.shortCode);

  return NextResponse.json({ message: "URL deleted successfully" });
}
