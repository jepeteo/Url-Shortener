import Stripe from "stripe";
import { PLANS } from "./plans";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const PRICE_ENV = {
  pro: {
    monthly: "STRIPE_PRO_PRICE_ID",
    annual: "STRIPE_PRO_ANNUAL_PRICE_ID",
  },
  business: {
    monthly: "STRIPE_BUSINESS_PRICE_ID",
    annual: "STRIPE_BUSINESS_ANNUAL_PRICE_ID",
  },
};

export function getStripePriceId(planId, interval = "monthly") {
  const envKey = PRICE_ENV[planId]?.[interval] || PRICE_ENV[planId]?.monthly;
  return envKey ? process.env[envKey] : null;
}

export function getPlanFromPriceId(priceId) {
  if (!priceId) return "free";
  for (const [planId, intervals] of Object.entries(PRICE_ENV)) {
    for (const envKey of Object.values(intervals)) {
      if (process.env[envKey] && process.env[envKey] === priceId) {
        return planId;
      }
    }
  }
  return "free";
}

export { PLANS };
