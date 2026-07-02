import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEffectivePlan } from "./billing";
import { getDb, users, urls } from "./db";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return {
      id: session.user.id,
      email: session.user.email,
      plan: "free",
      effectivePlan: "free",
      paymentStatus: null,
      emailVerified: null,
    };
  }

  const effectivePlan = getEffectivePlan(user);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan || "free",
    effectivePlan,
    paymentStatus: user.paymentStatus ?? null,
    emailVerified: user.emailVerified ?? null,
  };
}

export async function assertUrlOwner(urlId, userId) {
  const db = getDb();
  const url = await db.query.urls.findFirst({
    where: eq(urls.id, urlId),
  });

  if (!url) {
    return { error: "Not found", status: 404 };
  }

  if (!url.userId || url.userId !== userId) {
    return { error: "Forbidden", status: 403 };
  }

  return { url };
}
