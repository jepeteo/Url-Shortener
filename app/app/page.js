"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortenForm } from "@/components/ShortenForm";

export default function AppPage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-[64vh] flex-col items-center justify-center p-4 md:min-h-[88vh] md:p-24">
      <Card className="w-full max-w-lg bg-card">
        <CardHeader className="text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              mikrouli.link
            </Link>
          </p>
          <h1 className="text-2xl font-bold">Shorten a URL</h1>
        </CardHeader>
        <CardContent>
          {session && (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Signed in as {session.user.email}
            </p>
          )}
          <ShortenForm allowAnonymous />
        </CardContent>
        {session && (
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
