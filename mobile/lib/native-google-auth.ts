import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

import { GOOGLE_WEB_CLIENT_ID } from "@/lib/config";
import { HAS_DEV_BUILD } from "@/lib/native-capabilities";

let configured = false;

export function isNativeGoogleSignInAvailable(): boolean {
  return HAS_DEV_BUILD && GOOGLE_WEB_CLIENT_ID.length > 0;
}

export function configureNativeGoogleSignIn(): void {
  if (!isNativeGoogleSignInAvailable() || configured) return;

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

/** Returns a Google ID token for POST /api/mobile/auth/google. */
export async function signInWithGoogleNative(): Promise<string> {
  configureNativeGoogleSignIn();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch {
    // iOS has no Play Services — continue
  }

  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error("Google did not return an ID token.");
  }

  return idToken;
}

export function getNativeGoogleSignInErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = String((err as { code: unknown }).code);
    if (code === statusCodes.SIGN_IN_CANCELLED) {
      return "Sign-in was cancelled.";
    }
    if (code === statusCodes.IN_PROGRESS) {
      return "Sign-in already in progress.";
    }
    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return "Google Play Services is not available on this device.";
    }
  }

  return err instanceof Error ? err.message : "Native Google sign-in failed.";
}
