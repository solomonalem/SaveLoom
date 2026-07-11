import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';
import { env } from '~/env';
import { isAnthropicKeyConfigured } from '~/lib/anthropic-errors';
import { getInsightsStatus } from '~/lib/insights-generation';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const status = await getInsightsStatus(db, session.user.id, isAnthropicKeyConfigured(env.ANTHROPIC_API_KEY));

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('Error fetching insights status:', error);
        return NextResponse.json({ error: 'Failed to fetch insights status' }, { status: 500 });
    }
}
