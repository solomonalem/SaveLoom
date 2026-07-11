import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import TransactionRow from "@/components/TransactionRow";
import { useAuth, getDevSnapshotTransactions } from "@/contexts/AuthContext";
import { fetchTransactions, type Transaction } from "@/lib/api";
import { getOfflineApiReason, isDevMockSession } from "@/lib/config";
import { DEV_MOCK_TRANSACTIONS } from "@/lib/dev-mock";
import { formatCurrency } from "@/lib/money";

export default function TransactionsScreen() {
  const { token, isLoading: authLoading, usingDevSnapshot, markApiReachable, reconnectLive } =
    useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (authLoading) return;

    if (isDevMockSession(token)) {
      setError(null);
      setTransactions(DEV_MOCK_TRANSACTIONS);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const data = await fetchTransactions(token);
      setTransactions(data.transactions);
      if (usingDevSnapshot) {
        markApiReachable();
        void reconnectLive();
      }
    } catch (err) {
      if (usingDevSnapshot) {
        setError(null);
        setTransactions(getDevSnapshotTransactions());
      } else {
        setError(err instanceof Error ? err.message : "Failed to load transactions");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, token, usingDevSnapshot, markApiReachable, reconnectLive]);

  useEffect(() => {
    setLoading(true);
    void loadTransactions();
  }, [loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void (async () => {
      await reconnectLive();
      await loadTransactions();
    })();
  };

  const summary = useMemo(() => {
    const expenses = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const income = transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { expenses, income, count: transactions.length };
  }, [transactions]);

  if ((loading || authLoading) && transactions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.subtitle}>Recent activity</Text>

      {usingDevSnapshot ? (
        <Text style={styles.devBanner}>{getOfflineApiReason()}</Text>
      ) : isDevMockSession(token) ? (
        <Text style={styles.devBanner}>Dev mode — sample transactions</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {transactions.length > 0 ? (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={[styles.summaryValue, styles.summaryExpense]}>
                {formatCurrency(summary.expenses)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, styles.summaryIncome]}>
                {formatCurrency(summary.income)}
              </Text>
            </View>
          </View>

          <Text style={styles.listHeading}>
            {summary.count} transaction{summary.count === 1 ? "" : "s"}
          </Text>

          <View style={styles.list}>
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyBody}>
            Connect a bank on the web app to import transactions, then pull to refresh here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
  },
  subtitle: {
    marginBottom: 16,
    fontSize: 14,
    color: "#64748b",
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
  error: {
    marginBottom: 12,
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  summaryExpense: {
    color: "#dc2626",
  },
  summaryIncome: {
    color: "#059669",
  },
  listHeading: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
});
