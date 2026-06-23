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

function getFromMemory(shortCode) {
  const entry = redirectCache.get(shortCode);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    redirectCache.delete(shortCode);
    return null;
  }
  return {
    originalUrl: entry.originalUrl,
    urlId: entry.urlId,
  };
}

function setInMemory(shortCode, originalUrl, urlId) {
  const ttlMs = getCacheTtlSec() * 1000;
  redirectCache.set(shortCode, {
    originalUrl,
    urlId,
    expiresAt: Date.now() + ttlMs,
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
      return JSON.parse(data.result);
    } catch {
      return null;
    }
  }

  if (isProduction()) {
    return null;
  }

  return getFromMemory(shortCode);
}

export async function setCachedRedirect(shortCode, originalUrl, urlId) {
  const payload = JSON.stringify({
    originalUrl,
    urlId: urlId?.toString?.() ?? urlId,
  });
  const ttlSec = getCacheTtlSec();

  if (isUpstashConfigured()) {
    const encoded = encodeURIComponent(payload);
    const result = await upstashCommand(
      `/set/${cacheKey(shortCode)}/${encoded}?EX=${ttlSec}`
    );
    if (!result || result.error) {
      if (!isProduction()) {
        setInMemory(shortCode, originalUrl, urlId);
      }
    }
    return;
  }

  if (!isProduction()) {
    setInMemory(shortCode, originalUrl, urlId);
  }
}

export async function invalidateCachedRedirect(shortCode) {
  if (isUpstashConfigured()) {
    await upstashCommand(`/del/${cacheKey(shortCode)}`);
  }

  deleteFromMemory(shortCode);
}
