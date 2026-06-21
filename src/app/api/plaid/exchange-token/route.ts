//src/app/api/plaid/exchange-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { plaidClient } from '~/lib/plaid';
import { db } from '~/server/db';
import { env } from '~/env';
import { generateUserInsights } from '~/lib/insights-generation';

export async function POST(req: NextRequest) {
    try {
        console.log('🔄 Token exchange started');

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { public_token } = await req.json();
        if (!public_token) {
            return NextResponse.json({ error: 'Public token required' }, { status: 400 });
        }

        // Step 1: Exchange token (CORRECT METHOD NAME)
        console.log('🔄 Exchanging public token...');
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;
        console.log('✅ Token exchanged successfully');

        // Step 2: Get accounts
        console.log('🏦 Fetching accounts...');
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });
        console.log(`📊 Found ${accountsResponse.data.accounts.length} accounts`);

        // Step 3: Save accounts one by one
        const savedAccounts = [];
        for (const account of accountsResponse.data.accounts) {
            try {
                console.log(`💾 Saving account: ${account.name}`);

                const savedAccount = await db.bankAccount.create({
                    data: {
                        userId: session.user.id,
                        plaidAccountId: account.account_id,
                        plaidItemId: itemId,
                        accountName: account.name,
                        officialName: account.official_name || account.name,
                        accountType: account.type,
                        accountSubtype: account.subtype || '',
                        currentBalance: Number(account.balances.current) || 0,
                        availableBalance: account.balances.available ? Number(account.balances.available) : null,
                        creditLimit: account.balances.limit ? Number(account.balances.limit) : null,
                        bankName: account.official_name || 'Bank of America',
                        mask: account.mask || '',
                        lastSync: new Date(),
                    },
                });

                savedAccounts.push(savedAccount);
                console.log(`✅ Saved account: ${account.name}`);
            } catch (accountError) {
                console.error(`❌ Failed to save account ${account.name}:`, accountError);
            }
        }

        // Step 4: Update user
        try {
            console.log('👤 Updating user...');
            await db.user.update({
                where: { id: session.user.id },
                data: {
                    hasConnectedBank: true,
                    plaidAccessTokens: [accessToken],
                },
            });
            console.log('✅ User updated');
        } catch (userError) {
            console.error('❌ Failed to update user:', userError);
        }

        // Step 5: 🧠 Fetch initial transactions and generate AI insights
        try {
            console.log('📊 Fetching initial transactions...');

            // Get transactions for the last 30 days
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const endDate = new Date();

            const transactionsResponse = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
                end_date: endDate.toISOString().split('T')[0],
                count: 500, // Get up to 500 recent transactions
            });

            console.log(`📈 Found ${transactionsResponse.data.transactions.length} transactions`);

            // Save transactions to database
            let savedTransactionsCount = 0;
            for (const transaction of transactionsResponse.data.transactions) {
                try {
                    // Find the corresponding bank account
                    const bankAccount = savedAccounts.find(acc => acc.plaidAccountId === transaction.account_id);
                    if (!bankAccount) {
                        console.warn(`⚠️ No bank account found for transaction ${transaction.transaction_id}`);
                        continue;
                    }

                    // Check if transaction already exists
                    const existingTransaction = await db.transaction.findUnique({
                        where: { plaidTransactionId: transaction.transaction_id }
                    });

                    if (existingTransaction) {
                        continue; // Skip if already exists
                    }

                    await db.transaction.create({
                        data: {
                            userId: session.user.id,
                            bankAccountId: bankAccount.id,
                            plaidTransactionId: transaction.transaction_id,
                            amount: -transaction.amount, // Plaid uses positive for debits, we use negative for expenses
                            description: transaction.name,
                            merchantName: transaction.merchant_name || undefined,
                            date: new Date(transaction.date),
                            authorizedDate: transaction.authorized_date ? new Date(transaction.authorized_date) : undefined,
                            category: transaction.category?.[0] || 'Other',
                            subcategory: transaction.category?.[1] || undefined,
                            // Set some intelligent defaults for new transactions
                            isRecurring: false, // AI will determine this later
                            confidence: 0.8, // Default confidence
                            isEssential: ['Gas Stations', 'Groceries', 'Pharmacies'].includes(transaction.category?.[0] || ''),
                        },
                    });

                    savedTransactionsCount++;
                } catch (transactionError) {
                    console.error(`❌ Failed to save transaction ${transaction.transaction_id}:`, transactionError);
                }
            }

            console.log(`✅ Saved ${savedTransactionsCount} transactions`);

            // Step 6: 🧠 Generate AI insights after initial data load
            if (savedTransactionsCount > 0) {
                console.log('🧠 Generating initial insights...');
                try {
                    await generateUserInsights(db, session.user.id, { useAi: Boolean(env.ANTHROPIC_API_KEY) });
                    console.log('✅ Generated initial insights after bank connection');
                } catch (insightError) {
                    console.error('❌ Failed to generate insights:', insightError);
                }
            }

        } catch (transactionError) {
            console.error('❌ Failed to fetch initial transactions:', transactionError);
            // Don't fail the whole request if transaction fetch fails
        }

        return NextResponse.json({
            success: true,
            accounts: savedAccounts.length,
            message: `Connected ${savedAccounts.length} accounts and generated AI insights!`,
            hasInsights: true
        });

    } catch (error: any) {
        console.error('❌ Exchange token error:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        return NextResponse.json({
            error: 'Failed to connect bank account',
            details: error.message,
            type: error.constructor.name
        }, { status: 500 });
    }
}