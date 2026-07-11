import { OAuth2Client } from "google-auth-library";
import { SignJWT, jwtVerify } from "jose";
import { env } from "~/env";

const MOBILE_JWT_ISSUER = "saveloom-mobile";
const MOBILE_JWT_EXPIRY = "30d";

function getJwtSecret(): Uint8Array {
  const secret = env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for mobile JWT authentication");
  }
  return new TextEncoder().encode(secret);
}

export async function createMobileAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(MOBILE_JWT_ISSUER)
    .setExpirationTime(MOBILE_JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyMobileAccessToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: MOBILE_JWT_ISSUER,
    });

    if (typeof payload.sub !== "string") return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

export interface GoogleProfile {
  email: string;
  name: string | null;
  picture: string | null;
  googleId: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  const client = new OAuth2Client(env.AUTH_GOOGLE_ID);
  const audience = [env.AUTH_GOOGLE_ID, env.AUTH_GOOGLE_ANDROID_ID].filter(
    (value): value is string => Boolean(value),
  );

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return null;

    return {
      email: payload.email,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
      googleId: payload.sub ?? payload.email,
    };
  } catch (error) {
    console.error("Google ID token verification failed:", error);
    return null;
  }
}

export function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}
