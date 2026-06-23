import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || typeof token !== "string") {
    return NextResponse.redirect(
      new URL("/auth/signin?error=invalid-token", request.url)
    );
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const user = await db.collection("users").findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=invalid-token", request.url)
    );
  }

  await db.collection("users").updateOne(
    { _id: user._id },
    {
      $set: { emailVerified: new Date() },
      $unset: { verificationToken: "", verificationExpires: "" },
    }
  );

  return NextResponse.redirect(new URL("/dashboard?verified=1", request.url));
}
