"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Trash2, BarChart2 } from "lucide-react";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
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
          {urls.map((url) => (
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
