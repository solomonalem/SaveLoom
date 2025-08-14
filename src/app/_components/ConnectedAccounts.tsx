"use client";

import { useState, useEffect } from 'react';

interface BankAccount {
    id: string;
    accountName: string;
    bankName: string;
    accountType: string;
    currentBalance: number;
    mask: string;
    lastSync: string;
}

export default function ConnectedAccounts() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await fetch('/api/bank-accounts');
            const data = await response.json();
            setAccounts(data.accounts || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getAccountIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'checking': return '🏛️';
            case 'savings': return '🏦';
            case 'credit': return '💳';
            default: return '🏧';
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
                <p className="text-gray-500">No bank accounts connected yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
            <div className="space-y-3">
                {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getAccountIcon(account.accountType)}</span>
                            <div>
                                <h4 className="font-medium text-gray-900">{account.accountName}</h4>
                                <p className="text-sm text-gray-500">
                                    {account.bankName} •••• {account.mask}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">
                                {formatCurrency(account.currentBalance)}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {account.accountType}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
                Last updated: {accounts[0]?.lastSync ? new Date(accounts[0].lastSync).toLocaleString() : 'Never'}
            </div>
        </div>
    );
}