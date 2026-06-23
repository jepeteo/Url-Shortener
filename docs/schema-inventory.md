# Schema inventory (MongoDB → Neon migration reference)

Current database: `urlShortener` on MongoDB. This document maps collections and fields
for the upcoming Neon Postgres migration.

## `users`

Authentication, billing, and API key storage.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key → migrate to `uuid` |
| `name` | string | Display name, max 100 chars |
| `email` | string | Unique, lowercase |
| `password` | string | bcrypt hash (credentials only) |
| `githubId` | string | GitHub OAuth provider id |
| `plan` | string | `free`, `pro`, or `business` |
| `emailVerified` | Date \| null | null = unverified |
| `verificationToken` | string | Email verification token |
| `verificationExpires` | number | Token expiry timestamp (ms) |
| `resetToken` | string | Password reset token |
| `resetExpires` | number | Reset token expiry timestamp (ms) |
| `stripeCustomerId` | string | Stripe customer id |
| `stripeSubscriptionId` | string | Stripe subscription id |
| `paymentStatus` | string | e.g. `active`, `past_due` |
| `apiKeyHash` | string | SHA-256 hash of API key |
| `apiKeyCreatedAt` | Date | When current API key was generated |
| `createdAt` | Date | Account creation |

**Indexes:** unique on `email`

## `urls`

Short link records.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key → migrate to `uuid` |
| `originalUrl` | string | Destination URL (validated) |
| `shortCode` | string | Unique slug, 3–32 chars |
| `userId` | string \| null | Owner user id as string, null if anonymous |
| `isAnonymous` | boolean | Whether link was created without auth |
| `claimedAt` | Date | When anonymous link was claimed |
| `clicks` | number | Denormalized click counter |
| `lastClickedAt` | Date \| null | Last click timestamp |
| `expiresAt` | Date \| null | null = never expires |
| `createdAt` | Date | Link creation |

**Indexes:**

- unique on `shortCode`
- compound on `userId` + `createdAt` (desc)
- compound on `shortCode` + `expiresAt`
- TTL on `expiresAt` (Postgres: replace with cron cleanup job)

## `clicks`

Per-click analytics events.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key → migrate to `uuid` |
| `urlId` | ObjectId | Reference to `urls._id` |
| `shortCode` | string | Denormalized for queries |
| `timestamp` | Date | Click time |
| `ip` | string | Anonymized (/24 IPv4, /48 IPv6) |
| `userAgent` | string | Raw user agent (bots filtered) |
| `referer` | string \| null | HTTP referer header |

**Indexes:** compound on `urlId` + `timestamp` (desc); compound on `shortCode` + `timestamp` (desc)

## `stripeEvents`

Webhook idempotency log.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | string | Stripe event id (used as primary key) |
| `type` | string | Event type |
| `receivedAt` | Date | Processing timestamp |

**Indexes:** `_id` is unique by design (duplicate insert = 11000 error)

## Suggested Postgres tables

```
users (id uuid PK, ...)
urls (id uuid PK, user_id uuid FK nullable, short_code text UNIQUE, ...)
clicks (id uuid PK, url_id uuid FK, ...)
stripe_events (id text PK, ...)
```

## Files to rewrite during migration

All files importing from `lib/mongodb.js` or using `ObjectId`:

- `lib/auth.js`, `lib/shorten.js`, `lib/usage.js`, `lib/clickTracking.js`, `lib/apiKeys.js`, `lib/userUtils.js`
- `app/api/auth/[...nextauth]/route.js` and auth sub-routes
- `app/api/shorten/route.js`, `app/api/v1/shorten/route.js`
- `app/api/urls/route.js`, `app/api/urls/[id]/route.js`
- `app/api/analytics/[id]/route.js`, `app/api/claim/route.js`
- `app/api/register/route.js`, `app/api/api-keys/route.js`
- `app/api/stripe/webhook/route.js`, `app/api/stripe/portal/route.js`
- `app/api/admin/route.js`, `app/api/[shortCode]/route.js`
- `scripts/seed-demo.js`, `scripts/create-indexes.js`, `scripts/migrate-email-verified.js`
- `lib/validation.js` (`isValidObjectId` → UUID validation)

## Stack-agnostic features (no rewrite needed)

These survive migration as-is:

- Upstash Redis rate limiting (`lib/rateLimit.js`, `lib/upstash.js`)
- Upstash redirect cache (`lib/redirectCache.js`)
- CSRF protection (`lib/csrf.js`, `hooks/useCsrf.js`)
- JSON-LD (`lib/structuredData.js`)
- Sentry, Stripe client, URL validation, plans, email sending
