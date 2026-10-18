import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/LegalDocument";
import { OPERATOR } from "@/lib/operator";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Privacy Policy — mikrouli.link",
  description:
    "How MTX STUDIO LTD collects, uses, and keeps data when you use mikrouli.link, under UK GDPR and EU GDPR.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy">
      <LegalSection heading="1. Who we are">
        <p>
          {OPERATOR.siteName} (the &quot;Service&quot;) is operated by {OPERATOR.legalName},
          company number {OPERATOR.companyNumber}, registered in {OPERATOR.registeredIn}.
          Our registered office is {OPERATOR.registeredOffice.join(", ")}. The directors
          are {OPERATOR.directors.join(" and ")}. Full operator details are on the{" "}
          <Link href="/imprint" className="text-primary hover:underline">
            imprint
          </Link>
          .
        </p>
        <p>
          We are the controller of the personal data described in this policy. For
          privacy questions or to use your rights, email{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.contactEmail}`}>
            {OPERATOR.contactEmail}
          </a>
          . We are not registered for VAT, and we do not yet hold an ICO registration
          number.
        </p>
        <p>
          This policy is written for the UK GDPR and the EU GDPR. The same practical
          rules apply under both. The legal bases below refer to Article 6 of each.
        </p>
      </LegalSection>

      <LegalSection heading="2. Account data">
        <p>If you create an account, we store:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>your name and email address;</li>
          <li>
            a one-way hash of your password, if you register with email and a password
            (we never store the password itself);
          </li>
          <li>
            your GitHub user id, if you sign in with GitHub, plus the name and email
            GitHub sends us;
          </li>
          <li>
            whether your email is verified, and a verification token with a 24-hour
            expiry;
          </li>
          <li>a password-reset token with a 1-hour expiry, when you ask for one;</li>
          <li>your plan (Free, Pro, or Business) and payment status;</li>
          <li>your Stripe customer id and subscription id, when you pay;</li>
          <li>a hash of an API key, and when it was created, on the Business plan;</li>
          <li>when the account was created.</li>
        </ul>
        <p>
          If you register with email and later sign in with GitHub using the same
          email, we link those sign-in methods only when the email on the existing
          account is already verified. GitHub sign-in does not take over an unverified
          password account. New GitHub accounts are marked verified.
        </p>
      </LegalSection>

      <LegalSection heading="3. Links you create">
        <p>For each short link we store:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>the destination URL, including any UTM parameters you add;</li>
          <li>the short code, or the custom alias on plans that allow one;</li>
          <li>the account that owns it, or a flag that it was created without an account;</li>
          <li>
            a hash of a creator token, for anonymous links, so the browser that created
            the link can claim it later;
          </li>
          <li>the click count, last click time, expiry time, and archive time.</li>
        </ul>
        <p>
          The creator token itself sits in an httpOnly cookie in that browser for up
          to 90 days. We store only the hash.
        </p>
      </LegalSection>

      <LegalSection heading="4. Click data">
        <p>
          When someone opens a short link, and the visitor is not a known bot or
          crawler, we record:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>the time of the click;</li>
          <li>
            an anonymized IP address: for IPv4 we keep the network and set the last
            octet to 0; for IPv6 we keep the first three groups;
          </li>
          <li>the user agent (browser, operating system, and device type);</li>
          <li>the referring page, when the browser sends one.</li>
        </ul>
        <p>
          The link owner can see this in their analytics. We still treat click records
          as personal data. The anonymized IP, user agent, and referrer together can
          sometimes single someone out.
        </p>
      </LegalSection>

      <LegalSection heading="5. Payments">
        <p>
          Paid plans are billed by Stripe. Stripe collects your card details. We do
          not receive or store the full card number. We send Stripe your email address,
          account id, chosen plan, and billing interval (monthly or annual) so the
          subscription can be attached to your account. We then store the Stripe
          customer id, subscription id, plan name, and payment status.
        </p>
      </LegalSection>

      <LegalSection heading="6. Email">
        <p>
          We send email through Resend. That covers email verification, password
          resets, and abuse reports sent to {OPERATOR.abuseEmail}. An abuse report
          contains the URL you report, the reason you choose, and your email address
          if you choose to leave one. We do not use these messages for marketing.
        </p>
      </LegalSection>

      <LegalSection heading="7. Security, rate limits, and errors">
        <p>
          Upstash Redis holds short-lived rate-limit counters. The key can include
          your IP address, your email address (for registration, sign-in, and password
          reset), or your account id. Most counters expire within minutes or hours.
          The anonymous monthly link cap keeps the IP address in the key for up to 31
          days. The same Redis service also caches a redirect target (destination URL
          and expiry) for a few minutes so links open quickly. Production does not
          serve the Service if this store is missing.
        </p>
        <p>
          If you opt into the bot check, Cloudflare Turnstile receives the challenge
          token and your IP address when you register or submit an abuse report. The
          check is on only when we have configured it.
        </p>
        <p>
          Sentry receives error reports when a data source name (DSN) is configured.
          Those reports can include the page address and technical details of the
          failure. We do not enable performance tracing or session replay.
        </p>
      </LegalSection>

      <LegalSection heading="8. Product measurement">
        <p>
          Vercel Web Analytics records cookieless page views (page path, referrer,
          browser, device, and country derived from the IP address). Vercel Speed
          Insights records performance measurements such as Core Web Vitals. Before a
          page view is sent, we strip query strings and remove password-reset tokens
          from the path, so a verification link or reset link is not included.
        </p>
        <p>
          We also record three conversion events from the server: signup (a new
          account was created), link_created, and upgrade (a paid Stripe checkout
          completed). The only properties on those events are the plan name and, for
          an upgrade, whether the interval was monthly or annual. They do not include
          your name, email, account id, or the destination URL. The server call does
          not forward your session cookie or IP address.
        </p>
        <p>
          The footer loads a Buy Me a Coffee button image from that service&apos;s
          content network. Their servers see the request for the image. The image is
          not a tracker we control.
        </p>
      </LegalSection>

      <LegalSection heading="9. Cookies and local storage">
        <p>We use a small number of cookies that are needed to run the Service:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>a signed session cookie so you stay signed in (about 30 days);</li>
          <li>an httpOnly CSRF cookie (about 8 hours) on actions that change data;</li>
          <li>an httpOnly creator-token cookie so an anonymous link can be claimed.</li>
        </ul>
        <p>
          Your theme choice and the dismissal of the cookie notice are stored in the
          browser&apos;s local storage. They are not sent to us as account data.
          Vercel Web Analytics and Speed Insights do not set cookies. We do not use
          advertising cookies.
        </p>
      </LegalSection>

      <LegalSection heading="10. Why we use data, and the legal basis">
        <p>Under the UK GDPR and the EU GDPR we rely on these bases:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Contract (Article 6(1)(b)):</strong> creating and running your
            account, shortening links, applying plan limits and expiry, sending
            verification and password-reset email, and taking payment for a plan you
            choose.
          </li>
          <li>
            <strong>Legitimate interests (Article 6(1)(f)):</strong> click analytics
            for the link owner, keeping archived links so a short code is never issued
            twice, rate limiting, abuse reports, error monitoring, and cookieless
            product measurement. These interests are running a safe and understandable
            short-link service. They are not overridden by your rights where the data
            is limited as described above. You can object, as set out below.
          </li>
          <li>
            <strong>Legal obligation (Article 6(1)(c)):</strong> records Stripe and we
            must keep for tax and accounting.
          </li>
        </ul>
        <p>
          We do not use consent as the basis for advertising, and we do not sell
          personal data. Strictly necessary cookies do not require consent. We do not
          make solely automated decisions that produce legal effects about you.
        </p>
      </LegalSection>

      <LegalSection heading="11. Who processes data for us">
        <p>We share personal data with these processors, only so they can run their part of the Service:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Neon</strong> — Postgres database for accounts, links, and clicks;
          </li>
          <li>
            <strong>Upstash</strong> — Redis for rate limits and the short-lived redirect cache;
          </li>
          <li>
            <strong>Vercel</strong> — hosting, Web Analytics, and Speed Insights;
          </li>
          <li>
            <strong>Stripe</strong> — subscriptions and card payments;
          </li>
          <li>
            <strong>Resend</strong> — transactional email and delivery of abuse reports;
          </li>
          <li>
            <strong>Sentry</strong> — error reports, when a DSN is configured;
          </li>
          <li>
            <strong>GitHub</strong> — optional sign-in;
          </li>
          <li>
            <strong>Cloudflare</strong> — optional Turnstile bot check.
          </li>
        </ul>
        <p>
          Several of these providers process data in the United States and in other
          countries outside the UK and the EEA. Where personal data leaves the UK or
          the EEA, we rely on an appropriate transfer safeguard, such as the
          provider&apos;s standard contractual clauses and the UK international data
          transfer addendum.
        </p>
      </LegalSection>

      <LegalSection heading="12. How long we keep it">
        <p>
          Account data is kept while the account exists. If we close an account, we
          delete the account row (name, email, password hash, and billing ids we
          stored). There is no self-serve delete button; email {OPERATOR.contactEmail}{" "}
          and we will do it.
        </p>
        <p>
          Links and click records are kept, including after a link expires, after you
          remove it from the dashboard, and after an account is closed. Expiry, a
          dashboard delete, and an admin removal all archive the link. They do not
          delete it, and they do not delete its clicks. We keep them so the short code
          is never given to someone else. Archived links stop redirecting.
        </p>
        <p>
          Verification tokens last 24 hours. Password-reset tokens last 1 hour. Rate-limit
          keys expire with their window (minutes, hours, or up to 31 days for the
          anonymous monthly cap). The redirect cache lasts about 5 minutes, or less if
          the link expires sooner. Stripe keeps payment records under its own policy.
          Sentry and Vercel keep events for the retention period configured on those
          accounts.
        </p>
      </LegalSection>

      <LegalSection heading="13. Your rights">
        <p>
          Under the UK GDPR and the EU GDPR you can ask to access, correct, erase, or
          restrict your personal data, and you can ask for a portable copy of the data
          you provided. You can object to processing based on legitimate interests. You
          can complain to the UK Information Commissioner&apos;s Office (
          <a
            className="text-primary hover:underline"
            href="https://ico.org.uk/make-a-complaint/"
          >
            ico.org.uk
          </a>
          ) or, if you are in the EEA, to your local supervisory authority.
        </p>
        <p>
          Email{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.contactEmail}`}>
            {OPERATOR.contactEmail}
          </a>{" "}
          to use these rights. We may need to confirm it is you. Archived links and
          their clicks are kept, as described above. If you need a destination URL
          taken off an archived link, say so in the email and we will clear it where
          we can do that without reissuing the short code.
        </p>
        <p>
          The Service is not directed at children. You need to be old enough to enter
          a contract where you live. If you believe we have account data for a child,
          email us and we will delete the account.
        </p>
      </LegalSection>

      <LegalSection heading="14. Security">
        <p>
          We use HTTPS, HSTS in production, password hashing, hashed API keys, hashed
          creator tokens, CSRF checks on changes, and rate limits. No method of
          transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection heading="15. Changes">
        <p>
          We will post changes on this page and update the effective date. The date at
          the top of this page is {OPERATOR.effectiveDate}.
        </p>
      </LegalSection>

      <LegalSection heading="16. Contact">
        <p>
          {OPERATOR.legalName}, {OPERATOR.registeredOffice.join(", ")}. Email{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.contactEmail}`}>
            {OPERATOR.contactEmail}
          </a>
          . To report a link, email{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.abuseEmail}`}>
            {OPERATOR.abuseEmail}
          </a>{" "}
          or use the{" "}
          <Link href="/abuse" className="text-primary hover:underline">
            abuse form
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
