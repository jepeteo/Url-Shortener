"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Trash2, BarChart2, QrCode } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [showQR, setShowQR] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [sortMethod, setSortMethod] = useState("createdAt");
  const [activeLinks, setActiveLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [newUrl, setNewUrl] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
    }
  }, [status, currentPage]);

  const fetchUrls = async () => {
    const response = await fetch(
      `/api/urls?page=${currentPage}&limit=${itemsPerPage}`
    );
    if (response.ok) {
      const data = await response.json();
      setUrls(data.urls);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setActiveLinks(data.activeLinks);
      setTotalClicks(data.totalClicks);
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

  return (
    <div className="container mx-auto p-4">
      {session?.user?.email === "demo@example.com" && (
        <Alert className="mb-4 bg-red-50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Demo Account</AlertTitle>
          <AlertDescription>
            You are currently using a demo account. Some features may be
            limited.
          </AlertDescription>
        </Alert>
      )}

      <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>

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
          <TableRow>
            <TableHead>Original URL</TableHead>
            <TableHead>Short URL</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Clicked</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUrls.map((url) => (
            <TableRow key={url._id}>
              <TableCell>{url.originalUrl}</TableCell>
              <TableCell>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                </a>
              </TableCell>
              <TableCell>{url.clicks}</TableCell>
              <TableCell>{new Date(url.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                {url.lastClickedAt
                  ? new Date(url.lastClickedAt).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>
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
    </div>
  );
}
