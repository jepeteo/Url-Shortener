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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, BarChart2, QrCode } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [showQR, setShowQR] = useState(null);
  const [sortMethod, setSortMethod] = useState("createdAt");

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
    }
  }, [status]);

  const fetchUrls = async () => {
    const response = await fetch("/api/urls");
    if (response.ok) {
      const data = await response.json();
      setUrls(data);
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
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Shortened URLs</h1>
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
