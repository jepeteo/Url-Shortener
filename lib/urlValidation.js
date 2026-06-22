const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

function isPrivateIpv4(hostname) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return false;
  }
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 169 && b === 254
  );
}

export function isValidUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || isPrivateIpv4(hostname)) {
    return false;
  }

  return true;
}

export function isValidAlias(alias) {
  if (!alias || typeof alias !== "string") {
    return false;
  }
  return /^[a-zA-Z0-9_-]{3,32}$/.test(alias);
}

const RESERVED_ALIASES = new Set([
  "api",
  "auth",
  "dashboard",
  "analytics",
  "pricing",
  "app",
  "admin",
  "link-not-found",
  "error",
]);

export function isReservedAlias(alias) {
  return RESERVED_ALIASES.has(alias.toLowerCase());
}

export function appendUtmParams(url, { source, medium, campaign, term, content }) {
  if (!isValidUrl(url)) {
    return url;
  }

  const parsed = new URL(url);
  const params = { utm_source: source, utm_medium: medium, utm_campaign: campaign, utm_term: term, utm_content: content };

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      parsed.searchParams.set(key, value);
    }
  }

  return parsed.toString();
}
