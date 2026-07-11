import { signInWithGoogleWeb, type WebAuthResult } from "@/lib/web-auth";
import {
  getNativeGoogleSignInErrorMessage,
  isNativeGoogleSignInAvailable,
  signInWithGoogleNative,
} from "@/lib/native-google-auth";

export type SignInResult =
  | { method: "native"; idToken: string }
  | { method: "web"; accessToken: string }
  | { method: "cancel" }
  | { method: "error"; message: string };

/** Native Google in dev builds; browser OAuth fallback for Expo Go / web. */
export async function signInWithGoogleUnified(): Promise<SignInResult> {
  if (isNativeGoogleSignInAvailable()) {
    try {
      const idToken = await signInWithGoogleNative();
      return { method: "native", idToken };
    } catch (err) {
      return { method: "error", message: getNativeGoogleSignInErrorMessage(err) };
    }
  }

  const webResult: WebAuthResult = await signInWithGoogleWeb();

  if (webResult.type === "cancel") {
    return { method: "cancel" };
  }

  if (webResult.type === "error") {
    return { method: "error", message: webResult.message };
  }

  return { method: "web", accessToken: webResult.accessToken };
}
