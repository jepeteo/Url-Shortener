const redirectCache = new Map();
const CACHE_TTL_MS = 60_000;

export function getCachedRedirect(shortCode) {
  const entry = redirectCache.get(shortCode);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    redirectCache.delete(shortCode);
    return null;
  }
  return entry;
}

export function setCachedRedirect(shortCode, originalUrl, urlId) {
  redirectCache.set(shortCode, {
    originalUrl,
    urlId,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateCachedRedirect(shortCode) {
  redirectCache.delete(shortCode);
}
