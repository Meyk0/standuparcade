import { NextRequest, NextResponse } from "next/server";

// Rate limit configuration
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  "/api/teams": { limit: 5, window: 3600 },        // 5 per hour
  "/api/teams/check": { limit: 20, window: 60 },   // 20 per minute
  "/api/session/spin": { limit: 30, window: 60 },   // 30 per minute
};

// In-memory rate limiting (works locally; use Vercel KV in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find matching rate limit rule
  const matchedPath = Object.keys(RATE_LIMITS).find((path) => {
    if (pathname === path) return true;
    if (pathname.startsWith(path + "/")) return true;
    return false;
  });

  if (matchedPath) {
    const { limit, window } = RATE_LIMITS[matchedPath];
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const key = `${matchedPath}:${ip}`;

    if (!checkRateLimit(key, limit, window)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
