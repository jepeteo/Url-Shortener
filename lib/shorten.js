import { nanoid } from "nanoid";
import { getDb, urls, isUniqueViolation } from "./db";
import {
  isValidAlias,
  isReservedAlias,
  isValidUrl,
  appendUtmParams,
} from "./urlValidation";
import { canCreateLink } from "./usage";
import {
  canUseFeature,
  computeExpiresAt,
  getExpiryDaysForPlan,
  getPlan,
} from "./plans";

const MAX_COLLISION_RETRIES = 3;

export async function createShortUrl({
  originalUrl,
  user = null,
  alias = null,
  expiryDays = undefined,
  utm = null,
}) {
  let targetUrl = originalUrl;
  if (utm) {
    targetUrl = appendUtmParams(originalUrl, utm);
  }

  if (!isValidUrl(targetUrl)) {
    return { error: "Invalid URL. Only http and https URLs are allowed.", status: 400 };
  }

  if (user?.id) {
    const usage = await canCreateLink(user);
    if (!usage.allowed) {
      return { error: usage.reason, status: 429 };
    }
  }

  const planId = user?.plan || "free";
  const plan = getPlan(planId);

  let shortCode;
  if (alias) {
    if (!canUseFeature(planId, "customAlias")) {
      return { error: "Custom aliases require a Pro or Business plan.", status: 403 };
    }
    if (!isValidAlias(alias) || isReservedAlias(alias)) {
      return { error: "Invalid or reserved alias.", status: 400 };
    }
    shortCode = alias.toLowerCase();
  } else {
    shortCode = nanoid(6);
  }

  const requestedExpiryDays =
    expiryDays === undefined ? plan.defaultExpiryDays : expiryDays;
  const resolvedExpiryDays = user
    ? getExpiryDaysForPlan(planId, requestedExpiryDays)
    : 14;
  const expiresAt = computeExpiresAt(resolvedExpiryDays);

  const db = getDb();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const values = {
    originalUrl: targetUrl,
    shortCode,
    expiresAt,
    userId: user?.id || null,
    clicks: 0,
    lastClickedAt: null,
    isAnonymous: !user?.id,
  };

  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt += 1) {
    try {
      if (!alias && attempt > 0) {
        values.shortCode = nanoid(6);
        shortCode = values.shortCode;
      }
      await db.insert(urls).values(values);
      return {
        shortUrl: `${baseUrl}/${values.shortCode}`,
        shortCode: values.shortCode,
        expiresAt: values.expiresAt,
      };
    } catch (error) {
      if (isUniqueViolation(error) && !alias) {
        continue;
      }
      if (isUniqueViolation(error) && alias) {
        return { error: "Alias already taken.", status: 409 };
      }
      throw error;
    }
  }

  return { error: "Could not generate a unique short code.", status: 500 };
}
