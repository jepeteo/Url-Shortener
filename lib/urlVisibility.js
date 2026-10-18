import { and, eq, gt, isNull, or } from "drizzle-orm";
import { urls } from "./db";

export function notArchived() {
  return isNull(urls.archivedAt);
}

export function unexpired(now) {
  return or(gt(urls.expiresAt, now), isNull(urls.expiresAt));
}

export function redirectableWhere(shortCode, now) {
  return and(eq(urls.shortCode, shortCode), notArchived(), unexpired(now));
}

export function ownerVisibleWhere(userId) {
  return and(eq(urls.userId, userId), notArchived());
}
