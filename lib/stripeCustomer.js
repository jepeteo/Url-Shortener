import { eq } from "drizzle-orm";
import { users } from "./db";

async function retrieveLiveCustomer(stripe, customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      return null;
    }
    return customer;
  } catch (error) {
    if (error?.code === "resource_missing" || error?.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

async function saveCustomerId(db, userId, customerId) {
  await db
    .update(users)
    .set({ stripeCustomerId: customerId })
    .where(eq(users.id, userId));
}

/**
 * Reuse the user's Stripe customer, or an existing customer with the same
 * email, before creating a new one. Checkout must pass `customer` and not
 * `customer_email`, which always creates a new customer.
 */
export async function reuseOrCreateStripeCustomer({ stripe, db, userId, email }) {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, email: true, stripeCustomerId: true },
  });

  if (!row) {
    return null;
  }

  const customerEmail = row.email || email;

  if (row.stripeCustomerId) {
    const existing = await retrieveLiveCustomer(stripe, row.stripeCustomerId);
    if (existing) {
      return existing.id;
    }
  }

  const listed = await stripe.customers.list({ email: customerEmail, limit: 10 });
  const found = listed.data?.find((customer) => customer && !customer.deleted);
  if (found) {
    if (found.id !== row.stripeCustomerId) {
      await saveCustomerId(db, row.id, found.id);
    }
    return found.id;
  }

  const created = await stripe.customers.create({
    email: customerEmail,
    metadata: { userId: row.id },
  });
  await saveCustomerId(db, row.id, created.id);
  return created.id;
}
