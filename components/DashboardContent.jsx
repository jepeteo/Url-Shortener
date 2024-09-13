import React, { useState, memo, useCallback } from "react";
import { debounce } from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, BarChart2, QrCode, InfoIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

const MemoizedCard = memo(({ title, content }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{content}</div>
    </CardContent>
  </Card>
));

export default function DashboardContent({
  urls,
  setUrls,
  totalClicks,
  activeLinks,
  currentPage,
  setCurrentPage,
  totalPages,
  fetchUrls,
}) {
  const [showQR, setShowQR] = useState(null);
  const [sortMethod, setSortMethod] = useState("createdAt");
  const [newUrl, setNewUrl] = useState("");
  const [formStatus, setFormStatus] = useState("");

  // Debounce the setNewUrl function
  const debouncedSetNewUrl = useCallback(
    debounce((value) => setNewUrl(value), 100),
    []
  );
  const handleInputChange = (e) => {
    debouncedSetNewUrl(e.target.value);
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    setFormStatus("Submitting...");
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      if (response.ok) {
        setNewUrl("");
        fetchUrls();
        setFormStatus({
          type: "success",
          message: "URL successfully shortened!",
        });
      }
    } catch (error) {
      setFormStatus({
        type: "error",
        message: "Error shortening URL. Please try again.",
      });
      console.error("Error adding URL:", error);
    }
  };

  const handleRemove = async (id) => {
    if (id && id.length === 24) {
      const response = await fetch(`/api/urls/${id}`, { method: "DELETE" });
      if (response.ok) {
        setUrls(urls.filter((url) => url._id !== id));
      }
    } else {
      console.error("Invalid ObjectId");
    }
  };

  const sortedUrls = [...urls].sort((a, b) => {
    if (sortMethod === "clicks") {
      return b.clicks - a.clicks;
    } else if (sortMethod === "createdAt") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <MemoizedCard title="Active Links" content={activeLinks} />
        <MemoizedCard title="Total Clicks" content={totalClicks} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add New URL</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUrl} className="space-y-4">
              <Input
                type="url"
                value={newUrl}
                onChange={handleInputChange}
                placeholder="Enter your URL here"
                required
                aria-label="Enter URL to shorten"
              />
              <Button type="submit" className="w-full">
                Shorten URL
              </Button>
              {formStatus.message && (
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
        <Select
          onValueChange={(value) => setSortMethod(value)}
          defaultValue="createdAt"
          aria-label="Sort URLs by"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created </SelectItem>
            <SelectItem value="clicks">Number of Clicks </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hidden md:table-row">
            <TableHead>Original URL</TableHead>
            <TableHead>Short URL</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Clicked</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUrls.map((url) => (
            <TableRow
              key={url._id}
              className="flex flex-col my-4 rounded-xl border bg-card text-card-foreground shadow p-6 
              md:table-row md:gap-4 md:shadow-none md:border-none md:p-0"
            >
              <TableCell>
                <span className="md:hidden font-bold">URL: </span>
                {url.originalUrl}
              </TableCell>
              <TableCell>
                <span className="md:hidden font-bold">Short URL: </span>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                </a>
              </TableCell>
              <TableCell>
                <span className="md:hidden font-bold">Clicks: </span>
                {url.clicks}
              </TableCell>
              <TableCell>
                <span className="md:hidden font-bold">Created: </span>
                {new Date(url.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <span className="md:hidden font-bold">Expires: </span>
                {url.lastClickedAt
                  ? new Date(url.lastClickedAt).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell className="flex items-center md:justify-end">
                <Button
                  onClick={() => handleRemove(url._id)}
                  variant="ghost"
                  size="icon"
                  className="bg-red-200 hover:bg-red-300 text-red-800"
                  aria-label={`Delete URL ${url.shortCode}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Link href={`/analytics/${url._id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-green-100 hover:bg-green-200 ml-2"
                    aria-label={`View analytics for URL ${url.shortCode}`}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowQR(url._id)}
                  variant="ghost"
                  size="icon"
                  className="bg-blue-100 hover:bg-blue-200 ml-2"
                  aria-label={`View QR code for URL ${url.shortCode}`}
                >
                  <QrCode className="h-4 w-4 text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
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
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={`${process.env.NEXT_PUBLIC_BASE_URL}/${
                urls.find((u) => u._id === showQR).shortCode
              }`}
            />
            <Button onClick={() => setShowQR(null)} className="w-full mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
