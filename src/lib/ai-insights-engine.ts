// src/lib/ai-insights-engine.ts
// Real Claude AI-Powered Financial Insights Engine for SaveLoom

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient, Transaction, User, BankAccount } from '@prisma/client';
import { env } from '~/env';

type TransactionWithAccount = Transaction & {
    bankAccount: BankAccount;
};

type UserWithData = User & {
    transactions: TransactionWithAccount[];
    budgets: any[];
};

interface ClaudeInsightResponse {
    insights: ClaudeInsight[];
    recommendations: ClaudeRecommendation[];
    financialHealthScore: number;
    summary: string;
    keyFindings: string[];
}

interface ClaudeInsight {
    type: string;
    title: string;
    content: string;
    severity: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    value?: number;
    timeframe: string;
    confidence: number;
    actionRequired: boolean;
}

interface ClaudeRecommendation {
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    potentialSavings?: number;
    timeframe: string;
    priority: number;
    steps: string[];
}

export default class AIInsightsEngine {
    private prisma: PrismaClient;
    private anthropic: Anthropic;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;

        // Initialize Claude AI
        if (!env.ANTHROPIC_API_KEY) {
            console.warn('⚠️ ANTHROPIC_API_KEY not found. AI insights will not work.');
            throw new Error('ANTHROPIC_API_KEY is required for AI insights');
        }

