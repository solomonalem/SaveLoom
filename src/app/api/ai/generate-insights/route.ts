import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';
import AIInsightsEngine from '~/lib/ai-insights-engine'; // Now uses Claude!

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if Claude API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('❌ ANTHROPIC_API_KEY not configured');
            return NextResponse.json(
                { error: 'Claude AI not configured. Please add ANTHROPIC_API_KEY to environment.' },
                { status: 500 }
            );
        }

        const aiEngine = new AIInsightsEngine(db);
        await aiEngine.generateInsights(session.user.id);

        return NextResponse.json({
            success: true,
            message: '🤖 Claude AI insights generated successfully!',
            provider: 'Claude AI (Anthropic)'
        });
    } catch (error: any) {
        console.error('❌ Error generating Claude AI insights:', error);

        // Handle specific errors
        if (error.message?.includes('Invalid API key')) {
            return NextResponse.json(
                { error: 'Invalid Claude API key. Please check your configuration.' },
                { status: 401 }
            );
        }

        if (error.message?.includes('rate limit')) {
            return NextResponse.json(
                { error: 'Claude API rate limit reached. Please try again later.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to generate AI insights',
                details: error.message
            },
            { status: 500 }
        );
    }
}