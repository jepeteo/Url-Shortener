"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const isProduction = process.env.NODE_ENV === "production";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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
    <div className="flex min-h-[64vh] flex-col items-center justify-center p-4 md:min-h-[88vh] md:p-24">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold">
            mikrouli.link
          </Link>
          <CardTitle className="mt-2 text-xl">Sign In</CardTitle>
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
