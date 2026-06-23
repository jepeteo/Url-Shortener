import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import { getDb, stripeEvents, users, isUniqueViolation } from "@/lib/db";

export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const db = getDb();

  try {
    await db.insert(stripeEvents).values({
      id: event.id,
      type: event.type,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw error;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || "pro";

    if (userId) {
      await db
        .update(users)
        .set({
          plan,
          paymentStatus: "active",
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        })
        .where(eq(users.id, userId));
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const priceId = subscription.items?.data?.[0]?.price?.id;
    const plan =
      event.type === "customer.subscription.deleted"
        ? "free"
        : getPlanFromPriceId(priceId);

    await db
      .update(users)
      .set({ plan, paymentStatus: subscription.status || "active" })
      .where(eq(users.stripeSubscriptionId, subscription.id));
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    if (invoice.customer) {
      await db
        .update(users)
        .set({ paymentStatus: "past_due" })
        .where(eq(users.stripeCustomerId, invoice.customer));
    }
  }

  return NextResponse.json({ received: true });
}
