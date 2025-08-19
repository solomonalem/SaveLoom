import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';

import { db } from '~/server/db';
import AIInsightsEngine from '~/lib/ai-insights-engine';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const priority = searchParams.get('priority');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');

        let where: any = { userId: session.user.id };

        if (priority && priority !== 'all') {
            where.priority = priority;
        }

        if (status === 'pending') {
            where.isActioned = false;
        } else if (status === 'completed') {
            where.isActioned = true;
        }

        const recommendations = await db.recommendation.findMany({
            where,
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit
        });

        return NextResponse.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const insightsEngine = new AIInsightsEngine(db);

        // Generate recommendations based on current data
        await insightsEngine.generateInsights(session.user.id);

        const recommendations = await db.recommendation.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 10
        });

        return NextResponse.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
