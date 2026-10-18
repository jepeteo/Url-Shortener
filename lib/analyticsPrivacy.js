const SITE_ORIGIN = "https://mikrouli.link";

export function measurementBeforeSend(event) {
  if (!event || typeof event.url !== "string") {
    return null;
  }

  const url = sanitizeMeasurementUrl(event.url);
  if (!url) {
    return null;
  }

  return { ...event, url };
}

/**
 * Page-measurement URLs can carry secrets in the query string (email
 * verification) or the path (password reset). Keep the path, drop the rest.
 * Returns null when the value cannot be parsed, so the caller can drop it.
 */
export function sanitizeMeasurementUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const absolute = value.startsWith("http://") || value.startsWith("https://");
    const url = new URL(value, SITE_ORIGIN);
    const parts = url.pathname.split("/");

    if (parts[1] === "auth" && parts[2] === "reset-password" && parts.length > 3) {
      url.pathname = "/auth/reset-password";
    }

    url.search = "";
    url.hash = "";

    if (absolute) {
      return url.toString();
    }

    return url.pathname || "/";
  } catch {
    return null;
  }
}
