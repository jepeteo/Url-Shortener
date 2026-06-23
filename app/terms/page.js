import Link from "next/link";

export const metadata = {
  title: "Terms of Service — mikrouli.link",
  description: "The terms governing your use of mikrouli.link.",
};

const EFFECTIVE_DATE = "[EFFECTIVE DATE]";
const COMPANY = "[COMPANY / LEGAL ENTITY NAME]";
const CONTACT_EMAIL = "[CONTACT EMAIL]";
const JURISDICTION = "[GOVERNING LAW / JURISDICTION]";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        This is a starting template. Replace the bracketed placeholders and have it
        reviewed by a legal professional before launch.
      </div>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {EFFECTIVE_DATE}
      </p>

      <div className="prose-legal mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold">1. Agreement to terms</h2>
          <p className="mt-2">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use
            of mikrouli.link (the &quot;Service&quot;), operated by {COMPANY}. By
            creating an account or using the Service, you agree to be bound by these
            Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. The service</h2>
          <p className="mt-2">
            mikrouli.link lets you create shortened URLs, generate QR codes, and view
            analytics for your links. Some features require a paid subscription. We
            may add, change, or remove features at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Accounts</h2>
          <p className="mt-2">
            You are responsible for safeguarding your account credentials and for all
            activity that occurs under your account. You must provide accurate
            information and be at least the age of majority in your jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Acceptable use</h2>
          <p className="mt-2">You agree not to use the Service to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Distribute malware, phishing, spam, or fraudulent content;</li>
            <li>Link to illegal content or infringe intellectual property rights;</li>
            <li>Harass, abuse, or harm others;</li>
            <li>
              Circumvent rate limits, security controls, or plan usage limits; or
            </li>
            <li>Violate any applicable law or regulation.</li>
          </ul>
          <p className="mt-2">
            We reserve the right to disable links or accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Plans, billing, and refunds</h2>
          <p className="mt-2">
            Paid plans are billed in advance on a monthly or annual basis through our
            payment processor (Stripe). Subscriptions renew automatically until
            cancelled. You can manage or cancel your subscription at any time from the
            billing portal. Except where required by law, payments are non-refundable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Link expiry and availability</h2>
          <p className="mt-2">
            Links may expire based on your plan. We aim for high availability but do
            not guarantee uninterrupted or error-free service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Termination</h2>
          <p className="mt-2">
            You may stop using the Service at any time. We may suspend or terminate
            your access if you breach these Terms or use the Service in a way that
            could cause harm to us or others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Disclaimers &amp; limitation of liability</h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; without warranties of any kind.
            To the maximum extent permitted by law, {COMPANY} shall not be liable for
            any indirect, incidental, or consequential damages arising from your use
            of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Changes to these terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. Material changes will be
            reflected by updating the &quot;Last updated&quot; date above. Continued
            use of the Service constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Governing law</h2>
          <p className="mt-2">
            These Terms are governed by the laws of {JURISDICTION}, without regard to
            conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Contact</h2>
          <p className="mt-2">
            Questions about these Terms? Contact us at{" "}
            <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
