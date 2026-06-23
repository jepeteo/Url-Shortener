import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getStripe, getStripePriceId } from "@/lib/stripe";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs." },
      { status: 503 }
    );
  }

  const { plan, interval = "monthly" } = await request.json();
  const billingInterval = interval === "annual" ? "annual" : "monthly";
  const priceId = getStripePriceId(plan, billingInterval);

  if (!priceId) {
    return NextResponse.json(
      { error: "This plan or billing interval is not available." },
      { status: 400 }
    );
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    metadata: {
      userId: session.user.id,
      plan,
      interval: billingInterval,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
