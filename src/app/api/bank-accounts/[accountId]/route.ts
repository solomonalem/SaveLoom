//src/app/api/bank-accounts/[accountId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { accountId: string } }
) {
    try {
        console.log('🗑️ Starting account removal process...');

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { accountId } = params;
        if (!accountId) {
            return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        console.log(`🔍 Removing account: ${accountId} for user: ${session.user.id}`);

        // Verify the account belongs to the user
        const account = await db.bankAccount.findFirst({
            where: {
                id: accountId,
                userId: session.user.id
            },
            include: {
                transactions: {
                    select: { id: true }
                }
            }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        console.log(`📊 Account has ${account.transactions.length} associated transactions`);

        // Option A: Soft delete (recommended) - just mark as inactive
        const updatedAccount = await db.bankAccount.update({
            where: { id: accountId },
            data: {
                isActive: false,
                updatedAt: new Date()
            }
        });

        // Option B: Hard delete (uncomment if you prefer complete removal)
        /*
        // Delete all associated transactions first
        await db.transaction.deleteMany({
            where: { bankAccountId: accountId }
        });

        // Then delete the account
        await db.bankAccount.delete({
            where: { id: accountId }
        });
        */

        console.log(`✅ Account ${accountId} successfully deactivated`);

        return NextResponse.json({
            success: true,
            message: 'Account removed successfully',
            accountId: accountId,
            transactionsAffected: account.transactions.length
        });

    } catch (error: any) {
        console.error('❌ Error removing account:', error);
        return NextResponse.json({
            error: 'Failed to remove account',
            details: error.message
        }, { status: 500 });
    }
}

// src/app/api/bank-accounts/[accountId]/reconnect/route.ts
// API endpoint to reactivate a removed account

export async function POST(
    req: NextRequest,
    { params }: { params: { accountId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { accountId } = params;

        // Reactivate the account
        const reactivatedAccount = await db.bankAccount.update({
            where: {
                id: accountId,
                userId: session.user.id
            },
            data: {
                isActive: true,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Account reactivated successfully',
            account: reactivatedAccount
        });

    } catch (error: any) {
        console.error('❌ Error reactivating account:', error);
        return NextResponse.json({
            error: 'Failed to reactivate account',
            details: error.message
        }, { status: 500 });
    }
}