// src/app/api/ai/insights/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';

import { db } from '~/server/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const insight = await db.aIInsight.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!insight) {
            return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
        }

        await db.aIInsight.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting insight:', error);
        return NextResponse.json(
            { error: 'Failed to delete insight' },
            { status: 500 }
        );
    }
}