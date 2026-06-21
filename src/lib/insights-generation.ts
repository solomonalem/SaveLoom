import type { PrismaClient } from "@prisma/client";
import { env } from "~/env";
import AIInsightsEngine from "~/lib/ai-insights-engine";
import { isAnthropicKeyConfigured } from "~/lib/anthropic-errors";
import { generateAlgorithmicInsights } from "~/lib/algorithmic-insights";
import {
  canForceAiRefresh,
  computeInsightsFingerprint,
  getInsightsStatus,
  markInsightsGenerated,
  type InsightsSource,
  type InsightsStatus,
} from "~/lib/insights-fingerprint";

export interface GenerateInsightsOptions {
  force?: boolean;
  useAi?: boolean;
}

export interface GenerateInsightsResult {
  generated: boolean;
  cached: boolean;
  source: InsightsSource | null;
  message: string;
  status: InsightsStatus;
  insightsCount?: number;
  recommendationsCount?: number;
}

export async function generateUserInsights(
  prisma: PrismaClient,
  userId: string,
  options: GenerateInsightsOptions = {},
): Promise<GenerateInsightsResult> {
  const aiAvailable = isAnthropicKeyConfigured(env.ANTHROPIC_API_KEY);
  const status = await getInsightsStatus(prisma, userId, aiAvailable);
  const { force = false, useAi = false } = options;

  if (!status.canGenerate) {
    throw new Error(status.blockReason ?? "Unable to generate insights.");
  }

  const forceBlock = canForceAiRefresh(status, force);
  if (forceBlock) {
    throw new Error(forceBlock);
  }

  if (!force && status.hasInsights && status.fingerprintMatches) {
    return {
      generated: false,
      cached: true,
      source: status.source,
      message: "Your insights are up to date. We'll refresh when your accounts or transactions change.",
      status,
    };
  }

  const fingerprint = status.fingerprint;
  const shouldUseClaude = useAi && aiAvailable;

  if (shouldUseClaude) {
    const engine = new AIInsightsEngine(prisma);
    const result = await engine.generateInsights(userId);
    await markInsightsGenerated(prisma, userId, fingerprint, "claude", force);

    return {
      generated: true,
      cached: false,
      source: "claude",
      message: "Claude AI insights generated successfully.",
      status: await getInsightsStatus(prisma, userId, aiAvailable),
      insightsCount: result.insightsCount,
      recommendationsCount: result.recommendationsCount,
    };
  }

  if (useAi && !aiAvailable) {
    const algo = await generateAlgorithmicInsights(prisma, userId);
    await markInsightsGenerated(prisma, userId, fingerprint, "algorithmic", force);

    return {
      generated: true,
      cached: false,
      source: "algorithmic",
      message:
        "Generated rule-based insights (Claude API key not configured). Add ANTHROPIC_API_KEY for AI-powered analysis.",
      status: await getInsightsStatus(prisma, userId, aiAvailable),
      insightsCount: algo.insightsCount,
      recommendationsCount: algo.recommendationsCount,
    };
  }

  const algo = await generateAlgorithmicInsights(prisma, userId);
  await markInsightsGenerated(prisma, userId, fingerprint, "algorithmic", force);

  return {
    generated: true,
    cached: false,
    source: "algorithmic",
    message: "Rule-based insights generated from your transaction data.",
    status: await getInsightsStatus(prisma, userId, aiAvailable),
    insightsCount: algo.insightsCount,
    recommendationsCount: algo.recommendationsCount,
  };
}

export { getInsightsStatus, computeInsightsFingerprint };
