import type { PrismaClient } from "@prisma/client";

export type InsightsSource = "claude" | "algorithmic";

export interface InsightsStatus {
  accountsConnected: number;
  transactionCount: number;
  hasInsights: boolean;
  hasRecommendations: boolean;
  fingerprint: string;
  fingerprintMatches: boolean;
  generatedAt: string | null;
  source: InsightsSource | null;
  canGenerate: boolean;
  blockReason: string | null;
  needsSync: boolean;
  aiAvailable: boolean;
  aiForcedRemainingToday: number;
}

const MAX_FORCED_AI_PER_DAY = 2;

export async function computeInsightsFingerprint(
  prisma: PrismaClient,
  userId: string,
): Promise<string> {
  const [accountAgg, txAgg] = await Promise.all([
    prisma.bankAccount.aggregate({
      where: { userId },
      _count: true,
      _max: { updatedAt: true, lastSync: true },
    }),
    prisma.transaction.aggregate({
      where: { userId },
      _count: true,
      _max: { updatedAt: true, date: true },
    }),
  ]);

  return [
    accountAgg._count,
    accountAgg._max.updatedAt?.toISOString() ?? "none",
    accountAgg._max.lastSync?.toISOString() ?? "none",
    txAgg._count,
    txAgg._max.updatedAt?.toISOString() ?? "none",
    txAgg._max.date?.toISOString() ?? "none",
  ].join("|");
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function forcedAiRemainingToday(lastForcedAt: Date | null | undefined): number {
  if (!lastForcedAt) return MAX_FORCED_AI_PER_DAY;

  const today = startOfUtcDay(new Date());
  const lastDay = startOfUtcDay(lastForcedAt);

  if (today.getTime() > lastDay.getTime()) {
    return MAX_FORCED_AI_PER_DAY;
  }

  return 0;
}

export async function getInsightsStatus(
  prisma: PrismaClient,
  userId: string,
  aiAvailable: boolean,
): Promise<InsightsStatus> {
  const [user, insightCount, recommendationCount, fingerprint] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiInsightsFingerprint: true,
        aiInsightsGeneratedAt: true,
        aiInsightsSource: true,
        aiInsightsLastForcedAt: true,
        hasConnectedBank: true,
      },
    }),
    prisma.aIInsight.count({ where: { userId } }),
    prisma.recommendation.count({ where: { userId, isHidden: false } }),
    computeInsightsFingerprint(prisma, userId),
  ]);

  const accountsConnected = await prisma.bankAccount.count({
    where: { userId },
  });

  const transactionCount = await prisma.transaction.count({
    where: { userId },
  });

  const hasLinkedAccounts = accountsConnected > 0 || Boolean(user?.hasConnectedBank);
  const fingerprintMatches = user?.aiInsightsFingerprint === fingerprint;
  const hasInsights = insightCount > 0;
  const needsSync = hasLinkedAccounts && transactionCount === 0;

  let blockReason: string | null = null;
  if (!hasLinkedAccounts) {
    blockReason = "Connect a bank account from the dashboard before generating insights.";
  } else if (transactionCount === 0) {
    blockReason =
      "No transactions in SaveLoom yet. Use Import on the dashboard to pull them from Plaid, then refresh insights.";
  }

  const aiForcedRemainingToday = forcedAiRemainingToday(user?.aiInsightsLastForcedAt);

  return {
    accountsConnected,
    transactionCount,
    hasInsights,
    hasRecommendations: recommendationCount > 0,
    fingerprint,
    fingerprintMatches,
    generatedAt: user?.aiInsightsGeneratedAt?.toISOString() ?? null,
    source: (user?.aiInsightsSource as InsightsSource | null) ?? null,
    canGenerate: blockReason === null,
    blockReason,
    needsSync,
    aiAvailable,
    aiForcedRemainingToday,
  };
}

export async function markInsightsGenerated(
  prisma: PrismaClient,
  userId: string,
  fingerprint: string,
  source: InsightsSource,
  forced = false,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      aiInsightsFingerprint: fingerprint,
      aiInsightsGeneratedAt: new Date(),
      aiInsightsSource: source,
      ...(forced ? { aiInsightsLastForcedAt: new Date() } : {}),
    },
  });
}

export function canForceAiRefresh(status: InsightsStatus, force: boolean): string | null {
  if (!force) return null;
  if (!status.aiAvailable) return null;
  if (!status.fingerprintMatches || !status.hasInsights) return null;

  if (status.aiForcedRemainingToday <= 0) {
    return "AI refresh limit reached for today. Your saved insights are still up to date.";
  }

  return null;
}
