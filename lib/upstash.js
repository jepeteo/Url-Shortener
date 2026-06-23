function getUpstashRestUrl() {
  return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
}

function getUpstashRestToken() {
  return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
}

export function isUpstashConfigured() {
  return Boolean(getUpstashRestUrl() && getUpstashRestToken());
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function requireUpstashInProduction() {
  if (isProduction() && !isUpstashConfigured()) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL/KV_REST_API_TOKEN are required in production"
    );
  }
}

export async function upstashCommand(path, options = {}) {
  requireUpstashInProduction();

  if (!isUpstashConfigured()) {
    return null;
  }

  const response = await fetch(`${getUpstashRestUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getUpstashRestToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (isProduction()) {
      console.error(`Upstash command failed: ${path} (${response.status})`);
      return { error: true };
    }
    return null;
  }

  return response.json();
}
