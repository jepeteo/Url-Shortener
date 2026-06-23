"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin")
        .then(async (response) => {
          if (!response.ok) throw new Error("Access denied");
          return response.json();
        })
        .then(setData)
        .catch((err) => setError(err.message));
    }
  }, [status, router]);

  const handleDelete = async (shortCode) => {
    if (!window.confirm(`Delete ${shortCode}?`)) return;
    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortCode }),
    });
    setData((prev) => ({
      ...prev,
      urls: prev.urls.filter((url) => url.shortCode !== shortCode),
    }));
  };

  if (status === "loading") return <div className="container mx-auto p-4">Loading...</div>;

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="error">
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!data) return <div className="container mx-auto p-4">Loading admin data...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.stats.users}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent links</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.stats.links}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total clicks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.stats.totalClicks}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {data.urls.map((url) => (
          <Card key={url.id}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-medium">/{url.shortCode}</p>
                <p className="truncate text-muted-foreground">{url.originalUrl}</p>
                <p className="text-muted-foreground">{url.clicks} clicks</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(url.shortCode)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
