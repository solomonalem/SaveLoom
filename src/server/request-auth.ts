import { auth } from "~/server/auth";
import {
  getBearerToken,
  verifyMobileAccessToken,
} from "~/lib/mobile-auth";

/**
 * Resolve the authenticated user id from a web session cookie or mobile Bearer JWT.
 */
export async function getRequestUserId(request?: Request): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  if (!request) return null;

  const bearer = getBearerToken(request.headers.get("authorization"));
  if (!bearer) return null;

  const verified = await verifyMobileAccessToken(bearer);
  return verified?.userId ?? null;
}
