import { and, isNull, lt, count } from "drizzle-orm";
import { urls } from "@/lib/db";
import { invalidateCachedRedirect } from "@/lib/redirectCache";
import { ARCHIVE_REASONS } from "./constants";

export async function archiveExpiredLinks(db, now = new Date(), invalidate = invalidateCachedRedirect) {
  const archived = await db
    .update(urls)
    .set({ archivedAt: now, archiveReason: ARCHIVE_REASONS.expired })
    .where(and(lt(urls.expiresAt, now), isNull(urls.archivedAt)))
    .returning({ shortCode: urls.shortCode });

  await Promise.all(archived.map((row) => invalidate(row.shortCode)));
  return archived;
}

export async function countExpiredUnarchived(db, now = new Date()) {
  const [row] = await db
    .select({ value: count() })
    .from(urls)
    .where(and(lt(urls.expiresAt, now), isNull(urls.archivedAt)));
  return Number(row?.value || 0);
}
