"use client";

import Link from "next/link";
import PlaidLink from "./PlaidLink";
import ConnectedAccounts from "./ConnectedAccounts";
import TransactionHistory from "./TransactionHistory";
import { useState, useEffect } from 'react';
import {
    TrendingUp,
    CreditCard,
    PiggyBank,
    Target,
    Brain,
    BarChart3,
    Wallet,
    Sparkles,
    ArrowRight,
    CheckCircle,
    Clock,
    Shield, Zap,
    AlertCircle,
    X,
} from 'lucide-react';

import { signOut } from "next-auth/react";

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

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: {
    title: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
}) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
        return null;
    };

    return (
        <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {getTrendIcon()}
            </div>
            <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>
                {value}
            </div>
            <div className="text-sm font-semibold text-gray-700">{title}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
    );
};

const ActionCard = ({
    title,
    description,
    icon,
    href,
    gradient,
    status = 'pending',
    buttonText = 'Get Started'
}: {
    title: string;
    description: string;
    icon: string;
    href?: string;
    gradient: string;
    status?: 'pending' | 'complete' | 'in-progress';
    buttonText?: string;
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'complete':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const content = (
        <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                {getStatusIcon()}
            </div>

            <div className="text-5xl mb-6">{icon}</div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{title}</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">{description}</p>

            <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${gradient} text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold group-hover:shadow-lg`}>
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
};

const OnboardingActionCard = ({ onboardingStatus }) => {
    const getStatus = () => {
        if (onboardingStatus.loading) return 'pending';
        if (onboardingStatus.isCompleted) return 'complete';
        if (onboardingStatus.currentStep > 0) return 'in-progress';
        return 'pending';
    };

    const getTitle = () => {
        if (onboardingStatus.isCompleted) return 'Your Profile';
        if (onboardingStatus.currentStep > 0) return 'Continue Your Profile';
        return 'Complete Your Profile';
    };

    const getButtonText = () => {
        if (onboardingStatus.loading) return 'Loading...';
        if (onboardingStatus.isCompleted) return 'Edit Profile';
        if (onboardingStatus.currentStep > 0) return 'Continue Profile';
        return 'Start Profile';
    };

    const getDescription = () => {
        if (onboardingStatus.isCompleted) {
            return `Profile complete! ${onboardingStatus.profileCompleteness}% of information filled out. You can update your preferences anytime.`;
        }
        if (onboardingStatus.currentStep > 0) {
            return `Continue where you left off (Step ${onboardingStatus.currentStep} of 4).`;
        }
        return "Tell us about your financial goals, interests, and lifestyle to get personalized AI recommendations.";
    };

    const getIcon = () => {
        if (onboardingStatus.isCompleted) return '✅';
        if (onboardingStatus.currentStep > 0) return '⏳';
        return '👤';
    };

    return (
        <ActionCard
            title={getTitle()}
            description={getDescription()}
            icon={getIcon()}
            href="/onboarding"
            gradient="from-indigo-500 to-purple-600"
            status={getStatus()}
            buttonText={getButtonText()}
        />
    );
};

const QuickActionCard = ({ title, description, href, gradient, icon: Icon }: {
    title: string;
    description: string;
    href: string;
    gradient: string;
    icon: React.ComponentType<any>;
}) => (
    <Link href={href} className="group">
        <div className={`bg-gradient-to-r ${gradient} p-8 rounded-3xl text-white hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden`}>
            <div className="absolute -top-4 -right-4 opacity-20">
                <Icon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-white/90 leading-relaxed">{description}</p>
            </div>
        </div>
    </Link>
);

export default function DashboardClient({ user }: DashboardClientProps) {
    const [stats, setStats] = useState<Stats>({
        accountsConnected: 0,
        transactionsTracked: 0,
        totalBalance: 0,
        monthlyExpenses: 0
    });

    const [onboardingStatus, setOnboardingStatus] = useState({
        isCompleted: false,
        currentStep: 0,
        profileCompleteness: 0,
        loading: true
    });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchOnboardingStatus = async () => {
            try {
                const response = await fetch('/api/onboarding/status');
                if (response.ok) {
                    const data = await response.json();
                    setOnboardingStatus({
                        ...data,
                        loading: false
                    });
                } else {
                    setOnboardingStatus(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Error fetching onboarding status:', error);
                setOnboardingStatus(prev => ({ ...prev, loading: false }));
            }
        };

        fetchOnboardingStatus();
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

    const OnboardingSuccessMessage = () => {
        const [showSuccess, setShowSuccess] = useState(false);

        useEffect(() => {
            // Check if user just completed onboarding
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('onboarding') === 'complete') {
                setShowSuccess(true);
                // Clean up URL without refreshing
                window.history.replaceState({}, document.title, window.location.pathname);

                // Auto-hide after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);
            }
        }, []);

        if (!showSuccess) return null;

        return (
            <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl flex items-center space-x-4 animate-slide-in-right max-w-sm">
                <div className="bg-white/20 p-2 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg">Profile Complete!</p>
                    <p className="text-sm text-green-100">Your financial journey starts now 🎉</p>
                </div>
                <button
                    onClick={() => setShowSuccess(false)}
                    className="text-green-100 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    };
    const ReturningUserMessage = () => {
        const [showWelcome, setShowWelcome] = useState(false);

        useEffect(() => {
            // Check if user is returning from onboarding redirect
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('returning') === 'true') {
                setShowWelcome(true);
                // Clean up URL without refreshing
                window.history.replaceState({}, document.title, window.location.pathname);

                // Auto-hide after 4 seconds
                setTimeout(() => setShowWelcome(false), 4000);
            }
        }, []);

        if (!showWelcome) return null;

        return (
            <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-2xl flex items-center space-x-4 animate-slide-in-right max-w-sm">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg">Welcome Back!</p>
                    <p className="text-sm text-blue-100">Your profile is all set up 👋</p>
                </div>
                <button
                    onClick={() => setShowWelcome(false)}
                    className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
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

    // Determine completion status
    const hasAccounts = stats.accountsConnected > 0;
    const hasTransactions = stats.transactionsTracked > 0;

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
                                <p className="text-sm text-gray-500 font-medium">Dashboard</p>
                            </div>
                        </div>

                        {/* Enhanced Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
                            <Link href="/" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/50">
                                Setup
                            </Link>
                            <Link href="/analytics" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/50">
                                Analytics
                            </Link>
                            <Link href="/budgets" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/50">
                                Budgets
                            </Link>
                            <Link href="/goals" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/50">
                                Goals
                            </Link>
                            <Link href="/insights" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                                <Brain className="w-4 h-4" />
                                <span>AI Insights</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">Welcome back,</div>
                                <div className="text-sm text-gray-600">{user.name}</div>
                            </div>
                            {user.image && (
                                <img
                                    src={user.image}
                                    alt={user.name || ""}
                                    className="h-10 w-10 rounded-2xl shadow-lg"
                                />
                            )}
                            <button
                                onClick={async () => {
                                    try {
                                        // First try NextAuth signOut
                                        await signOut({ redirect: false });

                                        // Then manually redirect to clear any cached state
                                        window.location.href = '/';
                                    } catch (error) {
                                        console.error('Sign out error:', error);

                                        // If NextAuth fails, try manual API call
                                        try {
                                            const response = await fetch('/api/auth/signout', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                }
                                            });

                                            if (response.ok) {
                                                window.location.href = '/';
                                            } else {
                                                throw new Error('API signout failed');
                                            }
                                        } catch (apiError) {
                                            console.error('API signout error:', apiError);
                                            // Force redirect as last resort
                                            window.location.href = '/';
                                        }
                                    }
                                }}
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100/50"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <OnboardingSuccessMessage />
            <ReturningUserMessage />
            {/* Main Content */}
            <main className="relative max-w-screen-2xl mx-auto p-6 lg:p-8 space-y-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
                        <Sparkles className="w-4 h-4" />
                        <span>Your Financial Journey Starts Here</span>
                    </div>
                    <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
                        Welcome to SaveLoom!
                    </h1>
                    <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform your financial future with AI-powered insights, smart budgeting, and personalized recommendations.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <StatCard
                        title="Accounts Connected"
                        value={stats.accountsConnected.toString()}
                        icon={CreditCard}
                        color="from-blue-500 to-indigo-600"
                        trend={stats.accountsConnected > 0 ? 'up' : undefined}
                    />
                    <StatCard
                        title="Transactions Tracked"
                        value={stats.transactionsTracked.toString()}
                        icon={BarChart3}
                        color="from-green-500 to-emerald-600"
                        trend={stats.transactionsTracked > 0 ? 'up' : undefined}
                    />
                    <StatCard
                        title="Total Balance"
                        value={formatCurrency(stats.totalBalance)}
                        icon={Wallet}
                        color="from-purple-500 to-pink-600"
                        subtitle="Across all accounts"
                        trend="up"
                    />
                    <StatCard
                        title="Monthly Expenses"
                        value={formatCurrency(stats.monthlyExpenses)}
                        icon={PiggyBank}
                        color="from-orange-500 to-red-500"
                        subtitle="Last 30 days"
                        trend="stable"
                    />
                </div>

                {/* Setup Journey */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Complete Your Setup</h2>
                    <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        Follow these steps to unlock the full power of SaveLoom's AI-driven financial insights.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <OnboardingActionCard onboardingStatus={onboardingStatus} />

                        <ActionCard
                            title="Connect Your Bank"
                            description="Securely link your accounts for automatic transaction tracking and real-time insights."
                            icon="🏦"
                            gradient="from-green-500 to-emerald-600"
                            status={hasAccounts ? 'complete' : 'pending'}
                            buttonText={hasAccounts ? 'Add More Banks' : 'Connect Bank'}
                        />

                        <ActionCard
                            title="Explore Analytics"
                            description="Discover your spending patterns, trends, and AI-powered financial wellness insights."
                            icon="📊"
                            href="/analytics"
                            gradient="from-purple-500 to-pink-600"
                            status={hasTransactions ? 'complete' : 'pending'}
                            buttonText="View Analytics"
                        />
                    </div>
                </div>

                {/* Plaid Connection Section */}

                {!hasAccounts && (
                    <div className="relative mb-16 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl"></div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                        {/* Floating Elements */}
                        <div className="absolute top-8 left-8 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-8 right-8 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-white/20 rounded-full animate-bounce delay-500"></div>

                        <div className="relative p-12 lg:p-16 text-center">


                            <div className="relative mb-12">
                                <div className="relative inline-block">
                                    {/* Layered Background Circles */}
                                    <div className="absolute inset-0 w-28 h-28 bg-white/10 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                                    <div className="absolute inset-2 w-24 h-24 bg-white/15 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>

                                    {/* Main Icon Container */}
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30">
                                        <div className="relative">
                                            <div className="text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🏦</div>
                                            {/* Sparkle Effect */}
                                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Expanding Rings */}
                                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '4s' }}></div>
                                    <div className="absolute inset-2 rounded-full border border-white/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-4xl lg:text-5xl font-black mb-6 text-white leading-tight">
                                    Ready to Connect Your Bank?
                                </h3>
                                <p className="text-xl lg:text-2xl text-indigo-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                                    Connect your accounts securely to start tracking transactions and get personalized insights powered by AI.
                                </p>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
                                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl mb-3">🔒</div>
                                        <h4 className="font-bold text-white mb-2">Bank-Level Security</h4>
                                        <p className="text-indigo-100 text-sm">256-bit encryption & read-only access</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl mb-3">⚡</div>
                                        <h4 className="font-bold text-white mb-2">Real-Time Sync</h4>
                                        <p className="text-indigo-100 text-sm">Automatic transaction updates</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl mb-3">🤖</div>
                                        <h4 className="font-bold text-white mb-2">AI-Powered Insights</h4>
                                        <p className="text-indigo-100 text-sm">Personalized recommendations</p>
                                    </div>
                                </div>

                                {/* CTA Section */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto mb-8">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-300" />
                                            <span>Trusted by 10,000+ banks</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-300" />
                                            <span>No account passwords stored</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-300" />
                                            <span>Connect in under 30 seconds</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Plaid Link Button */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                    <div className="relative">
                                        <PlaidLink
                                            onSuccess={handlePlaidSuccess}
                                            className="transform hover:scale-105 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                {/* Bottom Text */}
                                <p className="text-indigo-200 text-sm mt-6 max-w-xl mx-auto">
                                    Powered by Plaid • Used by millions of apps •
                                    <span className="font-semibold"> Free to connect</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Quick Actions for Active Users */}
                {hasTransactions && (
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Quick Actions</h2>
                        <p className="text-xl text-gray-600 text-center mb-12">
                            Jump into your financial management tools
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <QuickActionCard
                                title="View Analytics"
                                description="Analyze your spending patterns, trends, and financial health with beautiful charts."
                                href="/analytics"
                                gradient="from-blue-500 to-indigo-600"
                                icon={BarChart3}
                            />
                            <QuickActionCard
                                title="AI Insights"
                                description="Get personalized recommendations and insights powered by Claude AI."
                                href="/insights"
                                gradient="from-purple-500 to-pink-600"
                                icon={Brain}
                            />
                            <QuickActionCard
                                title="Create Budget"
                                description="Set spending limits, track progress, and achieve your financial goals."
                                href="/budgets"
                                gradient="from-green-500 to-emerald-600"
                                icon={Target}
                            />
                            <QuickActionCard
                                title="Set Goals"
                                description="Plan for the future with smart savings goals and milestone tracking."
                                href="/goals"
                                gradient="from-orange-500 to-red-500"
                                icon={PiggyBank}
                            />
                        </div>
                    </div>
                )}

                {/* Connected Accounts and Transactions */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <CreditCard className="w-6 h-6 text-indigo-500 mr-3" />
                            Connected Accounts
                        </h3>
                        <ConnectedAccounts />
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <BarChart3 className="w-6 h-6 text-green-500 mr-3" />
                            Recent Transactions
                        </h3>
                        <TransactionHistory />
                    </div>
                </div>
            </main>
        </div>
    );
}