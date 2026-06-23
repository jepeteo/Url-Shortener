export function isUpstashConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function requireUpstashInProduction() {
  if (isProduction() && !isUpstashConfigured()) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production"
    );
  }
}

export async function upstashCommand(path, options = {}) {
  requireUpstashInProduction();

  if (!isUpstashConfigured()) {
    return null;
  }

  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
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
