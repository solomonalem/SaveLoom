import { useCallback, useEffect, useMemo, useState } from "react";
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

import AccountRow from "@/components/AccountRow";
import { useAuth, getDevSnapshotAccounts } from "@/contexts/AuthContext";
import { fetchBankAccounts, type BankAccount } from "@/lib/api";
import { API_URL, DEV_BYPASS_AUTH, getOfflineApiReason, isDevMockSession } from "@/lib/config";
import { DEV_MOCK_ACCOUNTS } from "@/lib/dev-mock";
import { formatCurrency } from "@/lib/money";

export default function AccountsScreen() {
  const { token, isLoading: authLoading, usingDevSnapshot, markApiReachable, reconnectLive } =
    useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (authLoading) return;

    if (isDevMockSession(token)) {
      setError(null);
      setAccounts(DEV_MOCK_ACCOUNTS);
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
      const data = await fetchBankAccounts(token);
      setAccounts(data.accounts);
      if (usingDevSnapshot) {
        markApiReachable();
        void reconnectLive();
      }
    } catch (err) {
      if (usingDevSnapshot) {
        setError(null);
        setAccounts(getDevSnapshotAccounts());
      } else {
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, token, usingDevSnapshot, markApiReachable, reconnectLive]);

  useEffect(() => {
    setLoading(true);
    void loadAccounts();
  }, [loadAccounts]);

  useFocusEffect(
    useCallback(() => {
      void loadAccounts();
    }, [loadAccounts]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void (async () => {
      await reconnectLive();
      await loadAccounts();
    })();
  };

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.currentBalance, 0),
    [accounts],
  );

  const openWebConnect = () => {
    void Linking.openURL(API_URL);
  };

  if ((loading || authLoading) && accounts.length === 0) {
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
      <Text style={styles.subtitle}>Connected bank accounts</Text>

      {usingDevSnapshot ? (
        <Text style={styles.devBanner}>{getOfflineApiReason()}</Text>
      ) : isDevMockSession(token) ? (
        <Text style={styles.devBanner}>Dev mode — sample accounts</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {accounts.length > 0 ? (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total balance</Text>
            <Text style={styles.heroValue}>{formatCurrency(totalBalance)}</Text>
            <Text style={styles.heroMeta}>
              {accounts.length} account{accounts.length === 1 ? "" : "s"} connected
            </Text>
          </View>

          <View style={styles.list}>
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No accounts yet</Text>
          <Text style={styles.emptyBody}>
            Connect a bank on the SaveLoom web app to see your accounts here.
          </Text>
        </View>
      )}

      <Pressable style={styles.connectButton} onPress={openWebConnect}>
        <Text style={styles.connectButtonText}>Connect a bank on web</Text>
      </Pressable>

      <Text style={styles.footerNote}>
        Plaid linking in the mobile app is coming soon. For now, use the web dashboard to add or
        reconnect banks.
      </Text>
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
  list: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    marginBottom: 16,
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
  connectButton: {
    marginTop: 16,
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footerNote: {
    marginTop: 12,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
});
