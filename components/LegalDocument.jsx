import Link from "next/link";
import { OPERATOR } from "@/lib/operator";

export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{heading}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function LegalDocument({ title, lede, children }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {lede ? <p className="mt-2 text-muted-foreground">{lede}</p> : null}
      <p className="mt-2 text-sm text-muted-foreground">
        Effective date: {OPERATOR.effectiveDate}
      </p>
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">{children}</div>
      <p className="mt-10 text-sm text-muted-foreground">
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/imprint" className="text-primary hover:underline">
          Imprint
        </Link>
        {" · "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact
        </Link>
      </p>
    </div>
  );
}
