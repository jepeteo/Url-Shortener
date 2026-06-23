"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";
import { fetchWithCsrf } from "@/hooks/useCsrf";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [activeLinks, setActiveLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const itemsPerPage = 10;

  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/urls?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }
      const data = await response.json();
      setUrls(data.urls);
      setTotalPages(Math.max(1, Math.ceil(data.total / itemsPerPage)));
      setActiveLinks(data.activeLinks);
      setTotalClicks(data.totalClicks);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
      fetch("/api/usage")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => data && setUsage(data));
    }
  }, [status, router, fetchUrls]);

  if (status === "loading") {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  const handleGenerateApiKey = async () => {
    const response = await fetchWithCsrf("/api/api-keys", { method: "POST" });
    const data = await response.json();
    if (response.ok) {
      setApiKey(data.apiKey);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {usage && Number.isFinite(usage.limit) && (
        <Alert className="mb-4">
          <AlertTitle>
            {usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)} plan — {usage.count}/{usage.limit} links this month
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{usage.allowed ? "You can create more links." : "Monthly limit reached."}</span>
            {!usage.allowed && (
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade plan</Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      {session?.user && usage?.plan === "business" && (
        <Alert className="mb-4">
          <AlertTitle>API access</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Use POST /api/v1/shorten with header x-api-key.</p>
            {apiKey ? (
              <code className="block break-all rounded bg-muted p-2 text-xs">{apiKey}</code>
            ) : (
              <Button size="sm" onClick={handleGenerateApiKey}>Generate API key</Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      {session?.user?.email === "demo@example.com" && (
        <Alert className="mb-4 bg-amber-50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Demo Account</AlertTitle>
          <AlertDescription>
            You are using a demo account. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/pricing">Upgrade</Link>
          </Button>
          <Button onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
      <DashboardContent
        urls={urls}
        totalClicks={totalClicks}
        activeLinks={activeLinks}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchUrls}
      />
    </div>
  );
}
