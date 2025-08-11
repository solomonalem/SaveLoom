import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { plaidClient } from '~/lib/plaid';

export async function POST(req: NextRequest) {
    try {
        console.log('🔍 Link token route called');

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🏦 Creating link token for user:', session.user.id);

        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: session.user.id,
            },
            client_name: 'SaveLoom',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en',
        });

        console.log('✅ Link token created successfully');
        return NextResponse.json({ link_token: response.data.link_token });
    } catch (error: any) {
        console.error('❌ Plaid API Error Details:');
        console.error('Status:', error.response?.status);
        console.error('Plaid Error:', error.response?.data);

        return NextResponse.json({
            error: 'Failed to create link token',
            plaidError: error.response?.data,
        }, { status: 500 });
    }
}