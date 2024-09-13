import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET(request, { params }) {
  const { shortCode } = params;

  try {
    const client = await clientPromise;
    const db = client.db("urlShortener");

    const urlEntry = await db
      .collection("urls")
      .findOne({ shortCode, expiresAt: { $gt: new Date() } });

    if (urlEntry) {
      const clickData = {
        timestamp: new Date(),
        ip: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent"),
        referer: request.headers.get("referer") || null,
      };

      await db.collection("urls").updateOne(
        { _id: urlEntry._id },
        {
          $inc: { clicks: 1 },
          $set: { lastClickedAt: new Date() },
          $push: { clickData: clickData },
        }
      );

      return NextResponse.redirect(urlEntry.originalUrl);
    } else {
      return NextResponse.redirect("/"); // Redirect to home page if URL not found or expired
    }
  } catch (error) {
    return NextResponse.redirect("/error"); // Redirect to an error page
  }
}