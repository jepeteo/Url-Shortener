import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { generateApiKey, hashApiKey } from "@/lib/apiKeys";
import { getPlan } from "@/lib/plans";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { validateCsrf } from "@/lib/csrf";

export async function POST(request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!(await checkRateLimit(`apikey:${session.user.id}`, RATE_LIMITS.apiKey))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.user.id),
  });

  const plan = getPlan(user?.plan || "free");
  if (!plan.features.apiAccess) {
    return NextResponse.json(
      { error: "API keys require a Business plan." },
      { status: 403 }
    );
  }

  const apiKey = generateApiKey();
  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { apiKeyHash: hashApiKey(apiKey), apiKeyCreatedAt: new Date() } }
  );

  return NextResponse.json({
    apiKey,
    message: "Store this key securely. It will not be shown again.",
  });
}
