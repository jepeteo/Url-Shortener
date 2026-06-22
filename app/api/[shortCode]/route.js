import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { recordClickAsync } from "@/lib/clickTracking";
import {
  getCachedRedirect,
  setCachedRedirect,
} from "@/lib/redirectCache";

export async function GET(request, { params }) {
  const { shortCode } = await params;

  try {
    const cached = getCachedRedirect(shortCode);
    if (cached) {
      recordClickAsync(
        { _id: cached.urlId, shortCode },
        request
      );
      return NextResponse.redirect(cached.originalUrl, 307);
    }

    const client = await clientPromise;
    const db = client.db("urlShortener");

    const urlEntry = await db.collection("urls").findOne({
      shortCode,
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    });

    if (urlEntry) {
      setCachedRedirect(shortCode, urlEntry.originalUrl, urlEntry._id);
      recordClickAsync(urlEntry, request);

      const status = urlEntry.expiresAt === null ? 308 : 307;
      return NextResponse.redirect(urlEntry.originalUrl, status);
    }

    return NextResponse.redirect(
      new URL("/link-not-found", request.url).toString()
    );
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(
      new URL("/link-not-found", request.url).toString()
    );
  }
}
