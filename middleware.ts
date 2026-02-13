// Temporary no-op middleware so Next.js is satisfied,
// but we don't enforce any auth or redirects.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Allow all requests through unchanged
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
