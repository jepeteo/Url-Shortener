"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-dismissed";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:left-auto"
    >
      <p className="text-sm text-muted-foreground">
        We use strictly necessary cookies to keep you signed in. See our{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        for details.
      </p>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={dismiss}>
          Got it
        </Button>
      </div>
    </div>
  );
}
