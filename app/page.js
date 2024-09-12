"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }
      const data = await response.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            URL Shortener
          </CardTitle>
        </CardHeader>

        <CardContent>
          {session ? (
            <>
              <p className="text-center mb-4">
                Signed in as {session.user.email}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your URL here"
                  required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Shortening..." : "Shorten URL"}
                </Button>
              </form>
              {error && <p className="mt-4 text-red-500">{error}</p>}
              {shortUrl && (
                <div className="mt-8">
                  <p>Your shortened URL:</p>
                  <a href={shortUrl} className="text-blue-500 hover:underline">
                    {shortUrl}
                  </a>
                </div>
              )}
            </>
          ) : (
            <Button onClick={() => signIn()} className="w-full">
              Sign in
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {session && (
            <>
              <Button onClick={() => signOut()} variant="outline">
                Sign out
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </>
          )}
        </CardFooter>
        <div className="mt-[-40px] text-right italic text-sm p-4">
          by Theodoros Mentis
        </div>
      </Card>
    </main>
  );
}
