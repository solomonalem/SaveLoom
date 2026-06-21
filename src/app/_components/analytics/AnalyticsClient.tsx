//src/app/_components/analytics/AnalyticsClient.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, RefreshCw, AlertTriangle, Building2 } from 'lucide-react';
import AppNav from '~/app/_components/AppNav';
import PageShell from '~/app/_components/PageShell';
import EmptyState from '~/app/_components/EmptyState';
import { chartHeaderIcons } from '~/lib/category-icons';
import { TransactionListItem } from '~/app/_components/TransactionListItem';
import MerchantIcon from '~/app/_components/MerchantIcon';
import { buttons, chartColors, iconBadge, iconBadgeTint, layout, listRow, summaryStat, surfaces, typography } from '~/lib/design';

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

const colors = {
    gradients: {
        success: 'from-emerald-600 to-emerald-500',
        warning: 'from-amber-600 to-amber-500',
        danger: 'from-red-600 to-red-500',
        info: 'from-indigo-600 to-indigo-500',
    }
};

const ChartPanelIcon = ({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) => (
    <div className={iconBadge.muted}>
        <Icon className="h-5 w-5" />
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={`${surfaces.card} p-4 shadow-md`}>
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

const StatCard = ({ title, value, icon: Icon, trend, trendValue, tone = 'indigo' }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down';
    trendValue?: string;
    tone?: 'indigo' | 'emerald' | 'red' | 'amber' | 'slate';
}) => (
    <div className={`${surfaces.cardHover} p-4`}>
        <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
                <p className={`mb-1 ${typography.label}`}>{title}</p>
                <p className={summaryStat.value}>{value}</p>
            </div>
            <div className={iconBadgeTint(tone)}>
                <Icon className="h-4 w-4" />
            </div>
        </div>
        {trend && trendValue && (
            <div className={`flex items-center gap-1.5 ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium">{trendValue}</span>
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
            <PageShell>
                <AppNav subtitle="Analytics" />
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                        <p className="font-medium text-slate-900">Loading analytics</p>
                        <p className="mt-1 text-sm text-slate-500">Preparing your financial data...</p>
                    </div>
                </div>
            </PageShell>
        );
    }

    if (!analyticsData) {
        return (
            <PageShell>
                <AppNav subtitle="Analytics" />
                <div className="page-container p-6 lg:p-8">
                    <EmptyState
                        icon={AlertTriangle}
                        title="Unable to load analytics"
                        description="There was an error loading your financial data."
                        action={
                            <button onClick={fetchAnalyticsData} className={buttons.primary}>
                                Try again
                            </button>
                        }
                    />
                </div>
            </PageShell>
        );
    }

    const { accounts, transactions, metrics, chartData } = analyticsData;

    const navActions = (
        <>
            <select
                value={timeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className={`${buttons.secondary} py-2`}
            >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
            </select>
            <button
                onClick={handleRefresh}
                disabled={loading}
                className={buttons.primary}
            >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
            </button>
        </>
    );

    return (
        <PageShell>
            {error && (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
                    {error} — showing sample data for demonstration
                </div>
            )}

            <AppNav subtitle="Analytics" actions={navActions} />

            <div className={layout.page}>
                <div className={layout.gridStats}>
                    <StatCard
                        title="Total Balance"
                        value={formatCurrency(metrics.totalBalance)}
                        icon={DollarSign}
                        tone="emerald"
                    />
                    <StatCard
                        title="Net Cash Flow"
                        value={formatCurrency(metrics.netCashFlow)}
                        icon={metrics.netCashFlow >= 0 ? TrendingUp : TrendingDown}
                        trend={metrics.netCashFlow >= 0 ? 'up' : 'down'}
                        trendValue={`${Math.abs(metrics.savingsRate).toFixed(1)}%`}
                        tone={metrics.netCashFlow >= 0 ? 'emerald' : 'red'}
                    />
                    <StatCard
                        title="Monthly Spending"
                        value={formatCurrency(metrics.totalExpenses)}
                        icon={Activity}
                        tone="amber"
                    />
                    <StatCard
                        title="Transactions"
                        value={metrics.transactionCount.toString()}
                        icon={Calendar}
                        tone="indigo"
                    />
                </div>

                {transactions.length > 0 && (
                    <div className={`${surfaces.card} p-4`}>
                        <h3 className={typography.sectionTitle}>Recent transactions</h3>
                        <div className={`${surfaces.list} ${listRow.scroll} compact-scroll mt-3`}>
                            {[...transactions]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 10)
                                .map((transaction) => (
                                    <TransactionListItem
                                        key={transaction.id}
                                        transaction={transaction}
                                        showAccount={false}
                                    />
                                ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className={`${surfaces.card} p-4 xl:col-span-1`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className={typography.sectionTitle}>Spending breakdown</h3>
                            <ChartPanelIcon icon={chartHeaderIcons.breakdown} />
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
                                            <Cell key={`cell-${index}`} fill={entry.fill || chartColors.categories[index % chartColors.categories.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value: string) => value}
                                        wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                icon={chartHeaderIcons.empty}
                                title="No spending data yet"
                                description="Connect your bank accounts to see spending breakdown."
                            />
                        )}
                    </div>

                    <div className={`${surfaces.card} p-4 xl:col-span-2`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className={typography.sectionTitle}>Daily cash flow</h3>
                            <ChartPanelIcon icon={chartHeaderIcons.cashFlow} />
                        </div>
                        {chartData.dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData.dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(value) => `${value.toLocaleString()}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                                    <Bar dataKey="income" fill={chartColors.income} radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar dataKey="expenses" fill={chartColors.expense} radius={[4, 4, 0, 0]} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                icon={chartHeaderIcons.cashFlow}
                                title="No transaction data yet"
                                description="Your daily cash flow will appear here."
                            />
                        )}
                    </div>
                </div>

                <div className={`${surfaces.card} p-6`}>
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className={typography.sectionTitle}>Net cash flow trend</h3>
                        <ChartPanelIcon icon={chartHeaderIcons.trend} />
                    </div>
                    {chartData.dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={chartData.dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColors.net} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={chartColors.net} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(value) => `${value.toLocaleString()}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="net" stroke={chartColors.net} strokeWidth={2} fill="url(#colorNet)" name="Net Cash Flow" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState
                            icon={chartHeaderIcons.trend}
                            title="No trend data yet"
                            description="Your cash flow trends will appear here."
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {accounts.length > 0 ? (
                        accounts.map((account) => (
                            <div key={account.id} className={`${surfaces.card} p-6`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{account.accountName}</h4>
                                        <p className="text-sm text-slate-500">{account.bankName} •••• {account.mask}</p>
                                        <p className="mt-1 text-xs capitalize text-slate-400">{account.accountType}</p>
                                    </div>
                                    <MerchantIcon
                                        bankName={account.bankName}
                                        category="Banking & Finance"
                                        size="md"
                                    />
                                </div>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {formatCurrency(account.currentBalance)}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className={`${surfaces.card} col-span-full p-8`}>
                            <EmptyState
                                icon={Building2}
                                title="No bank accounts connected"
                                description="Connect your bank accounts to see detailed analytics and insights."
                            />
                        </div>
                    )}
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
                    <h3 className="mb-2 text-lg font-semibold">Analytics summary</h3>
                    <p className="mb-4 text-sm text-slate-300">
                        Last {timeframe} days · {metrics.transactionCount} transactions analyzed
                    </p>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                        <div>
                            <span className="text-slate-400">Savings rate</span>
                            <div className="text-lg font-semibold">{metrics.savingsRate.toFixed(1)}%</div>
                        </div>
                        <div>
                            <span className="text-slate-400">Avg. daily spending</span>
                            <div className="text-lg font-semibold">{formatCurrency(metrics.totalExpenses / parseInt(timeframe))}</div>
                        </div>
                        <div>
                            <span className="text-slate-400">Account balance</span>
                            <div className="text-lg font-semibold">{formatCurrency(metrics.totalBalance)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
}