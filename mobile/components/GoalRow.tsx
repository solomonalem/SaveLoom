import { StyleSheet, Text, View } from "react-native";

import type { FinancialGoal } from "@/lib/api";
import { formatCurrency } from "@/lib/money";

interface GoalRowProps {
  goal: FinancialGoal;
}

export default function GoalRow({ goal }: GoalRowProps) {
  const progress = Math.min(Math.max(goal.progress, 0), 100);

  return (
    <View style={[styles.card, goal.isCompleted && styles.cardCompleted]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {goal.title}
        </Text>
        <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
      </View>

      {goal.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      ) : null}

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress)}%` }]} />
      </View>

      <Text style={styles.meta}>
        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
        {goal.targetDate
          ? ` · target ${new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
          : ""}
      </Text>
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
  cardCompleted: {
    opacity: 0.75,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4338ca",
  },
  description: {
    marginBottom: 8,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
  },
});
