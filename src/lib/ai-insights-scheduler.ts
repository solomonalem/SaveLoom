import cron from 'node-cron';
import { db } from '~/server/db';
import AIInsightsEngine from './ai-insights-engine';

export class AIInsightsScheduler {
    private insightsEngine: AIInsightsEngine;

    constructor() {
        this.insightsEngine = new AIInsightsEngine(db);
    }

    /**
     * Start the scheduler for automatic insight generation
     */
    start() {
        // Generate insights daily at 6 AM
        cron.schedule('0 6 * * *', async () => {
            console.log('🤖 Running daily AI insights generation...');
            await this.generateInsightsForAllUsers();
        });

        // Generate insights weekly on Sundays at 8 AM
        cron.schedule('0 8 * * 0', async () => {
            console.log('🤖 Running weekly AI insights generation...');
            await this.generateInsightsForAllUsers();
        });

        console.log('✅ AI Insights Scheduler started');
    }

    /**
     * Generate insights for all active users
     */
    private async generateInsightsForAllUsers() {
        try {
            const users = await db.user.findMany({
                where: {
                    hasConnectedBank: true,
                    transactions: {
                        some: {} // Users with at least one transaction
                    }
                },
                select: { id: true }
            });

            console.log(`🎯 Generating insights for ${users.length} users`);

            for (const user of users) {
                try {
                    await this.insightsEngine.generateInsights(user.id);
                    console.log(`✅ Generated insights for user ${user.id}`);
                } catch (error) {
                    console.error(`❌ Failed to generate insights for user ${user.id}:`, error);
                }
            }

            console.log('🎉 Daily insights generation completed');
        } catch (error) {
            console.error('❌ Error in daily insights generation:', error);
        }
    }

    /**
     * Generate insights for a specific user on-demand
     */
    async generateForUser(userId: string) {
        try {
            await this.insightsEngine.generateInsights(userId);
            console.log(`✅ Generated on-demand insights for user ${userId}`);
        } catch (error) {
            console.error(`❌ Failed to generate insights for user ${userId}:`, error);
            throw error;
        }
    }
}