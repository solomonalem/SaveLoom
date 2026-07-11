import { NextRequest, NextResponse } from 'next/server';
//src/app/api/transactions/route.ts
import { auth } from '~/server/auth';
import { db } from '~/server/db';
import { parseMoney } from "~/lib/money";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const transactions = await db.transaction.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                bankAccount: {
                    select: {
                        accountName: true,
                        bankName: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
            take: 50, // Limit to last 50 transactions
        });

        return NextResponse.json({
            transactions: transactions.map((t) => ({
                ...t,
                amount: parseMoney(t.amount),
            })),
            count: transactions.length,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({
            error: 'Failed to fetch transactions'
        }, { status: 500 });
    }
}