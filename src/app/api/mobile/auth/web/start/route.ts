import { NextRequest, NextResponse } from "next/server";

import { isAllowedMobileRedirectUri } from "~/lib/mobile-web-auth";

export async function GET(req: NextRequest) {
  const redirectUri = req.nextUrl.searchParams.get("redirect_uri");

  if (!redirectUri || !isAllowedMobileRedirectUri(redirectUri)) {
    console.error("[mobile/auth/web/start] Rejected redirect_uri:", redirectUri);
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const completeUrl = `${origin}/api/mobile/auth/web/complete?redirect_uri=${encodeURIComponent(redirectUri)}`;
  const signInUrl = `${origin}/api/auth/signin/google?${new URLSearchParams({
    callbackUrl: completeUrl,
  }).toString()}`;

  return NextResponse.redirect(signInUrl);
}
