import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { useAuth } from "@/contexts/AuthContext";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/lib/config";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "dismiss" || response.type === "cancel") {
      setSubmitting(false);
      return;
    }

    if (response.type !== "success") {
      setSubmitting(false);
      setError("Google sign-in did not complete.");
      return;
    }

    const idToken =
      response.params?.id_token ?? response.authentication?.idToken;

    if (!idToken) {
      setSubmitting(false);
      setError("No ID token received from Google.");
      return;
    }

    void (async () => {
      try {
        await signInWithGoogle(idToken);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Sign-in failed on the server.",
        );
      } finally {
        setSubmitting(false);
      }
    })();
  }, [response]);

  const handlePress = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await promptAsync();
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error ? err.message : "Could not open Google sign-in.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SL</Text>
        </View>
        <Text style={styles.title}>SaveLoom</Text>
        <Text style={styles.subtitle}>Your AI financial coach on mobile</Text>
      </View>

      <Pressable
        style={[
          styles.button,
          (submitting || !request) && styles.buttonDisabled,
        ]}
        disabled={submitting || !request}
        onPress={() => void handlePress()}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.footer}>
        Opens Google sign-in in your browser, then returns you to the app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#eef2ff",
  },
  hero: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4f46e5",
    marginBottom: 16,
  },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    color: "#dc2626",
    textAlign: "center",
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
});
