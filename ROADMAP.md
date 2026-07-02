# Roadmap

This document tracks features that are planned or coming soon to mikrouli.link.
Items are grouped by priority, not committed dates.

## Recently shipped

See [CHANGELOG.md](CHANGELOG.md) for shipped features, including:

- Neon Postgres migration with Drizzle ORM (replaces MongoDB)
- Production Redis hardening (Upstash rate limits + redirect cache)
- CSRF protection on session mutations
- Registration bot protection (honeypot, CSRF, optional Turnstile)
- Plan-gated analytics and billing-status feature enforcement
- Email verification with soft 2-link cap for unverified users
- Sentry error monitoring and cookie consent
- Modern redesign, dark mode, annual billing, and legal pages

## Planned

- **Custom domains** — bring your own branded domain for short links (Business plan).
  Already referenced on the pricing page as "coming soon".
- **Geo & country analytics** — enrich click data with country/region (privacy-friendly,
  derived from anonymized IP) and show a map/breakdown on the analytics page.
- **Bulk link creation & CSV import** — create many links at once from the dashboard or API.
- **Link editing** — update destination URL, alias, and expiry after creation.
- **API key lifecycle** — revoke, rotate, and manage multiple keys per user.
- **Team workspaces** — invite members, shared links, and role-based access.
- **Tags & folders** — organize links and filter the dashboard by tag.
- **UTM builder UI** — guided builder with presets and saved campaigns.
- **Link-in-bio / landing pages** — simple hosted bio page bundling multiple links.
- **Password-protected & one-time links** — gated or self-destructing links.
- **Scheduled / deep links** — activate links at a future time; smart mobile deep links.
- **Webhooks** — notify external systems on click events.
- **API rate-limit dashboard & usage metrics** — visibility into API key usage.

## Under consideration

- Browser extension and mobile share targets
- A/B redirect testing (split traffic across destinations)
- Slack/Discord integrations for link creation
- Data export for an entire account (GDPR self-service export)
- 2FA for accounts
