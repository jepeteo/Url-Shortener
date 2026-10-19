import { archiveExpiredLinks, countExpiredUnarchived } from "./archive";
import { buildDigests } from "./digests";
import { deliverDigests, emptyReminderSummary, loadReminderRows } from "./reminders";

export function asExpiredArchive(row, now) {
  return {
    ...row,
    archivedAt: row.archivedAt || now,
    archiveReason: "expired",
    sentStages: row.sentStages || [],
  };
}

/**
 * Daily job: warn about links that are still live, archive those that have
 * expired, then email once about the links that archive just covered.
 * A second run the same day finds the reminder rows already claimed.
 */
export async function runExpiryMaintenance(options) {
  const now = options.now || new Date();
  const dryRun = Boolean(options.dryRun);
  const db = options.db;
  const loadRows = options.loadRows || loadReminderRows;
  const archive = options.archive || archiveExpiredLinks;
  const countArchivable = options.countArchivable || countExpiredUnarchived;
  const summary = emptyReminderSummary();
  let failed = 0;

  const activeRows = await loadRows(db, now, "active");
  const activeDelivery = await deliverDigests(buildDigests(activeRows, now), {
    ...options,
    dryRun,
    summary,
  });
  failed += activeDelivery.failed;

  let archived = 0;
  if (dryRun) {
    const archivable = await loadRows(db, now, "archivable");
    archived = await countArchivable(db, now);
    const alreadyExpired = await loadRows(db, now, "expired");
    const expiredDelivery = await deliverDigests(
      buildDigests(
        [...alreadyExpired, ...archivable.map((row) => asExpiredArchive(row, now))],
        now
      ),
      { ...options, dryRun: true, summary }
    );
    failed += expiredDelivery.failed;
  } else {
    const archivedRows = await archive(db, now);
    archived = Array.isArray(archivedRows) ? archivedRows.length : Number(archivedRows || 0);
    const expiredRows = await loadRows(db, now, "expired");
    const expiredDelivery = await deliverDigests(buildDigests(expiredRows, now), {
      ...options,
      dryRun: false,
      summary,
    });
    failed += expiredDelivery.failed;
  }

  return { dryRun, archived, failed, reminders: summary };
}
