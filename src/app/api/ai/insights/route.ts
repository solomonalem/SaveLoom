import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { auth } from '~/server/auth';
export async function GET(req: NextRequest) {
    try {
        const session = await auth();


        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        let insights;

        if (type && type !== 'all') {
            insights = await db.aIInsight.findMany({
                where: {
                    userId: session.user.id,
                    type: type
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            });
        } else {
            insights = await db.aIInsight.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            });
        }

        return NextResponse.json({
            insights,
            total: insights.length
        });
    } catch (error) {
        console.error('Error fetching insights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch insights' },
            { status: 500 }
        );
    }
}
