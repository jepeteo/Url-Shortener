import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Link2, QrCode, Shield } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Short links",
    description: "Create branded short URLs with optional custom aliases.",
  },
  {
    icon: BarChart2,
    title: "Click analytics",
    description: "Track clicks, referrers, devices, and export your data.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    description: "Generate QR codes for any shortened link from your dashboard.",
  },
  {
    icon: Shield,
    title: "Secure redirects",
    description: "HTTPS-only destinations with rate limiting and link expiry.",
  },
];

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">mikrouli.link</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A modern URL shortener with analytics, QR codes, and simple pricing for creators and teams.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/app">Shorten a URL</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-2xl text-center">
        <h2 className="text-2xl font-semibold">Start free, upgrade when you grow</h2>
        <p className="mt-2 text-muted-foreground">
          20 free links per month. Pro from $6/mo. Business API access from $15/mo.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/register">Get started free</Link>
        </Button>
      </section>
    </div>
  );
}
