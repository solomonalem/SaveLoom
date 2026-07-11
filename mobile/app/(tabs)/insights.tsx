import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import InsightCard from "@/components/InsightCard";
import RecommendationCard from "@/components/RecommendationCard";
import {
  useAuth,
  getDevSnapshotInsights,
  getDevSnapshotRecommendations,
} from "@/contexts/AuthContext";
import {
  fetchInsights,
  fetchRecommendations,
  type AIInsight,
  type Recommendation,
} from "@/lib/api";
import { getOfflineApiReason, isDevMockSession } from "@/lib/config";
import { DEV_MOCK_INSIGHTS, DEV_MOCK_RECOMMENDATIONS } from "@/lib/dev-mock";

export default function InsightsScreen() {
  const { token, isLoading: authLoading, usingDevSnapshot, markApiReachable, reconnectLive } =
    useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (authLoading) return;

    if (isDevMockSession(token)) {
      setError(null);
      setInsights(DEV_MOCK_INSIGHTS);
      setRecommendations(DEV_MOCK_RECOMMENDATIONS);
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
      const [insightsData, recommendationsData] = await Promise.all([
        fetchInsights(token),
        fetchRecommendations(token),
      ]);
      setInsights(insightsData.insights);
      setRecommendations(recommendationsData.recommendations);
      if (usingDevSnapshot) {
        markApiReachable();
        void reconnectLive();
      }
    } catch (err) {
      if (usingDevSnapshot) {
        setError(null);
        setInsights(getDevSnapshotInsights());
        setRecommendations(getDevSnapshotRecommendations());
      } else {
        setError(err instanceof Error ? err.message : "Failed to load insights");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, token, usingDevSnapshot, markApiReachable, reconnectLive]);

  useEffect(() => {
    setLoading(true);
    void loadInsights();
  }, [loadInsights]);

  useFocusEffect(
    useCallback(() => {
      void loadInsights();
    }, [loadInsights]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void (async () => {
      await reconnectLive();
      await loadInsights();
    })();
  };

  const hasContent = insights.length > 0 || recommendations.length > 0;

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
      <Text style={styles.subtitle}>AI-powered financial insights</Text>

      {usingDevSnapshot ? (
        <Text style={styles.devBanner}>{getOfflineApiReason()}</Text>
      ) : isDevMockSession(token) ? (
        <Text style={styles.devBanner}>Dev mode — sample insights</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {recommendations.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.list}>
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </View>
        </>
      ) : null}

      {insights.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, recommendations.length > 0 && styles.sectionTitleSpaced]}>
            Insights
          </Text>
          <View style={styles.list}>
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        </>
      ) : null}

      {!hasContent && !error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No insights yet</Text>
          <Text style={styles.emptyBody}>
            Connect accounts and sync transactions on the web app. Insights are generated automatically
            from your spending patterns.
          </Text>
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
});
