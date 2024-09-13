"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UrlAnalytics({ params }) {
  const [analytics, setAnalytics] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    } else {
      const fetchAnalytics = async () => {
        try {
          const response = await fetch(`/api/analytics/${id}`);
          if (response.ok) {
            const data = await response.json();
            setAnalytics(data);
          }
        } catch (error) {
          console.error("Error fetching analytics:", error);
        }
      };

      fetchAnalytics();
    }
  }, [session, router, id]);

  if (!analytics) return <div>Loading...</div>;

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
          <p>
            <strong>Original URL:</strong> {analytics.originalUrl}
          </p>
          <p>
            <strong>Short URL:</strong>{" "}
            {`${process.env.NEXT_PUBLIC_BASE_URL}/${analytics.shortCode}`}
          </p>
          <p>
            <strong>Total Clicks:</strong> {analytics.clicks}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(analytics.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Last Clicked:</strong>{" "}
            {analytics.lastClickedAt
              ? new Date(analytics.lastClickedAt).toLocaleString()
              : "N/A"}
          </p>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Click History</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.clickData && analytics.clickData.length > 0 ? (
            <ul>
              {analytics.clickData.map((click, index) => (
                <li key={index}>
                  {new Date(click.timestamp).toLocaleString()} - IP: {click.ip},
                  User Agent: {click.userAgent}
                </li>
              ))}
            </ul>
          ) : (
            <p>No click data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
