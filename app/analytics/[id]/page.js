"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FaChrome,
  FaSafari,
  FaEdge,
  FaMobileAlt,
  FaDesktop,
  FaRobot,
} from "react-icons/fa";
import UAParser from "ua-parser-js";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";

const getBrowserIcon = (browserName) => {
  if (!browserName) return null;

  switch (browserName.toLowerCase()) {
    case "chrome":
      return <FaChrome />;
    case "safari":
      return <FaSafari />;
    case "edge":
      return <FaEdge />;
    case "facebook bot":
      return <FaRobot />;
    default:
      return null;
  }
};

const getDeviceIcon = (deviceType) => {
  switch (deviceType) {
    case "mobile":
      return <FaMobileAlt />;
    case "desktop":
      return <FaDesktop />;
    case "bot":
      return <FaRobot />;
    default:
      return <FaDesktop />;
  }
};

const formatUserAgent = (userAgent) => {
  if (userAgent.includes("facebookexternalhit")) {
    return {
      browser: "Facebook Bot",
      os: "N/A",
      device: "bot",
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  return {
    browser: result.browser?.name || "Unknown",
    os: result.os?.name || "Unknown",
    device: result.device?.type || "desktop",
  };
};

const formatReferrer = (referrer) => {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return referrer;
  }
};

export default function UrlAnalytics({ params }) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const { id } = params;

  const sortedClickData =
    analytics && analytics.clickData
      ? analytics.clickData.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
      : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedClickData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, router, id]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${id}`);
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        console.error("Response:", await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toTimeString().slice(0, 5);

    return `${day} ${month} ${year} || ${time}`;
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>No analytics data available</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">URL Analytics</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Original URL</TableCell>
                <TableCell>{analytics.originalUrl}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>{`${process.env.NEXT_PUBLIC_BASE_URL}/${analytics.shortCode}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Clicks</TableCell>
                <TableCell>{analytics.clicks}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created At</TableCell>
                <TableCell>
                  {new Date(analytics.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Last Clicked</TableCell>
                <TableCell>
                  {analytics.lastClickedAt
                    ? new Date(analytics.lastClickedAt).toLocaleString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Click History</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.clickData && analytics.clickData.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Referer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((click, index) => {
                    const { browser, os, device } = formatUserAgent(
                      click.userAgent
                    );
                    return (
                      <TableRow key={index}>
                        <TableCell className="w-2/12">
                          {formatDate(click.timestamp)}
                        </TableCell>
                        <TableCell className="w-2/12">{click.ip}</TableCell>
                        <TableCell className="w-2/12">
                          <span className="flex items-center gap-2">
                            {getBrowserIcon(browser)} {browser}
                          </span>
                        </TableCell>
                        <TableCell className="w-2/12">{os}</TableCell>
                        <TableCell className="w-2/12">
                          <span className="flex items-center gap-2">
                            {getDeviceIcon(device)} {device}
                          </span>
                        </TableCell>
                        <TableCell className="w-2/12">
                          {formatReferrer(click.referer)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination className="mt-8 mb-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {[
                    ...Array(Math.ceil(sortedClickData.length / itemsPerPage)),
                  ].map((_, i) => (
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
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(sortedClickData.length / itemsPerPage),
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(sortedClickData.length / itemsPerPage)
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <p>No click data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
