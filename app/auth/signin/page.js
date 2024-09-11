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
      router.push("/");
    } else {
      // Handle error
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
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
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={() => signIn("github")} className="w-full">
            Sign in with GitHub
          </Button>
        </CardFooter>
        <CardFooter className="flex justify-center">
          <Link href="/auth/register">
            <Button variant="link">Don't have an account? Register here</Button>
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
