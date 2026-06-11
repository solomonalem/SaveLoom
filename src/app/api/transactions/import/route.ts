//src/app/api/transactions/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { plaidClient } from '~/lib/plaid';
import { db } from '~/server/db';

export async function POST(req: NextRequest) {
    try {
        console.log('🔄 Starting modern transaction sync...');

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's Plaid access tokens
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { bankAccounts: true },
        });

        if (!user?.plaidAccessTokens || user.plaidAccessTokens.length === 0) {
            return NextResponse.json({ error: 'No bank accounts connected' }, { status: 400 });
        }

        let totalAdded = 0;
        let totalModified = 0;
        let totalRemoved = 0;
        const accessTokens = user.plaidAccessTokens as string[];

        // Process each connected bank
        for (let i = 0; i < accessTokens.length; i++) {
            const accessToken = accessTokens[i];
            console.log(`🏦 Syncing bank ${i + 1}/${accessTokens.length}`);

            try {
                // Get the stored cursor for this access token (if any)
                // For now, we'll start fresh (cursor = "" means get all transactions)
                let cursor = "";

                // You can store cursors per access token in your database later
                // For initial sync, empty cursor gets all historical transactions

                let hasMore = true;
                let requestCount = 0;
                const maxRequests = 10; // Prevent infinite loops

                while (hasMore && requestCount < maxRequests) {
                    console.log(`📡 Sync request ${requestCount + 1} with cursor: ${cursor || 'initial'}`);

                    // ✅ Use the new /transactions/sync endpoint
                    const syncResponse = await plaidClient.transactionsSync({
                        access_token: accessToken,
                        cursor: cursor,
                        count: 100, // ✅ count IS supported in /sync (unlike /get)
                    });

                    const { added, modified, removed, next_cursor, has_more } = syncResponse.data;

                    console.log(`📊 Sync results: +${added.length} added, ~${modified.length} modified, -${removed.length} removed`);

                    // Process added transactions
                    for (const transaction of added) {
                        try {
                            // Find the corresponding bank account
                            const bankAccount = user.bankAccounts.find(
                                account => account.plaidAccountId === transaction.account_id
                            );

                            if (!bankAccount) {
                                console.log(`⚠️ No matching bank account for transaction ${transaction.transaction_id}`);
                                continue;
                            }

                            // Check if transaction already exists (shouldn't happen with sync, but safe)
                            const existingTransaction = await db.transaction.findUnique({
                                where: { plaidTransactionId: transaction.transaction_id },
                            });

                            if (existingTransaction) {
                                console.log(`⏭️ Transaction ${transaction.transaction_id} already exists, skipping`);
                                continue;
                            }

                            // Create new transaction
                            await db.transaction.create({
                                data: {
                                    userId: session.user.id,
                                    bankAccountId: bankAccount.id,
                                    plaidTransactionId: transaction.transaction_id,
                                    amount: -transaction.amount, // Plaid uses positive for outgoing, we use negative
                                    description: transaction.name,
                                    merchantName: transaction.merchant_name || null,
                                    category: transaction.category?.[0] || 'Other',
                                    subcategory: transaction.category?.[1] || null,
                                    date: new Date(transaction.date),
                                    authorizedDate: transaction.authorized_date ? new Date(transaction.authorized_date) : null,
                                },
                            });

                            totalAdded++;
                            console.log(`💾 Added: ${transaction.name} - $${Math.abs(transaction.amount)}`);
                        } catch (transactionError) {
                            console.error(`❌ Error adding transaction ${transaction.transaction_id}:`, transactionError);
                        }
                    }

                    // Process modified transactions
                    for (const transaction of modified) {
                        try {
                            const existingTransaction = await db.transaction.findUnique({
                                where: { plaidTransactionId: transaction.transaction_id },
                            });

                            if (existingTransaction) {
                                await db.transaction.update({
                                    where: { plaidTransactionId: transaction.transaction_id },
                                    data: {
                                        amount: -transaction.amount,
                                        description: transaction.name,
                                        merchantName: transaction.merchant_name || null,
                                        category: transaction.category?.[0] || 'Other',
                                        subcategory: transaction.category?.[1] || null,
                                        date: new Date(transaction.date),
                                        authorizedDate: transaction.authorized_date ? new Date(transaction.authorized_date) : null,
                                    },
                                });
                                totalModified++;
                                console.log(`🔄 Updated: ${transaction.name}`);
                            }
                        } catch (updateError) {
                            console.error(`❌ Error updating transaction ${transaction.transaction_id}:`, updateError);
                        }
                    }

                    // Process removed transactions
                    for (const removedTransaction of removed) {
                        try {
                            await db.transaction.delete({
                                where: { plaidTransactionId: removedTransaction.transaction_id },
                            });
                            totalRemoved++;
                            console.log(`🗑️ Removed: ${removedTransaction.transaction_id}`);
                        } catch (deleteError) {
                            console.error(`❌ Error removing transaction ${removedTransaction.transaction_id}:`, deleteError);
                        }
                    }

                    // Update cursor and check if more data available
                    cursor = next_cursor;
                    hasMore = has_more;
                    requestCount++;

                    console.log(`📍 Next cursor: ${cursor}, Has more: ${hasMore}`);
                }

                // TODO: Store the final cursor in your database for future incremental syncs
                // You can add a field like 'plaidSyncCursor' to your User model

            } catch (accessTokenError: any) {
                console.error(`❌ Error syncing access token ${i + 1}:`, {
                    message: accessTokenError.message,
                    status: accessTokenError.response?.status,
                    plaidError: accessTokenError.response?.data
                });
                continue;
            }
        }

        // Update user's last sync time
        await db.user.update({
            where: { id: session.user.id },
            data: { lastPlaidSync: new Date() },
        });

        const totalTransactions = totalAdded + totalModified;
        console.log(`✅ Sync completed: +${totalAdded} added, ~${totalModified} modified, -${totalRemoved} removed`);

        return NextResponse.json({
            success: true,
            imported: totalAdded,
            modified: totalModified,
            removed: totalRemoved,
            total: totalTransactions,
            message: `Successfully synced ${totalAdded} new transactions, updated ${totalModified}, removed ${totalRemoved}!`
        });

    } catch (error: any) {
        console.error('❌ Transaction sync error:', error);
        return NextResponse.json({
            error: 'Failed to sync transactions',
            details: error.message
        }, { status: 500 });
    }
}