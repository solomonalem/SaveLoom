// src/app/api/debug/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { bankAccounts: true },
        });

        return NextResponse.json({
            user: {
                id: user?.id,
                hasConnectedBank: user?.hasConnectedBank,
                plaidAccessTokens: user?.plaidAccessTokens,
                tokensType: typeof user?.plaidAccessTokens,
                tokensIsArray: Array.isArray(user?.plaidAccessTokens),
                tokensLength: Array.isArray(user?.plaidAccessTokens) ? user.plaidAccessTokens.length : 'N/A',
                bankAccounts: user?.bankAccounts?.map(acc => ({
                    id: acc.id,
                    plaidAccountId: acc.plaidAccountId,
                    accountName: acc.accountName,
                    bankName: acc.bankName
                }))
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}