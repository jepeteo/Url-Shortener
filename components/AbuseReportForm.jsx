"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchWithCsrf } from "@/hooks/useCsrf";
import { ABUSE_REASONS, ABUSE_REPORT_RECEIVED } from "@/lib/abuseReport";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const fieldClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function AbuseReportForm({ initialUrl = "" }) {
  const [url, setUrl] = useState(initialUrl);
  const [reason, setReason] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_SITE_KEY);
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileReady || !turnstileRef.current) {
      return;
    }

    if (widgetIdRef.current != null) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "auto",
    });
  }, [turnstileReady]);

  const getTurnstileToken = () => {
    if (!TURNSTILE_SITE_KEY) {
      return undefined;
    }

    if (widgetIdRef.current == null) {
      return null;
    }

    return window.turnstile.getResponse(widgetIdRef.current);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const turnstileToken = getTurnstileToken();
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetchWithCsrf("/api/abuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          reason,
          reporterEmail,
          website,
          turnstileToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not send the report.");
        if (TURNSTILE_SITE_KEY && widgetIdRef.current != null) {
          window.turnstile.reset(widgetIdRef.current);
        }
        return;
      }

      setMessage(data.message || ABUSE_REPORT_RECEIVED);
      setUrl("");
      setReason("");
      setReporterEmail("");
    } catch {
      setError("Could not send the report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (message) {
    return (
      <Alert variant="success" role="status">
        <AlertTitle>Report sent</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          onLoad={() => setTurnstileReady(true)}
        />
      )}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <Input
          id="website"
          type="text"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="report-url" className="mb-1 block text-sm font-medium">
          URL being reported
        </label>
        <Input
          id="report-url"
          type="url"
          name="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://mikrouli.link/example"
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="report-reason" className="mb-1 block text-sm font-medium">
          Reason
        </label>
        <select
          id="report-reason"
          name="reason"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose a reason
          </option>
          {ABUSE_REASONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="reporter-email" className="mb-1 block text-sm font-medium">
          Your email <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="reporter-email"
          type="email"
          name="reporterEmail"
          value={reporterEmail}
          onChange={(event) => setReporterEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave this blank if you do not want a reply.
        </p>
      </div>
      {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="flex justify-center" />}
      {error && (
        <Alert variant="error" role="alert">
          <AlertTitle>Report not sent</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send report"}
      </Button>
    </form>
  );
}
