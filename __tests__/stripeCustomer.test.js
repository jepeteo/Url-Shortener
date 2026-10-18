import { describe, expect, it, vi } from "vitest";
import { reuseOrCreateStripeCustomer } from "../lib/stripeCustomer";

function createDb(row) {
  const saved = [];
  return {
    saved,
    query: {
      users: {
        findFirst: async () => row,
      },
    },
    update: () => ({
      set: (values) => ({
        where: async () => {
          saved.push(values);
        },
      }),
    }),
  };
}

describe("reuseOrCreateStripeCustomer", () => {
  it("reuses the customer already stored on the user", async () => {
    const db = createDb({ id: "user-1", email: "a@example.com", stripeCustomerId: "cus_saved" });
    const stripe = {
      customers: {
        retrieve: vi.fn(async () => ({ id: "cus_saved", deleted: false })),
        list: vi.fn(),
        create: vi.fn(),
      },
    };

    const customerId = await reuseOrCreateStripeCustomer({
      stripe,
      db,
      userId: "user-1",
      email: "a@example.com",
    });

    expect(customerId).toBe("cus_saved");
    expect(stripe.customers.list).not.toHaveBeenCalled();
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(db.saved).toHaveLength(0);
  });

  it("reuses an existing customer with the same email", async () => {
    const db = createDb({ id: "user-1", email: "a@example.com", stripeCustomerId: null });
    const stripe = {
      customers: {
        retrieve: vi.fn(),
        list: vi.fn(async () => ({ data: [{ id: "cus_email", deleted: false }] })),
        create: vi.fn(),
      },
    };

    const customerId = await reuseOrCreateStripeCustomer({
      stripe,
      db,
      userId: "user-1",
      email: "a@example.com",
    });

    expect(customerId).toBe("cus_email");
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(db.saved).toEqual([{ stripeCustomerId: "cus_email" }]);
  });

  it("creates a customer only when none exists", async () => {
    const db = createDb({ id: "user-1", email: "a@example.com", stripeCustomerId: null });
    const stripe = {
      customers: {
        retrieve: vi.fn(),
        list: vi.fn(async () => ({ data: [] })),
        create: vi.fn(async () => ({ id: "cus_new" })),
      },
    };

    const customerId = await reuseOrCreateStripeCustomer({
      stripe,
      db,
      userId: "user-1",
      email: "a@example.com",
    });

    expect(customerId).toBe("cus_new");
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: "a@example.com",
      metadata: { userId: "user-1" },
    });
    expect(db.saved).toEqual([{ stripeCustomerId: "cus_new" }]);
  });
});
