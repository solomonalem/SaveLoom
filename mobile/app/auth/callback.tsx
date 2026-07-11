import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";

/** Fallback handler when the app is opened via auth deep link (cold start). */
export default function AuthCallbackScreen() {
  const { token, error: authError } = useLocalSearchParams<{
    token?: string;
    error?: string;
  }>();
  const { signInWithAccessToken } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (authError) {
        setMessage(
          authError === "not_authenticated"
            ? "Sign-in was not completed."
            : String(authError),
        );
        setTimeout(() => router.replace("/(auth)/login"), 1500);
        return;
      }

      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      try {
        await signInWithAccessToken(String(token));
        router.replace("/(tabs)");
      } catch {
        setMessage("Could not restore your session.");
        setTimeout(() => router.replace("/(auth)/login"), 1500);
      }
    })();
  }, [authError, router, signInWithAccessToken, token]);

  return (
    <View style={styles.container}>
      {message ? (
        <Text style={styles.error}>{message}</Text>
      ) : (
        <ActivityIndicator size="large" color="#4f46e5" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    padding: 24,
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    fontSize: 14,
  },
});
