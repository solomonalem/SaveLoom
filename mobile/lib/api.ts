import { API_URL } from "./config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(API_URL.includes("loca.lt") ? { "Bypass-Tunnel-Reminder": "true" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }).catch((err: unknown) => {
    throw new ApiError(
      err instanceof Error
        ? `Network error: ${err.message}. Is the API running at ${API_URL}?`
        : `Network error. Is the API running at ${API_URL}?`,
      0,
    );
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new ApiError(data.error ?? "Request failed", response.status);
  }

  return data;
}

export interface MobileUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  onboardingCompleted: boolean;
  hasConnectedBank: boolean;
}

export interface DashboardStats {
  accountsConnected: number;
  transactionsTracked: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  savingsRate: number | null;
  avgDailySpend: number;
  topCategory: string | null;
  topCategoryAmount: number;
  hasRecentActivity: boolean;
}

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountType: string;
  currentBalance: number;
  availableBalance: number | null;
  mask: string | null;
  syncStatus: string;
  lastSync: string | null;
  createdAt: string;
}

export interface BankAccountsResponse {
  accounts: BankAccount[];
  count: number;
}

export async function signInWithGoogleIdToken(idToken: string) {
  return apiFetch<{ accessToken: string; user: MobileUser }>("/api/mobile/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function fetchCurrentUser(token: string) {
  return apiFetch<{ user: MobileUser }>("/api/mobile/me", { token });
}

export async function fetchDashboardStats(token: string) {
  return apiFetch<DashboardStats>("/api/dashboard/stats", { token });
}

export async function fetchBankAccounts(token: string) {
  return apiFetch<BankAccountsResponse>("/api/bank-accounts", { token });
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  merchantName: string | null;
  category: string;
  subcategory: string | null;
  date: string;
  bankAccount?: {
    accountName: string;
    bankName: string;
  };
}

export interface TransactionsResponse {
  transactions: Transaction[];
  count: number;
}

export async function fetchTransactions(token: string) {
  return apiFetch<TransactionsResponse>("/api/transactions", { token });
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  content: string;
  timeframe: string;
  metric: string | null;
  value: number | null;
  change: number | null;
  createdAt: string;
  isRead: boolean;
  priority: string;
}

export interface InsightsResponse {
  insights: AIInsight[];
  total: number;
}

export interface Recommendation {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  priority: string;
  confidence: number;
  potentialSavings: number | null;
  isRead: boolean;
  isActioned: boolean;
  createdAt: string;
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: Recommendation[];
}

export async function fetchInsights(token: string, limit = 20) {
  return apiFetch<InsightsResponse>(`/api/ai/insights?limit=${limit}`, { token });
}

export async function fetchRecommendations(token: string, limit = 10) {
  return apiFetch<RecommendationsResponse>(`/api/recommendations?limit=${limit}&status=pending`, {
    token,
  });
}
