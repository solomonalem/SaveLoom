import type { Prisma, PrismaClient, Transaction } from "@prisma/client";
import { computeSavingsRate, formatCurrency, parseMoney } from "~/lib/money";

interface CategoryTotal {
  category: string;
  total: number;
}

function groupExpensesByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    const amount = parseMoney(tx.amount);
    if (amount >= 0) continue;

    const category = tx.category || "Other";
    totals.set(category, (totals.get(category) ?? 0) + Math.abs(amount));
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function detectRecurringMerchants(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const amount = parseMoney(tx.amount);
    if (amount >= 0) continue;

    const merchant = tx.merchantName || tx.description || "Unknown";
    const list = groups.get(merchant) ?? [];
    list.push(tx);
    groups.set(merchant, list);
  }

  return [...groups.entries()]
    .filter(([, txns]) => txns.length >= 2)
    .map(([merchant, txns]) => {
      const avg =
        txns.reduce((sum, tx) => sum + Math.abs(parseMoney(tx.amount)), 0) / txns.length;
      return { merchant, avg, count: txns.length };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);
}

export async function generateAlgorithmicInsights(
  prisma: PrismaClient,
  userId: string,
): Promise<{ insightsCount: number; recommendationsCount: number }> {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      transactions: {
        where: { isHidden: false },
        orderBy: { date: "desc" },
        take: 1000,
      },
      budgets: { where: { isActive: true } },
    },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  if (userData.transactions.length === 0) {
    throw new Error(
      "No transaction data available. Sync transactions from the dashboard before generating insights.",
    );
  }

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recent = userData.transactions.filter((tx) => new Date(tx.date) >= last30Days);
  const expenses = recent.filter((tx) => parseMoney(tx.amount) < 0);
  const income = recent.filter((tx) => parseMoney(tx.amount) > 0);

  const totalExpenses = expenses.reduce(
    (sum, tx) => sum + Math.abs(parseMoney(tx.amount)),
    0,
  );
  const totalIncome = income.reduce((sum, tx) => sum + parseMoney(tx.amount), 0);
  const savingsRate = computeSavingsRate(totalIncome, totalExpenses);
  const topCategories = groupExpensesByCategory(expenses);
  const recurring = detectRecurringMerchants(expenses);

  const insights: Array<{
    type: string;
    title: string;
    content: string;
    timeframe: string;
    metric?: string;
    value?: number;
    chartData?: Record<string, unknown>;
  }> = [];

  insights.push({
    type: "spending_trend",
    title: "30-day spending summary",
    content: `You spent ${formatCurrency(totalExpenses)} across ${expenses.length} transactions in the last 30 days${
      totalIncome > 0 ? ` with ${formatCurrency(totalIncome)} in income` : ""
    }.`,
    timeframe: "last_30_days",
    metric: "spending",
    value: totalExpenses,
    chartData: { source: "algorithmic" },
  });

  if (topCategories[0]) {
    const top = topCategories[0];
    const share = totalExpenses > 0 ? (top.total / totalExpenses) * 100 : 0;
    insights.push({
      type: "category_analysis",
      title: `${top.category.replace(/_/g, " ")} is your top category`,
      content: `${formatCurrency(top.total)} (${Math.round(share)}% of spending) went to ${top.category.replace(/_/g, " ")} this month.`,
      timeframe: "last_30_days",
      metric: "category_percentage",
      value: share,
      chartData: { source: "algorithmic", category: top.category },
    });
  }

  if (savingsRate !== null) {
    insights.push({
      type: "income_analysis",
      title: savingsRate >= 20 ? "Strong savings rate" : "Room to improve savings",
      content:
        savingsRate >= 20
          ? `Your estimated savings rate is ${Math.round(savingsRate)}%, which is above the recommended 20% target.`
          : `Your estimated savings rate is ${Math.round(savingsRate)}%. Aim for at least 20% by trimming discretionary spending.`,
      timeframe: "last_30_days",
      metric: "income_stability",
      value: savingsRate,
      chartData: { source: "algorithmic" },
    });
  }

  if (recurring.length > 0) {
    const top = recurring[0]!;
    insights.push({
      type: "subscription_optimization",
      title: "Recurring charges detected",
      content: `${top.merchant} appears ${top.count} times (~${formatCurrency(top.avg)} each). Review whether this subscription is still worth keeping.`,
      timeframe: "last_30_days",
      metric: "subscription_cost",
      value: top.avg,
      chartData: { source: "algorithmic", merchant: top.merchant },
    });
  }

  for (const budget of userData.budgets) {
    const spent = parseMoney(budget.spent);
    const limit = parseMoney(budget.amount);
    if (limit <= 0) continue;

    const utilization = (spent / limit) * 100;
    if (utilization >= 90) {
      insights.push({
        type: "budget_alert",
        title: `${budget.category} budget nearly exhausted`,
        content: `You've used ${Math.round(utilization)}% of your ${budget.category} budget (${formatCurrency(spent)} of ${formatCurrency(limit)}).`,
        timeframe: "this_month",
        metric: "budget_usage",
        value: utilization,
        chartData: { source: "algorithmic", category: budget.category },
      });
    }
  }

  const recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    priority: string;
    potentialSavings?: number;
    metadata: Record<string, unknown>;
  }> = [];

  if (topCategories[0]) {
    recommendations.push({
      title: `Review ${topCategories[0].category.replace(/_/g, " ")} spending`,
      description: `This category accounts for the largest share of your monthly expenses. Look for one or two recurring purchases you could reduce.`,
      impact: `Potential to cut 10–15% (${formatCurrency(topCategories[0].total * 0.1)}–${formatCurrency(topCategories[0].total * 0.15)}) from your top category.`,
      priority: "high",
      potentialSavings: topCategories[0].total * 0.1,
      metadata: {
        effort: "low",
        timeframe: "this_week",
        steps: [
          "Open your transaction history filtered by this category",
          "Flag non-essential purchases",
          "Set a lower budget target for next month",
        ],
        algorithmicGenerated: true,
      },
    });
  }

  if (recurring.length > 0) {
    recommendations.push({
      title: "Audit recurring subscriptions",
      description: `We found ${recurring.length} merchants with repeat charges. Cancel services you no longer use.`,
      impact: `Saving one ${formatCurrency(recurring[0]!.avg)}/month charge adds up over the year.`,
      priority: "medium",
      potentialSavings: recurring[0]!.avg,
      metadata: {
        effort: "low",
        timeframe: "immediate",
        steps: [
          "List all recurring merchants from your transactions",
          "Cancel unused subscriptions",
          "Set a calendar reminder to review quarterly",
        ],
        algorithmicGenerated: true,
      },
    });
  }

  if (userData.budgets.length === 0) {
    recommendations.push({
      title: "Create your first budget",
      description:
        "Budgets help track spending by category and trigger alerts before you overspend.",
      impact: "Better visibility typically improves savings by 5–10%.",
      priority: "medium",
      metadata: {
        effort: "low",
        timeframe: "this_week",
        steps: [
          "Go to Budgets and add your top 3 spending categories",
          "Set realistic monthly limits based on last month's spending",
          "Check budget progress weekly",
        ],
        algorithmicGenerated: true,
      },
    });
  }

  if (savingsRate !== null && savingsRate < 20) {
    recommendations.push({
      title: "Build an automatic savings habit",
      description:
        "Your savings rate is below the 20% guideline. Automating transfers makes saving easier.",
      impact: "Even a small recurring transfer compounds over time.",
      priority: "high",
      metadata: {
        effort: "medium",
        timeframe: "this_month",
        steps: [
          "Pick a fixed amount you can save each paycheck",
          "Schedule an automatic transfer to savings",
          "Revisit the amount after 30 days",
        ],
        algorithmicGenerated: true,
      },
    });
  }

  const healthScore = Math.min(
    100,
    Math.max(
      35,
      Math.round(
        (savingsRate ?? 10) * 0.4 +
          (totalIncome > 0 ? 20 : 10) +
          (userData.budgets.length > 0 ? 15 : 0) +
          (recurring.length === 0 ? 15 : 5),
      ),
    ),
  );

  await prisma.aIInsight.deleteMany({ where: { userId } });
  await prisma.recommendation.deleteMany({
    where: { userId, type: { in: ["ai_generated", "algorithmic"] } },
  });

  for (const insight of insights) {
    await prisma.aIInsight.create({
      data: {
        userId,
        type: insight.type,
        title: insight.title,
        content: insight.content,
        timeframe: insight.timeframe,
        metric: insight.metric,
        value: insight.value ?? null,
        chartData: {
          ...insight.chartData,
          financialHealthScore: healthScore,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  }

  for (const rec of recommendations) {
    await prisma.recommendation.create({
      data: {
        userId,
        type: "algorithmic",
        category: "financial_optimization",
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        priority: rec.priority,
        confidence: 0.75,
        potentialSavings: rec.potentialSavings ?? null,
        metadata: rec.metadata as Prisma.InputJsonValue,
      },
    });
  }

  return {
    insightsCount: insights.length,
    recommendationsCount: recommendations.length,
  };
}
