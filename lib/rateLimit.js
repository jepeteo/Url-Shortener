const rateLimit = new Map();

export function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;

  const requestTimestamps = rateLimit.get(ip) || [];
  const requestsInWindow = requestTimestamps.filter(
    (timestamp) => timestamp > windowStart
  );

  if (requestsInWindow.length >= 3) {
    return false;
  }

  requestTimestamps.push(now);
  rateLimit.set(ip, requestTimestamps);

  return true;
}
