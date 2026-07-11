/**
 * Allowed deep-link targets for mobile OAuth callbacks.
 * Must stay in sync with mobile/lib/web-auth.ts getAuthCallbackUri().
 */
export function isAllowedMobileRedirectUri(uri: string): boolean {
  if (!uri || /\s/.test(uri)) return false;

  // Production / custom dev builds
  if (uri.startsWith("saveloom://")) return true;

  // Expo Go — Linking.createURL() may emit exp:/ or exp://
  if (uri.startsWith("exp:/")) return true;

  // Expo dev-client combined schemes, e.g. exp+saveloom://
  if (/^exp\+[\w.-]+:\/\/?/.test(uri)) return true;

  return false;
}

export function appendQueryParam(uri: string, key: string, value: string): string {
  const separator = uri.includes("?") ? "&" : "?";
  return `${uri}${separator}${key}=${encodeURIComponent(value)}`;
}
