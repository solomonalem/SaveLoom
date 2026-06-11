"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    TrendingUp,
    TrendingDown,
    Shield,
    Target,
    DollarSign,
    PiggyBank,
    CreditCard,
    Calendar,
    Trophy,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    Star,
    Award,
    Loader2
} from 'lucide-react';

interface FinancialHealthData {
    overallScore: number;
    scores: {
        budgetHealth: number;
        savingsRate: number;
        debtManagement: number;
        spendingControl: number;
        incomeStability: number;
        emergencyFund: number;
    };
    trends: {
        scoreChange: number;
        period: string;
    };
    keyMetrics: {
        monthlyIncome: number;
        monthlyExpenses: number;
        savingsRate: number;
        debtToIncome: number;
        emergencyFundMonths: number;
        budgetUtilization: number;
    };
    goals: {
        emergencyFund: { current: number; target: number; progress: number };
        savings: { current: number; target: number; progress: number };
        debtPayoff: { current: number; target: number; progress: number };
    };
    achievements: Array<{
        id: string;
        title: string;
        description: string;
        icon: string;
        earned: boolean;
        earnedDate?: string;
    }>;
    quickActions: Array<{
        id: string;
        title: string;
        description: string;
        impact: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        estimatedSavings?: number;
    }>;
}

const ScoreRing = ({ score, size = 120, strokeWidth = 8, label }: {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981'; // green
        if (score >= 60) return '#F59E0B'; // yellow
        if (score >= 40) return '#F97316'; // orange
        return '#EF4444'; // red
    };

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getScoreColor(score)}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-black text-gray-900">{score}</div>
                {label && <div className="text-xs text-gray-500 font-medium">{label}</div>}
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend, subtitle }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    subtitle?: string;
}) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return null;
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                    <div className="text-white">{icon}</div>
                </div>
                {getTrendIcon()}
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600 font-medium">{title}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
    );
};

