import Stripe from "stripe";
import { PLANS } from "./plans";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function getStripePriceId(planId) {
  if (planId === "pro") {
    return process.env.STRIPE_PRO_PRICE_ID;
  }
  if (planId === "business") {
    return process.env.STRIPE_BUSINESS_PRICE_ID;
  }
  return null;
}

export function getPlanFromPriceId(priceId) {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "business";
  return "free";
}

export { PLANS };
