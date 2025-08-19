"use client";

import { usePlaidLink } from 'react-plaid-link';
import { useState } from 'react';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface PlaidLinkProps {
    onSuccess: () => void;
}

export default function PlaidLink({ onSuccess }: PlaidLinkProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'processing' | 'generating-insights' | 'complete'>('idle');

    // Get link token from our API
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
                console.error('Failed to get link token:', data);
                setConnectionStatus('idle');
            }
        } catch (error) {
            console.error('Error getting link token:', error);
            setConnectionStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    // Handle successful bank connection with enhanced UI feedback
    const onPlaidSuccess = async (public_token: string, metadata: any) => {
        try {
            setLoading(true);
            setConnectionStatus('processing');
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

                // Show AI insights generation status
                if (data.hasInsights) {
                    setConnectionStatus('generating-insights');

                    // Simulate a brief delay to show the AI generation step
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                setConnectionStatus('complete');

                // Enhanced success message with AI insights
                const successMessage = data.hasInsights
                    ? `🎉 Successfully connected ${data.accounts} bank accounts!\n\n🧠 AI insights have been generated from your transaction history.\n\n✨ Check out your personalized financial recommendations!`
                    : `🎉 Successfully connected ${data.accounts} bank accounts!\n\n📊 Transaction data is being processed...`;

                alert(successMessage);

                // Brief delay before calling onSuccess to show completion
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            } else {
                console.error('Failed to save bank accounts:', data);
                setConnectionStatus('idle');
                alert('Failed to save bank accounts. Please try again.');
            }
        } catch (error) {
            console.error('Error saving bank accounts:', error);
            setConnectionStatus('idle');
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
            setConnectionStatus('idle');
        },
        env: process.env.NEXT_PUBLIC_PLAID_ENV as any,
    });

    // Get status message and icon based on current state
    const getStatusContent = () => {
        switch (connectionStatus) {
            case 'connecting':
                return {
                    message: 'Preparing secure connection...',
                    icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                };
            case 'processing':
                return {
                    message: 'Saving account information...',
                    icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                };
            case 'generating-insights':
                return {
                    message: 'Generating AI insights...',
                    icon: <Brain className="w-5 h-5 animate-pulse" />
                };
            case 'complete':
                return {
                    message: 'Connection successful!',
                    icon: <CheckCircle className="w-5 h-5" />
                };
            default:
                return {
                    message: linkToken ? 'Select Your Bank' : 'Connect Bank Account',
                    icon: null
                };
        }
    };

    const statusContent = getStatusContent();
    const isProcessing = ['connecting', 'processing', 'generating-insights'].includes(connectionStatus);

    return (
        <div className="space-y-4">
            {!linkToken ? (
                <button
                    onClick={getLinkToken}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                    {statusContent.icon && (
                        <span className="flex items-center">
                            {statusContent.icon}
                        </span>
                    )}
                    <span>{statusContent.message}</span>
                </button>
            ) : (
                <button
                    onClick={() => open()}
                    disabled={!ready || loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                    {statusContent.icon && (
                        <span className="flex items-center">
                            {statusContent.icon}
                        </span>
                    )}
                    <span>{statusContent.message}</span>
                </button>
            )}

            {/* Status indicator */}
            {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        {statusContent.icon}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                                {statusContent.message}
                            </p>
                            {connectionStatus === 'generating-insights' && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Analyzing your transaction patterns and creating personalized recommendations...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {connectionStatus === 'complete' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">
                                Bank connected successfully!
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                🧠 AI insights are ready. You'll be redirected to view them shortly.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Information box about AI insights */}
            {!linkToken && !loading && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <Brain className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-indigo-900 mb-1">
                                AI-Powered Financial Insights
                            </p>
                            <p className="text-xs text-indigo-600">
                                After connecting your bank, our AI will automatically analyze your spending patterns,
                                detect subscriptions, identify savings opportunities, and provide personalized recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}