import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import StatCard from "@/components/StatCard";
import { useAuth, getDevSnapshotStats } from "@/contexts/AuthContext";
import { fetchDashboardStats, type DashboardStats } from "@/lib/api";
import { DEV_BYPASS_AUTH, isDevMockSession } from "@/lib/config";
import { DEV_MOCK_STATS } from "@/lib/dev-mock";
import {
  formatCurrency,
  formatSignedCurrency,
  formatSavingsRate,
} from "@/lib/money";
import { useFocusEffect } from "expo-router";

export default function DashboardScreen() {
  const { token, user, isLoading: authLoading, usingDevSnapshot } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (authLoading) return;

    if (isDevMockSession(token)) {
      setError(null);
      setStats(DEV_MOCK_STATS);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (usingDevSnapshot) {
      setError(null);
      setStats(getDevSnapshotStats());
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
      const data = await fetchDashboardStats(token);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, token, usingDevSnapshot]);

  useEffect(() => {
    setLoading(true);
    void loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void loadStats();
  };

  if ((loading || authLoading) && !stats) {
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
      <Text style={styles.greeting}>
        Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </Text>
      <Text style={styles.subtitle}>Your financial overview</Text>

      {usingDevSnapshot ? (
        <Text style={styles.devBanner}>
          Offline dev snapshot — your real SaveLoom data (refresh when API is reachable)
        </Text>
      ) : isDevMockSession(token) ? (
        <Text style={styles.devBanner}>
          Dev mode — sample data. Get a real token at /dev/mobile-token on the web app.
        </Text>
      ) : DEV_BYPASS_AUTH ? (
        <Text style={styles.devBanner}>Dev mode — signed in with your SaveLoom account</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {stats ? (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total balance</Text>
            <Text style={styles.heroValue}>{formatCurrency(stats.totalBalance)}</Text>
            <Text style={styles.heroMeta}>
              {stats.accountsConnected} account{stats.accountsConnected === 1 ? "" : "s"} ·{" "}
              {formatSignedCurrency(stats.netCashFlow)} cash flow (30d)
            </Text>
          </View>

          <View style={styles.grid}>
            <StatCard label="Accounts" value={String(stats.accountsConnected)} hint="Connected" />
            <StatCard label="Transactions" value={String(stats.transactionsTracked)} hint="All time" />
            <StatCard label="Income (30d)" value={formatCurrency(stats.monthlyIncome)} />
            <StatCard label="Expenses (30d)" value={formatCurrency(stats.monthlyExpenses)} />
            <StatCard
              label="Savings rate"
              value={formatSavingsRate(stats.savingsRate)}
              hint={stats.savingsRate === null ? "No income recorded" : "Last 30 days"}
            />
            <StatCard label="Avg daily spend" value={formatCurrency(stats.avgDailySpend)} hint="Per day" />
          </View>

          {stats.topCategory ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Top spending category</Text>
              <Text style={styles.noteBody}>
                {stats.topCategory.replace(/_/g, " ")} · {formatCurrency(stats.topCategoryAmount)}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
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
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
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
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  heroCard: {
    backgroundColor: "#4f46e5",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroValue: {
    marginTop: 8,
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  heroMeta: {
    marginTop: 8,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  noteCard: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  noteBody: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
  },
});
