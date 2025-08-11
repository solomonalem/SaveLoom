"use client";

import { usePlaidLink } from 'react-plaid-link';
import { useState } from 'react';

interface PlaidLinkProps {
    onSuccess: () => void;
}

export default function PlaidLink({ onSuccess }: PlaidLinkProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Get link token from our API
    const getLinkToken = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/plaid/link-token', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.link_token) {
                setLinkToken(data.link_token);
            } else {
                console.error('Failed to get link token:', data);
            }
        } catch (error) {
            console.error('Error getting link token:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle successful bank connection
    const onPlaidSuccess = async (public_token: string, metadata: any) => {
        try {
            setLoading(true);
            console.log('🎉 Plaid connection successful!');
            console.log('Metadata:', metadata);

            const response = await fetch('/api/plaid/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ public_token }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Bank accounts saved successfully!');
                console.log(`Connected ${data.accounts} accounts`);
                alert(`Successfully connected ${data.accounts} bank accounts!`);
                onSuccess();
            } else {
                console.error('Failed to save bank accounts:', data);
                alert('Failed to save bank accounts. Please try again.');
            }
        } catch (error) {
            console.error('Error saving bank accounts:', error);
            alert('Error connecting bank account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: onPlaidSuccess,
        onExit: (err, metadata) => {
            if (err) {
                console.error('Plaid Link error:', err);
            }
            setLoading(false);
        },
        env: process.env.NEXT_PUBLIC_PLAID_ENV as any,
    });

    return (
        <div>
            {!linkToken ? (
                <button
                    onClick={getLinkToken}
                    disabled={loading}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                >
                    {loading ? 'Preparing...' : 'Connect Bank Account'}
                </button>
            ) : (
                <button
                    onClick={() => open()}
                    disabled={!ready || loading}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                >
                    {loading ? 'Connecting...' : 'Select Your Bank'}
                </button>
            )}
        </div>
    );
}