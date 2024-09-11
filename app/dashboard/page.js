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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Your Shortened URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original URL</TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Expires At</TableHead>
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
                  <TableCell>{url.visits}</TableCell>
                  <TableCell>
                    {new Date(url.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(url.expiresAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleRemove(url._id)}
                      variant="destructive"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
