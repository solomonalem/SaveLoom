import { StyleSheet, Text, View } from "react-native";

import MerchantIcon from "@/components/MerchantIcon";
import type { Transaction } from "@/lib/api";
import { getMerchantDisplayName } from "@/lib/merchant-icons";
import { formatCurrency } from "@/lib/money";

interface TransactionRowProps {
  transaction: Transaction;
  showAccount?: boolean;
}

function getDisplayName(merchantName: string | null, description: string): string {
  return getMerchantDisplayName(merchantName, description);
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
      <MerchantIcon
        merchantName={transaction.merchantName}
        description={transaction.description}
        category={transaction.category}
      />

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
