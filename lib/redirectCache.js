import { isProduction, isUpstashConfigured, upstashCommand } from "./upstash";

const redirectCache = new Map();
const DEFAULT_TTL_SEC = 300;

function getCacheTtlSec() {
  const parsed = Number(process.env.REDIRECT_CACHE_TTL_SEC);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_TTL_SEC;
}

function cacheKey(shortCode) {
  return `redirect:${shortCode}`;
}

export function linkExpiryIso(linkExpiresAt) {
  if (linkExpiresAt == null) {
    return null;
  }
  const expiresMs = new Date(linkExpiresAt).getTime();
  if (!Number.isFinite(expiresMs)) {
    return null;
  }
  return new Date(expiresMs).toISOString();
}

export function cacheTtlSec(linkExpiresAt, now = Date.now()) {
  const max = getCacheTtlSec();
  const iso = linkExpiryIso(linkExpiresAt);
  if (!iso) {
    return max;
  }
  const remaining = Math.floor((new Date(iso).getTime() - now) / 1000);
  if (remaining <= 0) {
    return 0;
  }
  return Math.min(max, remaining);
}

function linkStillActive(linkExpiresAt, now = Date.now()) {
  if (linkExpiresAt == null) {
    return true;
  }
  const expiresMs = new Date(linkExpiresAt).getTime();
  if (!Number.isFinite(expiresMs)) {
    return true;
  }
  return expiresMs > now;
}

function toCachedRedirect(entry) {
  if (!entry || !linkStillActive(entry.linkExpiresAt)) {
    return null;
  }
  return {
    originalUrl: entry.originalUrl,
    urlId: entry.urlId,
    linkExpiresAt: entry.linkExpiresAt ?? null,
  };
}

function getFromMemory(shortCode) {
  const entry = redirectCache.get(shortCode);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.cacheExpiresAt || !linkStillActive(entry.linkExpiresAt)) {
    redirectCache.delete(shortCode);
    return null;
  }
  return toCachedRedirect(entry);
}

function setInMemory(shortCode, originalUrl, urlId, linkExpiresAt) {
  const ttlSec = cacheTtlSec(linkExpiresAt);
  if (ttlSec <= 0) {
    redirectCache.delete(shortCode);
    return;
  }
  redirectCache.set(shortCode, {
    originalUrl,
    urlId,
    linkExpiresAt: linkExpiryIso(linkExpiresAt),
    cacheExpiresAt: Date.now() + ttlSec * 1000,
  });
}

function deleteFromMemory(shortCode) {
  redirectCache.delete(shortCode);
}

export async function getCachedRedirect(shortCode) {
  if (isUpstashConfigured()) {
    const data = await upstashCommand(`/get/${cacheKey(shortCode)}`);
    if (!data || data.error || data.result === null) {
      return isProduction() ? null : getFromMemory(shortCode);
    }

    try {
      const cached = toCachedRedirect(JSON.parse(data.result));
      if (!cached) {
        await invalidateCachedRedirect(shortCode);
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  if (isProduction()) {
    return null;
  }

  return getFromMemory(shortCode);
}

export async function setCachedRedirect(shortCode, originalUrl, urlId, linkExpiresAt = null) {
  const ttlSec = cacheTtlSec(linkExpiresAt);
  if (ttlSec <= 0) {
    await invalidateCachedRedirect(shortCode);
    return;
  }

  const payload = JSON.stringify({
    originalUrl,
    urlId: urlId?.toString?.() ?? urlId,
    linkExpiresAt: linkExpiryIso(linkExpiresAt),
  });

  if (isUpstashConfigured()) {
    const encoded = encodeURIComponent(payload);
    const result = await upstashCommand(
      `/set/${cacheKey(shortCode)}/${encoded}?EX=${ttlSec}`
    );
    if (!result || result.error) {
      if (!isProduction()) {
        setInMemory(shortCode, originalUrl, urlId, linkExpiresAt);
      }
    }
    return;
  }

  if (!isProduction()) {
    setInMemory(shortCode, originalUrl, urlId, linkExpiresAt);
  }
}

export async function invalidateCachedRedirect(shortCode) {
  if (isUpstashConfigured()) {
    await upstashCommand(`/del/${cacheKey(shortCode)}`);
  }

  deleteFromMemory(shortCode);
}
