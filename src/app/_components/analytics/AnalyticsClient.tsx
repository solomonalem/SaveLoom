//src/app/_components/analytics/AnalyticsClient.tsx
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

interface AnalyticsData {
    accounts: BankAccount[];
    transactions: Transaction[];
    metrics: {
        totalBalance: number;
        totalIncome: number;
        totalExpenses: number;
        netCashFlow: number;
        savingsRate: number;
        transactionCount: number;
    };
    chartData: {
        categoryBreakdown: Array<{
            name: string;
            value: number;
            emoji: string;
            fill: string;
            transactions: number;
        }>;
        dailyData: Array<{
            date: string;
            income: number;
            expenses: number;
            net: number;
        }>;
    };
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
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch real analytics data
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📊 Fetching analytics data for timeframe:', timeframe);

            const response = await fetch(`/api/analytics?timeframe=${timeframe}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Analytics data received:', data);
                setAnalyticsData(data);
            } else {
                console.error('❌ Failed to fetch analytics data:', response.status);
                setError('Failed to load analytics data');

            }
        } catch (error) {
            console.error('❌ Error fetching analytics data:', error);
            setError('Error loading analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount and timeframe change
    useEffect(() => {
        fetchAnalyticsData();
    }, [timeframe]);

    // Handle refresh button
    const handleRefresh = () => {
        fetchAnalyticsData();
    };

    // Handle timeframe change
    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe);
    };

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

    if (!analyticsData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Analytics</h3>
                    <p className="text-gray-600 mb-6">There was an error loading your financial data.</p>
                    <button
                        onClick={fetchAnalyticsData}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const { accounts, transactions, metrics, chartData } = analyticsData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

            {/* Error Banner */}
            {error && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 text-center">
                    <span className="text-sm">⚠️ {error} - Showing sample data for demonstration</span>
                </div>
            )}

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
                                    onChange={(e) => handleTimeframeChange(e.target.value)}
                                    className="border-0 bg-transparent px-4 py-2 text-gray-700 font-semibold focus:outline-none"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                </select>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                        value={formatCurrency(metrics.totalBalance)}
                        icon={DollarSign}
                        gradient={colors.gradients.success}
                        delay={0}
                    />
                    <StatCard
                        title="Net Cash Flow"
                        value={formatCurrency(metrics.netCashFlow)}
                        icon={metrics.netCashFlow >= 0 ? TrendingUp : TrendingDown}
                        trend={metrics.netCashFlow >= 0 ? 'up' : 'down'}
                        trendValue={`${Math.abs(metrics.savingsRate).toFixed(1)}%`}
                        gradient={metrics.netCashFlow >= 0 ? colors.gradients.success : colors.gradients.danger}
                        delay={100}
                    />
                    <StatCard
                        title="Monthly Spending"
                        value={formatCurrency(metrics.totalExpenses)}
                        icon={Activity}
                        gradient={colors.gradients.warning}
                        delay={200}
                    />
                    <StatCard
                        title="Transactions"
                        value={metrics.transactionCount.toString()}
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
                        {chartData.categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={chartData.categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={140}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {chartData.categoryBreakdown.map((entry, index) => (
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
                                <p className="text-sm mt-2">Connect your bank accounts to see spending breakdown</p>
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
                        {chartData.dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData.dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                        tickFormatter={(value) => `${value.toLocaleString()}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <div className="text-6xl mb-4">📈</div>
                                <p className="text-lg font-semibold">No transaction data yet</p>
                                <p className="text-sm mt-2">Your daily cash flow will appear here</p>
                            </div>
                        )}
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
                    {chartData.dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={chartData.dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                    tickFormatter={(value) => `${value.toLocaleString()}`}
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
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <div className="text-6xl mb-4">🌊</div>
                            <p className="text-lg font-semibold">No trend data yet</p>
                            <p className="text-sm mt-2">Your cash flow trends will appear here</p>
                        </div>
                    )}
                </div>

                {/* Account Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.length > 0 ? (
                        accounts.map((account, index) => (
                            <div key={account.id} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{account.accountName}</h4>
                                        <p className="text-sm text-gray-600">{account.bankName} •••• {account.mask}</p>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">{account.accountType}</p>
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
                        ))
                    ) : (
                        <div className="col-span-full bg-white/70 backdrop-blur-xl p-12 rounded-3xl shadow-xl border border-white/40 text-center">
                            <div className="text-6xl mb-4">🏦</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Bank Accounts Connected</h3>
                            <p className="text-gray-600 mb-6">Connect your bank accounts to see detailed analytics and insights.</p>
                            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold">
                                Connect Bank Account
                            </button>
                        </div>
                    )}
                </div>

                {/* Analytics Summary */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">📊 Analytics Summary</h3>
                            <p className="text-indigo-100 mb-4">
                                Showing data for the last {timeframe} days • {metrics.transactionCount} transactions analyzed
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-indigo-200">Savings Rate:</span>
                                    <div className="font-bold text-lg">{metrics.savingsRate.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="text-indigo-200">Avg. Daily Spending:</span>
                                    <div className="font-bold text-lg">{formatCurrency(metrics.totalExpenses / parseInt(timeframe))}</div>
                                </div>
                                <div>
                                    <span className="text-indigo-200">Account Balance:</span>
                                    <div className="font-bold text-lg">{formatCurrency(metrics.totalBalance)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-6xl opacity-50">📈</div>
                    </div>
                </div>
            </div>
        </div>
    );
}