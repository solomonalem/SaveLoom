import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/config";
import { getPlaidUnavailableMessage, isPlaidLinkAvailable, openPlaidLink } from "@/lib/plaid-link";

interface PlaidLinkButtonProps {
  token: string | null;
  onLinked: () => void;
  disabled?: boolean;
}

export default function PlaidLinkButton({ token, onLinked, disabled }: PlaidLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = () => {
    if (!token || disabled) return;

    setError(null);
    setLoading(true);

    void openPlaidLink(token, {
      onSuccess: () => {
        setLoading(false);
        onLinked();
      },
      onError: (message) => {
        setLoading(false);
        setError(message);
      },
    });
  };

  const openWebFallback = () => {
    void Linking.openURL(API_URL);
  };

  if (!isPlaidLinkAvailable()) {
    return (
      <View>
        <Pressable style={styles.secondaryButton} onPress={openWebFallback}>
          <Text style={styles.secondaryButtonText}>Connect a bank on web</Text>
        </Pressable>
        <Text style={styles.hint}>{getPlaidUnavailableMessage()}</Text>
      </View>
    );
  }

  return (
    <View>
      <Pressable
        style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
        disabled={loading || disabled || !token}
        onPress={handlePress}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connect a bank</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
  error: {
    marginTop: 10,
    color: "#dc2626",
    fontSize: 13,
    textAlign: "center",
  },
});
