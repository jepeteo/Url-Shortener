import { isProduction, isUpstashConfigured, upstashExec } from "./upstash";

const rateLimitMap = new Map();

export const RATE_LIMITS = {
  default: { limit: 3, windowMs: 60_000 },
  shorten: { limit: 10, windowMs: 60_000 },
  apiV1: { limit: 60, windowMs: 60_000 },
  deleteUrl: { limit: 20, windowMs: 60_000 },
  apiKey: { limit: 3, windowMs: 3_600_000 },
  register: { limit: 5, windowMs: 60_000 },
  registerEmail: { limit: 3, windowMs: 3_600_000 },
  login: { limit: 10, windowMs: 900_000 },
  resetPassword: { limit: 3, windowMs: 3_600_000 },
  verifyResend: { limit: 3, windowMs: 3_600_000 },
  abuse: { limit: 5, windowMs: 3_600_000 },
};

export async function checkRateLimit(
  identifier,
  { limit = RATE_LIMITS.default.limit, windowMs = RATE_LIMITS.default.windowMs } = {}
) {
  if (isUpstashConfigured()) {
    return checkUpstashRateLimit(identifier, limit, windowMs);
  }

  if (isProduction()) {
    console.error("Rate limit blocked: Upstash is not configured in production");
    return false;
  }

  return checkMemoryRateLimit(identifier, limit, windowMs);
}

function checkMemoryRateLimit(identifier, limit, windowMs) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];

  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}

// INCR and EXPIRE in one Lua script so a key cannot be left without a TTL
// if the process stops between two REST calls. TTL is also repaired when missing.
const RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if redis.call("TTL", KEYS[1]) < 0 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return count
`.trim();

async function checkUpstashRateLimit(identifier, limit, windowMs) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const key = `ratelimit:${identifier}`;

  const incrData = await upstashExec([
    "EVAL",
    RATE_LIMIT_SCRIPT,
    "1",
    key,
    String(windowSec),
  ]);
  if (!incrData || incrData.error) {
    return isProduction() ? false : checkMemoryRateLimit(identifier, limit, windowMs);
  }

  const count = Number(incrData.result);
  if (!Number.isFinite(count)) {
    return isProduction() ? false : checkMemoryRateLimit(identifier, limit, windowMs);
  }

  return count <= limit;
}
