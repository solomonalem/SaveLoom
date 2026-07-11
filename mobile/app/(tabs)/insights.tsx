import { StyleSheet, Text, View } from "react-native";

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.body}>Phase 6 will bring AI insights and recommendations to mobile.</Text>
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
