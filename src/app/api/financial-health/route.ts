//src/app/api/financial-health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { auth } from '~/server/auth';

interface FinancialHealthScore {
    overallScore: number;
    scores: {
        budgetHealth: number;
        savingsRate: number;
        debtManagement: number;
        spendingControl: number;
        incomeStability: number;
        emergencyFund: number;
    };
    trends: {
        scoreChange: number;
        period: string;
    };
    keyMetrics: {
        monthlyIncome: number;
        monthlyExpenses: number;
        savingsRate: number;
        debtToIncome: number;
        emergencyFundMonths: number;
        budgetUtilization: number;
    };
    goals: {
        emergencyFund: { current: number; target: number; progress: number };
        savings: { current: number; target: number; progress: number };
        debtPayoff: { current: number; target: number; progress: number };
    };
    achievements: Array<{
        id: string;
        title: string;
        description: string;
        icon: string;
        earned: boolean;
        earnedDate?: string;
    }>;
    quickActions: Array<{
        id: string;
        title: string;
        description: string;
        impact: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        estimatedSavings?: number;
    }>;
}

export async function GET(req: NextRequest) {
    try {
        console.log('🏥 Financial Health API called');

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('✅ User authenticated:', session.user.id);

        // Fetch comprehensive user data
        const userData = await fetchUserFinancialData(session.user.id);

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate financial health metrics
        const healthData = calculateFinancialHealth(userData);

        console.log('✅ Financial health calculated:', healthData.overallScore);

        return NextResponse.json(healthData);
    } catch (error) {
        console.error('❌ Error in financial health API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch financial health data' },
            { status: 500 }
        );
    }
}

async function fetchUserFinancialData(userId: string) {
    try {
        console.log('🔍 Fetching financial data for user:', userId);

        // Fetch all user financial data in parallel for performance
        const [user, transactions, budgets, bankAccounts, goals] = await Promise.all([
            // User basic info
            db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    incomeRange: true,
                    primaryGoal: true,
                    goalTargetAmount: true,
                    riskTolerance: true,
                    createdAt: true
                }
            }),

            // Recent transactions (last 90 days for trend analysis)
            db.transaction.findMany({
                where: {
                    userId: userId,
                    date: {
                        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                    }
                },
                include: {
                    bankAccount: true
                },
                orderBy: {
                    date: 'desc'
                }
            }),

            // Active budgets
            db.budget.findMany({
                where: {
                    userId: userId,
                    isActive: true
                }
            }),

            // Bank accounts
            db.bankAccount.findMany({
                where: {
                    userId: userId,
                    isActive: true
                }
            }),

            // Financial goals
            db.financialGoal.findMany({
                where: {
                    userId: userId,
                    isCompleted: false
                }
            })
        ]);

        console.log('📊 Data fetched:', {
            transactions: transactions.length,
            budgets: budgets.length,
            bankAccounts: bankAccounts.length,
            goals: goals.length
        });

        return {
            user,
            transactions,
            budgets,
            bankAccounts,
            goals
        };
    } catch (error) {
        console.error('❌ Error fetching user financial data:', error);
        throw error;
    }
}

function calculateFinancialHealth(data: any): FinancialHealthScore {
    const { user, transactions, budgets, bankAccounts, goals } = data;

    console.log('🧮 Calculating financial health metrics...');

    // Date calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period (last 30 days)
    const currentTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    const currentIncome = currentTransactions
        .filter(t => Number(t.amount) > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const currentExpenses = Math.abs(currentTransactions
        .filter(t => Number(t.amount) < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0));

    // Previous period (30-60 days ago)
    const previousTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });
    const previousExpenses = Math.abs(previousTransactions
        .filter(t => Number(t.amount) < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0));

    // Calculate savings rate
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

    // Calculate total account balance (emergency fund)
    const totalBalance = bankAccounts.reduce((sum, account) => sum + Number(account.currentBalance), 0);
    const emergencyFundMonths = currentExpenses > 0 ? totalBalance / currentExpenses : 0;

    // Calculate budget performance
    const budgetHealth = calculateBudgetHealth(budgets);
    const budgetUtilization = calculateBudgetUtilization(budgets);

    // Calculate spending control (trend vs previous month)
    const spendingControl = calculateSpendingControl(currentExpenses, previousExpenses);

    // Calculate income stability
    const incomeStability = calculateIncomeStability(transactions);

    // Calculate debt management score
    const debtManagement = calculateDebtManagement(bankAccounts, currentIncome);

    // Individual scores
    const scores = {
        budgetHealth,
        savingsRate: Math.min(Math.max(savingsRate * 2, 0), 100), // 50% savings = 100 score
        debtManagement,
        spendingControl,
        incomeStability,
        emergencyFund: Math.min(emergencyFundMonths * 16.67, 100) // 6 months = 100 score
    };

    // Overall score (weighted average)
    const overallScore = Math.round(
        scores.budgetHealth * 0.20 +
        scores.savingsRate * 0.20 +
        scores.debtManagement * 0.15 +
        scores.spendingControl * 0.15 +
        scores.incomeStability * 0.15 +
        scores.emergencyFund * 0.15
    );

    // Calculate score change (simplified - in production, store historical scores)
    const previousScore = Math.round(overallScore * 0.92); // Mock previous score
    const scoreChange = overallScore - previousScore;

    // Generate goals data
    const goalsData = generateGoalsData(goals, totalBalance, currentExpenses, user);

    // Generate achievements
    const achievements = generateAchievements(scores, goalsData, user);

    // Generate quick actions
    const quickActions = generateQuickActions(scores, budgets, transactions);

    console.log('✅ Financial health calculated:', {
        overallScore,
        scores,
        keyMetrics: {
            currentIncome,
            currentExpenses,
            savingsRate: Math.max(savingsRate, 0),
            emergencyFundMonths,
            budgetUtilization
        }
    });

    return {
        overallScore,
        scores,
        trends: {
            scoreChange,
            period: "last_month"
        },
        keyMetrics: {
            monthlyIncome: currentIncome,
            monthlyExpenses: currentExpenses,
            savingsRate: Math.max(savingsRate, 0),
            debtToIncome: calculateDebtToIncome(bankAccounts, currentIncome),
            emergencyFundMonths,
            budgetUtilization
        },
        goals: goalsData,
        achievements,
        quickActions
    };
}

