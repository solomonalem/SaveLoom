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

        await db.recommendation.update({
            where: { id: params.id },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking recommendation as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark as read' },
            { status: 500 }
        );
    }
}