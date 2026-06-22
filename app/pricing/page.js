"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";

const tiers = [
  {
    id: "free",
    name: PLANS.free.name,
    price: "$0",
    period: "forever",
    description: "Great for trying mikrouli.link",
    features: [
      "20 links per month",
      "14-day link expiry",
      "Basic click analytics",
      "QR codes",
    ],
    cta: "Get started",
    href: "/auth/register",
  },
  {
    id: "pro",
    name: PLANS.pro.name,
    price: "$6",
    period: "/month",
    annual: "$59/year (~$4.90/mo)",
    description: "For creators who need more control",
    features: [
      "100 links per month",
      "90-day link expiry",
      "Custom aliases",
      "Analytics charts & CSV export",
      "Configurable expiry",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "business",
    name: PLANS.business.name,
    price: "$15",
    period: "/month",
    annual: "$149/year (~$12.40/mo)",
    description: "For teams and developers",
    features: [
      "Unlimited links",
      "1-year link expiry",
      "API keys & higher limits",
      "Full analytics history",
      "Custom domain — coming soon",
    ],
    cta: "Upgrade to Business",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planId) => {
    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }

    if (planId === "free") {
      window.location.href = "/app";
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Simple, honest pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Start free. Upgrade when you need custom aliases, charts, or API access.
        </p>
        {session && (
          <Button variant="outline" className="mt-4" onClick={handlePortal}>
            Manage billing
          </Button>
        )}
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={tier.highlighted ? "border-primary shadow-lg" : ""}
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-3xl font-bold">
                {tier.price}
                <span className="text-base font-normal text-muted-foreground">
                  {tier.period}
                </span>
              </p>
              {tier.annual && (
                <p className="text-sm text-muted-foreground">{tier.annual}</p>
              )}
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier.href ? (
                <Button asChild className="w-full">
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleCheckout(tier.id)}
                  disabled={loadingPlan === tier.id}
                >
                  {loadingPlan === tier.id ? "Loading..." : tier.cta}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
