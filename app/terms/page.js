import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/LegalDocument";
import { OPERATOR } from "@/lib/operator";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Terms of Service — mikrouli.link",
  description:
    "The terms for using mikrouli.link, operated by MTX STUDIO LTD under the law of England and Wales.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service">
      <LegalSection heading="1. Agreement">
        <p>
          These terms are a contract between you and {OPERATOR.legalName} (&quot;we&quot;,
          &quot;us&quot;) for your use of {OPERATOR.siteName} (the &quot;Service&quot;).
          The company is registered in {OPERATOR.registeredIn} under company number{" "}
          {OPERATOR.companyNumber}. By creating an account, creating a link, or paying
          for a plan, you agree to these terms. If you do not agree, do not use the
          Service.
        </p>
        <p>
          Our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          explains how we handle personal data. Our{" "}
          <Link href="/imprint" className="text-primary hover:underline">
            imprint
          </Link>{" "}
          has the registered office and the directors.
        </p>
      </LegalSection>

      <LegalSection heading="2. The service">
        <p>
          The Service lets you create short URLs, generate a QR code for a link, and
          view click analytics. Some features depend on your plan. We may add, change,
          or remove features. We aim for reliable redirects and do not promise that the
          Service will be uninterrupted or error-free.
        </p>
        <p>
          You must have the right to use the destination you shorten. You are
          responsible for what that destination contains and for what you do with the
          short link.
        </p>
      </LegalSection>

      <LegalSection heading="3. Accounts">
        <p>
          You must be old enough to enter a contract where you live. Keep your
          password and API keys to yourself. You are responsible for activity under
          your account.
        </p>
        <p>
          Give us an accurate name and email. Email-and-password accounts have to
          verify the email address. Until you do, the account is limited to 2 links in
          a calendar month. GitHub sign-in is marked verified. We link a GitHub sign-in
          to an existing password account only when that account&apos;s email is
          already verified.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>phish, defraud, or mislead someone about who you are or where a link goes;</li>
          <li>distribute malware or other harmful software;</li>
          <li>send spam or run unsolicited bulk messaging;</li>
          <li>link to illegal content, or break intellectual property rights;</li>
          <li>harass, abuse, or harm another person;</li>
          <li>bypass rate limits, security checks, or plan limits;</li>
          <li>break any law that applies to you.</li>
        </ul>
        <p>
          We may disable a link that breaks these terms. Disabling a link archives it:
          it stops redirecting, and the short code is not given out again. We may also
          suspend or close an account. You can report a link on the{" "}
          <Link href="/abuse" className="text-primary hover:underline">
            abuse page
          </Link>{" "}
          or by email to{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.abuseEmail}`}>
            {OPERATOR.abuseEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="5. Plans and link expiry">
        <p>
          Prices are in US dollars and are shown on the{" "}
          <Link href="/pricing" className="text-primary hover:underline">
            pricing page
          </Link>{" "}
          before you pay. The plans, and how long links last, work like this:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Free:</strong> 20 links per calendar month. Each link expires 14
            days after it is created. Custom aliases and a choice of expiry are not
            included.
          </li>
          <li>
            <strong>Pro:</strong> 100 links per calendar month. Links default to 90
            days. You can choose a shorter expiry from the options the product offers.
          </li>
          <li>
            <strong>Business:</strong> no monthly link cap. Links default to 1 year.
            You can choose a shorter expiry, or no expiry.
          </li>
          <li>
            <strong>No account:</strong> 20 links per calendar month for that network,
            each expiring after 14 days.
          </li>
        </ul>
        <p>
          A calendar month is counted in UTC. Archiving a link, or removing it from
          your dashboard, does not give the monthly allowance back. The count includes
          links you have already archived. Unverified email accounts stay at 2 links
          per month until the email is verified, even on a higher plan allowance.
        </p>
        <p>
          When a link expires, a daily job archives it. An archived link does not
          redirect. Click history for that link is kept. See the Privacy Policy for
          how long we keep links and clicks.
        </p>
        <p>
          If your email is verified and you have not turned expiry reminders off, we
          email you once when a link&apos;s expiry date is within three days, once on
          the day it expires, and once after it has been archived. Each email lists
          the links for that stage. Anonymous links have no email address, so they
          are not included.
        </p>
        <p>
          When a Free account, or a lapsed paid subscription, becomes an active Pro
          or Business subscription, links that were archived only because they
          expired start working again. Links that are still live and have an expiry
          are given the new plan&apos;s default expiry when that is later than the
          date they already have (90 days on Pro, one year on Business). Moving from
          an active Pro plan to Business does the same. Links you removed, or that we
          removed, stay archived. A renewal of the plan you already have active does
          not change those dates.
        </p>
      </LegalSection>

      <LegalSection heading="6. Billing and cancellation">
        <p>
          Paid plans are subscriptions billed by Stripe, monthly or annually, in
          advance. The subscription renews until you cancel. You can cancel or change
          payment details in the Stripe billing portal, opened from &quot;Manage
          billing&quot; on the pricing page when you are signed in.
        </p>
        <p>
          Cancelling stops the next renewal. Paid features stay while Stripe still
          reports the subscription as active (or trialing). When Stripe tells us the
          subscription has ended, the account returns to the Free plan. If a payment
          fails and the subscription is past due, or is in any status other than
          active or trialing, paid features stop until billing is active again. Free
          features remain available within the Free limits.
        </p>
        <p>
          We do not store your card number. If we change a price, the new price
          applies to a later billing period, and the price you are about to pay is the
          one Stripe shows at checkout.
        </p>
        <p>
          Fees already paid are not refunded except where the law requires a refund.
          If you are a consumer in the UK or the EEA, that includes any cooling-off
          right you still have. Nothing in these terms takes away rights that the law
          says cannot be waived.
        </p>
      </LegalSection>

      <LegalSection heading="7. Ending use">
        <p>
          You can stop using the Service at any time. We may suspend or close access
          if you break these terms, if we have to do so to comply with the law, or if
          your use puts the Service or other people at risk. Short codes from archived
          links stay reserved.
        </p>
      </LegalSection>

      <LegalSection heading="8. Liability">
        <p>
          These terms do not exclude or limit liability for death or personal injury
          caused by negligence, for fraud or fraudulent misrepresentation, or for
          anything else that the law of {OPERATOR.governingLaw} does not allow us to
          exclude or limit.
        </p>
        <p>
          The Service is provided with reasonable care and skill. We do not warrant
          that analytics will be complete, that a redirect will always succeed, or
          that a third-party destination will be safe or available.
        </p>
        <p>
          If you are a consumer and we fail to use reasonable care, our liability for
          that failure is limited to the greater of (a) the fees you paid us for the
          Service in the 12 months before the claim and (b) £100. We are not liable
          for loss of profit, loss of business, or other indirect or consequential
          loss, except where the law does not allow that exclusion.
        </p>
        <p>
          If you use the Service for business purposes, our total liability arising
          out of these terms in a year is limited to the fees you paid us in that
          year. We are not liable for loss of profit, lost data, or indirect or
          consequential loss.
        </p>
      </LegalSection>

      <LegalSection heading="9. Changes to these terms">
        <p>
          We may update these terms. The effective date at the top of this page will
          change when we do. If you keep using the Service after that date, you are
          agreeing to the updated terms. The effective date is {OPERATOR.effectiveDate}.
        </p>
      </LegalSection>

      <LegalSection heading="10. Governing law">
        <p>
          These terms are governed by the law of {OPERATOR.governingLaw}. The courts
          of {OPERATOR.governingLaw} have exclusive jurisdiction, except that if you
          are a consumer in the UK you may also bring a claim in the courts of the
          part of the UK in which you live, and if you are a consumer in the EEA you
          keep any mandatory right to bring a claim in your country of residence.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p>
          {OPERATOR.legalName}, {OPERATOR.registeredOffice.join(", ")}. Questions about
          these terms:{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.contactEmail}`}>
            {OPERATOR.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
