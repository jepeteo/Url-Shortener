"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { fetchWithCsrf } from "@/hooks/useCsrf";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_SITE_KEY);
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileReady || !turnstileRef.current) {
      return;
    }

    if (widgetIdRef.current != null) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "auto",
    });
  }, [turnstileReady]);

  const getTurnstileToken = () => {
    if (!TURNSTILE_SITE_KEY) {
      return undefined;
    }

    if (widgetIdRef.current == null) {
      return null;
    }

    return window.turnstile.getResponse(widgetIdRef.current);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const turnstileToken = getTurnstileToken();
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    const response = await fetchWithCsrf("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        website,
        turnstileToken,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      router.push("/auth/signin?registered=1");
      return;
    }

    setError(data.error || "An error occurred during registration");

    if (TURNSTILE_SITE_KEY && widgetIdRef.current != null) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center p-4 md:min-h-[82vh] md:p-24">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          onLoad={() => setTurnstileReady(true)}
        />
      )}
      <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
      <Card className="w-full max-w-md border-border/70 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            mikrouli.link
          </Link>
          <CardTitle className="mt-2 text-xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="website">Website</label>
              <Input
                id="website"
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
            </div>
            {TURNSTILE_SITE_KEY && (
              <div ref={turnstileRef} className="flex justify-center" />
            )}
            {error && (
              <Alert variant="error" role="alert">
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Create account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/auth/signin" className="text-sm text-primary hover:underline">
            Already have an account? Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
