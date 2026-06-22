import { NextResponse } from "next/server";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
    return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("urlShortener");

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || "pro";

    if (userId) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            plan,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          },
        }
      );
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

    await db.collection("users").updateOne(
      { stripeSubscriptionId: subscription.id },
      { $set: { plan } }
    );
  }

  return NextResponse.json({ received: true });
}
