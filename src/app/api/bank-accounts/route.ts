//src/app/api/bank-accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseMoney } from "~/lib/money";
import { getRequestUserId } from "~/server/request-auth";
import { db } from '~/server/db';

export async function GET(req: NextRequest) {
    try {
        const userId = await getRequestUserId(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's bank accounts
        const accounts = await db.bankAccount.findMany({
            where: {
                userId,
                isActive: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            accounts: accounts.map((account) => ({
                ...account,
                currentBalance: parseMoney(account.currentBalance),
                availableBalance: account.availableBalance
                    ? parseMoney(account.availableBalance)
                    : null,
            })),
            count: accounts.length,
        });
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        return NextResponse.json({
            error: 'Failed to fetch bank accounts'
        }, { status: 500 });
    }
}