"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchWithCsrf } from "@/hooks/useCsrf";

const DISMISS_KEY = "verify-email-banner-dismissed";

export function VerifyEmailBanner() {
  const { status } = useSession();
  const [verified, setVerified] = useState(true);
  const [dismissed, setDismissed] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    let active = true;
    fetch("/api/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setVerified(data.verified !== false);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [status]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetchWithCsrf("/api/auth/verify/resend", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification email");
      }
      toast.success("Verification email sent. Check your inbox.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setResending(false);
    }
  };

  if (status !== "authenticated" || verified || dismissed) {
    return null;
  }

  return (
    <div className="border-b border-primary/20 bg-accent/60">
      <div className="container flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p>
            <span className="font-medium">Verify your email</span> to unlock your full
            monthly link allowance. Unverified accounts are limited to 2 links per month.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={handleResend} disabled={resending}>
            {resending ? "Sending..." : "Resend email"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleDismiss}
            aria-label="Dismiss verification reminder"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
