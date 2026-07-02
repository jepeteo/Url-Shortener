const HONEYPOT_FIELD = "website";

export function isHoneypotTriggered(body) {
  if (!body || typeof body !== "object") {
    return false;
  }

  const value = body[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token, ip) {
  if (!isTurnstileConfigured()) {
    return true;
  }

  if (!token || typeof token !== "string") {
    return false;
  }

  const formData = new URLSearchParams();
  formData.set("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.set("response", token);
  if (ip && ip !== "unknown") {
    formData.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.success === true;
}

export const REGISTRATION_SUCCESS_MESSAGE =
  "If this email is available, check your inbox to verify your account.";
