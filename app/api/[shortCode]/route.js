import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET(request, { params }) {
  console.log("Handling GET request for shortCode:", params.shortCode);

  const { shortCode } = params;

  try {
    const client = await clientPromise;
    const db = client.db("urlShortener");

    const urlEntry = await db
      .collection("urls")
      .findOne({ shortCode, expiresAt: { $gt: new Date() } });

    if (urlEntry) {
      console.log("URL entry found:", urlEntry.originalUrl);

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

      console.log("Redirecting to:", urlEntry.originalUrl);
      return NextResponse.redirect(urlEntry.originalUrl);
    } else {
      console.log("URL not found or expired");
      return NextResponse.redirect("/"); // Redirect to home page if URL not found or expired
    }
  } catch (error) {
    console.error("Error handling shortened URL:", error);
    return NextResponse.redirect("/error"); // Redirect to an error page
  }
}