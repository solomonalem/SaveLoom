import Constants from "expo-constants";
import { Platform } from "react-native";

/** Running inside Expo Go (no custom native modules). */
export const IS_EXPO_GO = Constants.appOwnership === "expo";

/** Dev build or standalone app with native modules compiled in. */
export const HAS_DEV_BUILD = !IS_EXPO_GO && Platform.OS !== "web";

export function getRuntimeLabel(): string {
  if (Platform.OS === "web") return "Web preview";
  if (IS_EXPO_GO) return "Expo Go";
  return "Development build";
}
