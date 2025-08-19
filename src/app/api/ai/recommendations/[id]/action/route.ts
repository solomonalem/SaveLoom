// src/app/api/ai/recommendations/[id]/action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { isActioned } = await req.json();

        // Verify the recommendation belongs to the user
        const recommendation = await db.recommendation.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!recommendation) {
            return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
        }

        const updatedRecommendation = await db.recommendation.update({
            where: { id: params.id },
            data: {
                isActioned: isActioned,
                ...(isActioned && { actionedAt: new Date() })
            }
        });

        return NextResponse.json({
            success: true,
            recommendation: updatedRecommendation
        });
    } catch (error) {
        console.error('Error updating recommendation action:', error);
        return NextResponse.json(
            { error: 'Failed to update recommendation' },
            { status: 500 }
        );
    }
}