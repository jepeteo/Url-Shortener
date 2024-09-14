"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result.ok) {
      router.push("/dashboard");
    } else {
      // Handle error
    }
  };

  return (
    <div className="flex flex-col min-h-[64vh] items-center justify-center p-4 md:p-24 md:min-h-[88vh]">
      <Card className="w-full max-w-md bg-slate-50">
        <CardHeader className="text-4xl font-bold text-center">
          <Link href="/">mikrouli.link</Link>
          <CardTitle className="text-xl font-bold text-center my-2">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              aria-label="Email Address"
              className="bg-white"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              aria-label="Password"
              className="bg-white"
            />
            <Button type="submit" className="w-full" aria-label="Sign In">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center flex-col">
          <Button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full mb-2"
            aria-label="Sign In with GitHub"
          >
            Sign in with GitHub
          </Button>
          <Button
            onClick={() =>
              signIn("credentials", {
                email: "demo@example.com",
                password: "demopassword",
                callbackUrl: "/dashboard",
              })
            }
            className="w-full"
            aria-label="Try Demo Account"
          >
            Try Demo Account
          </Button>
        </CardFooter>

        <CardFooter className="flex justify-center">
          <Link href="/auth/register">
            <Button variant="link">
              Don&apos;t have an account? Register here
            </Button>
          </Link>
        </CardFooter>
        <div className="text-sm text-center pb-4">
          <Link
            href="/auth/reset-password"
            className="text-blue-500 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </Card>
    </div>
  );
}
