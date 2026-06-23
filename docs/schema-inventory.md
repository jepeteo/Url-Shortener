# Schema inventory (Neon Postgres / Drizzle)

Source of truth: [`db/schema.js`](../db/schema.js). Database: Neon Postgres.

## `users`

Authentication, billing, and API key storage.

| Column (DB) | Drizzle field | Type | Notes |
|-------------|---------------|------|-------|
| `id` | `id` | uuid PK | Auto-generated |
| `name` | `name` | text | Display name, max 100 chars |
| `email` | `email` | text | Unique, lowercase |
| `password` | `password` | text | bcrypt hash (credentials only) |
| `github_id` | `githubId` | text | GitHub OAuth provider id |
| `plan` | `plan` | text | `free`, `pro`, or `business` |
| `email_verified` | `emailVerified` | timestamptz | null = unverified |
| `verification_token` | `verificationToken` | text | Email verification token |
| `verification_expires` | `verificationExpires` | bigint | Token expiry timestamp (ms) |
| `reset_password_token` | `resetPasswordToken` | text | Password reset token |
| `reset_password_expires` | `resetPasswordExpires` | bigint | Reset token expiry (ms) |
| `stripe_customer_id` | `stripeCustomerId` | text | Stripe customer id |
| `stripe_subscription_id` | `stripeSubscriptionId` | text | Stripe subscription id |
| `payment_status` | `paymentStatus` | text | e.g. `active`, `past_due` |
| `api_key_hash` | `apiKeyHash` | text | SHA-256 hash of API key |
| `api_key_created_at` | `apiKeyCreatedAt` | timestamptz | When current API key was generated |
| `created_at` | `createdAt` | timestamptz | Account creation |

**Indexes:** unique on `email`

## `urls`

Short link records.

| Column (DB) | Drizzle field | Type | Notes |
|-------------|---------------|------|-------|
| `id` | `id` | uuid PK | Auto-generated |
| `original_url` | `originalUrl` | text | Destination URL (validated) |
| `short_code` | `shortCode` | text | Unique slug, 3–32 chars |
| `user_id` | `userId` | uuid FK | Owner, null if anonymous |
| `is_anonymous` | `isAnonymous` | boolean | Created without auth |
| `claimed_at` | `claimedAt` | timestamptz | When anonymous link was claimed |
| `clicks` | `clicks` | integer | Denormalized click counter |
| `last_clicked_at` | `lastClickedAt` | timestamptz | Last click timestamp |
| `expires_at` | `expiresAt` | timestamptz | null = never expires |
| `created_at` | `createdAt` | timestamptz | Link creation |

**Indexes:**

- unique on `short_code`
- compound on `user_id` + `created_at`
- compound on `short_code` + `expires_at`

Expired links are removed by the daily cron job at `/api/cron/cleanup-expired`.

## `clicks`

Per-click analytics events.

| Column (DB) | Drizzle field | Type | Notes |
|-------------|---------------|------|-------|
| `id` | `id` | uuid PK | Auto-generated |
| `url_id` | `urlId` | uuid FK | References `urls.id` (cascade delete) |
| `short_code` | `shortCode` | text | Denormalized for queries |
| `timestamp` | `timestamp` | timestamptz | Click time |
| `ip` | `ip` | text | Anonymized (/24 IPv4, /48 IPv6) |
| `user_agent` | `userAgent` | text | Raw user agent (bots filtered) |
| `referer` | `referer` | text | HTTP referer header |

**Indexes:** compound on `url_id` + `timestamp`; compound on `short_code` + `timestamp`

## `stripe_events`

Webhook idempotency log.

| Column (DB) | Drizzle field | Type | Notes |
|-------------|---------------|------|-------|
| `id` | `id` | text PK | Stripe event id |
| `type` | `type` | text | Event type |
| `received_at` | `receivedAt` | timestamptz | Processing timestamp |

Duplicate inserts raise Postgres unique violation (`23505`) and are ignored.

## Data access layer

- Connection: [`lib/db.js`](../lib/db.js) (`getDb()`, Neon HTTP driver)
- Validation: [`lib/validation.js`](../lib/validation.js) (`isValidUuid`)
- Migrations: `npm run db:push` or `npm run db:migrate` (see [`drizzle.config.js`](../drizzle.config.js))

## Stack-agnostic features (unchanged by DB migration)

- Upstash Redis rate limiting (`lib/rateLimit.js`, `lib/upstash.js`)
- Upstash redirect cache (`lib/redirectCache.js`)
- CSRF protection (`lib/csrf.js`, `hooks/useCsrf.js`)
- JSON-LD (`lib/structuredData.js`)
- Sentry, Stripe client, URL validation, plans, email sending
