"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, BarChart2, QrCode, InfoIcon, Link2, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { QRModal } from "@/components/QRModal";
import { toast } from "sonner";
import { fetchWithCsrf } from "@/hooks/useCsrf";
import { cn } from "@/lib/utils";

function getLinkStatus(expiresAt) {
  if (expiresAt === null || expiresAt === undefined) {
    return {
      label: "Active",
      detail: "Never expires",
      className: "bg-success/15 text-success",
    };
  }

  const expiry = new Date(expiresAt);
  const now = new Date();

  if (expiry <= now) {
    return {
      label: "Expired",
      detail: `Expired on ${expiry.toLocaleDateString()}`,
      className: "bg-destructive/15 text-destructive",
    };
  }

  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const detail =
    daysLeft === 1 ? "Expires in 1 day" : `Expires in ${daysLeft} days`;

  return {
    label: "Active",
    detail,
    className: "bg-success/15 text-success",
  };
}

function LinkStatusBadge({ expiresAt }) {
  const status = getLinkStatus(expiresAt);

  return (
    <div className="space-y-1">
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
          status.className
        )}
      >
        {status.label}
      </span>
      <p className="text-xs text-muted-foreground">{status.detail}</p>
    </div>
  );
}

function StatCard({ title, content, icon: Icon }) {
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
        <div className="text-3xl font-bold tracking-tight">{content}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardContent({
  urls,
  totalClicks,
  activeLinks,
  currentPage,
  setCurrentPage,
  totalPages,
  isLoading,
  error,
  onRefresh,
}) {
  const [showQR, setShowQR] = useState(null);
  const [sortMethod, setSortMethod] = useState("createdAt");
  const [newUrl, setNewUrl] = useState("");
  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUrl = useCallback(
    async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      setFormStatus(null);

      try {
        const response = await fetchWithCsrf("/api/shorten", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: newUrl }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to shorten URL");
        }
        setNewUrl("");
        setFormStatus({ type: "success", message: `Created: ${data.shortUrl}` });
        toast.success("URL shortened");
        onRefresh?.();
      } catch (err) {
        setFormStatus({ type: "error", message: err.message });
        toast.error(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [newUrl, onRefresh]
  );

  const handleRemove = useCallback(
    async (id, shortCode) => {
      if (!window.confirm(`Delete link ${shortCode}?`)) {
        return;
      }
      try {
        const response = await fetchWithCsrf(`/api/urls/${id}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Failed to delete URL");
        }
        toast.success("Link deleted");
        onRefresh?.();
      } catch (err) {
        toast.error(err.message);
      }
    },
    [onRefresh]
  );

  const sortedUrls = useMemo(() => {
    return [...urls].sort((a, b) => {
      if (sortMethod === "clicks") {
        return b.clicks - a.clicks;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [urls, sortMethod]);

  const qrCode = showQR ? urls.find((u) => u.id === showQR)?.shortCode : null;

  if (isLoading) {
    return <p className="text-muted-foreground">Loading your links...</p>;
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard title="Active Links" content={activeLinks} icon={Link2} />
        <StatCard title="Total Clicks" content={totalClicks} icon={MousePointerClick} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add New URL</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label htmlFor="dashboard-url" className="mb-1 block text-sm font-medium">
                  URL
                </label>
                <Input
                  id="dashboard-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Shortening..." : "Shorten URL"}
              </Button>
              {formStatus && (
                <Alert variant={formStatus.type}>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Status</AlertTitle>
                  <AlertDescription>{formStatus.message}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <label htmlFor="sort" className="sr-only">
          Sort URLs by
        </label>
        <Select onValueChange={setSortMethod} defaultValue="createdAt">
          <SelectTrigger id="sort" className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="clicks">Number of Clicks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedUrls.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-4">
            <Link2 className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-semibold">No links yet</h2>
            <p className="text-muted-foreground">
              Shorten your first URL using the form above or visit the app page.
            </p>
            <Button asChild>
              <Link href="/app">Shorten a URL</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table aria-label="Shortened URLs">
          <TableCaption>List of your shortened URLs</TableCaption>
          <TableHeader>
            <TableRow className="hidden md:table-row">
              <TableHead>Original URL</TableHead>
              <TableHead>Short URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Clicked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUrls.map((url) => {
              const shortLink = `${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`;
              return (
                <TableRow
                  key={url.id}
                  className="my-4 flex flex-col rounded-xl border bg-card p-6 text-card-foreground shadow md:table-row md:gap-4 md:border-none md:p-0 md:shadow-none"
                >
                  <TableCell className="break-all">
                    <span className="font-bold md:hidden">URL: </span>
                    <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                      {url.originalUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold md:hidden">Short URL: </span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <a href={shortLink} target="_blank" rel="noopener noreferrer" className="break-all">
                        {shortLink}
                      </a>
                      <CopyButton value={shortLink} label={`Copy ${url.shortCode}`} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold md:hidden">Status: </span>
                    <LinkStatusBadge expiresAt={url.expiresAt} />
                  </TableCell>
                  <TableCell>
                    <span className="font-bold md:hidden">Clicks: </span>
                    {url.clicks}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold md:hidden">Created: </span>
                    {new Date(url.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold md:hidden">Last Clicked: </span>
                    {url.lastClickedAt
                      ? new Date(url.lastClickedAt).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="flex items-center gap-2 md:justify-end">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="text-primary hover:bg-accent hover:text-accent-foreground"
                    >
                      <Link
                        href={`/analytics/${url.id}`}
                        aria-label={`View analytics for URL ${url.shortCode}`}
                      >
                        <BarChart2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setShowQR(url.id)}
                      variant="outline"
                      size="icon"
                      className="text-primary hover:bg-accent hover:text-accent-foreground"
                      aria-label={`View QR code for URL ${url.shortCode}`}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleRemove(url.id, url.shortCode)}
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      aria-label={`Delete URL ${url.shortCode}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </nav>
      )}

      {qrCode && <QRModal shortCode={qrCode} onClose={() => setShowQR(null)} />}
    </>
  );
}
