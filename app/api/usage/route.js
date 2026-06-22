import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canCreateLink } from "@/lib/usage";
import { getPlan } from "@/lib/plans";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const usage = await canCreateLink(user);
  const plan = getPlan(user.plan);

  return NextResponse.json({
    plan: plan.id,
    count: usage.count ?? 0,
    limit: usage.limit ?? plan.linksPerMonth,
    allowed: usage.allowed,
  });
}
