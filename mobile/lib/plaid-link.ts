import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/api";
import { HAS_DEV_BUILD } from "@/lib/native-capabilities";

export function isPlaidLinkAvailable(): boolean {
  return HAS_DEV_BUILD;
}

export function getPlaidUnavailableMessage(): string {
  return (
    "In-app bank linking requires a development build (not Expo Go). " +
    "Run: cd mobile && npx expo run:android"
  );
}

export async function openPlaidLink(
  apiToken: string,
  callbacks: {
    onSuccess: () => void;
    onError: (message: string) => void;
  },
): Promise<void> {
  if (!isPlaidLinkAvailable()) {
    callbacks.onError(getPlaidUnavailableMessage());
    return;
  }

  try {
    const { link_token: linkToken } = await createPlaidLinkToken(apiToken);
    const { createPlaidLinkSession } = await import("react-native-plaid-link-sdk");

    const session = await createPlaidLinkSession({
      token: linkToken,
      onSuccess: async (success) => {
        try {
          const publicToken = success.publicToken;
          if (!publicToken) {
            callbacks.onError("Plaid did not return a public token.");
            return;
          }
          await exchangePlaidPublicToken(apiToken, publicToken);
          callbacks.onSuccess();
        } catch (err) {
          callbacks.onError(
            err instanceof Error ? err.message : "Failed to connect bank account",
          );
        }
      },
      onExit: (exit) => {
        if (exit.error) {
          callbacks.onError(exit.error.displayMessage ?? "Plaid Link closed with an error.");
        }
      },
      onEvent: () => {},
    });

    await session.open();
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : "Could not open Plaid Link");
  }
}
