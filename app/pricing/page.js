"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tiers = [
  {
    id: "free",
    name: PLANS.free.name,
    monthly: 0,
    annual: 0,
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
    monthly: 6,
    annual: 59,
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
    monthly: 15,
    annual: 149,
    description: "For teams and developers",
    features: [
      "Unlimited links",
      "1-year & never-expire links",
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
  const [annual, setAnnual] = useState(false);

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
        body: JSON.stringify({
          plan: planId,
          interval: annual ? "annual" : "monthly",
        }),
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
    <div className="relative">
      <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Simple, <span className="gradient-text">honest pricing</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you need custom aliases, charts, or API access.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border bg-card p-1 text-sm">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-1.5 font-medium transition-colors",
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors",
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Annual
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  annual ? "bg-primary-foreground/20" : "bg-success/15 text-success"
                )}
              >
                Save ~18%
              </span>
            </button>
          </div>

          {session && (
            <div>
              <Button variant="outline" className="mt-6" onClick={handlePortal}>
                Manage billing
              </Button>
            </div>
          )}
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const price = annual ? tier.annual : tier.monthly;
            const period = tier.id === "free" ? "forever" : annual ? "/year" : "/month";
            return (
              <Card
                key={tier.id}
                className={cn(
                  "relative flex flex-col card-hover",
                  tier.highlighted &&
                    "border-primary/60 shadow-xl shadow-primary/10 ring-1 ring-primary/20"
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full gradient-brand px-3 py-1 text-xs font-semibold text-white shadow">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </span>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-4xl font-extrabold tracking-tight">
                    ${price}
                    <span className="text-base font-normal text-muted-foreground">
                      {period}
                    </span>
                  </p>
                  {annual && tier.id !== "free" && (
                    <p className="text-sm text-success">
                      ${(tier.annual / 12).toFixed(2)}/mo billed annually
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2.5 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {tier.href ? (
                    <Button
                      asChild
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                    >
                      <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => handleCheckout(tier.id)}
                      disabled={loadingPlan === tier.id}
                    >
                      {loadingPlan === tier.id ? "Loading..." : tier.cta}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Prices in USD. Cancel anytime from the billing portal.
        </p>
      </div>
    </div>
  );
}
