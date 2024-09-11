import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { nanoid } from "nanoid";
import { checkRateLimit } from "@/lib/rateLimit";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { url } = await request.json();

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const shortCode = nanoid(6); 
  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  await db.collection("urls").insertOne({
    originalUrl: url,
    shortCode: shortCode,
    createdAt: new Date(),
    expiresAt: expiresAt,
    userId: session.user.id,
    visits: 0,
    lastClickedAt: null,
    clickData: []
  
  });

  return NextResponse.json({ shortUrl });
}
