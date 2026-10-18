import { LegalDocument } from "@/components/LegalDocument";
import { OPERATOR } from "@/lib/operator";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Imprint — mikrouli.link",
  description:
    "Impressum for mikrouli.link: MTX STUDIO LTD, company number 15856187, registered office in Manchester, England.",
  path: "/imprint",
});

function Fact({ label, children }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export default function ImprintPage() {
  return (
    <LegalDocument title="Imprint" lede="Impressum">
      <p>
        This page identifies the operator of {OPERATOR.siteName}. It is the Impressum
        for the service, including the information people in Germany look for under
        § 5 of the Digitale-Dienste-Gesetz (DDG).
      </p>
      <dl className="space-y-6">
        <Fact label="Operator (Diensteanbieter)">
          <p>{OPERATOR.legalName}</p>
        </Fact>
        <Fact label="Registered office (Anschrift)">
          {OPERATOR.registeredOffice.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Fact>
        <Fact label="Register">
          <p>Registered in {OPERATOR.registeredIn}.</p>
          <p className="mt-1">Register: {OPERATOR.register}</p>
          <p className="mt-1">Company number: {OPERATOR.companyNumber}</p>
        </Fact>
        <Fact label="Representatives (Vertreten durch)">
          <p>The company is represented by its directors:</p>
          <ul className="mt-1 list-disc pl-6">
            {OPERATOR.directors.map((director) => (
              <li key={director}>{director}</li>
            ))}
          </ul>
        </Fact>
        <Fact label="Contact (Kontakt)">
          <p>
            Email:{" "}
            <a className="text-primary hover:underline" href={`mailto:${OPERATOR.contactEmail}`}>
              {OPERATOR.contactEmail}
            </a>
          </p>
          <p className="mt-1">
            Abuse reports:{" "}
            <a className="text-primary hover:underline" href={`mailto:${OPERATOR.abuseEmail}`}>
              {OPERATOR.abuseEmail}
            </a>
          </p>
        </Fact>
        <Fact label="VAT (Umsatzsteuer)">
          {OPERATOR.vatRegistered ? (
            <p>Registered for VAT.</p>
          ) : (
            <p>
              {OPERATOR.legalName} is not registered for VAT. No VAT identification
              number is shown because none has been issued.
            </p>
          )}
        </Fact>
        {OPERATOR.icoNumber ? (
          <Fact label="Data protection registration">
            <p>ICO registration number: {OPERATOR.icoNumber}</p>
          </Fact>
        ) : null}
      </dl>
    </LegalDocument>
  );
}
