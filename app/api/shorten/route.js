import { NextResponse } from "next/server";

export async function POST(request) {
  const { url } = await request.json();
  // implement the logic to generate a short URL
  // For now, return a mock response
  const shortCode = Math.random().toString(36).substr(2, 6);
  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;

  return NextResponse.json({ shortUrl });
}
