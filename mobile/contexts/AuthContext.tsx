import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchCurrentUser,
  signInWithGoogleIdToken,
  type MobileUser,
} from "@/lib/api";
import { DEV_BYPASS_AUTH, DEV_ACCESS_TOKEN } from "@/lib/config";
import devSnapshot from "@/lib/dev-snapshot.json";
import { DEV_MOCK_USER } from "@/lib/dev-mock";
import { deleteStoredToken, getStoredToken, setStoredToken } from "@/lib/token-storage";

const TOKEN_KEY = "saveloom_access_token";

const SESSION_TIMEOUT_MS = 10_000;

interface AuthContextValue {
  user: MobileUser | null;
  token: string | null;
  isLoading: boolean;
  usingDevSnapshot: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithAccessToken: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Call after a live API request succeeds while in offline snapshot mode. */
  markApiReachable: () => void;
  /** Retry connecting to the live API (e.g. pull-to-refresh). */
  reconnectLive: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadDevSnapshotSession(token: string) {
  return {
    token,
    user: devSnapshot.user as MobileUser,
  };
}

async function fetchLiveUser(tokenToTry: string): Promise<MobileUser> {
  const { user: realUser } = await Promise.race([
    fetchCurrentUser(tokenToTry),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Session restore timed out")), SESSION_TIMEOUT_MS),
    ),
  ]);
  return realUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDevSnapshot, setUsingDevSnapshot] = useState(false);

  const persistSession = useCallback(async (accessToken: string, nextUser: MobileUser) => {
    await setStoredToken(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(nextUser);
    setUsingDevSnapshot(false);
  }, []);

  const signOut = useCallback(async () => {
    await deleteStoredToken(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setUsingDevSnapshot(false);
  }, []);

  const markApiReachable = useCallback(() => {
    setUsingDevSnapshot(false);
  }, []);

  const reconnectLive = useCallback(async (): Promise<boolean> => {
    const storedToken = await getStoredToken(TOKEN_KEY);
    const tokenToTry =
      DEV_ACCESS_TOKEN.length > 0
        ? DEV_ACCESS_TOKEN
        : token && token !== "dev-bypass"
          ? token
          : storedToken;

    if (!tokenToTry || tokenToTry === "dev-bypass") return false;

    try {
      const realUser = await fetchLiveUser(tokenToTry);
      await persistSession(tokenToTry, realUser);
      return true;
    } catch {
      return false;
    }
  }, [persistSession, token]);

  const refreshUser = useCallback(async () => {
    if (!token || token === "dev-bypass") return;
    const { user: nextUser } = await fetchCurrentUser(token);
    setUser(nextUser);
    setUsingDevSnapshot(false);
  }, [token]);

  const signInWithAccessToken = useCallback(
    async (accessToken: string) => {
      const { user: nextUser } = await fetchCurrentUser(accessToken);
      await persistSession(accessToken, nextUser);
    },
    [persistSession],
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const result = await signInWithGoogleIdToken(idToken);
      await persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  useEffect(() => {
    void (async () => {
      if (DEV_BYPASS_AUTH) {
        const storedToken = await getStoredToken(TOKEN_KEY);
        const tokenToTry =
          DEV_ACCESS_TOKEN.length > 0 ? DEV_ACCESS_TOKEN : storedToken;

        if (tokenToTry) {
          try {
            const realUser = await fetchLiveUser(tokenToTry);
            setToken(tokenToTry);
            setUser(realUser);
            setUsingDevSnapshot(false);
            await setStoredToken(TOKEN_KEY, tokenToTry);
            setIsLoading(false);
            return;
          } catch {
            if (DEV_ACCESS_TOKEN.length > 0) {
              const snapshot = loadDevSnapshotSession(DEV_ACCESS_TOKEN);
              setToken(snapshot.token);
              setUser(snapshot.user);
              setUsingDevSnapshot(true);
              setIsLoading(false);
              return;
            }
          }
        }

        setUser(DEV_MOCK_USER);
        setToken("dev-bypass");
        setUsingDevSnapshot(false);
        setIsLoading(false);
        return;
      }

      try {
        const storedToken = await getStoredToken(TOKEN_KEY);
        if (!storedToken) return;

        const { user: storedUser } = await Promise.race([
          fetchCurrentUser(storedToken),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Session restore timed out")), SESSION_TIMEOUT_MS),
          ),
        ]);
        setToken(storedToken);
        setUser(storedUser);
      } catch {
        await deleteStoredToken(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      usingDevSnapshot,
      signInWithGoogle,
      signInWithAccessToken,
      signOut,
      refreshUser,
      markApiReachable,
      reconnectLive,
    }),
    [user, token, isLoading, usingDevSnapshot, signInWithGoogle, signInWithAccessToken, signOut, refreshUser, markApiReachable, reconnectLive],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function getDevSnapshotStats() {
  return devSnapshot.stats;
}

export function getDevSnapshotAccounts() {
  return (devSnapshot as { accounts?: import("@/lib/api").BankAccount[] }).accounts ?? [];
}

export function getDevSnapshotTransactions() {
  return (devSnapshot as { transactions?: import("@/lib/api").Transaction[] }).transactions ?? [];
}

export function getDevSnapshotInsights() {
  return (devSnapshot as { insights?: import("@/lib/api").AIInsight[] }).insights ?? [];
}

export function getDevSnapshotRecommendations() {
  return (devSnapshot as { recommendations?: import("@/lib/api").Recommendation[] }).recommendations ?? [];
}

export function getDevSnapshotBudgets() {
  return (devSnapshot as { budgets?: import("@/lib/api").Budget[] }).budgets ?? [];
}

export function getDevSnapshotGoals() {
  return (devSnapshot as { goals?: import("@/lib/api").FinancialGoal[] }).goals ?? [];
}
