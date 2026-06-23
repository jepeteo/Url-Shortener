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
import {
  FaChrome,
  FaSafari,
  FaEdge,
  FaMobileAlt,
  FaDesktop,
  FaRobot,
} from "react-icons/fa";
import { BarChart2, Calendar, Globe, MousePointerClick } from "lucide-react";
import UAParser from "ua-parser-js";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand text-white">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto animate-pulse space-y-6 p-4 md:p-8">
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-muted" />
      <div className="h-96 rounded-xl bg-muted" />
    </div>
  );
}

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

function getTopReferrer(clicks) {
  const counts = {};
  for (const click of clicks) {
    const ref = formatReferrer(click.referer);
    counts[ref] = (counts[ref] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "—";
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

  const topReferrer = useMemo(
    () => getTopReferrer(sortedClickData),
    [sortedClickData]
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = sortedClickData.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );
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
    return (
      <div className="relative">
        <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
        <AnalyticsSkeleton />
      </div>
    );
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
    <div className="relative">
      <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
      <div className="container mx-auto space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Link <span className="gradient-text">Analytics</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span title={analytics.originalUrl}>
                {truncateUrl(analytics.originalUrl, 64)}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clicks"
            value={analytics.clicks}
            icon={MousePointerClick}
          />
          <StatCard
            title="Top Referrer"
            value={topReferrer}
            icon={Globe}
          />
          <StatCard
            title="Created"
            value={new Date(analytics.createdAt).toLocaleDateString()}
            icon={Calendar}
          />
          <StatCard
            title="Last Clicked"
            value={
              analytics.lastClickedAt
                ? new Date(analytics.lastClickedAt).toLocaleDateString()
                : "Never"
            }
            icon={BarChart2}
          />
        </div>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Short link</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <a
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/${analytics.shortCode}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${process.env.NEXT_PUBLIC_BASE_URL}/${analytics.shortCode}`}
            </a>
          </CardContent>
        </Card>

        {chartData.length > 0 && (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Clicks over time</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--primary))"
                    fill="url(#clickGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Click History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedClickData.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No clicks recorded yet.
              </p>
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

                <div className="hidden overflow-x-auto md:block">
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
                            <TableCell>
                              {new Date(click.timestamp).toLocaleString()}
                            </TableCell>
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
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
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
    </div>
  );
}
