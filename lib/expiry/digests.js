import { getEffectivePlan } from "@/lib/billing";
import { getPlan } from "@/lib/plans";
import { classifyExpiryStage } from "./display";

export function reminderAudience(row) {
  const stored = getPlan(row.plan).id;
  const effective = getEffectivePlan({
    plan: row.plan,
    paymentStatus: row.paymentStatus,
  });
  if (effective === "free" && stored === "pro") {
    return "lapsed-pro";
  }
  if (effective === "free" && stored === "business") {
    return "lapsed-business";
  }
  return effective;
}

export function isReminderEligible(row) {
  if (!row?.userId || row.isAnonymous) {
    return false;
  }
  if (!row.email || !row.emailVerified) {
    return false;
  }
  if (row.emailPreferences === false) {
    return false;
  }
  return true;
}

function linkSummary(row) {
  return {
    id: row.id,
    shortCode: row.shortCode,
    originalUrl: row.originalUrl,
    expiresAt: row.expiresAt,
  };
}

/**
 * One digest per user per stage. Links already recorded for that stage are left out.
 */
export function buildDigests(rows, now) {
  const groups = new Map();

  for (const row of rows) {
    if (!isReminderEligible(row)) {
      continue;
    }

    const stage = classifyExpiryStage(row.expiresAt, now, {
      archived: Boolean(row.archivedAt),
      archiveReason: row.archiveReason,
    });
    if (!stage) {
      continue;
    }
    if (Array.isArray(row.sentStages) && row.sentStages.includes(stage)) {
      continue;
    }

    const key = `${row.userId}:${stage}`;
    let digest = groups.get(key);
    if (!digest) {
      digest = {
        userId: row.userId,
        email: row.email,
        stage,
        audience: reminderAudience(row),
        links: [],
      };
      groups.set(key, digest);
    }

    if (!digest.links.some((link) => link.id === row.id)) {
      digest.links.push(linkSummary(row));
    }
  }

  for (const digest of groups.values()) {
    digest.links.sort((a, b) => {
      const byDate = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      if (byDate !== 0) {
        return byDate;
      }
      return String(a.shortCode).localeCompare(String(b.shortCode));
    });
  }

  return [...groups.values()];
}
