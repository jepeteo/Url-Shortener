import { and, eq, gt, inArray, isNotNull, isNull, lt, notExists } from "drizzle-orm";
import { expiryEmails, urls, users } from "@/lib/db";
import { sendExpiryReminderEmail } from "@/lib/email";
import { EVENTS, trackEvent } from "@/lib/analytics";
import { ARCHIVE_REASONS, EXPIRY_EMAIL_STAGES, REMINDER_LEAD_DAYS } from "./constants";
import { startOfUtcDay } from "./display";
import { preferenceUrl } from "./preferences";

const reminderColumns = {
  id: urls.id,
  shortCode: urls.shortCode,
  originalUrl: urls.originalUrl,
  expiresAt: urls.expiresAt,
  archivedAt: urls.archivedAt,
  archiveReason: urls.archiveReason,
  userId: urls.userId,
  isAnonymous: urls.isAnonymous,
  email: users.email,
  emailVerified: users.emailVerified,
  emailPreferences: users.emailPreferences,
  plan: users.plan,
  paymentStatus: users.paymentStatus,
};

function eligibleUser() {
  return and(
    isNotNull(urls.userId),
    eq(urls.isAnonymous, false),
    isNotNull(users.emailVerified),
    eq(users.emailPreferences, true)
  );
}

function upcomingHorizon(now) {
  const start = startOfUtcDay(now);
  return new Date(start.getTime() + (REMINDER_LEAD_DAYS + 1) * 24 * 60 * 60 * 1000);
}

async function withSentStages(db, rows) {
  if (rows.length === 0) {
    return rows;
  }
  const sent = await db
    .select({ urlId: expiryEmails.urlId, stage: expiryEmails.stage })
    .from(expiryEmails)
    .where(inArray(expiryEmails.urlId, rows.map((row) => row.id)));

  const byUrl = new Map();
  for (const row of sent) {
    const stages = byUrl.get(row.urlId) || [];
    stages.push(row.stage);
    byUrl.set(row.urlId, stages);
  }

  return rows.map((row) => ({ ...row, sentStages: byUrl.get(row.id) || [] }));
}

export async function loadReminderRows(db, now, kind) {
  if (kind === "active") {
    const rows = await db
      .select(reminderColumns)
      .from(urls)
      .innerJoin(users, eq(urls.userId, users.id))
      .where(
        and(
          eligibleUser(),
          isNull(urls.archivedAt),
          isNotNull(urls.expiresAt),
          gt(urls.expiresAt, now),
          lt(urls.expiresAt, upcomingHorizon(now))
        )
      );
    return withSentStages(db, rows);
  }

  if (kind === "archivable") {
    return db
      .select(reminderColumns)
      .from(urls)
      .innerJoin(users, eq(urls.userId, users.id))
      .where(and(eligibleUser(), isNull(urls.archivedAt), isNotNull(urls.expiresAt), lt(urls.expiresAt, now)));
  }

  return db
    .select(reminderColumns)
    .from(urls)
    .innerJoin(users, eq(urls.userId, users.id))
    .where(
      and(
        eligibleUser(),
        eq(urls.archiveReason, ARCHIVE_REASONS.expired),
        isNotNull(urls.archivedAt),
        notExists(
          db
            .select({ id: expiryEmails.id })
            .from(expiryEmails)
            .where(
              and(
                eq(expiryEmails.urlId, urls.id),
                eq(expiryEmails.stage, EXPIRY_EMAIL_STAGES.expired)
              )
            )
        )
      )
    );
}

export async function claimExpiryEmails(db, digest) {
  if (digest.links.length === 0) {
    return [];
  }

  const inserted = await db
    .insert(expiryEmails)
    .values(
      digest.links.map((link) => ({
        urlId: link.id,
        userId: digest.userId,
        stage: digest.stage,
      }))
    )
    .onConflictDoNothing({ target: [expiryEmails.urlId, expiryEmails.stage] })
    .returning({ urlId: expiryEmails.urlId });

  const claimedIds = new Set((inserted || []).map((row) => row.urlId));
  return digest.links.filter((link) => claimedIds.has(link.id));
}

export async function releaseExpiryEmails(db, stage, urlIds) {
  if (!urlIds.length) {
    return;
  }
  await db
    .delete(expiryEmails)
    .where(and(eq(expiryEmails.stage, stage), inArray(expiryEmails.urlId, urlIds)));
}

export function emptyReminderSummary() {
  return {
    upcoming: { users: 0, links: 0 },
    today: { users: 0, links: 0 },
    expired: { users: 0, links: 0 },
  };
}

export async function deliverDigests(digests, options) {
  const summary = options.summary || emptyReminderSummary();
  const send = options.send || sendExpiryReminderEmail;
  const claim = options.claim || claimExpiryEmails;
  const release = options.release || releaseExpiryEmails;
  const track = options.track || trackEvent;
  let failed = 0;

  for (const digest of digests) {
    if (options.dryRun) {
      summary[digest.stage].users += 1;
      summary[digest.stage].links += digest.links.length;
      continue;
    }

    const claimed = await claim(options.db, digest);
    if (claimed.length === 0) {
      continue;
    }

    try {
      const unsubscribeUrl = preferenceUrl({ userId: digest.userId, enabled: false });
      const result = await send({
        email: digest.email,
        stage: digest.stage,
        audience: digest.audience,
        links: claimed,
        unsubscribeUrl,
      });
      if (result && result.sent === false && !result.dev) {
        throw new Error("expiry reminder was not accepted");
      }
      summary[digest.stage].users += 1;
      summary[digest.stage].links += claimed.length;
      await track(EVENTS.expiryEmailSent, { stage: digest.stage });
    } catch (error) {
      failed += 1;
      console.error(
        `Expiry reminder (${digest.stage}) failed for ${claimed.length} link(s):`,
        error?.message || error
      );
      try {
        await release(options.db, digest.stage, claimed.map((link) => link.id));
      } catch (releaseError) {
        console.error("Could not release expiry reminder claim:", releaseError?.message || releaseError);
      }
    }
  }

  return { summary, failed };
}
