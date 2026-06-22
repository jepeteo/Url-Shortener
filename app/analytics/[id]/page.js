"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FaChrome, FaSafari, FaEdge, FaMobileAlt, FaDesktop, FaRobot } from "react-icons/fa";
import UAParser from "ua-parser-js";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getBrowserIcon(browserName) {
  if (!browserName) return null;
  switch (browserName.toLowerCase()) {
    case "chrome":
      return <FaChrome aria-hidden="true" />;
    case "safari":
      return <FaSafari aria-hidden="true" />;
    case "edge":
      return <FaEdge aria-hidden="true" />;
    case "facebook bot":
      return <FaRobot aria-hidden="true" />;
    default:
      return null;
  }
}

function getDeviceIcon(deviceType) {
  switch (deviceType) {
    case "mobile":
      return <FaMobileAlt aria-hidden="true" />;
    case "desktop":
      return <FaDesktop aria-hidden="true" />;
    case "bot":
      return <FaRobot aria-hidden="true" />;
    default:
      return <FaDesktop aria-hidden="true" />;
  }
}

function formatUserAgent(userAgent) {
  if (userAgent?.includes("facebookexternalhit")) {
    return { browser: "Facebook Bot", os: "N/A", device: "bot" };
  }
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  return {
    browser: result.browser?.name || "Unknown",
    os: result.os?.name || "Unknown",
    device: result.device?.type || "desktop",
  };
}

function formatReferrer(referrer) {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

function truncateUrl(url, max = 48) {
  if (!url || url.length <= max) return url;
  return `${url.slice(0, max)}…`;
}

export default function UrlAnalytics({ params }) {
  const { id } = use(params);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetch(`/api/analytics/${id}`)
        .then(async (response) => {
          if (!response.ok) throw new Error("Failed to fetch analytics");
          return response.json();
        })
        .then(setAnalytics)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [status, router, id]);

  const sortedClickData = useMemo(() => {
    if (!analytics?.clickData) return [];
    return [...analytics.clickData].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [analytics]);

  const chartData = useMemo(() => {
    const counts = {};
    for (const click of sortedClickData) {
      const day = new Date(click.timestamp).toLocaleDateString();
      counts[day] = (counts[day] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([date, clicks]) => ({ date, clicks }))
      .reverse();
  }, [sortedClickData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = sortedClickData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(sortedClickData.length / itemsPerPage));

  const handleExport = () => {
    const rows = [
      ["timestamp", "ip", "browser", "os", "device", "referer"],
      ...sortedClickData.map((click) => {
        const { browser, os, device } = formatUserAgent(click.userAgent);
        return [
          click.timestamp,
          click.ip,
          browser,
          os,
          device,
          click.referer || "Direct",
        ];
      }),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `analytics-${analytics.shortCode}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (status === "loading" || isLoading) {
    return <div className="container mx-auto p-4">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics) {
    return <div className="container mx-auto p-4">No analytics data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">URL Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">Original URL:</span>{" "}
            <span title={analytics.originalUrl}>{truncateUrl(analytics.originalUrl, 80)}</span>
          </p>
          <p>
            <span className="font-medium">Short URL:</span>{" "}
            {`${process.env.NEXT_PUBLIC_BASE_URL}/${analytics.shortCode}`}
          </p>
          <p>
            <span className="font-medium">Total Clicks:</span> {analytics.clicks}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {new Date(analytics.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Last Clicked:</span>{" "}
            {analytics.lastClickedAt
              ? new Date(analytics.lastClickedAt).toLocaleString()
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Clicks over time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Click History</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedClickData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No clicks recorded yet.</p>
          ) : (
            <>
              <div className="space-y-4 md:hidden">
                {currentItems.map((click, index) => {
                  const { browser, os, device } = formatUserAgent(click.userAgent);
                  return (
                    <Card key={index}>
                      <CardContent className="space-y-2 p-4 text-sm">
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {new Date(click.timestamp).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Browser:</span> {browser}
                        </p>
                        <p>
                          <span className="font-medium">OS:</span> {os}
                        </p>
                        <p>
                          <span className="font-medium">Device:</span> {device}
                        </p>
                        <p>
                          <span className="font-medium">Referer:</span>{" "}
                          {formatReferrer(click.referer)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Referer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((click, index) => {
                      const { browser, os, device } = formatUserAgent(click.userAgent);
                      return (
                        <TableRow key={index}>
                          <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{click.ip}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              {getBrowserIcon(browser)} {browser}
                            </span>
                          </TableCell>
                          <TableCell>{os}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              {getDeviceIcon(device)} {device}
                            </span>
                          </TableCell>
                          <TableCell>{formatReferrer(click.referer)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
