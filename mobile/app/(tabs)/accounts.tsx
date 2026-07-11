import { StyleSheet, Text, View } from "react-native";

export default function AccountsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accounts</Text>
      <Text style={styles.body}>Phase 2 will add Plaid bank linking and connected accounts here.</Text>
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
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
});
