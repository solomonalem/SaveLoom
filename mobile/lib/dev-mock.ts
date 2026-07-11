import type { BankAccount, DashboardStats, MobileUser, Transaction } from "@/lib/api";

/** Placeholder user while auth is bypassed in development. */
export const DEV_MOCK_USER: MobileUser = {
  id: "dev-user",
  email: "dev@saveloom.local",
  name: "Dev User",
  image: null,
  onboardingCompleted: true,
  hasConnectedBank: true,
};

/** Placeholder dashboard data while auth is bypassed in development. */
export const DEV_MOCK_STATS: DashboardStats = {
  accountsConnected: 2,
  transactionsTracked: 148,
  totalBalance: 12450.75,
  monthlyIncome: 5200,
  monthlyExpenses: 3180.42,
  netCashFlow: 2019.58,
  savingsRate: 38.8,
  avgDailySpend: 106.01,
  topCategory: "food_and_drink",
  topCategoryAmount: 842.5,
  hasRecentActivity: true,
};

/** Placeholder accounts while auth is bypassed in development. */
export const DEV_MOCK_ACCOUNTS: BankAccount[] = [
  {
    id: "dev-checking",
    accountName: "Everyday Checking",
    bankName: "Chase",
    accountType: "checking",
    currentBalance: 8420.5,
    availableBalance: 8420.5,
    mask: "4821",
    syncStatus: "active",
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "dev-savings",
    accountName: "High Yield Savings",
    bankName: "Ally Bank",
    accountType: "savings",
    currentBalance: 4030.25,
    availableBalance: 4030.25,
    mask: "9103",
    syncStatus: "active",
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

/** Placeholder transactions while auth is bypassed in development. */
export const DEV_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "dev-tx-1",
    amount: -42.18,
    description: "STARBUCKS STORE 12345",
    merchantName: "Starbucks",
    category: "food_and_drink",
    subcategory: null,
    date: new Date(Date.now() - 86400000).toISOString(),
    bankAccount: { accountName: "Everyday Checking", bankName: "Chase" },
  },
  {
    id: "dev-tx-2",
    amount: -128.5,
    description: "AMAZON MARKETPLACE",
    merchantName: "Amazon",
    category: "shopping",
    subcategory: null,
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    bankAccount: { accountName: "Everyday Checking", bankName: "Chase" },
  },
  {
    id: "dev-tx-3",
    amount: 2600,
    description: "DIRECT DEPOSIT PAYROLL",
    merchantName: "Employer Inc",
    category: "income",
    subcategory: null,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    bankAccount: { accountName: "Everyday Checking", bankName: "Chase" },
  },
  {
    id: "dev-tx-4",
    amount: -65,
    description: "SHELL OIL",
    merchantName: "Shell",
    category: "transportation",
    subcategory: null,
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    bankAccount: { accountName: "Everyday Checking", bankName: "Chase" },
  },
];
