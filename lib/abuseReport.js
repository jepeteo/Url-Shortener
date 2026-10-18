export const ABUSE_REASONS = [
  { id: "phishing", label: "Phishing or fraud" },
  { id: "malware", label: "Malware or harmful software" },
  { id: "spam", label: "Spam" },
  { id: "illegal", label: "Illegal content" },
  { id: "other", label: "Something else" },
];

export const ABUSE_REPORT_RECEIVED = "Thanks. We received your report and will review it.";

const REASON_IDS = new Set(ABUSE_REASONS.map((reason) => reason.id));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REPORT_URL_LENGTH = 2048;

export function isReportableUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_REPORT_URL_LENGTH || /[\r\n]/.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeShortCode(value) {
  if (typeof value !== "string") {
    return null;
  }

  const code = value.trim();
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(code)) {
    return null;
  }

  return code;
}

export function linkNotFoundTarget(requestUrl, shortCode) {
  const target = new URL("/link-not-found", requestUrl);
  const code = normalizeShortCode(shortCode);
  if (code) {
    target.searchParams.set("code", code);
  }
  return target;
}

export function absoluteShortUrl(
  code,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link"
) {
  const safe = normalizeShortCode(code);
  if (!safe) {
    return null;
  }

  return `${String(baseUrl).replace(/\/$/, "")}/${safe}`;
}

export function parseAbuseReport(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid report." };
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const reporterEmail =
    typeof body.reporterEmail === "string" ? body.reporterEmail.trim() : "";

  if (!isReportableUrl(url)) {
    return { error: "Enter a valid http or https URL." };
  }

  if (!REASON_IDS.has(reason)) {
    return { error: "Choose a reason." };
  }

  if (reporterEmail.length > 254 || (reporterEmail && !EMAIL_REGEX.test(reporterEmail))) {
    return { error: "Enter a valid email address, or leave it blank." };
  }

  const reasonLabel = ABUSE_REASONS.find((item) => item.id === reason).label;

  return {
    report: {
      url,
      reason,
      reasonLabel,
      reporterEmail: reporterEmail || null,
    },
  };
}