        this.anthropic = new Anthropic({
            apiKey: env.ANTHROPIC_API_KEY
        });
    }

    /**
     * Generate AI-powered insights using Claude
     */
    async generateInsights(userId: string): Promise<void> {
        console.log(`🤖 Generating Claude AI insights for user: ${userId}`);

        try {
            // Validate userId
            if (!userId || typeof userId !== 'string') {
                throw new Error('Invalid userId provided');
            }

            // Get user financial data
            const userData = await this.getUserData(userId);
            if (!userData) {
                throw new Error('User not found');
            }

            if (!userData.transactions || userData.transactions.length === 0) {
                throw new Error(
                    'No transaction data available. Connect a bank account and sync transactions before generating insights.'
                );
            }

            // Prepare data for Claude analysis
            const financialContext = await this.prepareFinancialContext(userData);

            // Validate that we have meaningful data
            if (!financialContext || financialContext.trim().length === 0) {
                throw new Error('Unable to prepare financial data for analysis');
            }

            // Get Claude analysis
            const claudeAnalysis = await this.getClaudeAnalysis(financialContext);

            // Validate Claude response
            if (!claudeAnalysis || !claudeAnalysis.insights) {
                throw new Error('Received an invalid response from Claude AI');
            }

            // Save insights to database
            await this.saveClaudeInsights(userId, claudeAnalysis);

            console.log(`✅ Generated ${claudeAnalysis.insights.length} Claude AI insights successfully`);
        } catch (error) {
            console.error('❌ Error generating Claude insights:', error);

            // Log more details for debugging
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }

            throw error;
        }
    }

    /**
     * Prepare financial context for Claude analysis
     */
    /**
     * Prepare financial context for Claude analysis
     */
    /**
     * Prepare financial context for Claude analysis
     */
    private async prepareFinancialContext(userData: UserWithData): Promise<string> {
        const transactions = userData.transactions;
        const budgets = userData.budgets;

        // Calculate financial metrics for last 30 days
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentTransactions = transactions.filter(t => new Date(t.date) >= last30Days);
        const expenses = recentTransactions.filter(t => Number(t.amount) < 0);
        const income = recentTransactions.filter(t => Number(t.amount) > 0);

        // Fixed: Ensure these values are always numbers and handle null/undefined
        const totalExpenses = expenses.reduce((sum, t) => {
            const amount = parseFloat(t.amount?.toString() || '0') || 0;
            return sum + Math.abs(amount);
        }, 0);

        const totalIncome = income.reduce((sum, t) => {
            const amount = parseFloat(t.amount?.toString() || '0') || 0;
            return sum + amount;
        }, 0);

        const netCashFlow = totalIncome - totalExpenses;

        // Debug logging
        console.log('Debug - totalIncome type:', typeof totalIncome, 'value:', totalIncome);
        console.log('Debug - totalExpenses type:', typeof totalExpenses, 'value:', totalExpenses);

        // Group by categories
        const categorySpending = this.groupByCategory(expenses);
        const topCategories = Object.entries(categorySpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        // Detect recurring transactions
        const recurringTransactions = this.detectRecurringTransactions(expenses);

        // Calculate trends (compare with previous 30 days)
        const previous30Days = new Date();
        previous30Days.setDate(previous30Days.getDate() - 60);
        const previousPeriodEnd = new Date();
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);

        const previousTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= previous30Days && transactionDate < previousPeriodEnd;
        });
        const previousExpenses = previousTransactions.filter(t => Number(t.amount) < 0);
        const previousTotalExpenses = previousExpenses.reduce(
            (sum, t) => sum + Math.abs(Number(t.amount)),
            0
        );

        // Budget analysis
        const budgetAnalysis = budgets.map(budget => ({
            category: budget.category,
            budgeted: budget.amount || 0,
            spent: budget.spent || 0,
            remaining: (budget.amount || 0) - (budget.spent || 0),
            utilization: budget.spent && budget.amount ? (budget.spent / budget.amount) * 100 : 0
        }));

        // Calculate spending trend safely
        let spendingTrendText = 'First period of data';
        if (previousTotalExpenses > 0) {
            const trendPercent = ((totalExpenses - previousTotalExpenses) / previousTotalExpenses * 100);
            spendingTrendText = `${trendPercent.toFixed(1)}% vs previous period`;
        }

        return `
FINANCIAL DATA ANALYSIS REQUEST
===============================

USER PROFILE:
- User ID: ${userData.id}
- Primary Goal: ${userData.primaryGoal || 'Not specified'}
- Income Range: ${userData.incomeRange || 'Not specified'}
- Lifestyle: ${userData.lifestyle || 'Not specified'}
- Risk Tolerance: ${userData.riskTolerance || 'Not specified'}
- Location: ${userData.location || 'Not specified'}

FINANCIAL SUMMARY (Last 30 Days):
- Total Transactions: ${recentTransactions.length}
- Total Income: ${(totalIncome || 0).toFixed(2)}
- Total Expenses: ${(totalExpenses || 0).toFixed(2)}
- Net Cash Flow: ${(netCashFlow || 0).toFixed(2)}
- Spending Trend: ${spendingTrendText}

TOP SPENDING CATEGORIES:
${topCategories.length > 0
                ? topCategories.map(([category, amount]) =>
                    `- ${category}: ${(amount || 0).toFixed(2)} (${totalExpenses > 0 ? (((amount || 0) / totalExpenses) * 100).toFixed(1) : '0'}%)`
                ).join('\n')
                : '- No spending categories found'
            }

RECURRING TRANSACTIONS (Potential Subscriptions):
${recurringTransactions.length > 0
                ? recurringTransactions.slice(0, 10).map(rt =>
                    `- ${rt.merchantName || 'Unknown'}: ${Math.abs(rt.amount || 0).toFixed(2)} ${rt.frequency || 'unknown'} (Last: ${(rt.lastSeen || new Date()).toLocaleDateString()})`
                ).join('\n')
                : '- No recurring transactions detected'
            }

BUDGET PERFORMANCE:
${budgetAnalysis.length > 0
                ? budgetAnalysis.map(budget =>
                    `- ${budget.category || 'Unknown'}: ${(budget.utilization || 0).toFixed(0)}% used (${(budget.spent || 0).toFixed(2)}/${(budget.budgeted || 0).toFixed(2)})`
                ).join('\n')
                : '- No budgets set up yet'
            }

RECENT TRANSACTION SAMPLE (Last 15):
${expenses.length > 0
                ? expenses.slice(0, 15).map(t =>
                    `- ${new Date(t.date || new Date()).toISOString().split('T')[0]}: ${Math.abs(t.amount || 0).toFixed(2)} at ${t.merchantName || t.description || 'Unknown'} (${t.category || 'Other'})`
                ).join('\n')
                : '- No recent expense transactions found'
            }

ANALYSIS REQUEST:
As a professional financial advisor, analyze this user's financial data and provide:
1. Key insights about spending patterns and financial health
2. Specific subscription optimization opportunities
3. Budget recommendations and alerts
4. Savings opportunities with actionable steps
5. Financial wellness assessment with score (0-100)

Focus on practical, actionable advice that can immediately improve their financial wellness.
    `.trim();
    }

    /**
     * Get analysis from Claude AI
     */
    private async getClaudeAnalysis(context: string): Promise<ClaudeInsightResponse> {
        const prompt = `
You are an expert financial advisor analyzing a user's personal finance data. Based on the detailed financial information provided, generate comprehensive insights and recommendations.

${context}

Please respond with a valid JSON object in this exact format:

{
  "insights": [
    {
      "type": "spending_trend|subscription_optimization|budget_alert|budget_performance|saving_opportunity|spending_alert|income_analysis|category_analysis",
      "title": "Clear, actionable title with appropriate emoji",
      "content": "Detailed 2-3 sentence explanation of the insight with specific numbers",
      "severity": "low|medium|high|urgent",
      "category": "main financial category this affects",
      "value": 123.45,
      "timeframe": "this_month|last_30_days|this_year|current",
      "confidence": 0.90,
      "actionRequired": true
    }
  ],
  "recommendations": [
    {
      "title": "Specific action the user should take",
      "description": "Detailed explanation of why and how to implement this recommendation",
      "impact": "Expected positive outcome with specific numbers if possible",
      "effort": "low|medium|high",
      "potentialSavings": 50.00,
      "timeframe": "immediate|this_week|this_month|next_month",
      "priority": 3,
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "financialHealthScore": 78,
  "summary": "Overall 2-3 sentence assessment of their financial health and trajectory",
  "keyFindings": ["Most important finding 1", "Key insight 2", "Priority action 3"]
}

Requirements:
- Generate 5-8 relevant insights based on the actual data
- Include 3-6 actionable recommendations
- Use specific dollar amounts and percentages from the data
- Be encouraging but honest about areas needing improvement
- Prioritize high-impact, achievable recommendations
- Include emojis in titles for visual appeal
- Financial health score should reflect actual spending habits and trends

Respond ONLY with valid JSON. No additional text.
`;

        try {
            console.log('🤖 Calling Claude AI for financial analysis...');

            const response = await this.anthropic.messages.create({
                model: env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
                max_tokens: 4000,
                temperature: 0.3,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            const content = response.content[0];
            if (!content || content.type !== 'text') {
                throw new Error('Unexpected response type from Claude AI');
            }

            try {
                let jsonText = content.text.trim();

                    // Remove any potential markdown formatting
                    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

                    // 🔍 LOG THE RAW CLAUDE RESPONSE
                    console.log('🤖 === RAW CLAUDE RESPONSE ===');
                    console.log('Length:', jsonText.length, 'characters');
                    console.log('First 500 chars:', jsonText.substring(0, 500));
                    console.log('Last 200 chars:', jsonText.substring(jsonText.length - 200));
                    console.log('=== END RAW RESPONSE ===\n');

                    const analysis = JSON.parse(jsonText) as ClaudeInsightResponse;

                    // 🔍 ADD DETAILED LOGGING HERE
                    console.log('🤖 === CLAUDE AI RESPONSE DEBUG ===');
                    console.log('📊 Financial Health Score:', analysis.financialHealthScore);
                    console.log('📝 Summary:', analysis.summary);
                    console.log('🔑 Key Findings:', analysis.keyFindings);

                    console.log('\n💡 GENERATED INSIGHTS:');
                    console.log(`✅ Claude generated ${analysis.insights.length} insights and ${analysis.recommendations.length} recommendations`);
                    return analysis;
                } catch (parseError) {
                    console.error('❌ Failed to parse Claude response as JSON:', parseError);
                    console.log('Raw Claude response:', content.text);
                    throw new Error('Invalid JSON response from Claude AI');
                }
        } catch (error: unknown) {
            console.error('❌ Error calling Claude API:', error);

            const message = error instanceof Error ? error.message : String(error);

            if (message.includes('Invalid API key')) {
                throw new Error('Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY.');
            }
            if (message.includes('rate limit')) {
                throw new Error('Claude API rate limit reached. Please try again later.');
            }
            if (message.includes('not_found_error') || message.includes('model:')) {
                throw new Error(
                    `Claude model not available. Set ANTHROPIC_MODEL in .env (recommended: claude-sonnet-4-6).`
                );
            }

            throw error instanceof Error ? error : new Error(message);
        }
    }

    /**
     * Save Claude insights to database
     */
    private async saveClaudeInsights(userId: string, analysis: ClaudeInsightResponse): Promise<void> {
        try {
            console.log('🧹 Starting complete refresh - deleting all existing insights...');

            // 🗑️ DELETE ALL existing insights for this user (complete refresh)
            const deletedInsightsCount = await this.prisma.aIInsight.deleteMany({
                where: { userId }
            });
            console.log(`🗑️ Deleted ${deletedInsightsCount.count} old insights for complete refresh`);

            // 🗑️ DELETE ALL existing AI-generated recommendations for this user
            try {
                const deletedRecommendationsCount = await this.prisma.recommendation.deleteMany({
                    where: {
                        userId,
                        type: 'ai_generated'
                    }
                });
                console.log(`🗑️ Deleted ${deletedRecommendationsCount.count} old AI recommendations`);
            } catch (recDeleteError) {
                console.warn('⚠️ Could not delete old recommendations (table may not exist):', recDeleteError);
            }

            console.log('💾 Saving fresh Claude insights...');

            // 💾 Save new Claude-generated insights with detailed progress logging
            const savedInsights = [];
            for (const [index, insight] of analysis.insights.entries()) {
                console.log(`💾 Saving insight ${index + 1}/${analysis.insights.length}: "${insight.title}" (${insight.type})`);

                const savedInsight = await this.prisma.aIInsight.create({
                    data: {
                        userId,
                        type: insight.type,
                        title: insight.title,
                        content: insight.content,
                        timeframe: insight.timeframe,
                        metric: this.getMetricFromType(insight.type),
                        value: insight.value ? parseFloat(insight.value.toString()) : null, // 🔧 ENSURE NUMBER TYPE
                        chartData: {
                            severity: insight.severity,
                            confidence: insight.confidence,
                            actionRequired: insight.actionRequired,
                            category: insight.category,
                            claudeGenerated: true,
                            financialHealthScore: analysis.financialHealthScore,
                            generatedAt: new Date().toISOString()
                        }
                    }
                });

                savedInsights.push(savedInsight);
                console.log(`✅ Saved insight with ID: ${savedInsight.id}`);
            }

            console.log('💾 Saving fresh Claude recommendations...');

            // 💾 Save new recommendations with detailed progress logging
            const savedRecommendations = [];
            for (const [index, rec] of analysis.recommendations.entries()) {
                console.log(`💾 Saving recommendation ${index + 1}/${analysis.recommendations.length}: "${rec.title}"`);

                try {
                    const savedRec = await this.prisma.recommendation.create({
                        data: {
                            userId,
                            type: 'ai_generated',
                            category: 'financial_optimization',
                            title: rec.title,
                            description: rec.description,
                            impact: rec.impact,
                            priority: this.mapPriorityToString(rec.priority),
                            confidence: 0.9,
                            potentialSavings: rec.potentialSavings ? parseFloat(rec.potentialSavings.toString()) : null, // 🔧 ENSURE NUMBER TYPE
                            metadata: {
                                effort: rec.effort,
                                timeframe: rec.timeframe,
                                steps: rec.steps,
                                claudeGenerated: true,
                                generatedAt: new Date().toISOString()
                            }
                        }
                    });

                    savedRecommendations.push(savedRec);
                    console.log(`✅ Saved recommendation with ID: ${savedRec.id}`);
                } catch (recError) {
                    console.warn(`⚠️ Could not save recommendation ${index + 1} (model may not exist):`, recError);
                }
            }

        } catch (error) {
            console.error('❌ Error in complete refresh save:', error);
            throw error;
        }
    }

    /**
     * Helper methods (unchanged from original)
     */
    private async getUserData(userId: string): Promise<UserWithData | null> {
        return await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                transactions: {
                    include: { bankAccount: true },
                    orderBy: { date: 'desc' },
                    take: 1000 // Limit for performance
                },
                budgets: { where: { isActive: true } }
            }
        });
    }

    // Additional fixes for the groupByCategory method
    private groupByCategory(transactions: Transaction[]): { [category: string]: number } {
        if (!transactions || transactions.length === 0) {
            return {};
        }

        return transactions.reduce((acc, transaction) => {
            if (!transaction) return acc; // Skip null transactions

            const category = transaction.category || 'Other';
            const amount = transaction.amount || 0;
            acc[category] = (acc[category] || 0) + Math.abs(amount);
            return acc;
        }, {} as { [category: string]: number });
    }

    // Additional fixes for detectRecurringTransactions method
    private detectRecurringTransactions(transactions: Transaction[]): any[] {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        const merchantGroups: { [key: string]: Transaction[] } = {};

        transactions.forEach(transaction => {
            if (!transaction) return; // Skip null transactions

            const merchant = transaction.merchantName || transaction.description || 'Unknown Merchant';
            if (!merchantGroups[merchant]) {
                merchantGroups[merchant] = [];
            }
            merchantGroups[merchant].push(transaction);
        });

        return Object.entries(merchantGroups)
            .filter(([, txns]) => txns && txns.length >= 2)
            .map(([merchant, txns]) => {
                const amounts = txns
                    .filter(t => t && typeof t.amount === 'number')
                    .map(t => Math.abs(t.amount));

                if (amounts.length === 0) return null;

                const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

                return {
                    merchantName: merchant,
                    amount: -avgAmount,
                    frequency: txns.length >= 3 ? 'monthly' : 'recurring',
                    category: txns[0]?.category || 'Other',
                    lastSeen: new Date(Math.max(...txns.map(t => new Date(t.date || new Date()).getTime())))
                };
            })
            .filter(item => item !== null); // Remove null items
    }

    private getMetricFromType(type: string): string {
        const typeMetricMap: { [key: string]: string } = {
            'spending_trend': 'spending',
            'subscription_optimization': 'subscription_cost',
            'budget_alert': 'budget_usage',
            'budget_performance': 'budget_usage',
            'saving_opportunity': 'potential_savings',
            'spending_alert': 'large_purchase',
            'income_analysis': 'income_stability',
            'category_analysis': 'category_percentage'
        };
        return typeMetricMap[type] || 'general';
    }

    private mapPriorityToString(priority: number): string {
        if (priority >= 4) return 'urgent';
        if (priority >= 3) return 'high';
        if (priority >= 2) return 'medium';
        return 'low';
    }

    // Backward compatibility methods
    async getUserInsights(userId: string, limit: number = 10, offset: number = 0) {
        return await this.prisma.aIInsight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
    }

    async getInsightsByType(userId: string, type: string) {
        return await this.prisma.aIInsight.findMany({
            where: { userId, type },
            orderBy: { createdAt: 'desc' }
        });
    }
}