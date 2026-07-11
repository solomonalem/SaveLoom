"use client";

import { usePlaidLink } from 'react-plaid-link';
import { useState } from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { useAppModal } from '~/app/_components/modal/ModalProvider';
import { buttons } from '~/lib/design';

interface PlaidLinkProps {
    onSuccess: () => void;
    className?: string;
}

export default function PlaidLink({ onSuccess, className = '' }: PlaidLinkProps) {
    const { showAlert } = useAppModal();
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'processing' | 'generating-insights' | 'complete'>('idle');

    const getLinkToken = async () => {
        try {
            setLoading(true);
            setConnectionStatus('connecting');
            const response = await fetch('/api/plaid/link-token', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.link_token) {
                setLinkToken(data.link_token);
                setConnectionStatus('idle');
            } else {
                await showAlert({
                    title: 'Connection failed',
                    message: 'Could not start bank linking. Please try again.',
                    variant: 'error',
                });
                setConnectionStatus('idle');
            }
        } catch (error) {
            console.error('Error getting link token:', error);
            await showAlert({
                title: 'Connection failed',
                message: 'Could not reach the server. Please try again.',
                variant: 'error',
            });
            setConnectionStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const onPlaidSuccess = async (public_token: string) => {
        try {
            setLoading(true);
            setConnectionStatus('processing');

            const response = await fetch('/api/plaid/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ public_token }),
            });

            const data = await response.json();

            if (data.success) {
                if (data.hasInsights) {
                    setConnectionStatus('generating-insights');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                setConnectionStatus('complete');

                await showAlert({
                    title: 'Bank connected',
                    message: data.hasInsights
                        ? `Connected ${data.accounts} account(s). AI insights were generated from your transaction history.`
                        : `Connected ${data.accounts} account(s). Your transactions are being processed.`,
                    variant: 'success',
                });

                setTimeout(() => {
                    onSuccess();
                }, 500);
            } else {
                setConnectionStatus('idle');
                await showAlert({
                    title: 'Save failed',
                    message: 'Failed to save bank accounts. Please try again.',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error saving bank accounts:', error);
            setConnectionStatus('idle');
            await showAlert({
                title: 'Connection failed',
                message: 'An error occurred while connecting your bank account.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: onPlaidSuccess,
        onExit: (err) => {
            if (err) {
                console.error('Plaid Link error:', err);
            }
            setLoading(false);
            setConnectionStatus('idle');
        },
        env: process.env.NEXT_PUBLIC_PLAID_ENV as 'sandbox' | 'development' | 'production',
    });

    const getStatusContent = () => {
        switch (connectionStatus) {
            case 'connecting':
                return { message: 'Preparing secure connection...', loading: true };
            case 'processing':
                return { message: 'Saving account information...', loading: true };
            case 'generating-insights':
                return { message: 'Generating AI insights...', loading: true };
            case 'complete':
                return { message: 'Connection successful', loading: false };
            default:
                return {
                    message: linkToken ? 'Select your bank' : 'Connect bank account',
                    loading: false,
                };
        }
    };

    const statusContent = getStatusContent();
    const isProcessing = ['connecting', 'processing', 'generating-insights'].includes(connectionStatus);
    const buttonClass = `${buttons.primary} w-full py-3 ${className}`;

    return (
        <div className="space-y-4">
            {!linkToken ? (
                <button
                    onClick={getLinkToken}
                    disabled={loading}
                    className={buttonClass}
                >
                    {statusContent.loading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}
                    <span>{statusContent.message}</span>
                </button>
            ) : (
                <button
                    onClick={() => open()}
                    disabled={!ready || loading}
                    className={buttonClass}
                >
                    {statusContent.loading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}
                    <span>{statusContent.message}</span>
                </button>
            )}

            {isProcessing && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 animate-pulse text-indigo-600" />
                        <div>
                            <p className="text-sm font-medium text-indigo-900">{statusContent.message}</p>
                            {connectionStatus === 'generating-insights' && (
                                <p className="mt-1 text-xs text-indigo-600">
                                    Analyzing spending patterns and building recommendations...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {connectionStatus === 'complete' && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-900">
                            Bank connected successfully. Redirecting...
                        </p>
                    </div>
                </div>
            )}

            {!linkToken && !loading && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                        <Brain className="mt-0.5 h-5 w-5 text-indigo-600" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">AI-powered insights</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                After connecting, SaveLoom analyzes transactions for subscriptions,
                                savings opportunities, and personalized recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
