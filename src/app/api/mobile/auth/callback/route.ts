import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import { createMobileAccessToken, verifyGoogleIdToken } from "~/lib/mobile-auth";
import { db } from "~/server/db";

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
}

function redirectWithError(appRedirect: string, error: string): NextResponse {
  const sep = appRedirect.includes("?") ? "&" : "?";
  return NextResponse.redirect(
    `${appRedirect}${sep}error=${encodeURIComponent(error)}`,
  );
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");
  const googleError = req.nextUrl.searchParams.get("error");

  const secret = new TextEncoder().encode(env.AUTH_SECRET);

  if (googleError) {
    try {
      const { payload } = await jwtVerify(stateParam ?? "", secret);
      return redirectWithError(
        payload.appRedirect as string,
        googleError === "access_denied" ? "cancelled" : googleError,
      );
    } catch {
      return NextResponse.json(
        { error: `Google auth error: ${googleError}` },
        { status: 400 },
      );
    }
  }

  if (!code || !stateParam) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    );
  }

  let appRedirect: string;
  let redirectUri: string;
  try {
    const { payload } = await jwtVerify(stateParam, secret);
    appRedirect = payload.appRedirect as string;
    redirectUri = payload.redirectUri as string;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired state token" },
      { status: 400 },
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.AUTH_GOOGLE_ID,
      client_secret: env.AUTH_GOOGLE_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("Google token exchange failed:", await tokenRes.text());
    return redirectWithError(appRedirect, "token_exchange_failed");
  }

  const tokens = (await tokenRes.json()) as GoogleTokenResponse;

  if (!tokens.id_token) {
    return redirectWithError(appRedirect, "no_id_token");
  }

  const profile = await verifyGoogleIdToken(tokens.id_token);
  if (!profile) {
    return redirectWithError(appRedirect, "invalid_id_token");
  }

  let user = await db.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await db.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        onboardingCompleted: false,
        hasConnectedBank: false,
        riskTolerance: "moderate",
      },
    });

    await db.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: profile.googleId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
        token_type: tokens.token_type,
        scope: tokens.scope,
        expires_at: tokens.expires_in
          ? Math.floor(Date.now() / 1000) + tokens.expires_in
          : undefined,
      },
    });
  } else if (profile.name || profile.picture) {
    user = await db.user.update({
      where: { id: user.id },
      data: {
        name: profile.name ?? user.name,
        image: profile.picture ?? user.image,
      },
    });
  }

  const accessToken = await createMobileAccessToken(user.id);

  const sep = appRedirect.includes("?") ? "&" : "?";
  return NextResponse.redirect(
    `${appRedirect}${sep}token=${encodeURIComponent(accessToken)}`,
  );
}
