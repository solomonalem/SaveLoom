import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const WEB_PREFIX = "saveloom.";

function webStorageKey(key: string) {
  return `${WEB_PREFIX}${key}`;
}

export async function getStoredToken(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(webStorageKey(key));
  }

  return SecureStore.getItemAsync(key);
}

export async function setStoredToken(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(webStorageKey(key), value);
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteStoredToken(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(webStorageKey(key));
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Token may already be missing.
  }
}
