"use client";

import Link from "next/link";
import PlaidLink from "./PlaidLink";
import ConnectedAccounts from "./ConnectedAccounts";
import TransactionHistory from "./TransactionHistory";
import AppNav from "./AppNav";
import PageShell from "./PageShell";
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
    Shield,
    Zap,
    AlertCircle,
    X,
    User,
    Building2,
    ChevronDown,
    DollarSign,
    Activity,
} from 'lucide-react';
import { buttons, iconBadge, surfaces, typography } from "~/lib/design";

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

const SectionHeader = ({ title, defaultOpen = true }: { title: string; defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);
    return { open, header: (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-between pb-3"
        >
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
    )};
};

const DashStatCard = ({ title, value, subtitle, icon: Icon, trend, iconBg = "bg-indigo-50/80", iconColor = "text-indigo-600" }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
    iconBg?: string;
    iconColor?: string;
}) => (
    <div className="glass-card rounded-2xl p-5 transition-all hover:shadow-lg hover:border-white/80">
        <div className="mb-3 flex items-start justify-between">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
                <Icon className="h-5 w-5" />
            </div>
            {trend !== undefined && (
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    trend > 0 ? "trend-badge-up" : trend < 0 ? "trend-badge-down" : "bg-slate-100/80 text-slate-500"
                }`}>
                    {trend > 0 ? "+" : ""}{trend}%
                </span>
            )}
        </div>
        <p className="mb-1 text-sm font-medium text-slate-500">{title}</p>
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
);

const SetupStep = ({ title, description, icon: Icon, href, status, buttonText }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    status: 'pending' | 'complete' | 'in-progress';
    buttonText: string;
}) => {
    const statusIcon = status === 'complete'
        ? <CheckCircle className="h-5 w-5 text-emerald-500" />
        : status === 'in-progress'
        ? <Clock className="h-5 w-5 text-amber-500" />
        : <AlertCircle className="h-5 w-5 text-slate-300" />;

    const content = (
        <div className="glass-card rounded-2xl p-5 transition-all hover:shadow-lg hover:border-white/80">
            <div className="mb-3 flex items-center justify-between">
                <div className={iconBadge.sm}>
                    <Icon className="h-4 w-4" />
                </div>
                {statusIcon}
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-500">{description}</p>
            <div className={`${buttons.primary} w-fit text-xs`}>
                <span>{buttonText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
            </div>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
};

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

    const [sectionsOpen, setSectionsOpen] = useState({
        overview: true,
        accounts: true,
        history: true,
    });

    const toggleSection = (key: keyof typeof sectionsOpen) =>
        setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));

    useEffect(() => { fetchStats(); }, []);

    useEffect(() => {
        const fetchOnboardingStatus = async () => {
            try {
                const response = await fetch('/api/onboarding/status');
                if (response.ok) {
                    const data = await response.json();
                    setOnboardingStatus({ ...data, loading: false });
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

            const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.currentBalance, 0);
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
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('onboarding') === 'complete') {
                setShowSuccess(true);
                window.history.replaceState({}, document.title, window.location.pathname);
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
                    <p className="text-sm text-green-100">Your financial journey starts now</p>
                </div>
                <button onClick={() => setShowSuccess(false)} className="text-green-100 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const ReturningUserMessage = () => {
        const [showWelcome, setShowWelcome] = useState(false);

        useEffect(() => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('returning') === 'true') {
                setShowWelcome(true);
                window.history.replaceState({}, document.title, window.location.pathname);
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
                    <p className="text-sm text-blue-100">Your profile is all set up</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const handlePlaidSuccess = () => {
        window.location.reload();
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    const hasAccounts = stats.accountsConnected > 0;
    const hasTransactions = stats.transactionsTracked > 0;

    const getOnboardingSetup = () => {
        const status = onboardingStatus.loading ? 'pending'
            : onboardingStatus.isCompleted ? 'complete'
            : onboardingStatus.currentStep > 0 ? 'in-progress'
            : 'pending';
        const title = onboardingStatus.isCompleted ? 'Your Profile'
            : onboardingStatus.currentStep > 0 ? 'Continue Profile'
            : 'Complete Profile';
        const buttonText = onboardingStatus.loading ? 'Loading...'
            : onboardingStatus.isCompleted ? 'Edit Profile'
            : onboardingStatus.currentStep > 0 ? 'Continue'
            : 'Start';
        const description = onboardingStatus.isCompleted
            ? `Profile complete! ${onboardingStatus.profileCompleteness}% filled.`
            : onboardingStatus.currentStep > 0
            ? `Continue where you left off (Step ${onboardingStatus.currentStep} of 4).`
            : "Tell us about your financial goals for personalized AI recommendations.";
        return { status, title, buttonText, description };
    };

    const onboarding = getOnboardingSetup();

    return (
        <PageShell>
            <AppNav subtitle="Dashboard" user={user} />
            <OnboardingSuccessMessage />
            <ReturningUserMessage />

            <div className="sidebar-content">
                <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8">

                    {/* Stats Cards */}
                    <section>
                        <button type="button" onClick={() => toggleSection('overview')} className="flex w-full items-center justify-between pb-3">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">Overview</h2>
                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${sectionsOpen.overview ? "" : "-rotate-90"}`} />
                        </button>
                        {sectionsOpen.overview && (
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <DashStatCard
                                    title="Accounts Connected"
                                    value={stats.accountsConnected.toString()}
                                    icon={CreditCard}
                                    trend={stats.accountsConnected > 0 ? 42 : 0}
                                    iconBg="bg-indigo-50/80"
                                    iconColor="text-indigo-600"
                                    subtitle="Active bank accounts"
                                />
                                <DashStatCard
                                    title="Transactions"
                                    value={stats.transactionsTracked.toString()}
                                    icon={BarChart3}
                                    trend={stats.transactionsTracked > 0 ? 22 : 0}
                                    iconBg="bg-emerald-50/80"
                                    iconColor="text-emerald-600"
                                    subtitle="Tracked this month"
                                />
                                <DashStatCard
                                    title="Total Balance"
                                    value={formatCurrency(stats.totalBalance)}
                                    icon={Wallet}
                                    trend={5}
                                    iconBg="bg-violet-50/80"
                                    iconColor="text-violet-600"
                                    subtitle="Across all accounts"
                                />
                                <DashStatCard
                                    title="Monthly Expenses"
                                    value={formatCurrency(stats.monthlyExpenses)}
                                    icon={PiggyBank}
                                    trend={-3}
                                    iconBg="bg-amber-50/80"
                                    iconColor="text-amber-600"
                                    subtitle="Last 30 days"
                                />
                            </div>
                        )}
                    </section>

                    {/* Financial Overview — purple hero card + smaller cards */}
                    <section>
                        <button type="button" onClick={() => toggleSection('accounts')} className="flex w-full items-center justify-between pb-3">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">Financial Overview</h2>
                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${sectionsOpen.accounts ? "" : "-rotate-90"}`} />
                        </button>
                        {sectionsOpen.accounts && (
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {/* Purple Hero Card */}
                                <div className="hero-card-purple p-6 lg:row-span-2">
                                    <div className="relative z-10 flex h-full flex-col justify-between">
                                        <div>
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                                <DollarSign className="h-6 w-6" />
                                            </div>
                                            <p className="mb-1 text-sm font-medium text-white/70">Net Worth</p>
                                            <div className="text-3xl font-bold tracking-tight">
                                                {formatCurrency(stats.totalBalance)}
                                            </div>
                                            <p className="mt-1 text-sm text-white/60">
                                                {formatCurrency(stats.totalBalance - stats.monthlyExpenses)} after expenses
                                            </p>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                                <span className="text-sm text-white/80">Savings Rate</span>
                                                <span className="text-sm font-semibold">
                                                    {stats.totalBalance > 0
                                                        ? `${Math.round(((stats.totalBalance - stats.monthlyExpenses) / stats.totalBalance) * 100)}%`
                                                        : "—"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                                <span className="text-sm text-white/80">Accounts</span>
                                                <span className="text-sm font-semibold">{stats.accountsConnected}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Connected Accounts Card */}
                                <div className="glass-card rounded-2xl p-5 lg:col-span-2">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <CreditCard className="h-4 w-4 text-indigo-600" />
                                            Connected Accounts
                                        </h3>
                                        {!hasAccounts && <PlaidLink onSuccess={handlePlaidSuccess} />}
                                    </div>
                                    <ConnectedAccounts />
                                </div>

                                {/* Quick Actions */}
                                <div className="glass-card rounded-2xl p-5 lg:col-span-2">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Zap className="h-4 w-4 text-indigo-600" />
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {[
                                            { href: "/analytics", icon: BarChart3, label: "Analytics" },
                                            { href: "/insights", icon: Brain, label: "AI Insights" },
                                            { href: "/budgets", icon: Target, label: "Budgets" },
                                            { href: "/goals", icon: PiggyBank, label: "Goals" },
                                        ].map(({ href, icon: QIcon, label }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                className="group flex flex-col items-center gap-2 rounded-xl bg-white/50 px-3 py-4 ring-1 ring-slate-200/40 transition-all hover:bg-white hover:shadow-md hover:ring-indigo-200/50"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50/80 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                                                    <QIcon className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-700">{label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Setup Steps (shown if not all complete) */}
                    {(!hasAccounts || !onboardingStatus.isCompleted) && (
                        <section>
                            <h2 className="pb-3 text-lg font-bold tracking-tight text-slate-900">Complete Setup</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <SetupStep
                                    title={onboarding.title}
                                    description={onboarding.description}
                                    icon={onboardingStatus.isCompleted ? CheckCircle : onboardingStatus.currentStep > 0 ? Clock : User}
                                    href="/onboarding"
                                    status={onboarding.status as 'pending' | 'complete' | 'in-progress'}
                                    buttonText={onboarding.buttonText}
                                />
                                <SetupStep
                                    title="Connect your bank"
                                    description="Securely link accounts for automatic transaction tracking."
                                    icon={Building2}
                                    status={hasAccounts ? 'complete' : 'pending'}
                                    buttonText={hasAccounts ? 'Add more' : 'Connect'}
                                />
                                <SetupStep
                                    title="Explore analytics"
                                    description="Discover spending patterns and financial insights."
                                    icon={BarChart3}
                                    href="/analytics"
                                    status={hasTransactions ? 'complete' : 'pending'}
                                    buttonText="View"
                                />
                            </div>
                        </section>
                    )}

                    {/* Bank Connection CTA */}
                    {!hasAccounts && (
                        <div className="hero-card-purple p-6 text-center lg:p-8">
                            <div className="relative z-10">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold tracking-tight">
                                    Connect your bank to get started
                                </h3>
                                <p className="mx-auto mb-5 max-w-2xl text-sm text-white/70">
                                    Link accounts securely with Plaid to sync transactions and unlock AI insights.
                                </p>
                                <div className="mx-auto mb-5 grid max-w-3xl grid-cols-1 gap-2 md:grid-cols-3">
                                    {[
                                        { icon: Shield, label: "Bank-level security" },
                                        { icon: Zap, label: "Real-time sync" },
                                        { icon: Brain, label: "AI-powered insights" },
                                    ].map(({ icon: FeatureIcon, label }) => (
                                        <div key={label} className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-sm">
                                            <FeatureIcon className="h-4 w-4 text-indigo-200" />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <PlaidLink onSuccess={handlePlaidSuccess} />
                                <p className="mt-6 text-sm text-white/40">Powered by Plaid · Read-only access</p>
                            </div>
                        </div>
                    )}

                    {/* History / Transactions */}
                    <section>
                        <button type="button" onClick={() => toggleSection('history')} className="flex w-full items-center justify-between pb-3">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">History</h2>
                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${sectionsOpen.history ? "" : "-rotate-90"}`} />
                        </button>
                        {sectionsOpen.history && (
                            <div className="glass-card rounded-2xl p-5">
                                <TransactionHistory />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </PageShell>
    );
}
