import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { env } from "~/env";

const ALLOWED_SCHEMES = ["exp://", "saveloom://"];

export async function GET(req: NextRequest) {
  const appRedirect = req.nextUrl.searchParams.get("app_redirect");

  if (
    !appRedirect ||
    !ALLOWED_SCHEMES.some((s) => appRedirect.startsWith(s))
  ) {
    return NextResponse.json({ error: "Invalid app_redirect" }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/mobile/auth/callback`;

  const state = await new SignJWT({ appRedirect, redirectUri })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(new TextEncoder().encode(env.AUTH_SECRET));

  const params = new URLSearchParams({
    client_id: env.AUTH_GOOGLE_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
