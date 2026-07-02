export function isBillingActive(user) {
  if (!user) {
    return true;
  }

  const status = user.paymentStatus;
  if (status == null || status === "active" || status === "trialing") {
    return true;
  }

  return false;
}

export function getEffectivePlan(user) {
  if (!user) {
    return "free";
  }

  if (!isBillingActive(user)) {
    return "free";
  }

  return user.plan || "free";
}
