# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Expiry reminder digests for verified accounts: one email three days before a link expires, one on the expiry day, and one after the daily job archives it. One email per user per stage, sent at most once per link (`expiry_emails`). Each message links to pricing or the dashboard and includes a signed one-click unsubscribe (`users.email_preferences`)
- QR code PNG and SVG download, with the expiry date on the download and on dashboard rows
- Server analytics events `expiry_email_sent` (stage) and `restore_after_upgrade` (count). Properties still exclude personal data
- Vercel Web Analytics and Speed Insights, with server-side `signup`, `link_created`, and `upgrade` events (plan name and billing interval only; query strings and password-reset tokens are stripped from page measurements)
- Privacy Policy and Terms of Service for MTX STUDIO LTD, effective 18 October 2026
- Imprint at `/imprint`, with `/impressum` redirecting to it, linked from the footer
- Abuse report form at `/abuse` (CSRF, honeypot, Turnstile, rate limit) that emails abuse@mikrouli.link, plus a report path from `/link-not-found`
- Reserved paths for imprint, impressum, abuse, and upcoming routes (`qr-code-generator`, `utm-builder`, `blog`, `el`, `en`)
- Per-page title, description, and canonical URL for the public marketing pages; sitemap lists those pages only

### Changed
- The daily cleanup cron sends the reminder digests and then archives expired links. `?dryRun=1` (or `EXPIRY_EMAIL_DRY_RUN=1`) previews the counts without writing or sending. Admins can open `/api/admin/expiry-email-preview` to read a sample
- An active upgrade (checkout, or a subscription that becomes active or moves up a plan) restores links archived because they expired and extends live links to the new plan default when that date is later. User and admin archives are left alone. `urls.archive_reason` tells those apart
- Imprint and privacy show an ICO registration number only when one is set, and say nothing about it otherwise
- Content Security Policy names `va.vercel-scripts.com` and `vitals.vercel-insights.com` so Analytics and Speed Insights can load
- `robots.txt` also disallows `/auth/` and `/analytics` (API, dashboard, and admin were already disallowed) and still points at the sitemap

### Fixed
- Expired links are archived instead of deleted, so short codes and custom aliases are never reissued and click history is kept
- Monthly link quota counts every link created in the UTC month, including archived links, so deleting a link does not free quota
- Month boundaries for link quotas use UTC
- Redirects are temporary (307) with `Cache-Control: private, no-store`; the redirect cache stores link expiry and stops serving a link as soon as it expires
- Anonymous link claims require the creator token cookie set when the link was created
- GitHub sign-in no longer links onto an unverified password account
- Clicks are recorded with Next.js `after()` so the platform waits for the write without delaying the redirect
- Stripe webhook events are marked processed only after the handler succeeds, so a failed delivery can be retried
- Checkout reuses an existing Stripe customer instead of passing `customer_email`
- Unknown Stripe price IDs no longer change a subscription to the free plan
- Rate-limit counters apply their TTL in the same Redis command as the increment
- Redirect cache now invalidated when links expire (cron) or are deleted (admin/user delete)
- Paid analytics (charts, click history, CSV export) gated by plan on API and UI
- `past_due` subscriptions no longer grant Pro/Business features until billing is active again
- Admin DELETE mutations now require CSRF tokens
- Unified reserved path list prevents unusable custom aliases (e.g. `contact`, `mtxadmin`)
- JWT session plan refreshed from database on each request
- Password reset hashing aligned to bcrypt cost 12
- CSRF token comparison uses timing-safe equality
- WhatsApp in-app clicks no longer filtered as bot traffic
- `/contact` route blocked by short-link middleware rewrite (added to reserved paths)

### Added
- Registration bot protection: CSRF, honeypot field, per-email rate limit, optional Cloudflare Turnstile
- Anonymous link monthly cap (20 links per IP)
- CSRF protection on email verification resend
- `lib/billing.js` with `isBillingActive` and `getEffectivePlan` helpers
- `lib/reservedPaths.js` shared between middleware and alias validation
- `lib/botProtection.js` for honeypot and Turnstile verification
- HSTS header in production
- Max URL length validation (2048 characters)
- Unit tests for billing, bot protection, and reserved paths

### Changed
- Registration success response no longer returns `userId`

