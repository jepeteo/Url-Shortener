export const EVENTS = {
  signup: "signup",
  linkCreated: "link_created",
  upgrade: "upgrade",
  expiryEmailSent: "expiry_email_sent",
  restoreAfterUpgrade: "restore_after_upgrade",
};

const PLANS = new Set(["free", "pro", "business"]);
const INTERVALS = new Set(["monthly", "annual"]);
const EXPIRY_STAGES = new Set(["upcoming", "today", "expired"]);
const MAX_COUNT = 10000;
const TRACK_TIMEOUT_MS = 2000;

export function analyticsProperties(input) {
  if (!input || typeof input !== "object") {
    return {};
  }

  const properties = {};
  if (PLANS.has(input.plan)) {
    properties.plan = input.plan;
  }
  if (INTERVALS.has(input.interval)) {
    properties.interval = input.interval;
  }
  if (EXPIRY_STAGES.has(input.stage)) {
    properties.stage = input.stage;
  }
  if (Number.isInteger(input.count) && input.count >= 0 && input.count <= MAX_COUNT) {
    properties.count = input.count;
  }
  return properties;
}

async function sendToVercel(name, properties) {
  if (process.env.VITEST) {
    return;
  }

  const { track } = await import("@vercel/analytics/server");
  // A fixed user-agent satisfies the server SDK without forwarding the
  // visitor's cookie, IP address, or account session.
  await track(name, properties, {
    headers: { "user-agent": "mikrouli-server" },
  });
}

export async function trackEvent(name, properties = {}, track = sendToVercel) {
  if (!Object.values(EVENTS).includes(name)) {
    return { tracked: false, properties: {} };
  }

  const safe = analyticsProperties(properties);

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("analytics timeout")), TRACK_TIMEOUT_MS);
      Promise.resolve(track(name, safe)).then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
    return { tracked: true, properties: safe };
  } catch (error) {
    console.error(`Analytics event ${name} failed:`, error);
    return { tracked: false, properties: safe };
  }
}
