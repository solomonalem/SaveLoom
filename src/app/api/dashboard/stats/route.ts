import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { computeSavingsRate, parseMoney } from "~/lib/money";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [accounts, transactions, transactionCount] = await Promise.all([
      db.bankAccount.findMany({
        where: { userId, isActive: true },
        select: { currentBalance: true },
      }),
      db.transaction.findMany({
        where: { userId },
        select: { amount: true, category: true, date: true },
        orderBy: { date: "desc" },
      }),
      db.transaction.count({ where: { userId } }),
    ]);

    const totalBalance = accounts.reduce(
      (sum, account) => sum + parseMoney(account.currentBalance),
      0,
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentTransactions = transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo);

    const monthlyIncome = recentTransactions
      .filter((t) => parseMoney(t.amount) > 0)
      .reduce((sum, t) => sum + parseMoney(t.amount), 0);

    const monthlyExpenses = recentTransactions
      .filter((t) => parseMoney(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(parseMoney(t.amount)), 0);

    const netCashFlow = monthlyIncome - monthlyExpenses;
    const savingsRate = computeSavingsRate(monthlyIncome, monthlyExpenses);

    const categoryTotals = recentTransactions
      .filter((t) => parseMoney(t.amount) < 0)
      .reduce<Record<string, number>>((acc, t) => {
        const category = t.category?.trim() || "Other";
        acc[category] = (acc[category] ?? 0) + Math.abs(parseMoney(t.amount));
        return acc;
      }, {});

    const topCategoryEntry = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];

    return NextResponse.json({
      accountsConnected: accounts.length,
      transactionsTracked: transactionCount,
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netCashFlow,
      savingsRate,
      avgDailySpend: monthlyExpenses / 30,
      topCategory: topCategoryEntry?.[0] ?? null,
      topCategoryAmount: topCategoryEntry?.[1] ?? 0,
      hasRecentActivity: recentTransactions.length > 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
