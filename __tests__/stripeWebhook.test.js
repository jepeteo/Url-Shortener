import { beforeEach, describe, expect, it } from "vitest";
import { stripeEvents, users } from "../db/schema";
import { processStripeEvent, UnknownStripePriceError } from "../lib/stripeWebhook";
import { getPlanFromPriceId } from "../lib/stripe";

function createDb() {
  const events = new Map();
  const updates = [];
  let userWrites = 0;
  let failUserWrite = false;

  return {
    updates,
    events,
    failNextUserWrite() {
      failUserWrite = true;
    },
    query: {
      stripeEvents: {
        findFirst: async () => [...events.values()][0],
      },
    },
    insert: () => ({
      values: async (row) => {
        if (events.has(row.id)) {
          const error = new Error("duplicate");
          error.code = "23505";
          throw error;
        }
        events.set(row.id, { ...row, processedAt: null });
      },
    }),
    update: (table) => ({
      set: (values) => ({
        where: async () => {
          if (table === users) {
            userWrites += 1;
            if (failUserWrite) {
              failUserWrite = false;
              throw new Error("db down");
            }
          }
          updates.push({ table, values });
          if (table === stripeEvents && values.processedAt) {
            for (const event of events.values()) {
              event.processedAt = values.processedAt;
            }
          }
        },
      }),
    }),
  };
}

describe("getPlanFromPriceId", () => {
  const original = process.env.STRIPE_PRO_PRICE_ID;

  beforeEach(() => {
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
  });

  it("returns null for an unknown price instead of free", () => {
    expect(getPlanFromPriceId("price_unknown")).toBeNull();
    expect(getPlanFromPriceId(undefined)).toBeNull();
    expect(getPlanFromPriceId("price_pro")).toBe("pro");
    process.env.STRIPE_PRO_PRICE_ID = original;
  });
});

describe("processStripeEvent", () => {
  beforeEach(() => {
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
  });

  it("does not mark a failed handler processed, so a retry can apply it", async () => {
    const db = createDb();
    db.failNextUserWrite();
    const event = {
      id: "evt_1",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-1", plan: "pro" },
          customer: "cus_1",
          subscription: "sub_1",
        },
      },
    };

    await expect(processStripeEvent(db, event)).rejects.toThrow("db down");
    expect(db.events.get("evt_1").processedAt).toBeNull();

    const result = await processStripeEvent(db, event);
    expect(result).toEqual({ duplicate: false });
    expect(db.events.get("evt_1").processedAt).toBeInstanceOf(Date);
    expect(db.updates.some((update) => update.table === users && update.values.plan === "pro")).toBe(
      true
    );
  });

  it("ignores an event that was already processed", async () => {
    const db = createDb();
    const event = {
      id: "evt_2",
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_1" } },
    };

    await processStripeEvent(db, event);
    const writes = db.updates.length;
    const again = await processStripeEvent(db, event);

    expect(again).toEqual({ duplicate: true });
    expect(db.updates).toHaveLength(writes);
  });

  it("does not downgrade a subscription when the price id is unknown", async () => {
    const db = createDb();
    const event = {
      id: "evt_3",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "active",
          items: { data: [{ price: { id: "price_unknown" } }] },
        },
      },
    };

    await expect(processStripeEvent(db, event)).rejects.toBeInstanceOf(UnknownStripePriceError);
    expect(db.events.get("evt_3").processedAt).toBeNull();
    expect(db.updates.some((update) => update.table === users)).toBe(false);
  });

  it("sets free only when the subscription is deleted", async () => {
    const db = createDb();
    const event = {
      id: "evt_4",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_1", status: "canceled" } },
    };

    await processStripeEvent(db, event);
    expect(db.updates.find((update) => update.table === users).values.plan).toBe("free");
    expect(db.events.get("evt_4").processedAt).toBeInstanceOf(Date);
  });

  it("maps a known price id onto the plan", async () => {
    const db = createDb();
    const event = {
      id: "evt_5",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "active",
          items: { data: [{ price: { id: "price_pro" } }] },
        },
      },
    };

    await processStripeEvent(db, event);
    expect(db.updates.find((update) => update.table === users).values.plan).toBe("pro");
  });
});
