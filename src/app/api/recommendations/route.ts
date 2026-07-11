//src/app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from "~/server/request-auth";
import { db } from '~/server/db';
import { parseMoney } from "~/lib/money";

export async function GET(req: NextRequest) {
    try {
        const userId = await getRequestUserId(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const priority = searchParams.get('priority');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: {
            userId: string;
            priority?: string;
            isActioned?: boolean;
        } = { userId };

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
            recommendations: recommendations.map((rec) => ({
                ...rec,
                potentialSavings: rec.potentialSavings != null ? parseMoney(rec.potentialSavings) : null,
            })),
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}

