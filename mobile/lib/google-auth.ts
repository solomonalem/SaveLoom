import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

const EXPO_GO_ANDROID_PACKAGE = "host.exp.exponent";

/**
 * Redirect URI for Google OAuth on Android.
 *
 * Expo Go must use host.exp.exponent:/oauthredirect so the browser returns to the app.
 * com.googleusercontent.apps.* redirects to google.com in Expo Go (no handler).
 *
 * Requires "Enable custom URI scheme" on the Android OAuth client in Google Cloud.
 */
export function getGoogleOAuthRedirectUri(androidClientId: string): string {
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Application.applicationId === EXPO_GO_ANDROID_PACKAGE;

  if (Platform.OS === "android" && isExpoGo) {
    return `${EXPO_GO_ANDROID_PACKAGE}:/oauthredirect`;
  }

  const clientIdPart = androidClientId.replace(/\.apps\.googleusercontent\.com$/, "");
  return `com.googleusercontent.apps.${clientIdPart}:/oauthredirect`;
}
