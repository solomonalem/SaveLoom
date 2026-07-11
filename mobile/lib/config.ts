import { Platform } from "react-native";

const devHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:3000`;

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

/** Android OAuth client ID (for future native dev builds only). */
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? "";

/**
 * Skip login in development and use mock user + dashboard data.
 * Set EXPO_PUBLIC_DEV_BYPASS_AUTH=false to re-enable login.
 */
export const DEV_BYPASS_AUTH =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH !== "false";

/** Real account token from web dev page (/dev/mobile-token). Overrides mock data. */
export const DEV_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim() ?? "";

/** Production release builds never use dev bypass (__DEV__ is false). */
export const IS_PRODUCTION = !__DEV__;

export function isDevMockSession(token: string | null): boolean {
  return DEV_BYPASS_AUTH && token === "dev-bypass";
}

export function isLocalApiUrl(): boolean {
  return /localhost|127\.0\.0\.1|10\.0\.2\.2/.test(API_URL);
}

/** Short reason Expo is showing cached data instead of live API. */
export function getOfflineApiReason(): string {
  if (isLocalApiUrl() && Platform.OS !== "web") {
    return (
      `Expo on your ${Platform.OS === "ios" ? "phone" : "device"} can't reach localhost — ` +
      `that's your phone, not your Mac. Point EXPO_PUBLIC_API_URL to a tunnel URL ` +
      `(cloudflared/ngrok) and restart Metro.`
    );
  }
  return `Can't reach ${API_URL}. Run npm run dev at repo root, then pull to refresh.`;
}

/** Warn when Google OAuth is likely to fail on a physical device. */
export function getGoogleSignInSetupHint(): string | null {
  if (DEV_BYPASS_AUTH || Platform.OS === "web") return null;

  const isLocal =
    /localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.|10\.\d+\./.test(API_URL);

  if (isLocal) {
    return (
      "Google sign-in needs a public HTTPS API URL on a physical device. " +
      "Run: npx ngrok http 3000 — then set EXPO_PUBLIC_API_URL to the ngrok https URL " +
      "and add https://YOUR-NGROK.ngrok-free.app/api/mobile/auth/callback to Google Cloud Console."
    );
  }

  return null;
}