function calculateBudgetHealth(budgets: any[]): number {
    if (budgets.length === 0) return 40; // Low score for no budgets

    const budgetPerformance = budgets.map(budget => {
        const spent = Number(budget.spent || 0);
        const amount = Number(budget.amount);
        const utilization = amount > 0 ? spent / amount : 0;

        // Score based on staying within budget
        if (utilization <= 0.8) return 100;
        if (utilization <= 0.9) return 80;
        if (utilization <= 1.0) return 60;
        return 30;
    });

    return Math.round(budgetPerformance.reduce((sum, score) => sum + score, 0) / budgetPerformance.length);
}

function calculateBudgetUtilization(budgets: any[]): number {
    if (budgets.length === 0) return 0;

    const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);

    return totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
}

function calculateSpendingControl(currentExpenses: number, previousExpenses: number): number {
    if (previousExpenses === 0) return 75; // Default score

    const change = (currentExpenses - previousExpenses) / previousExpenses;

    // Score based on spending change
    if (change <= -0.1) return 100; // Reduced spending by 10%+
    if (change <= 0) return 85;     // Maintained or slightly reduced
    if (change <= 0.05) return 75;  // Small increase
    if (change <= 0.1) return 60;   // Moderate increase
    return 40; // Large increase
}

function calculateIncomeStability(transactions: any[]): number {
    const incomeTransactions = transactions.filter(t => Number(t.amount) > 0);

    if (incomeTransactions.length < 3) return 70; // Default for insufficient data

    // Group by month and calculate variance
    const monthlyIncome: { [key: string]: number } = {};
    incomeTransactions.forEach(t => {
        const monthKey = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
        monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + Number(t.amount);
    });

    const incomeValues = Object.values(monthlyIncome);
    if (incomeValues.length < 2) return 70;

    const averageIncome = incomeValues.reduce((sum, val) => sum + val, 0) / incomeValues.length;
    const variance = incomeValues.reduce((sum, val) => sum + Math.pow(val - averageIncome, 2), 0) / incomeValues.length;
    const stabilityScore = Math.max(0, 100 - (Math.sqrt(variance) / averageIncome) * 100);

    return Math.round(stabilityScore);
}

function calculateDebtManagement(bankAccounts: any[], monthlyIncome: number): number {
    // Calculate debt-to-income ratio from credit card balances
    const creditAccounts = bankAccounts.filter(acc => acc.accountType === 'credit');
    const totalDebt = creditAccounts.reduce((sum, acc) => {
        // For credit cards, negative balance means debt
        const balance = Number(acc.currentBalance);
        return sum + (balance < 0 ? Math.abs(balance) : 0);
    }, 0);

    if (monthlyIncome === 0) return 70; // Default score

    const debtToIncomeRatio = (totalDebt / monthlyIncome) * 100;

    // Score based on debt-to-income ratio
    if (debtToIncomeRatio <= 10) return 100;
    if (debtToIncomeRatio <= 20) return 85;
    if (debtToIncomeRatio <= 30) return 70;
    if (debtToIncomeRatio <= 40) return 50;
    return 30;
}

function calculateDebtToIncome(bankAccounts: any[], monthlyIncome: number): number {
    const creditAccounts = bankAccounts.filter(acc => acc.accountType === 'credit');
    const totalDebt = creditAccounts.reduce((sum, acc) => {
        const balance = Number(acc.currentBalance);
        return sum + (balance < 0 ? Math.abs(balance) : 0);
    }, 0);

    return monthlyIncome > 0 ? (totalDebt / monthlyIncome) * 100 : 0;
}

