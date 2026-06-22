const rateLimitMap = new Map();

export async function checkRateLimit(identifier, { limit = 3, windowMs = 60_000 } = {}) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return checkUpstashRateLimit(identifier, limit, windowMs);
  }
  return checkMemoryRateLimit(identifier, limit, windowMs);
}

function checkMemoryRateLimit(ip, limit, windowMs) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];

  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

async function checkUpstashRateLimit(identifier, limit, windowMs) {
  const windowSec = Math.ceil(windowMs / 1000);
  const key = `ratelimit:${identifier}`;

  const incrResponse = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/incr/${key}`,
    {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    }
  );

  if (!incrResponse.ok) {
    return checkMemoryRateLimit(identifier, limit, windowMs);
  }

  const incrData = await incrResponse.json();
  const count = incrData.result;

  if (count === 1) {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/expire/${key}/${windowSec}`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    });
  }

  return count <= limit;
}
