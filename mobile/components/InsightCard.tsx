import { StyleSheet, Text, View } from "react-native";

import type { AIInsight } from "@/lib/api";
import { formatCurrency } from "@/lib/money";

interface InsightCardProps {
  insight: AIInsight;
}

const TYPE_LABELS: Record<string, string> = {
  spending_trend: "Spending",
  subscription_optimization: "Subscriptions",
  budget_alert: "Budget",
  budget_performance: "Budget",
  saving_opportunity: "Savings",
  spending_alert: "Alert",
  income_analysis: "Income",
  category_analysis: "Category",
};

type Tone = "indigo" | "emerald" | "red" | "amber" | "slate";

function getInsightTone(type: string, change: number | null): Tone {
  switch (type) {
    case "spending_trend":
      return change != null && change > 0 ? "red" : "emerald";
    case "budget_alert":
    case "spending_alert":
      return "red";
    case "saving_opportunity":
    case "budget_performance":
      return "emerald";
    case "category_analysis":
      return "amber";
    default:
      return "indigo";
  }
}

const TONE_STYLES: Record<Tone, { badge: object; dot: object }> = {
  indigo: { badge: { backgroundColor: "#eef2ff", color: "#4338ca" }, dot: { backgroundColor: "#6366f1" } },
  emerald: { badge: { backgroundColor: "#ecfdf5", color: "#047857" }, dot: { backgroundColor: "#10b981" } },
  red: { badge: { backgroundColor: "#fef2f2", color: "#b91c1c" }, dot: { backgroundColor: "#ef4444" } },
  amber: { badge: { backgroundColor: "#fffbeb", color: "#b45309" }, dot: { backgroundColor: "#f59e0b" } },
  slate: { badge: { backgroundColor: "#f1f5f9", color: "#475569" }, dot: { backgroundColor: "#64748b" } },
};

function formatMetricValue(value: number | null, metric: string | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (metric?.includes("usage") || metric?.includes("percentage") || metric?.includes("stability")) {
    return `${value.toFixed(1)}%`;
  }
  if (metric === "spending" || metric?.includes("cost") || metric?.includes("savings")) {
    return formatCurrency(value);
  }
  return value.toLocaleString();
}

function formatTimeframe(timeframe: string): string {
  return timeframe.replace(/_/g, " ");
}

export default function InsightCard({ insight }: InsightCardProps) {
  const tone = getInsightTone(insight.type, insight.change);
  const toneStyle = TONE_STYLES[tone];
  const typeLabel = TYPE_LABELS[insight.type] ?? insight.type.replace(/_/g, " ");
  const metricValue = formatMetricValue(insight.value, insight.metric);

  return (
    <View style={styles.card}>
      <View style={[styles.typeDot, toneStyle.dot]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.typeBadge, toneStyle.badge]}>{typeLabel}</Text>
          {metricValue ? <Text style={styles.metric}>{metricValue}</Text> : null}
        </View>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.body}>{insight.content}</Text>
        <View style={styles.footer}>
          <Text style={styles.timeframe}>{formatTimeframe(insight.timeframe)}</Text>
          <Text style={styles.date}>
            {new Date(insight.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  typeDot: {
    width: 4,
    borderRadius: 4,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  metric: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
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
  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeframe: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "capitalize",
  },
  date: {
    fontSize: 11,
    color: "#94a3b8",
  },
});
