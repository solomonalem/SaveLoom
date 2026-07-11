import { NextRequest, NextResponse } from "next/server";

import { createMobileAccessToken } from "~/lib/mobile-auth";
import { appendQueryParam, isAllowedMobileRedirectUri } from "~/lib/mobile-web-auth";
import { auth } from "~/server/auth";

export async function GET(req: NextRequest) {
  const redirectUri = req.nextUrl.searchParams.get("redirect_uri");

  if (!redirectUri || !isAllowedMobileRedirectUri(redirectUri)) {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(appendQueryParam(redirectUri, "error", "not_authenticated"));
  }

  const accessToken = await createMobileAccessToken(session.user.id);
  return NextResponse.redirect(appendQueryParam(redirectUri, "token", accessToken));
}
