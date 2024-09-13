import React, { useState } from "react";
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
import { Trash2, BarChart2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

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

  const handleAddUrl = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      if (response.ok) {
        setNewUrl("");
        fetchUrls(); // Refresh the URL list
      } else {
        // Handle error
        console.error("Failed to shorten URL");
      }
    } catch (error) {
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLinks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add New URL</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUrl} className="space-y-4">
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter your URL here"
                required
              />
              <Button type="submit" className="w-full">
                Shorten URL
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <Select
          onValueChange={(value) => setSortMethod(value)}
          defaultValue="createdAt"
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
                  className="bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Link href={`/analytics/${url._id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-green-100 hover:bg-green-200 ml-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowQR(url._id)}
                  variant="ghost"
                  size="icon"
                  className="bg-blue-100 hover:bg-blue-200 ml-2"
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
