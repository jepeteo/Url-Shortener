import { isIP } from "net";
import { isReservedPath } from "./reservedPaths";

export const MAX_URL_LENGTH = 2048;

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
    (a === 169 && b === 254)
  );
}

function decimalToIpv4(decimal) {
  const num = Number(decimal);
  if (!Number.isInteger(num) || num < 0 || num > 0xffffffff) {
    return null;
  }
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

function isPrivateIpv6(hostname) {
  const normalized = hostname.toLowerCase();
  if (normalized === "::1") {
    return true;
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }
  if (normalized.startsWith("fe80:")) {
    return true;
  }
  return false;
}

function isBlockedIp(hostname) {
  if (/^\d+$/.test(hostname)) {
    const dotted = decimalToIpv4(hostname);
    if (dotted) {
      return isPrivateIpv4(dotted);
    }
    return true;
  }

  const ipVersion = isIP(hostname);
  if (ipVersion === 4) {
    return isPrivateIpv4(hostname);
  }
  if (ipVersion === 6) {
    return isPrivateIpv6(hostname);
  }

  return false;
}

export function isValidUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  if (url.length > MAX_URL_LENGTH) {
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
  const normalizedHost =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;

  if (BLOCKED_HOSTNAMES.has(normalizedHost)) {
    return false;
  }

  if (isBlockedIp(normalizedHost)) {
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

export function isReservedAlias(alias) {
  return isReservedPath(alias);
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
