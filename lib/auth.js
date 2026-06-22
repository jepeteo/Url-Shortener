import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.user.id),
  });

  if (!user) {
    return { id: session.user.id, email: session.user.email, plan: "free" };
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    plan: user.plan || "free",
  };
}

export async function assertUrlOwner(urlId, userId) {
  const client = await clientPromise;
  const db = client.db("urlShortener");
  const url = await db.collection("urls").findOne({ _id: new ObjectId(urlId) });

  if (!url) {
    return { error: "Not found", status: 404 };
  }

  if (!url.userId || url.userId !== userId) {
    return { error: "Forbidden", status: 403 };
  }

  return { url };
}
