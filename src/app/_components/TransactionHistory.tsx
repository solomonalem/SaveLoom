"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, X, Download } from 'lucide-react';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    merchantName?: string;
    category: string;
    subcategory?: string;
    date: string;
    bankAccount?: {
        accountName: string;
        bankName: string;
    };
}

interface StatusModalProps {
    type: 'success' | 'error';
    title: string;
    message: string;
    onClose: () => void;
}

const StatusModal = ({ type, title, message, onClose }: StatusModalProps) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50">
            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-6 ${type === 'success'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                    {type === 'success' ? (
                        <CheckCircle className="w-8 h-8" />
                    ) : (
                        <AlertTriangle className="w-8 h-8" />
                    )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

                <button
                    onClick={onClose}
                    className={`w-full px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${type === 'success'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105'
                            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                        }`}
                >
                    Got it
                </button>
            </div>
        </div>
    </div>
);

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [statusModal, setStatusModal] = useState<{
        show: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    const MAX_TRANSACTIONS_DISPLAY = 8;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const showStatusModal = (type: 'success' | 'error', title: string, message: string) => {
        setStatusModal({
            show: true,
            type,
            title,
            message
        });
    };

    const hideStatusModal = () => {
        setStatusModal(prev => ({ ...prev, show: false }));
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/transactions');
            const data = await response.json();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showStatusModal(
                'error',
                'Failed to Load Transactions',
                'There was an error loading your transactions. Please refresh the page and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const importTransactions = async () => {
        setImporting(true);
        try {
            const response = await fetch('/api/transactions/import', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                showStatusModal(
                    'success',
                    'Import Successful!',
                    `Successfully imported ${data.imported} new transactions! Your transaction history has been updated with the latest data from your bank accounts.`
                );
                fetchTransactions(); // Refresh the list
            } else {
                showStatusModal(
                    'error',
                    'Import Failed',
                    `Failed to import transactions: ${data.error}. Please check your bank connection and try again.`
                );
            }
        } catch (error) {
            console.error('Error importing transactions:', error);
            showStatusModal(
                'error',
                'Connection Error',
                'There was a network error while importing transactions. Please check your connection and try again.'
            );
        } finally {
            setImporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Math.abs(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCategoryEmoji = (category: string) => {
        const categoryMap: { [key: string]: string } = {
            'Food & Dining': '🍔',
            'Groceries': '🛒',
            'Transportation': '🚗',
            'Shopping': '🛍️',
            'Entertainment': '🎬',
            'Bills & Utilities': '💡',
            'Healthcare': '🏥',
            'Banking & Finance': '🏦',
            'Income': '💰',
            'Subscriptions': '📱',
            'Travel': '✈️',
            'Personal Care': '💅',
            'Food and Drink': '🍔',
            'Shops': '🛍️',
            'Payment': '💳',
            'Transfer': '💸',
            'Recreation': '🎯',
            'Service': '🔧',
            'Community': '🏛️',
            'Other': '💳'
        };
        return categoryMap[category] || '💳';
    };

    // Display logic
    const displayedTransactions = showAllTransactions
        ? transactions
        : transactions.slice(0, MAX_TRANSACTIONS_DISPLAY);

    const hiddenTransactionCount = transactions.length - MAX_TRANSACTIONS_DISPLAY;
    const shouldShowExpand = hiddenTransactionCount > 0;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-2xl w-32 animate-pulse"></div>
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-3xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Transactions Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Import your transactions from connected bank accounts to see your spending history and get AI-powered insights.
                </p>
                <button
                    onClick={importTransactions}
                    disabled={importing}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                    {importing ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Importing...</span>
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            <span>Import Your Transactions</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {shouldShowExpand && (
                        <button
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                            className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl"
                        >
                            {showAllTransactions ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span>Show Less</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span>Show All ({transactions.length})</span>
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={importTransactions}
                        disabled={importing}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold disabled:opacity-50 flex items-center space-x-2"
                    >
                        {importing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Importing...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Import</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {displayedTransactions.map((transaction, index) => (
                    <div
                        key={transaction.id}
                        className="group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                    {getCategoryEmoji(transaction.category)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 leading-tight">
                                        {transaction.merchantName || transaction.description}
                                    </h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                                            {transaction.category}
                                        </span>
                                        <span>•</span>
                                        <span>{formatDate(transaction.date)}</span>
                                    </div>
                                    {transaction.bankAccount && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {transaction.bankAccount.accountName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`text-2xl font-black ${transaction.amount < 0
                                        ? 'bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent'
                                    }`}>
                                    {transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {transaction.amount < 0 ? 'Expense' : 'Income'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show collapsed transactions indicator */}
            {!showAllTransactions && shouldShowExpand && (
                <div className="text-center">
                    <button
                        onClick={() => setShowAllTransactions(true)}
                        className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-6 py-4 rounded-2xl border border-gray-200 hover:border-indigo-200 group"
                    >
                        <span>+{hiddenTransactionCount} more transaction{hiddenTransactionCount > 1 ? 's' : ''} hidden</span>
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                    </button>
                </div>
            )}

            {/* View All Link (when expanded) */}
            {showAllTransactions && transactions.length > MAX_TRANSACTIONS_DISPLAY && (
                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing all {transactions.length} transactions
                    </p>
                </div>
            )}

            {/* Status Modal */}
            {statusModal.show && (
                <StatusModal
                    type={statusModal.type}
                    title={statusModal.title}
                    message={statusModal.message}
                    onClose={hideStatusModal}
                />
            )}
        </div>
    );
}