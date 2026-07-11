import { StyleSheet, Text, View } from "react-native";

import type { Budget } from "@/lib/api";
import { formatCurrency } from "@/lib/money";

interface BudgetRowProps {
  budget: Budget;
}

function formatCategory(category: string): string {
  return category.replace(/_/g, " ");
}

export default function BudgetRow({ budget }: BudgetRowProps) {
  const spent = Math.max(0, budget.spent);
  const limit = Math.max(budget.amount, 1);
  const progress = Math.min(spent / limit, 1);
  const overBudget = spent > budget.amount;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.category}>{formatCategory(budget.category)}</Text>
        <Text style={[styles.remaining, overBudget && styles.overBudget]}>
          {overBudget ? "Over" : formatCurrency(budget.remaining)} left
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(progress * 100)}%` },
            overBudget && styles.fillOver,
          ]}
        />
      </View>

      <Text style={styles.meta}>
        {formatCurrency(spent)} of {formatCurrency(budget.amount)} · {budget.period}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  category: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  remaining: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  overBudget: {
    color: "#dc2626",
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
    backgroundColor: "#6366f1",
  },
  fillOver: {
    backgroundColor: "#ef4444",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
  },
});
