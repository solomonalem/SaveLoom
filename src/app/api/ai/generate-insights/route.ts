//src/app/api/ai/generate-insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';
import { generateUserInsights } from '~/lib/insights-generation';
import { normalizeAnthropicError } from '~/lib/anthropic-errors';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let force = false;
        let useAi = false;

        try {
            const body = await req.json();
            force = Boolean(body?.force);
            useAi = Boolean(body?.useAi);
        } catch {
            // Empty body is fine — defaults to rule-based refresh
        }

        const result = await generateUserInsights(db, session.user.id, { force, useAi });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error: unknown) {
        console.error('❌ Error generating insights:', error);

        const normalized = normalizeAnthropicError(error);
        const message = normalized.message;

        if (message.includes('Invalid Anthropic API key') || message.includes('Anthropic API key')) {
            return NextResponse.json({ error: message }, { status: 401 });
        }

        if (message.includes('rate limit') || message.includes('refresh limit')) {
            return NextResponse.json({ error: message }, { status: 429 });
        }

        if (message.includes('No transaction') || message.includes('Connect a bank') || message.includes('Sync transactions')) {
            return NextResponse.json({ error: message }, { status: 400 });
        }

        return NextResponse.json(
            {
                error: message,
            },
            { status: 500 }
        );
    }
}
