import { NextRequest, NextResponse } from 'next/server';
import { AIInsightsScheduler } from '~/lib/ai-insights-scheduler';

export async function POST(req: NextRequest) {
    try {
        // Add authentication check for admin users
        const scheduler = new AIInsightsScheduler();
        // This would typically be called by a cron job or admin interface

        return NextResponse.json({
            success: true,
            message: 'Auto-generation triggered'
        });
    } catch (error) {
        console.error('Error in auto-generation:', error);
        return NextResponse.json(
            { error: 'Failed to trigger auto-generation' },
            { status: 500 }
        );
    }
}