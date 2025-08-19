
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';

import { db } from '~/server/db';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { insightIds } = await req.json();

        if (!Array.isArray(insightIds)) {
            return NextResponse.json({ error: 'Invalid insight IDs' }, { status: 400 });
        }

        await db.aIInsight.updateMany({
            where: {
                id: { in: insightIds },
                userId: session.user.id
            },
            data: {
                // Add isRead field to your AIInsight model if needed
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking insights as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark insights as read' },
            { status: 500 }
        );
    }
}
