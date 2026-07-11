import { StyleSheet, Text, View } from "react-native";

import type { Recommendation } from "@/lib/api";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "#fef2f2", text: "#b91c1c" },
  high: { bg: "#fff7ed", text: "#c2410c" },
  medium: { bg: "#eef2ff", text: "#4338ca" },
  low: { bg: "#f1f5f9", text: "#64748b" },
};

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityStyle = PRIORITY_COLORS[recommendation.priority] ?? PRIORITY_COLORS.medium!;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.priority, { backgroundColor: priorityStyle.bg, color: priorityStyle.text }]}>
          {recommendation.priority}
        </Text>
        <Text style={styles.impact}>{recommendation.impact}</Text>
      </View>
      <Text style={styles.title}>{recommendation.title}</Text>
      <Text style={styles.body}>{recommendation.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  priority: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  impact: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 20,
  },
  body: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
});
