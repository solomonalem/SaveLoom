import { StyleSheet, Text, View } from "react-native";

import type { Transaction } from "@/lib/api";
import { formatCurrency } from "@/lib/money";

interface TransactionRowProps {
  transaction: Transaction;
  showAccount?: boolean;
}

function getDisplayName(merchantName: string | null, description: string): string {
  return (merchantName || description || "Unknown").trim();
}

function formatCategory(category: string): string {
  return category.replace(/_/g, " ");
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function merchantInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
}

export default function TransactionRow({ transaction, showAccount = true }: TransactionRowProps) {
  const displayName = getDisplayName(transaction.merchantName, transaction.description);
  const isExpense = transaction.amount < 0;
  const amountText = `${isExpense ? "-" : "+"}${formatCurrency(Math.abs(transaction.amount))}`;

  const metaParts = [formatCategory(transaction.category), formatDate(transaction.date)];
  if (showAccount && transaction.bankAccount) {
    metaParts.push(transaction.bankAccount.accountName);
  }

  return (
    <View style={styles.row}>
      <View style={[styles.icon, isExpense ? styles.iconExpense : styles.iconIncome]}>
        <Text style={[styles.iconText, isExpense ? styles.iconTextExpense : styles.iconTextIncome]}>
          {merchantInitials(displayName)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {metaParts.join(" · ")}
        </Text>
      </View>

      <Text style={[styles.amount, isExpense ? styles.amountExpense : styles.amountIncome]}>
        {amountText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconExpense: {
    backgroundColor: "#fee2e2",
  },
  iconIncome: {
    backgroundColor: "#d1fae5",
  },
  iconText: {
    fontSize: 13,
    fontWeight: "700",
  },
  iconTextExpense: {
    color: "#b91c1c",
  },
  iconTextIncome: {
    color: "#047857",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
  amountExpense: {
    color: "#dc2626",
  },
  amountIncome: {
    color: "#059669",
  },
});
