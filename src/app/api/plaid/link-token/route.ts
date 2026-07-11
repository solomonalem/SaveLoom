//src/app/api/plaid/link-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from "~/server/request-auth";
import { plaidClient } from '~/lib/plaid';

export async function POST(req: NextRequest) {
    try {
        console.log('🔍 Link token route called');

        const userId = await getRequestUserId(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🏦 Creating link token for user:', userId);

        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: userId,
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