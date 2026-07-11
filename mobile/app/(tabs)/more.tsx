import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { API_URL, DEV_BYPASS_AUTH } from "@/lib/config";
import { getRuntimeLabel, HAS_DEV_BUILD, IS_EXPO_GO } from "@/lib/native-capabilities";

export default function MoreScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API</Text>
        <Text style={styles.valueSmall}>{API_URL}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Runtime</Text>
        <Text style={styles.valueSmall}>{getRuntimeLabel()}</Text>
        <Text style={styles.valueSmall}>
          {HAS_DEV_BUILD
            ? "Native Google sign-in and Plaid Link are available."
            : IS_EXPO_GO
              ? "Expo Go — browser sign-in and web bank linking."
              : "Web preview mode."}
        </Text>
      </View>

      {DEV_BYPASS_AUTH ? (
        <Text style={styles.devBanner}>
          Dev bypass is on. Set EXPO_PUBLIC_DEV_BYPASS_AUTH=false to test real sign-in.
        </Text>
      ) : null}

      <Pressable style={styles.button} onPress={() => void signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  valueSmall: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  devBanner: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  buttonText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
  },
});
