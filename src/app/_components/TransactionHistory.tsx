"use client";

import { useState, useEffect } from 'react';

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

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/transactions');
            const data = await response.json();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
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
                alert(`Successfully imported ${data.imported} new transactions!`);
                fetchTransactions(); // Refresh the list
            } else {
                alert('Failed to import transactions: ' + data.error);
            }
        } catch (error) {
            console.error('Error importing transactions:', error);
            alert('Error importing transactions');
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
            'Food and Drink': '🍔',
            'Shops': '🛍️',
            'Transportation': '🚗',
            'Payment': '💳',
            'Transfer': '💸',
            'Recreation': '🎯',
            'Service': '🔧',
            'Healthcare': '🏥',
            'Travel': '✈️',
            'Community': '🏛️',
            'Other': '💰'
        };
        return categoryMap[category] || '💰';
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <button
                    onClick={importTransactions}
                    disabled={importing}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {importing ? 'Importing...' : 'Import Transactions'}
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No transactions found</p>
                    <button
                        onClick={importTransactions}
                        disabled={importing}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {importing ? 'Importing...' : 'Import Your Transactions'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.slice(0, 10).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getCategoryEmoji(transaction.category)}</span>
                                <div>
                                    <h4 className="font-medium text-gray-900">
                                        {transaction.merchantName || transaction.description}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {transaction.category} • {formatDate(transaction.date)}
                                    </p>
                                    {transaction.bankAccount && (
                                        <p className="text-xs text-gray-400">
                                            {transaction.bankAccount.accountName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {transactions.length > 10 && (
                        <div className="text-center pt-4">
                            <button className="text-blue-500 hover:text-blue-600 text-sm">
                                View All {transactions.length} Transactions
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}