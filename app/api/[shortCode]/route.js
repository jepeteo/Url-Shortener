import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { redirect } from "next/dist/server/api-utils";

export default async function ShortUrlRedirect({ params }) {
  const { shortCode } = params;

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const urlEntry = await db
    .collection("urls")
    .findOne({ shortCode, expiresAt: { $gt: new Date() } });

  if (urlEntry) {
    await db
      .collection("urls")
      .updateOne({ _id: urlEntry._id }, { $inc: { visits: 1 } });
    redirect(urlEntry.originalUrl);
  } else {
    redirect("/");
  }
}
