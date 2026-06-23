import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Link2,
  QrCode,
  Shield,
  Zap,
  Code2,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Branded short links",
    description:
      "Create clean, memorable short URLs with optional custom aliases on Pro and Business.",
  },
  {
    icon: BarChart2,
    title: "Click analytics",
    description:
      "See clicks over time, referrers, devices, and browsers — then export to CSV.",
  },
  {
    icon: QrCode,
    title: "Instant QR codes",
    description:
      "Generate a downloadable QR code for any link, perfect for print and packaging.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description:
      "HTTPS-only destinations, SSRF protection, rate limiting, and link expiry.",
  },
  {
    icon: Zap,
    title: "Fast redirects",
    description:
      "Edge-aware redirect caching keeps your links snappy anywhere in the world.",
  },
  {
    icon: Code2,
    title: "Developer API",
    description:
      "Automate link creation with API keys on the Business plan. Built for scale.",
  },
];

const steps = [
  {
    title: "Paste your long URL",
    description: "Drop in any link — add UTM tags or a custom alias if you like.",
  },
  {
    title: "Share your short link",
    description: "Copy the shortened URL or grab a QR code in one click.",
  },
  {
    title: "Track performance",
    description: "Watch clicks roll in with real-time analytics on your dashboard.",
  },
];

const faqs = [
  {
    q: "Is mikrouli.link free to use?",
    a: "Yes. The Free plan includes 20 links per month, click analytics, and QR codes — no credit card required.",
  },
  {
    q: "Can I use my own custom alias?",
    a: "Custom aliases are available on the Pro and Business plans, so your links can stay on-brand.",
  },
  {
    q: "Do links expire?",
    a: "Links have a configurable expiry. Free links last 14 days, while paid plans extend up to a year or never.",
  },
  {
    q: "Is there an API?",
    a: "Business customers get API keys to create and manage links programmatically.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
        <div className="bg-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container mx-auto px-4 py-20 text-center md:py-28">
          <div className="animate-fade-up mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-success" />
              Now with QR codes & CSV export
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Short links, <span className="gradient-text">real insights.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Shorten URLs, generate QR codes, and track every click with a modern,
              privacy-friendly link platform for creators and teams.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Link href="/app">
                  Shorten a URL <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free forever plan · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to manage links
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features wrapped in a clean, fast interface.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-hover rounded-2xl border bg-card p-6 text-card-foreground"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand text-white shadow-md shadow-primary/20">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Up and running in seconds
            </h2>
            <p className="mt-4 text-muted-foreground">
              No setup, no friction. Just paste, share, and measure.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-card p-8 text-center shadow-sm md:p-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Start free, upgrade when you grow
          </h2>
          <p className="mt-3 text-muted-foreground">
            20 free links per month. Pro from $6/mo. Business with API access from
            $15/mo.
          </p>
          <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left text-sm">
            {[
              "Click analytics & CSV export",
              "Custom aliases on Pro & Business",
              "Developer API on Business",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/register">Get started free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y rounded-2xl border bg-card">
            {faqs.map((faq) => (
              <details key={faq.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {faq.q}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
