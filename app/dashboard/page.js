"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import dynamic from "next/dynamic";
const DashboardContent = dynamic(
  () => import("../../components/DashboardContent"),
  {
    loading: () => <p>Loading...</p>,
  }
);

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [activeLinks, setActiveLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
    }
  }, [status, currentPage]);

  const fetchUrls = useCallback(async () => {
    const response = await fetch(
      `/api/urls?page=${currentPage}&limit=${itemsPerPage}&userId=${session.user.id}`
    );
    if (response.ok) {
      const data = await response.json();
      setUrls(data.urls);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setActiveLinks(data.activeLinks);
      setTotalClicks(data.totalClicks);
    }
  }, [currentPage, itemsPerPage, session?.user?.id]);

  return (
    <main className="container mx-auto p-4">
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>{" "}
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent
          urls={urls}
          setUrls={setUrls}
          totalClicks={totalClicks}
          activeLinks={activeLinks}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          fetchUrls={fetchUrls}
        />
      </Suspense>
    </main>
  );
}
