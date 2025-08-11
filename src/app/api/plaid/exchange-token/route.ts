import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { plaidClient } from '~/lib/plaid';
import { db } from '~/server/db';

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

        return NextResponse.json({
            success: true,
            accounts: savedAccounts.length,
            message: `Connected ${savedAccounts.length} accounts!`
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