### Added
- Admin panel tabs for users, links, and recent clicks with search, suspicious-user flagging, and delete actions
- Contact page (`/contact`) linking to MTX Studio support channels, with footer and sitemap links
- Neon Postgres database with Drizzle ORM (replaces MongoDB)
- `DATABASE_URL` env var, `npm run db:push` / `db:migrate` / `db:studio` scripts
- Daily cron job to clean up expired links (`/api/cron/cleanup-expired`)
- `isValidUuid` helper for URL id validation
- Production Upstash Redis requirement for rate limiting in production (fail-closed without Redis)
- Named per-route rate limit presets (`RATE_LIMITS`) for shorten, API v1, delete, and API key routes
- Redis-backed redirect cache with configurable `REDIRECT_CACHE_TTL_SEC` (default 5 minutes)
- CSRF protection via double-submit cookie on session mutations (`GET /api/csrf`, `fetchWithCsrf` helper)
- JSON-LD structured data on landing (`SoftwareApplication`, `FAQPage`) and pricing (`Product`/`Offer`)
- Dashboard link status badges with active/expired labels and expiry countdown
- Shared Upstash client helper (`lib/upstash.js`)
- Schema inventory doc for upcoming Neon migration (`docs/schema-inventory.md`)
- Email verification for credentials signups with resend and verify routes
- Soft verification: unverified users can log in but are limited to 2 links/month until verified
- `VerifyEmailBanner` with resend action; GitHub OAuth users are auto-verified
- `npm run migrate-email-verified` script to backfill existing users
- Sentry error monitoring (`@sentry/nextjs`, errors only — no tracing or replay)
- Lightweight cookie consent notice linking to the Privacy Policy
- Analytics page restyle: stat cards, gradient AreaChart, loading skeleton
- Modern indigo/violet redesign with gradient accents, glassmorphism, and motion
- Light/dark theme support via `next-themes` with a header toggle (system default)
- Redesigned landing page with hero, feature grid, how-it-works, pricing teaser, and FAQ
- Terms of Service and Privacy Policy pages (templates) linked from the footer and sitemap
- Monthly/annual billing toggle on pricing with annual Stripe price IDs
- Dynamic Open Graph & Twitter card images generated with `next/og` (PNG)
- Plan-aware shorten form: custom alias and expiry options reflect the user's plan
- Unit tests for URL validation, rate limiting, plans, shortening, usage quotas, and API keys
- CI changelog check (`npm run check:changelog`) to require CHANGELOG updates when application code changes
- `isValidObjectId` helper for safer MongoDB id validation

### Changed
- Redirect cache and rate limit routes now use async Upstash operations
- URL delete invalidates redirect cache entry for the short code
- README, `.env.example`, and ROADMAP updated for Redis requirements and Neon migration handoff
- CI pipeline now runs production build, npm audit, and changelog verification
- Dashboard action buttons restyled to be theme-aware (no hard-coded light colors)
- Dashboard API key section uses live plan from `/api/usage` instead of stale JWT session plan
- Removed unused dependencies (`lodash`, `dompurify`, `express-rate-limit`, `react-query`)
- Replaced static SVG OG image with generated PNG OG/Twitter images
- Updated README with current API routes, deployment, and environment variables

### Fixed
- Rate limiting now enforced on shorten, register, and API v1 endpoints (missing `await` on async check)
- Credentials login now normalizes email case to match registration
- Pagination limit capped at 100 on `/api/urls`
- Invalid URL ids return 400 instead of 500
- Never-expire and configurable expiry now resolve correctly per plan
- Demo seed script includes consistent schema fields (`plan`, `expiresAt`, string `userId`)
- Stripe webhook errors no longer leak internal exception messages

### Security
- Archived links do not redirect, and short codes stay reserved after expiry, user delete, and admin removal
- CI audits production dependencies only. The remaining high advisory is `braces` through Tailwind, and upstream 3.0.3 has no patched release. `tailwindcss-animate` is a build plugin, so it lives with the other dev dependencies and no longer pulls that advisory into production. `next` still pins `postcss@8.4.31`, so production installs force the direct `postcss@^8` release (currently 8.5.30)
- Claiming an anonymous link requires the httpOnly creator cookie from the browser that created it
- GitHub OAuth cannot take over an unverified email/password account
- CSRF tokens required on `/api/shorten`, URL delete, API key generation, claim, and Stripe routes
- Rate limiting no longer silently falls back to in-memory storage in production
- Click IP addresses are anonymized (IPv4 /24, IPv6 /48) before storage for GDPR compliance
- Stripe webhooks are now idempotent (deduplicated by event id) and handle `invoice.payment_failed`
- Hardened SSRF URL validation: decimal IPs, private IPv4/IPv6 ranges blocked
- Rate limits added for credentials login and password reset requests
- Server-side password length validation on password reset confirm
- Register name trimmed and limited to 100 characters
- `.env` added to `.gitignore`

## [0.1.0] - 2024-01-01

- Initial release
