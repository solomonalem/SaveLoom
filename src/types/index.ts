// src/types/index.ts 
export interface BankAccount {
    id: string;
    accountName: string;
    bankName: string;
    accountType: string;
    currentBalance: number;
    mask: string;
    isActive: boolean;
}

export interface FinancialGoal {
    id: string;
    title: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    priority: number;
    category: string;
    monthlyContribution?: number;
    isCompleted: boolean;
    completedDate?: string;
    progress?: number;
    linkedAccountIds?: string[]; // 🔥 NEW
}

export interface GoalContribution {
    id: string;
    goalId: string;
    amount: number;
    sourceType: string;
    sourceAccountId?: string;
    note?: string;
    contributedAt: string;
}

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    merchantName?: string;
    category: string;
    subcategory?: string;
    date: string;
    bankAccount?: {
        accountName: string;
        bankName: string;
    };
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
    spent?: number;
    remaining?: number;
    period: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
}