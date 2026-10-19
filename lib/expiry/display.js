import { REMINDER_LEAD_DAYS } from "./constants";

export function startOfUtcDay(date) {
  const value = new Date(date);
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function utcDayDiff(from, to) {
  const ms = startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime();
  return Math.round(ms / 86400000);
}

export function formatExpiryDate(value, locale, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const options = { day: "numeric", month: "short", year: "numeric" };
  if (timeZone) {
    options.timeZone = timeZone;
  }
  return date.toLocaleDateString(locale, options);
}

/**
 * Upcoming: expiry date is 1–3 UTC days ahead (a late daily cron still warns).
 * Today: expiry is later today.
 * Already past and not archived: no email yet; cleanup archives, then the expired stage sends.
 * Expired: archived because the link expired.
 */
export function classifyExpiryStage(expiresAt, now, { archived = false, archiveReason = null } = {}) {
  if (archived) {
    return archiveReason === "expired" ? "expired" : null;
  }

  if (!expiresAt) {
    return null;
  }

  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime()) || expiry <= now) {
    return null;
  }

  const days = utcDayDiff(now, expiry);
  if (days <= 0) {
    return "today";
  }
  if (days <= REMINDER_LEAD_DAYS) {
    return "upcoming";
  }
  return null;
}

export function getLinkStatus(expiresAt, now = new Date(), locale) {
  if (expiresAt === null || expiresAt === undefined) {
    return {
      label: "Active",
      detail: "Never expires",
      className: "bg-success/15 text-success",
    };
  }

  const expiry = new Date(expiresAt);
  const dateLabel = formatExpiryDate(expiry, locale);

  if (expiry <= now) {
    return {
      label: "Expired",
      detail: `Expired on ${dateLabel}`,
      className: "bg-destructive/15 text-destructive",
    };
  }

  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const detail =
    daysLeft === 1
      ? `Expires on ${dateLabel} (1 day)`
      : `Expires on ${dateLabel} (${daysLeft} days)`;

  return {
    label: "Active",
    detail,
    className: "bg-success/15 text-success",
  };
}

export function qrExpiryWarning(expiresAt, now = new Date(), locale, plan = "free") {
  if (expiresAt === null || expiresAt === undefined || expiresAt === "") {
    return null;
  }

  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) {
    return null;
  }

  const dateLabel = formatExpiryDate(expiry, locale);
  const stopped = expiry <= now;

  if (plan === "business") {
    return stopped
      ? `This QR code stopped working on ${dateLabel}.`
      : `This QR code stops working on ${dateLabel}.`;
  }

  if (plan === "pro") {
    return stopped
      ? `This QR code stopped working on ${dateLabel}. Upgrade to Business to bring the link back.`
      : `This QR code stops working on ${dateLabel}. Printing it? Upgrade to Business to keep it working.`;
  }

  return stopped
    ? `This QR code stopped working on ${dateLabel}. Upgrade to bring the link back.`
    : `This QR code stops working on ${dateLabel}. Printing it? Upgrade to keep it working.`;
}

export function qrUpgradeLabel(plan = "free", expiresAt) {
  if (expiresAt === null || expiresAt === undefined || expiresAt === "") {
    return null;
  }
  if (plan === "business") {
    return null;
  }
  if (plan === "pro") {
    return "Upgrade to Business";
  }
  return "Upgrade to keep it working";
}
