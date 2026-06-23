"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/CopyButton";
import { toast } from "sonner";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { EXPIRY_OPTIONS, getPlan } from "@/lib/plans";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ShortenForm({ allowAnonymous = false, onSuccess }) {
  const { data: session } = useSession();
  const [plan, setPlan] = useState("free");
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState("14");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = session || allowAnonymous;
  const planConfig = getPlan(plan);
  const canUseAlias = planConfig.features.customAlias;

  const expiryOptions = EXPIRY_OPTIONS.filter((option) =>
    option.plans.includes(plan)
  );

  useEffect(() => {
    if (!session) return;
    let active = true;
    fetch("/api/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.plan) setPlan(data.plan);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    const valid = expiryOptions.some((o) => String(o.days) === expiryDays);
    if (!valid) {
      setExpiryDays(String(planConfig.defaultExpiryDays));
    }
  }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");
    setShortUrl("");

    try {
      const body = {
        url,
        expiryDays: expiryDays === "null" ? null : Number(expiryDays),
        anonymous: !session && allowAnonymous,
      };

      if (alias.trim() && canUseAlias) {
        body.alias = alias.trim();
      }

      if (utmSource || utmMedium || utmCampaign) {
        body.utm = {
          source: utmSource || undefined,
          medium: utmMedium || undefined,
          campaign: utmCampaign || undefined,
        };
      }

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setShortUrl(data.shortUrl);
      toast.success("URL shortened successfully");
      onSuccess?.(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canSubmit) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          Sign in to shorten URLs and manage your dashboard.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/signin">Sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/register">Create account</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="mb-1 block text-sm font-medium">
          Long URL
        </label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      {session && (
        <>
          <div>
            <label htmlFor="alias" className="mb-1 block text-sm font-medium">
              Custom alias{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            {canUseAlias ? (
              <Input
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="my-link"
              />
            ) : (
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Custom aliases are available on Pro &amp; Business — upgrade
              </Link>
            )}
          </div>
          <div>
            <label htmlFor="expiry" className="mb-1 block text-sm font-medium">
              Link expiry
            </label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger id="expiry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expiryOptions.map((option) => (
                  <SelectItem
                    key={option.label}
                    value={String(option.days)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">UTM parameters (optional)</summary>
            <div className="mt-2 space-y-2">
              <Input
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="utm_source"
                aria-label="UTM source"
              />
              <Input
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="utm_medium"
                aria-label="UTM medium"
              />
              <Input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="utm_campaign"
                aria-label="UTM campaign"
              />
            </div>
          </details>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Shortening..." : "Shorten URL"}
      </Button>

      {error && (
        <Alert variant="error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {shortUrl && (
        <Alert variant="success">
          <AlertTitle>Your short link</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <a href={shortUrl} className="break-all text-primary hover:underline">
              {shortUrl}
            </a>
            <CopyButton value={shortUrl} />
          </AlertDescription>
        </Alert>
      )}

      {!session && allowAnonymous && (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/register" className="text-primary hover:underline">
            Create an account
          </Link>{" "}
          to manage links and view analytics.
        </p>
      )}
    </form>
  );
}
