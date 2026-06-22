export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    linksPerMonth: 20,
    defaultExpiryDays: 14,
    features: {
      customAlias: false,
      analyticsCharts: false,
      csvExport: false,
      apiAccess: false,
      configurableExpiry: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 6,
    linksPerMonth: 100,
    defaultExpiryDays: 90,
    features: {
      customAlias: true,
      analyticsCharts: true,
      csvExport: true,
      apiAccess: false,
      configurableExpiry: true,
    },
  },
  business: {
    id: "business",
    name: "Business",
    monthlyPrice: 15,
    linksPerMonth: Infinity,
    defaultExpiryDays: 365,
    features: {
      customAlias: true,
      analyticsCharts: true,
      csvExport: true,
      apiAccess: true,
      configurableExpiry: true,
    },
  },
};

export const EXPIRY_OPTIONS = [
  { label: "1 day", days: 1, plans: ["pro", "business"] },
  { label: "7 days", days: 7, plans: ["pro", "business"] },
  { label: "14 days", days: 14, plans: ["free", "pro", "business"] },
  { label: "30 days", days: 30, plans: ["pro", "business"] },
  { label: "90 days", days: 90, plans: ["pro", "business"] },
  { label: "1 year", days: 365, plans: ["business"] },
  { label: "Never", days: null, plans: ["business"] },
];

export function getPlan(planId = "free") {
  return PLANS[planId] || PLANS.free;
}

export function canUseFeature(planId, feature) {
  return getPlan(planId).features[feature] === true;
}

export function getExpiryDaysForPlan(planId, requestedDays) {
  const plan = getPlan(planId);
  const option = EXPIRY_OPTIONS.find((o) => o.days === requestedDays);
  if (!option || !option.plans.includes(plan.id)) {
    return plan.defaultExpiryDays;
  }
  return requestedDays;
}

export function computeExpiresAt(days) {
  if (days === null) {
    return null;
  }
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
