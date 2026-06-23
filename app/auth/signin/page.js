"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const isProduction = process.env.NODE_ENV === "production";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setNotice("Account created. Check your email to verify and unlock your full link allowance.");
    }
    if (searchParams.get("verified") === "1") {
      setNotice("Email verified successfully. You now have your full monthly link allowance.");
    }
    if (searchParams.get("error") === "invalid-token") {
      setError("Verification link is invalid or has expired. Sign in and resend verification.");
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center p-4 md:min-h-[82vh] md:p-24">
      <div className="glow absolute inset-0 -z-10" aria-hidden="true" />
      <Card className="w-full max-w-md border-border/70 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            mikrouli.link
          </Link>
          <CardTitle className="mt-2 text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
              />
            </div>
            {notice && (
              <Alert variant="success" role="status">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="error" role="alert">
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full"
            variant="outline"
          >
            Sign in with GitHub
          </Button>
          {!isProduction && (
            <Button
              onClick={() =>
                signIn("credentials", {
                  email: "demo@example.com",
                  password: "demopassword",
                  callbackUrl: "/dashboard",
                })
              }
              className="w-full"
              variant="secondary"
            >
              Try Demo Account
            </Button>
          )}
          <Link href="/auth/register" className="text-center text-sm text-primary hover:underline">
            Don&apos;t have an account? Register
          </Link>
          <Link
            href="/auth/reset-password"
            className="text-center text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center p-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
