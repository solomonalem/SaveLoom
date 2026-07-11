import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { API_URL } from "./config";

WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = "saveloom";

export type WebAuthResult =
  | { type: "success"; accessToken: string }
  | { type: "cancel" }
  | { type: "error"; message: string };

/**
 * Deep-link URI the API redirects to after NextAuth Google sign-in.
 *
 * Linking.createURL() can return http://localhost:8081/... on some builds,
 * which the API rejects. We build the exp:// URI explicitly for Expo Go.
 */
export function getAuthCallbackUri(): string {
  // Expo Go — use Metro host from the dev server (LAN or tunnel)
  if (Constants.appOwnership === "expo") {
    const hostUri = Constants.expoConfig?.hostUri?.replace(/^\/+/, "");
    if (hostUri) {
      return `exp://${hostUri}/--/auth/callback`;
    }

    // Fallback: derive host from linkingUri (e.g. exp://192.168.4.153:8081)
    const linkingUri =
      Constants.linkingUri ??
      (Constants.expoConfig as { linkingUri?: string } | null)?.linkingUri;
    if (linkingUri?.startsWith("exp://")) {
      const host = linkingUri.replace("exp://", "").split("/")[0];
      if (host) {
        return `exp://${host}/--/auth/callback`;
      }
    }
  }

  // Standalone / dev builds use the app scheme from app.json
  return `${APP_SCHEME}://auth/callback`;
}

/**
 * Sign in via direct server-side Google OAuth (no NextAuth dependency).
 *
 * Flow:
 * 1. Open Chrome Custom Tab → /api/mobile/auth/start (redirects to Google)
 * 2. User picks Google account
 * 3. Google redirects to /api/mobile/auth/callback (server exchanges code)
 * 4. Server redirects to exp://…/auth/callback?token=JWT
 * 5. Custom Tab closes, app receives JWT
 */
export async function signInWithGoogleWeb(): Promise<WebAuthResult> {
  const appRedirect = getAuthCallbackUri();
  const startUrl = `${API_URL}/api/mobile/auth/start?app_redirect=${encodeURIComponent(appRedirect)}`;

  const result = await WebBrowser.openAuthSessionAsync(startUrl, appRedirect, {
    preferEphemeralSession: false,
  });

  if (result.type === "cancel" || result.type === "dismiss") {
    return { type: "cancel" };
  }

  if (result.type !== "success" || !result.url) {
    return { type: "error", message: "Sign-in did not complete." };
  }

  return parseAuthCallbackUrl(result.url);
}

export function parseAuthCallbackUrl(url: string): WebAuthResult {
  const { queryParams } = Linking.parse(url);
  const params = queryParams ?? {};

  const error = firstParam(params.error);
  const token = firstParam(params.token);

  if (error) {
    const messages: Record<string, string> = {
      cancelled: "Sign-in was cancelled.",
      access_denied: "Sign-in was cancelled.",
      not_authenticated: "Sign-in was not completed. Please try again.",
      token_exchange_failed:
        "Could not complete sign-in. Make sure the server's callback URL is registered in Google Cloud Console.",
      no_id_token: "Google did not return an ID token.",
      invalid_id_token: "Could not verify your Google account.",
    };
    return { type: "error", message: messages[error] ?? error };
  }

  if (!token) {
    return { type: "error", message: "No access token received from the server." };
  }

  return { type: "success", accessToken: token };
}

function firstParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}