const ProgressBar = ({ label, current, target, color = "indigo" }: {
    label: string;
    current: number;
    target: number;
    color?: string;
}) => {
    const progress = Math.min((current / target) * 100, 100);

    const colorClasses = {
        indigo: 'from-indigo-500 to-purple-600',
        green: 'from-green-500 to-emerald-600',
        orange: 'from-orange-500 to-red-500'
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <span className="text-sm text-gray-500">
                    ${current.toLocaleString()} / ${target.toLocaleString()}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`h-3 bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="text-xs text-gray-500">{progress.toFixed(0)}% complete</div>
        </div>
    );
};

const AchievementBadge = ({ achievement }: { achievement: any }) => {
    return (
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${achievement.earned
            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 shadow-lg'
            : 'bg-gray-100 border-gray-300 opacity-60'
            }`}>
            <div className="text-center">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="font-bold text-sm text-gray-900">{achievement.title}</div>
                <div className="text-xs text-gray-600 mt-1">{achievement.description}</div>
                {achievement.earned && achievement.earnedDate && (
                    <div className="text-xs text-yellow-600 mt-2 font-medium">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
};

const QuickActionCard = ({ action, onTakeAction }: {
    action: any;
    onTakeAction: (actionId: string) => void;
}) => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'from-red-500 to-pink-500';
            case 'high': return 'from-orange-500 to-red-500';
            case 'medium': return 'from-blue-500 to-indigo-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    const getPriorityLabel = (priority: string) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <div className="text-sm text-green-600 font-semibold">{action.impact}</div>
                    {action.estimatedSavings && (
                        <div className="text-xs text-gray-500 mt-1">
                            Potential savings: ${action.estimatedSavings}/month
                        </div>
                    )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPriorityColor(action.priority)}`}>
                    {getPriorityLabel(action.priority)}
                </div>
            </div>
            <button
                onClick={() => onTakeAction(action.id)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
                Take Action
            </button>
        </div>
    );
};

export default function FinancialHealthDashboard() {
    const [healthData, setHealthData] = useState<FinancialHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch financial health data
    const fetchHealthData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching financial health data...');

            const response = await fetch('/api/financial-health');

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Financial health data received:', data);
                setHealthData(data);
                setError(null);
            } else {
                setError('Unable to load real financial data');
                return; // No fallback to mock
            }
        } catch (error) {
            console.error('❌ Error fetching health data:', error);
            setError('Error loading financial health data');

        } finally {
            setLoading(false);
        }
    };


    // Handle action clicks
    const handleTakeAction = (actionId: string) => {
        console.log('🎯 Taking action:', actionId);

        // Route to appropriate action based on ID
        switch (actionId) {
            case 'budget_setup':
            case 'set_food_budget':
                window.location.href = '/budgets';
                break;
            case 'emergency_fund':
            case 'increase_savings':
                // Could open a modal or navigate to savings setup
                alert('💰 Great choice! Let\'s help you increase your savings rate.');
                break;
            case 'subscription_review':
            case 'review_netflix':
                // Could integrate with subscription detection
                alert('💳 We\'ll help you identify unused subscriptions to cancel.');
                break;
            case 'spending_review':
                window.location.href = '/analytics';
                break;
            default:
                alert('🚀 This feature is coming soon!');
        }
    };

    useEffect(() => {
        fetchHealthData();
    }, []);

    const getScoreEmoji = (score: number) => {
        if (score >= 90) return '🏆';
        if (score >= 80) return '🎉';
        if (score >= 70) return '👍';
        if (score >= 60) return '🤔';
        return '⚠️';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Attention';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4 mx-auto"></div>
                        <Heart className="w-8 h-8 text-indigo-500 absolute top-4 left-1/2 transform -translate-x-1/2" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Calculating Your Financial Health</h3>
                    <p className="text-gray-600">Analyzing your spending patterns and financial data...</p>
                </div>
            </div>
        );
    }

    if (error && !healthData) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Financial Health</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchHealthData}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!healthData) return null;

    return (
        <div className="space-y-8">
            {/* Error Banner */}
            {error && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-2xl">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span className="text-sm">Using sample data. Connect your bank accounts for real insights.</span>
                    </div>
                </div>
            )}

            {/* Header with Overall Score */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <ScoreRing score={healthData.overallScore} size={160} strokeWidth={12} />
                        <div className="absolute -top-4 -right-4 text-4xl">
                            {getScoreEmoji(healthData.overallScore)}
                        </div>
                    </div>
                </div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Financial Health Score
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                    {getScoreLabel(healthData.overallScore)} Financial Wellness
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm">
                    {healthData.trends.scoreChange > 0 ? (
                        <>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-semibold">
                                +{healthData.trends.scoreChange} points {healthData.trends.period}
                            </span>
                        </>
                    ) : healthData.trends.scoreChange < 0 ? (
                        <>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 font-semibold">
                                {healthData.trends.scoreChange} points {healthData.trends.period}
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-600 font-semibold">
                            No change {healthData.trends.period}
                        </span>
                    )}
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Monthly Income"
                    value={`$${healthData.keyMetrics.monthlyIncome.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6" />}
                    trend="up"
                />
                <MetricCard
                    title="Savings Rate"
                    value={`${healthData.keyMetrics.savingsRate.toFixed(1)}%`}
                    icon={<PiggyBank className="w-6 h-6" />}
                    trend={healthData.keyMetrics.savingsRate >= 20 ? "up" : "down"}
                    subtitle={healthData.keyMetrics.savingsRate >= 20 ? "Above average!" : "Target: 20%"}
                />
                <MetricCard
                    title="Emergency Fund"
                    value={`${healthData.keyMetrics.emergencyFundMonths.toFixed(1)} months`}
                    icon={<Shield className="w-6 h-6" />}
                    trend={healthData.keyMetrics.emergencyFundMonths >= 3 ? "up" : "down"}
                    subtitle="Target: 6 months"
                />
                <MetricCard
                    title="Budget Usage"
                    value={`${healthData.keyMetrics.budgetUtilization.toFixed(0)}%`}
                    icon={<Target className="w-6 h-6" />}
                    trend={healthData.keyMetrics.budgetUtilization <= 80 ? "up" : "down"}
                    subtitle={healthData.keyMetrics.budgetUtilization <= 80 ? "On track" : "Over budget"}
                />
            </div>

            {/* Score Breakdown */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Heart className="w-6 h-6 text-red-500 mr-3" />
                    Health Score Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(healthData.scores).map(([key, score]) => {
                        const labels = {
                            budgetHealth: 'Budget Health',
                            savingsRate: 'Savings Rate',
                            debtManagement: 'Debt Management',
                            spendingControl: 'Spending Control',
                            incomeStability: 'Income Stability',
                            emergencyFund: 'Emergency Fund'
                        };

                        return (
                            <div key={key} className="text-center">
                                <ScoreRing score={Math.round(score)} size={100} strokeWidth={6} />
                                <div className="mt-3 text-sm font-semibold text-gray-700">
                                    {labels[key as keyof typeof labels]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Goals Progress */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Target className="w-6 h-6 text-blue-500 mr-3" />
                    Goal Progress
                </h3>

                <div className="space-y-6">
                    <ProgressBar
                        label="Emergency Fund"
                        current={healthData.goals.emergencyFund.current}
                        target={healthData.goals.emergencyFund.target}
                        color="indigo"
                    />
                    <ProgressBar
                        label="Savings Goal"
                        current={healthData.goals.savings.current}
                        target={healthData.goals.savings.target}
                        color="green"
                    />
                    <ProgressBar
                        label="Debt Payoff"
                        current={healthData.goals.debtPayoff.target - healthData.goals.debtPayoff.current}
                        target={healthData.goals.debtPayoff.target}
                        color="orange"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 text-yellow-500 mr-3" />
                    Quick Actions to Improve Your Score
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healthData.quickActions.map((action) => (
                        <QuickActionCard
                            key={action.id}
                            action={action}
                            onTakeAction={handleTakeAction}
                        />
                    ))}
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-6 h-6 text-purple-500 mr-3" />
                    Financial Achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {healthData.achievements.map((achievement) => (
                        <AchievementBadge key={achievement.id} achievement={achievement} />
                    ))}
                </div>
            </div>

            {/* AI Integration Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center">
                            🤖 Claude AI Analysis
                        </h3>
                        <p className="text-indigo-100 mb-4">
                            Your financial health score is powered by Claude AI analysis of your spending patterns,
                            budget performance, and financial behaviors.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => window.location.href = '/insights'}
                                className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                View AI Insights
                            </button>
                            <button
                                onClick={fetchHealthData}
                                className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300"
                            >
                                Refresh Analysis
                            </button>
                        </div>
                    </div>
                    <div className="text-6xl opacity-50">🧠</div>
                </div>
            </div>

            {/* Tips Section */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 text-yellow-500 mr-3" />
                    Financial Health Tips
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Build Your Emergency Fund</h4>
                                <p className="text-sm text-gray-600">Aim for 3-6 months of expenses in a high-yield savings account.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Track Your Spending</h4>
                                <p className="text-sm text-gray-600">Monitor where your money goes to identify saving opportunities.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Automate Your Savings</h4>
                                <p className="text-sm text-gray-600">Set up automatic transfers to make saving effortless.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Pay Down High-Interest Debt</h4>
                                <p className="text-sm text-gray-600">Focus on credit cards and personal loans first.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Review Subscriptions Monthly</h4>
                                <p className="text-sm text-gray-600">Cancel services you don't actively use.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Set Realistic Budgets</h4>
                                <p className="text-sm text-gray-600">Base budgets on actual spending patterns, not wishful thinking.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}