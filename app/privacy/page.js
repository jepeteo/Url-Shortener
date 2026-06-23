import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — mikrouli.link",
  description: "How mikrouli.link collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "[EFFECTIVE DATE]";
const COMPANY = "[COMPANY / LEGAL ENTITY NAME]";
const CONTACT_EMAIL = "[CONTACT EMAIL]";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        This is a starting template. Replace the bracketed placeholders and have it
        reviewed by a legal professional to ensure it fits your jurisdiction
        (e.g. GDPR, CCPA).
      </div>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {EFFECTIVE_DATE}
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold">1. Who we are</h2>
          <p className="mt-2">
            mikrouli.link (the &quot;Service&quot;) is operated by {COMPANY}. This
            policy explains what data we collect, why, and your rights regarding it.
            For privacy questions, contact{" "}
            <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Data we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Account data:</strong> your name, email address, and a securely
              hashed password (or GitHub OAuth identifier if you sign in with GitHub).
            </li>
            <li>
              <strong>Link data:</strong> the URLs you shorten, custom aliases, UTM
              parameters, and expiry settings.
            </li>
            <li>
              <strong>Click analytics:</strong> when someone visits a short link, we
              record a timestamp, a <em>truncated/anonymized</em> IP address (host bits
              removed), the user agent (browser, OS, device), and the referring page.
            </li>
            <li>
              <strong>Billing data:</strong> handled by Stripe. We store your Stripe
              customer and subscription identifiers and plan status, but never your
              full card details.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How we use data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>To provide and operate the Service and your dashboard;</li>
            <li>To produce the analytics you see for your links;</li>
            <li>To process payments and manage subscriptions;</li>
            <li>To prevent abuse, fraud, and security incidents (rate limiting);</li>
            <li>To communicate with you about your account or password resets.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Legal bases (GDPR)</h2>
          <p className="mt-2">
            Where GDPR applies, we process data to perform our contract with you
            (providing the Service), to comply with legal obligations, and based on our
            legitimate interests in securing and improving the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Cookies</h2>
          <p className="mt-2">
            We use strictly necessary cookies to keep you signed in (authentication
            session). We do not use third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Sharing &amp; processors</h2>
          <p className="mt-2">
            We share data only with service providers that help us run the Service,
            including our database host, our email provider for password resets, and
            Stripe for payments. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Data retention</h2>
          <p className="mt-2">
            Link and click data are retained while your account is active and your
            links exist. Expired links and their analytics may be removed. You can
            delete links at any time from your dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Your rights</h2>
          <p className="mt-2">
            Depending on your location, you may have the right to access, correct,
            export, or delete your personal data, and to object to or restrict certain
            processing. To exercise these rights, contact{" "}
            <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Security</h2>
          <p className="mt-2">
            We use industry-standard measures including password hashing, HTTPS,
            rate limiting, and access controls. No method of transmission or storage
            is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Changes</h2>
          <p className="mt-2">
            We may update this policy. Material changes will be reflected by updating
            the &quot;Last updated&quot; date above.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
