# URL Shortener

A modern, feature-rich URL shortening service built with Next.js, MongoDB, and Shadcn UI components.

## Features

- User authentication with NextAuth (credentials + GitHub OAuth)
- Create shortened URLs (authenticated or anonymous)
- Dashboard to manage and view shortened URLs
- Per-link analytics with charts and CSV export
- QR code generation for any link
- Freemium plans with Stripe billing (Free, Pro, Business) and monthly/annual pricing
- Business-tier API access via API keys
- Password reset functionality
- Rate limiting to prevent abuse (in-memory or Upstash Redis)
- Light/dark mode and a modern, responsive UI
- Privacy-friendly click tracking with anonymized IPs

## Tech Stack

- Next.js 15 (App Router)
- MongoDB
- NextAuth for authentication
- Stripe for billing
- Tailwind CSS + Shadcn UI components + next-themes
- Vitest for unit tests

## Installation

### Prerequisites

- Node.js 20+
- MongoDB database

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/jepeteo/url-shortener.git
cd url-shortener
npm install
```

2. Create a `.env.local` file (see `.env.example` for all variables):

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Create database indexes (optional but recommended):

```bash
npm run create-indexes
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel)

1. Push the repo to GitHub and import it into [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` in the Vercel project settings
   (set `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to your production URL).
3. Configure a Stripe webhook pointing to `https://your-domain/api/stripe/webhook`
   and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Deploy. After the first deploy, run `npm run create-indexes` and
   `npm run migrate-email-verified` against your production database.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Long random secret for NextAuth |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_BASE_URL` | Yes | App base URL |
| `GITHUB_ID` / `GITHUB_SECRET` | No | GitHub OAuth login |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Password-reset emails |
| `UPSTASH_REDIS_REST_URL` / `..._TOKEN` | No | Distributed rate limiting |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | For billing | Stripe API + webhook |
| `STRIPE_PRO_PRICE_ID` / `STRIPE_BUSINESS_PRICE_ID` | For billing | Monthly price IDs |
| `STRIPE_PRO_ANNUAL_PRICE_ID` / `STRIPE_BUSINESS_ANNUAL_PRICE_ID` | For annual billing | Annual price IDs |
| `ADMIN_EMAILS` | No | Comma-separated admin emails |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error monitoring |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | No | Sentry source map upload (CI) |

## Demo Account

Run `npm run seed-demo` or click "Try Demo Account" on the sign-in page (development only):

- Email: `demo@example.com`
- Password: `demopassword`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/shorten` | Create a short URL (session or anonymous) |
| POST | `/api/v1/shorten` | Create via API key (Business plan) |
| GET | `/api/urls` | List user's URLs (paginated) |
| GET/DELETE | `/api/urls/[id]` | Get or delete a URL |
| GET | `/api/analytics/[id]` | Click analytics for a URL |
| GET | `/api/usage` | Current plan usage |
| POST | `/api/register` | User registration (sends verification email) |
| GET | `/api/auth/verify` | Confirm email via token |
| POST | `/api/auth/verify/resend` | Resend verification email |
| POST | `/api/claim` | Claim anonymous links after login |
| GET | `/api/[shortCode]` | Redirect to original URL |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — run unit tests
- `npm run lint` — ESLint
- `npm run check:changelog` — verify CHANGELOG updated for source changes
- `npm run seed-demo` — seed demo user and sample URLs
- `npm run create-indexes` — create MongoDB indexes
- `npm run migrate-email-verified` — backfill `emailVerified` for existing users

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

See [CHANGELOG.md](CHANGELOG.md) for release history. Update `[Unreleased]` when changing application code — CI will verify.

## License

This project is licensed under the MIT License.
