// src/app/api/ai/recommendations/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, recommendationIds } = await req.json();

        if (!Array.isArray(recommendationIds) || !action) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        let updateData: any = {};

        switch (action) {
            case 'markAllRead':
                updateData = { isRead: true, readAt: new Date() };
                break;
            case 'markAllCompleted':
                updateData = { isActioned: true, actionedAt: new Date() };
                break;
            case 'markAllPending':
                updateData = { isActioned: false, actionedAt: null };
                break;
            case 'deleteAll':
                // For delete, we use deleteMany instead of updateMany
                await db.recommendation.deleteMany({
                    where: {
                        userId: session.user.id,
                        id: { in: recommendationIds }
                    }
                });
                return NextResponse.json({
                    success: true,
                    message: `Deleted ${recommendationIds.length} recommendations`
                });
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const result = await db.recommendation.updateMany({
            where: {
                userId: session.user.id,
                id: { in: recommendationIds }
            },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            updated: result.count,
            message: `Successfully ${action} for ${result.count} recommendations`
        });
    } catch (error) {
        console.error('Error in bulk recommendation update:', error);
        return NextResponse.json(
            { error: 'Failed to perform bulk update' },
            { status: 500 }
        );
    }
}