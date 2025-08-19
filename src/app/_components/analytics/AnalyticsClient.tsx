"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, RefreshCw } from 'lucide-react';

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

interface BankAccount {
    id: string;
    accountName: string;
    bankName: string;
    accountType: string;
    currentBalance: number;
    mask: string;
}

const categoryEmojis: { [key: string]: string } = {
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
    'Entertainment': '🎬',
    'Other': '💰'
};

// Modern color palette
const colors = {
    primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'],
    gradients: {
        primary: 'from-indigo-600 via-purple-600 to-pink-600',
        success: 'from-emerald-500 to-teal-500',
        warning: 'from-amber-500 to-orange-500',
        danger: 'from-red-500 to-pink-500',
        info: 'from-blue-500 to-indigo-500'
    }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50">
                <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: ${entry.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, gradient, delay }: any) => (
    <div
        className={`group bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:bg-white/80`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">{title}</p>
                <p className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-none`}>
                    {value}
                </p>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
        </div>
        {trend && (
            <div className={`flex items-center space-x-2 ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-semibold">{trendValue}</span>
            </div>
        )}
    </div>
);

export default function RefinedAnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('30');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);

    // Mock data for demonstration
    useEffect(() => {
        const mockTransactions: Transaction[] = [
            { id: '1', amount: -45.50, description: 'Starbucks', category: 'Food and Drink', date: '2025-08-10' },
            { id: '2', amount: -120.00, description: 'Grocery Store', category: 'Food and Drink', date: '2025-08-09' },
            { id: '3', amount: -25.99, description: 'Netflix', category: 'Entertainment', date: '2025-08-08' },
            { id: '4', amount: 3200.00, description: 'Salary', category: 'Transfer', date: '2025-08-07' },
            { id: '5', amount: -85.75, description: 'Gas Station', category: 'Transportation', date: '2025-08-07' },
            { id: '6', amount: -299.99, description: 'Amazon', category: 'Shops', date: '2025-08-06' },
            { id: '7', amount: -15.50, description: 'Parking', category: 'Transportation', date: '2025-08-05' },
            { id: '8', amount: -75.00, description: 'Restaurant', category: 'Food and Drink', date: '2025-08-04' },
        ];

        const mockAccounts: BankAccount[] = [
            { id: '1', accountName: 'Checking', bankName: 'Chase', accountType: 'checking', currentBalance: 5420.75, mask: '****1234' },
            { id: '2', accountName: 'Savings', bankName: 'Chase', accountType: 'savings', currentBalance: 12850.30, mask: '****5678' },
        ];

        setTimeout(() => {
            setTransactions(mockTransactions);
            setAccounts(mockAccounts);
            setLoading(false);
        }, 1500);
    }, []);

    // Filter transactions by timeframe
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
        return transactionDate >= cutoffDate;
    });

    // Calculate metrics
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const expenses = filteredTransactions.filter(t => t.amount < 0);
    const income = filteredTransactions.filter(t => t.amount > 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Prepare chart data
    const categoryTotals = expenses.reduce((acc, transaction) => {
        const category = transaction.category || 'Other';
        if (!acc[category]) {
            acc[category] = { amount: 0, transactions: 0 };
        }
        acc[category].amount += Math.abs(transaction.amount);
        acc[category].transactions += 1;
        return acc;
    }, {} as { [key: string]: { amount: number; transactions: number } });

    const pieData = Object.entries(categoryTotals)
        .map(([category, data], index) => ({
            name: category,
            value: data.amount,
            emoji: categoryEmojis[category] || '💰',
            fill: colors.primary[index % colors.primary.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    // Daily data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const dailyData = last7Days.map(date => {
        const dayTransactions = filteredTransactions.filter(t => t.date.split('T')[0] === date);
        const dayIncome = dayTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const dayExpenses = dayTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            income: dayIncome,
            expenses: dayExpenses,
            net: dayIncome - dayExpenses
        };
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

                {/* Animated Navigation */}
                <nav className="relative bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between h-20">
                            <div className="flex items-center animate-pulse">
                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mr-4"></div>
                                <div className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Loading Animation */}
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-8 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-4xl animate-pulse">📊</div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            Loading Analytics
                        </h2>
                        <p className="text-gray-600 text-lg">Preparing your beautiful data visualizations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

            {/* Ultra-Refined Navigation */}
            <nav className="relative bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50 z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mr-5 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-110">
                                <span className="text-lg font-black text-white">SL</span>
                            </div>
                            <div>
                                <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    SaveLoom
                                </span>
                                <p className="text-sm text-gray-500 font-medium">Financial Analytics</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-2">
                            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50">
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="border-0 bg-transparent px-4 py-2 text-gray-700 font-semibold focus:outline-none"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                </select>
                            </div>
                            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2">
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Premium Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Balance"
                        value={formatCurrency(totalBalance)}
                        icon={DollarSign}
                        gradient={colors.gradients.success}
                        delay={0}
                    />
                    <StatCard
                        title="Net Cash Flow"
                        value={formatCurrency(netCashFlow)}
                        icon={netCashFlow >= 0 ? TrendingUp : TrendingDown}
                        trend={netCashFlow >= 0 ? 'up' : 'down'}
                        trendValue={`${Math.abs(savingsRate).toFixed(1)}%`}
                        gradient={netCashFlow >= 0 ? colors.gradients.success : colors.gradients.danger}
                        delay={100}
                    />
                    <StatCard
                        title="Monthly Spending"
                        value={formatCurrency(totalExpenses)}
                        icon={Activity}
                        gradient={colors.gradients.warning}
                        delay={200}
                    />
                    <StatCard
                        title="Transactions"
                        value={filteredTransactions.length.toString()}
                        icon={Calendar}
                        gradient={colors.gradients.info}
                        delay={300}
                    />
                </div>

                {/* Enhanced Chart Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Refined Pie Chart */}
                    <div className="xl:col-span-1 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Spending Breakdown
                            </h3>
                            <div className="text-3xl">🎯</div>
                        </div>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={140}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value: string) => `${categoryEmojis[value] || '💰'} ${value}`}
                                        wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-lg font-semibold">No spending data yet</p>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Bar Chart */}
                    <div className="xl:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Daily Cash Flow
                            </h3>
                            <div className="text-3xl">📈</div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    fontWeight={600}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    fontWeight={600}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stunning Area Chart */}
                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Net Cash Flow Trend
                        </h3>
                        <div className="text-3xl">🌊</div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={12}
                                fontWeight={600}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                fontWeight={600}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="net"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fill="url(#colorNet)"
                                name="Net Cash Flow"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Account Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((account, index) => (
                        <div key={account.id} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{account.accountName}</h4>
                                    <p className="text-sm text-gray-600">{account.bankName} •••• {account.mask}</p>
                                </div>
                                <div className="text-3xl">🏦</div>
                            </div>
                            <p className={`text-3xl font-black bg-gradient-to-r ${colors.gradients.success} bg-clip-text text-transparent`}>
                                {formatCurrency(account.currentBalance)}
                            </p>
                            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${colors.gradients.success} rounded-full transition-all duration-1000`}
                                    style={{ width: `${Math.min((account.currentBalance / 20000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}