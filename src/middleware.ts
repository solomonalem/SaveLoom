import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOBILE_API_PREFIXES = ["/api/mobile", "/api/dashboard/stats"];

function isMobileApi(pathname: string): boolean {
  return MOBILE_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Bypass-Tunnel-Reminder",
  };
}

export function middleware(request: NextRequest) {
  if (!isMobileApi(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/api/mobile/:path*", "/api/dashboard/stats"],
};