function generateGoalsData(goals: any[], totalBalance: number, monthlyExpenses: number, user: any) {
    // Emergency fund goal
    const emergencyFundTarget = monthlyExpenses * 6; // 6 months of expenses
    const emergencyFundProgress = emergencyFundTarget > 0 ? (totalBalance / emergencyFundTarget) * 100 : 0;

    // Primary savings goal
    const savingsTarget = Number(user?.goalTargetAmount) || 50000;
    const currentSavings = totalBalance; // Simplified - in practice, track separate savings accounts
    const savingsProgress = savingsTarget > 0 ? (currentSavings / savingsTarget) * 100 : 0;

    // Debt payoff goal (from credit card balances)
    const totalDebt = 8000; // Placeholder - calculate from actual debt
    const debtProgress = 60; // Placeholder - track debt reduction over time

    return {
        emergencyFund: {
            current: Math.round(totalBalance),
            target: Math.round(emergencyFundTarget),
            progress: Math.min(Math.round(emergencyFundProgress), 100)
        },
        savings: {
            current: Math.round(currentSavings),
            target: Math.round(savingsTarget),
            progress: Math.min(Math.round(savingsProgress), 100)
        },
        debtPayoff: {
            current: Math.round(totalDebt * (1 - debtProgress / 100)), // Remaining debt
            target: Math.round(totalDebt),
            progress: Math.round(debtProgress)
        }
    };
}

function generateAchievements(scores: any, goals: any, user: any) {
    const achievements = [
        {
            id: 'budget_master',
            title: 'Budget Master',
            description: 'Maintain healthy budget usage',
            icon: '🎯',
            earned: scores.budgetHealth >= 80,
            earnedDate: scores.budgetHealth >= 80 ? '2025-07-15' : undefined
        },
        {
            id: 'savings_streak',
            title: 'Savings Champion',
            description: 'Achieve 20%+ savings rate',
            icon: '💰',
            earned: scores.savingsRate >= 70,
            earnedDate: scores.savingsRate >= 70 ? '2025-08-01' : undefined
        },
        {
            id: 'spending_control',
            title: 'Spending Controller',
            description: 'Control monthly spending increases',
            icon: '🎛️',
            earned: scores.spendingControl >= 80,
            earnedDate: scores.spendingControl >= 80 ? '2025-08-10' : undefined
        },
        {
            id: 'emergency_ready',
            title: 'Emergency Ready',
            description: 'Build 3+ month emergency fund',
            icon: '🛡️',
            earned: scores.emergencyFund >= 50,
            earnedDate: scores.emergencyFund >= 50 ? '2025-08-05' : undefined
        },
        {
            id: 'debt_crusher',
            title: 'Debt Crusher',
            description: 'Maintain healthy debt levels',
            icon: '💪',
            earned: scores.debtManagement >= 80,
            earnedDate: scores.debtManagement >= 80 ? '2025-07-20' : undefined
        },
        {
            id: 'financial_hero',
            title: 'Financial Health Hero',
            description: 'Achieve overall score above 80',
            icon: '🏆',
            earned: (scores.budgetHealth + scores.savingsRate + scores.debtManagement +
                scores.spendingControl + scores.incomeStability + scores.emergencyFund) / 6 >= 80,
            earnedDate: undefined
        }
    ];

    return achievements;
}

function generateQuickActions(scores: any, budgets: any[], transactions: any[]) {
    const actions = [];

    // Budget-related actions
    if (scores.budgetHealth < 70) {
        actions.push({
            id: 'budget_setup',
            title: 'Set Up Monthly Budgets',
            description: 'Create budgets for your top spending categories',
            impact: 'Improve budget health by 25 points',
            priority: 'high' as const
        });
    }

    // Emergency fund actions
    if (scores.emergencyFund < 50) {
        actions.push({
            id: 'emergency_fund',
            title: 'Build Emergency Fund',
            description: 'Start saving for 3-6 months of expenses',
            impact: 'Boost financial security score',
            priority: 'urgent' as const
        });
    }

    // Savings rate actions
    if (scores.savingsRate < 60) {
        actions.push({
            id: 'increase_savings',
            title: 'Increase Savings Rate',
            description: 'Aim to save at least 20% of income',
            impact: 'Improve long-term financial health',
            priority: 'medium' as const,
            estimatedSavings: 200
        });
    }

    // Spending control actions
    if (scores.spendingControl < 70) {
        actions.push({
            id: 'spending_review',
            title: 'Review Monthly Spending',
            description: 'Identify areas to reduce unnecessary expenses',
            impact: 'Save $150-300 per month',
            priority: 'high' as const,
            estimatedSavings: 225
        });
    }

    // Subscription optimization
    actions.push({
        id: 'subscription_review',
        title: 'Review Subscriptions',
        description: 'Cancel unused streaming and software services',
        impact: 'Save $25-50 per month',
        priority: 'medium' as const,
        estimatedSavings: 35
    });

    // Debt management actions
    if (scores.debtManagement < 70) {
        actions.push({
            id: 'debt_strategy',
            title: 'Create Debt Payoff Plan',
            description: 'Prioritize high-interest debt elimination',
            impact: 'Save hundreds in interest',
            priority: 'high' as const
        });
    }

    return actions.slice(0, 6); // Return top 6 actions
}