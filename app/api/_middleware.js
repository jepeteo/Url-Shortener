import rateLimit from "express-rate-limit";
import { NextResponse } from "next/server";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

export function middleware(request) {
  return limiter(request, NextResponse.next());
}
