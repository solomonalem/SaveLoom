import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import BudgetRow from "@/components/BudgetRow";
import GoalRow from "@/components/GoalRow";
import {
  useAuth,
  getDevSnapshotBudgets,
  getDevSnapshotGoals,
} from "@/contexts/AuthContext";
import {
  fetchBudgets,
  fetchGoals,
  type Budget,
  type FinancialGoal,
} from "@/lib/api";
import { API_URL, getOfflineApiReason, isDevMockSession } from "@/lib/config";
import { DEV_MOCK_BUDGETS, DEV_MOCK_GOALS } from "@/lib/dev-mock";

export default function PlanScreen() {
  const { token, isLoading: authLoading, usingDevSnapshot, markApiReachable, reconnectLive } =
    useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    if (authLoading) return;

    if (isDevMockSession(token)) {
      setError(null);
      setBudgets(DEV_MOCK_BUDGETS);
      setGoals(DEV_MOCK_GOALS);
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
      const [budgetsData, goalsData] = await Promise.all([
        fetchBudgets(token),
        fetchGoals(token),
      ]);
      setBudgets(budgetsData.budgets);
      setGoals(goalsData.goals);
      if (usingDevSnapshot) {
        markApiReachable();
        void reconnectLive();
      }
    } catch (err) {
      if (usingDevSnapshot) {
        setError(null);
        setBudgets(getDevSnapshotBudgets());
        setGoals(getDevSnapshotGoals());
      } else {
        setError(err instanceof Error ? err.message : "Failed to load plan");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, token, usingDevSnapshot, markApiReachable, reconnectLive]);

  useEffect(() => {
    setLoading(true);
    void loadPlan();
  }, [loadPlan]);

  useFocusEffect(
    useCallback(() => {
      void loadPlan();
    }, [loadPlan]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void (async () => {
      await reconnectLive();
      await loadPlan();
    })();
  };

  const hasContent = budgets.length > 0 || goals.length > 0;

  if ((loading || authLoading) && !hasContent) {
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
      <Text style={styles.subtitle}>Budgets and savings goals</Text>

      {usingDevSnapshot ? (
        <Text style={styles.devBanner}>{getOfflineApiReason()}</Text>
      ) : isDevMockSession(token) ? (
        <Text style={styles.devBanner}>Dev mode — sample budgets and goals</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {budgets.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Budgets</Text>
          <View style={styles.list}>
            {budgets.map((budget) => (
              <BudgetRow key={budget.id} budget={budget} />
            ))}
          </View>
        </>
      ) : null}

      {goals.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, budgets.length > 0 && styles.sectionTitleSpaced]}>
            Goals
          </Text>
          <View style={styles.list}>
            {goals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} />
            ))}
          </View>
        </>
      ) : null}

      {!hasContent && !error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No budgets or goals yet</Text>
          <Text style={styles.emptyBody}>
            Create budgets and financial goals on the SaveLoom web app, then pull to refresh here.
          </Text>
          <Pressable style={styles.linkButton} onPress={() => void Linking.openURL(API_URL)}>
            <Text style={styles.linkButtonText}>Open web app</Text>
          </Pressable>
        </View>
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
  sectionTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionTitleSpaced: {
    marginTop: 20,
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
  linkButton: {
    marginTop: 16,
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
