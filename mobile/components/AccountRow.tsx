import { StyleSheet, Text, View } from "react-native";

import MerchantIcon from "@/components/MerchantIcon";
import type { BankAccount } from "@/lib/api";
import { formatCurrency } from "@/lib/money";

interface AccountRowProps {
  account: BankAccount;
}

function formatAccountType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function AccountRow({ account }: AccountRowProps) {
  const mask = account.mask ? `•••• ${account.mask}` : null;
  const syncWarning = account.syncStatus !== "active";

  return (
    <View style={styles.row}>
      <MerchantIcon bankName={account.bankName} category="Banking & Finance" />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {account.accountName}
          </Text>
          <Text style={styles.type}>{formatAccountType(account.accountType)}</Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {account.bankName}
          {mask ? ` · ${mask}` : ""}
        </Text>
        {syncWarning ? (
          <Text style={styles.syncWarning}>Sync issue — reconnect on web</Text>
        ) : null}
      </View>

      <Text style={styles.balance}>{formatCurrency(account.currentBalance)}</Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  type: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  syncWarning: {
    marginTop: 4,
    fontSize: 11,
    color: "#d97706",
  },
  balance: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
});
