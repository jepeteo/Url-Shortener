import { eq } from "drizzle-orm";
import { EVENTS, trackEvent } from "./analytics";
import { stripeEvents, users, isUniqueViolation } from "./db";
import {
  restoreLinksAfterUpgrade,
  shouldRestoreOnUpgrade,
  subscriptionMightRestore,
} from "./expiry/restore";
import { getPlanFromPriceId } from "./stripe";

export class UnknownStripePriceError extends Error {
  constructor(priceId) {
    super(`Unknown Stripe price id: ${priceId || "(missing)"}`);
    this.name = "UnknownStripePriceError";
    this.priceId = priceId || null;
  }
}

async function applyStripeEvent(db, event) {
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

      if (shouldRestoreOnUpgrade({ source: "checkout", nextPlan: plan })) {
        await restoreLinksAfterUpgrade(db, userId, plan);
      }

      await trackEvent(EVENTS.upgrade, {
        plan,
        interval: session.metadata?.interval,
      });
    }
    return;
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    let plan;
    if (event.type === "customer.subscription.deleted") {
      plan = "free";
    } else {
      const priceId = subscription.items?.data?.[0]?.price?.id;
      plan = getPlanFromPriceId(priceId);
      if (!plan) {
        throw new UnknownStripePriceError(priceId);
      }
    }

    const nextStatus = subscription.status || "active";
    let previous = null;
    if (subscriptionMightRestore(plan, nextStatus)) {
      previous = await db.query.users.findFirst({
        where: eq(users.stripeSubscriptionId, subscription.id),
        columns: { id: true, plan: true, paymentStatus: true },
      });
    }

    await db
      .update(users)
      .set({ plan, paymentStatus: nextStatus })
      .where(eq(users.stripeSubscriptionId, subscription.id));

    if (
      previous &&
      shouldRestoreOnUpgrade({
        source: "subscription",
        previousUser: previous,
        nextPlan: plan,
        nextStatus,
      })
    ) {
      await restoreLinksAfterUpgrade(db, previous.id, plan);
    }
    return;
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
}

/**
 * Record the event before applying it, but only mark it processed after
 * the handler succeeds. A failed delivery can be retried; a finished one is ignored.
 */
export async function processStripeEvent(db, event) {
  const existing = await db.query.stripeEvents.findFirst({
    where: eq(stripeEvents.id, event.id),
  });

  if (existing?.processedAt) {
    return { duplicate: true };
  }

  if (!existing) {
    try {
      await db.insert(stripeEvents).values({
        id: event.id,
        type: event.type,
      });
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
      const raced = await db.query.stripeEvents.findFirst({
        where: eq(stripeEvents.id, event.id),
      });
      if (raced?.processedAt) {
        return { duplicate: true };
      }
    }
  }

  await applyStripeEvent(db, event);

  await db
    .update(stripeEvents)
    .set({ processedAt: new Date() })
    .where(eq(stripeEvents.id, event.id));

  return { duplicate: false };
}
