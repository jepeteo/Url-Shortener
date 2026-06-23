"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortenForm } from "@/components/ShortenForm";

export default function AppPage() {
  const { data: session } = useSession();

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center p-4 md:min-h-[82vh] md:p-24">
      <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
      <Card className="w-full max-w-lg border-border/70 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Shorten a <span className="gradient-text">URL</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste a long link below to get a short, shareable URL.
          </p>
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
