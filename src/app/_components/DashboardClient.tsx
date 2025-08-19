"use client";

import Link from "next/link";
import PlaidLink from "./PlaidLink";
import ConnectedAccounts from "./ConnectedAccounts";
import TransactionHistory from "./TransactionHistory";
import { useState, useEffect } from 'react';

interface DashboardClientProps {
    user: {
        name?: string | null;
        image?: string | null;
    };
}

interface Stats {
    accountsConnected: number;
    transactionsTracked: number;
    totalBalance: number;
    monthlyExpenses: number;
}

export default function DashboardClient({ user }: DashboardClientProps) {
    const [stats, setStats] = useState<Stats>({
        accountsConnected: 0,
        transactionsTracked: 0,
        totalBalance: 0,
        monthlyExpenses: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [accountsRes, transactionsRes] = await Promise.all([
                fetch('/api/bank-accounts'),
                fetch('/api/transactions')
            ]);

            const accountsData = await accountsRes.json();
            const transactionsData = await transactionsRes.json();

            const accounts = accountsData.accounts || [];
            const transactions = transactionsData.transactions || [];

            // Calculate stats
            const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.currentBalance, 0);

            // Monthly expenses (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const monthlyExpenses = transactions
                .filter((t: any) => new Date(t.date) >= thirtyDaysAgo && t.amount < 0)
                .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

            setStats({
                accountsConnected: accounts.length,
                transactionsTracked: transactions.length,
                totalBalance,
                monthlyExpenses
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handlePlaidSuccess = () => {
        // Refresh the page after successful connection
        window.location.reload();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-bold text-white">SL</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">SaveLoom</span>
                        </div>

                        {/* Enhanced Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Setup
                            </Link>
                            <Link href="/analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Analytics
                            </Link>
                            <Link href="/budgets" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Budgets
                            </Link>
                            <Link href="/goals" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Goals
                            </Link>
                            <Link href="/insights" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                🧠 AI Insights
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Hello, {user.name}</span>
                            {user.image && (
                                <img
                                    src={user.image}
                                    alt={user.name || ""}
                                    className="h-8 w-8 rounded-full"
                                />
                            )}
                            <button
                                onClick={() => {
                                    fetch('/api/auth/signout', { method: 'POST' })
                                        .then(() => window.location.href = '/');
                                }}
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Welcome to SaveLoom! 🎉
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Your personalized financial journey starts here. Let's get you set up for success!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">👤</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Complete Your Profile</h3>
                            <p className="text-gray-600 mb-6">Tell us about your financial goals, interests, and lifestyle to get personalized recommendations</p>
                            <Link
                                href="/onboarding"
                                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Start Onboarding
                            </Link>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">🏦</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Connect Your Bank</h3>
                            <p className="text-gray-600 mb-6">Securely link your bank accounts for automatic transaction tracking and insights</p>
                            <PlaidLink onSuccess={handlePlaidSuccess} />
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">View Analytics</h3>
                            <p className="text-gray-600 mb-6">See your financial overview, spending patterns, and AI-generated insights</p>
                            <Link
                                href="/analytics"
                                className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                            >
                                View Analytics
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 max-w-4xl mx-auto">
                        <ConnectedAccounts />
                    </div>

                    <div className="mt-8 max-w-4xl mx-auto">
                        <TransactionHistory />
                    </div>

                    {/* Enhanced Quick Stats with Real Data */}
                    <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your SaveLoom Journey</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.accountsConnected}</div>
                                <div className="text-gray-600">Accounts Connected</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">{stats.transactionsTracked}</div>
                                <div className="text-gray-600">Transactions Tracked</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">{formatCurrency(stats.totalBalance)}</div>
                                <div className="text-gray-600">Total Balance</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-2">{formatCurrency(stats.monthlyExpenses)}</div>
                                <div className="text-gray-600">Monthly Expenses</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Cards */}
                    {stats.transactionsTracked > 0 && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <Link
                                href="/analytics"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">📊 View Analytics</h3>
                                        <p className="text-blue-100">Analyze your spending patterns and trends</p>
                                    </div>
                                    <div className="text-2xl">→</div>
                                </div>
                            </Link>

                            <Link
                                href="/budgets"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl text-white hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">💰 Create Budget</h3>
                                        <p className="text-green-100">Set spending limits and track progress</p>
                                    </div>
                                    <div className="text-2xl">→</div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}