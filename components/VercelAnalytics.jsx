"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { measurementBeforeSend } from "@/lib/analyticsPrivacy";

export function VercelAnalytics() {
  return (
    <>
      <Analytics beforeSend={measurementBeforeSend} />
      <SpeedInsights beforeSend={measurementBeforeSend} />
    </>
  );
}
