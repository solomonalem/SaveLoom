import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { getGoogleSignInSetupHint } from "@/lib/config";
import { getRuntimeLabel, IS_EXPO_GO } from "@/lib/native-capabilities";
import { isNativeGoogleSignInAvailable } from "@/lib/native-google-auth";
import { signInWithGoogleUnified } from "@/lib/sign-in";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithAccessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setupHint = getGoogleSignInSetupHint();
  const usesNativeGoogle = isNativeGoogleSignInAvailable();

  const handlePress = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const result = await signInWithGoogleUnified();

      if (result.method === "cancel") {
        return;
      }

      if (result.method === "error") {
        setError(result.message);
        return;
      }

      if (result.method === "native") {
        await signInWithGoogle(result.idToken);
        return;
      }

      await signInWithAccessToken(result.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
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
        style={[styles.button, submitting && styles.buttonDisabled]}
        disabled={submitting}
        onPress={() => void handlePress()}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {setupHint ? <Text style={styles.hint}>{setupHint}</Text> : null}

      <Text style={styles.footer}>
        {usesNativeGoogle
          ? "Uses native Google sign-in in your development build."
          : IS_EXPO_GO
            ? "Opens Google sign-in in your browser, then returns to the app."
            : "Sign in with your SaveLoom Google account."}
      </Text>

      <Text style={styles.runtime}>Runtime: {getRuntimeLabel()}</Text>
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
  hint: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 18,
  },
  runtime: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 11,
    color: "#cbd5e1",
  },
});
