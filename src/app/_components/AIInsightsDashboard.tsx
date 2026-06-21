"use client";

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, Target, Coffee, CreditCard, Lightbulb, RefreshCw, Trash, Heart, Sparkles } from 'lucide-react';
import RecommendationsDashboard from './RecommendationsDashboard';
import FinancialHealthDashboard from './FinancialHealthDashboard';
import AppNav from './AppNav';
import PageShell from './PageShell';
import { useAppModal } from '~/app/_components/modal/ModalProvider';
import { buttons, iconBadge, iconBadgeTint, layout, summaryStat, surfaces, typography } from '~/lib/design';
import { parseApiError } from '~/lib/parse-api-error';

interface AIInsight {
    id: string;
    type: string;
    title: string;
    content: string;
    timeframe: string;
    metric?: string;
    value?: number;
    change?: number;
    chartData?: any;
    createdAt: string;
}

const InsightCard = ({ insight, onDelete }: { insight: AIInsight; onDelete: (id: string) => void }) => {
    const getInsightIcon = () => {
        switch (insight.type) {
            case 'spending_trend':
                return insight.change && insight.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
            case 'subscription_optimization':
                return <CreditCard className="h-4 w-4" />;
            case 'budget_alert':
                return <AlertTriangle className="h-4 w-4" />;
            case 'budget_performance':
                return <Target className="h-4 w-4" />;
            case 'saving_opportunity':
                return <Coffee className="h-4 w-4" />;
            case 'spending_alert':
                return <DollarSign className="h-4 w-4" />;
            case 'income_analysis':
                return <Calendar className="h-4 w-4" />;
            case 'category_analysis':
                return <Target className="h-4 w-4" />;
            default:
                return <Lightbulb className="h-4 w-4" />;
        }
    };

    const getInsightTone = (): 'indigo' | 'emerald' | 'red' | 'amber' | 'slate' => {
        switch (insight.type) {
            case 'spending_trend':
                return insight.change && insight.change > 0 ? 'red' : 'emerald';
            case 'subscription_optimization':
                return 'indigo';
            case 'budget_alert':
            case 'spending_alert':
                return 'red';
            case 'budget_performance':
            case 'saving_opportunity':
                return 'emerald';
            case 'income_analysis':
                return 'indigo';
            case 'category_analysis':
                return 'amber';
            default:
                return 'slate';
        }
    };

    const tone = getInsightTone();

    const formatValue = (value: number | undefined, metric: string | undefined) => {
        if (value === undefined || value === null) return '';

        // Convert to number if it's not already
        const numValue = typeof value === 'number' ? value : parseFloat(value?.toString() || '0');

        // Check if the conversion resulted in a valid number
        if (isNaN(numValue)) return '';

        switch (metric) {
            case 'spending':
            case 'subscription_cost':
            case 'potential_savings':
            case 'large_purchase':
            case 'small_purchases':
                return `${numValue.toFixed(2)}`;
            case 'budget_usage':
            case 'category_percentage':
            case 'income_stability':
                return `${numValue.toFixed(1)}%`;
            default:
                return numValue.toString();
        }
    };

    return (
        <div className={`${surfaces.cardHover} group p-4`}>
            <div className="flex items-start gap-3">
                <div className={iconBadgeTint(tone)}>
                    {getInsightIcon()}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-tight text-slate-900">
                            {insight.title}
                        </h3>
                        {insight.value && insight.metric && (
                            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-700">
                                {formatValue(insight.value, insight.metric)}
                            </span>
                        )}
                    </div>

                    <p className="mb-2 text-xs leading-relaxed text-slate-600">
                        {insight.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                            {insight.timeframe.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                            <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                            <button
                                onClick={() => onDelete(insight.id)}
                                className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                title="Delete insight"
                            >
                                <Trash className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InsightTypeFilter = ({ types, selectedType, onTypeChange }: {
    types: string[];
    selectedType: string;
    onTypeChange: (type: string) => void;
}) => {
    const typeLabels: { [key: string]: string } = {
        all: 'All Insights',
        spending_trend: 'Spending Trends',
        subscription_optimization: 'Subscriptions',
        budget_alert: 'Budget Alerts',
        budget_performance: 'Budget Performance',
        saving_opportunity: 'Savings',
        spending_alert: 'Spending Alerts',
        income_analysis: 'Income',
        category_analysis: 'Categories'
    };

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {['all', ...types].map((type) => (
                <button
                    key={type}
                    onClick={() => onTypeChange(type)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selectedType === type
                        ? 'bg-indigo-500/[0.08] text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    {typeLabels[type] || type}
                </button>
            ))}
        </div>
    );
};

export default function AIInsightsDashboard() {
    const { showAlert, showConfirm } = useAppModal();
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [activeTab, setActiveTab] = useState('insights'); // Can be 'insights', 'recommendations', or 'health'
    const [generating, setGenerating] = useState(false);

    // Delete insight handler
    const handleDeleteInsight = async (insightId: string) => {
        const confirmed = await showConfirm({
            title: 'Delete insight',
            message: 'Are you sure you want to delete this insight? This action cannot be undone.',
            confirmLabel: 'Delete',
            destructive: true,
            variant: 'warning',
        });
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/ai/insights/${insightId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setInsights(prev => prev.filter(insight => insight.id !== insightId));
                await showAlert({
                    title: 'Insight deleted',
                    message: 'The insight has been removed.',
                    variant: 'success',
                });
            } else {
                await showAlert({
                    title: 'Delete failed',
                    message: await parseApiError(response, 'Failed to delete insight'),
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting insight:', error);
            await showAlert({
                title: 'Delete failed',
                message: 'An unexpected error occurred while deleting the insight.',
                variant: 'error',
            });
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            console.log('🔍 Starting to fetch insights...');

            const response = await fetch('/api/ai/insights');
            console.log('🔍 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();

                // Check multiple possible response structures
                let realInsights = [];

                if (data.insights && Array.isArray(data.insights)) {
                    realInsights = data.insights;
                } else if (Array.isArray(data)) {
                    realInsights = data;
                } else if (data.data && Array.isArray(data.data)) {
                    realInsights = data.data;
                }

                if (realInsights.length > 0) {
                    setInsights(realInsights);
                }
            } else {
                console.error('❌ API failed with status:', response.status);
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);

            }
        } catch (error) {
            console.error('❌ Error fetching insights:', error);

        } finally {
            setLoading(false);
        }
    };

    const generateInsights = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-insights', {
                method: 'POST',
            });

            if (response.ok) {
                await fetchInsights();
                await showAlert({
                    title: 'Insights generated',
                    message: 'New AI insights and recommendations are ready to review.',
                    variant: 'success',
                });
            } else {
                await showAlert({
                    title: 'Generation failed',
                    message: await parseApiError(response, 'Failed to generate insights. Please try again.'),
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error generating insights:', error);
            await showAlert({
                title: 'Generation failed',
                message: 'An unexpected error occurred while generating insights.',
                variant: 'error',
            });
        } finally {
            setGenerating(false);
        }
    };

    const filteredInsights = selectedType === 'all'
        ? insights
        : insights.filter(insight => insight.type === selectedType);

    const uniqueTypes = Array.from(new Set(insights.map(insight => insight.type)));
    const potentialSavings = insights
        .filter(i => i.type === 'subscription_optimization' || i.type === 'saving_opportunity')
        .reduce((sum, i) => sum + (typeof i.value === 'number' ? i.value : 0), 0);

    if (loading) {
        return (
            <PageShell>
                <AppNav subtitle="Insights" />
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                            <Brain className="h-6 w-6 animate-pulse text-indigo-600" />
                        </div>
                        <p className="font-medium text-slate-900">Analyzing your data</p>
                        <p className="mt-1 text-sm text-slate-500">Generating personalized insights...</p>
                    </div>
                </div>
            </PageShell>
        );
    }

    const navActions = (
        <button
            onClick={generateInsights}
            disabled={generating}
            className={buttons.primary}
        >
            <Brain className="h-4 w-4" />
            <span>{generating ? 'Generating...' : 'Generate new'}</span>
        </button>
    );

    const tabClass = (active: boolean) =>
        `${buttons.ghost} ${active ? 'bg-indigo-500/[0.08] text-indigo-700 hover:bg-indigo-500/[0.08] hover:text-indigo-700' : ''}`;

    return (
        <PageShell>
            <AppNav subtitle="Insights" actions={navActions} />

            <div className={layout.page}>
                <div className="mb-6 text-center">
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <div className={iconBadge.md}>
                            <Brain className="h-5 w-5" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3 text-indigo-600" />
                            Powered by Claude
                        </span>
                    </div>
                    <h1 className={`${typography.pageTitle} mb-2`}>AI financial insights</h1>
                    <p className={`${typography.pageSubtitle} mx-auto max-w-2xl`}>
                        Personalized analysis of your spending patterns and actionable recommendations.
                    </p>
                </div>

                <div className="mb-6 flex justify-center">
                    <div className={`${surfaces.card} inline-flex gap-1 p-1`}>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={tabClass(activeTab === 'insights')}
                        >
                            <Brain className="h-4 w-4" />
                            <span>Insights</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('recommendations')}
                            className={tabClass(activeTab === 'recommendations')}
                        >
                            <Target className="h-4 w-4" />
                            <span>Recommendations</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('health')}
                            className={tabClass(activeTab === 'health')}
                        >
                            <Heart className="h-4 w-4" />
                            <span>Health score</span>
                        </button>
                    </div>
                </div>

                {/* Conditional Content Based on Active Tab */}
                {activeTab === 'insights' ? (
                    <>
                        {/* Summary Cards */}
                        <div className={`${layout.gridStats} mb-6 md:grid-cols-3`}>
                            <div className={summaryStat.card}>
                                <div className="mb-2 flex items-center justify-between">
                                    <p className={typography.label}>Total insights</p>
                                    <div className={iconBadge.sm}><Lightbulb className="h-4 w-4" /></div>
                                </div>
                                <p className={summaryStat.value}>{insights.length}</p>
                                <p className={summaryStat.sub}>AI-generated recommendations</p>
                            </div>
                            <div className={summaryStat.card}>
                                <div className="mb-2 flex items-center justify-between">
                                    <p className={typography.label}>Action items</p>
                                    <div className={iconBadge.danger}><AlertTriangle className="h-4 w-4" /></div>
                                </div>
                                <p className={`${summaryStat.value} text-red-600`}>
                                    {insights.filter(i => ['budget_alert', 'spending_alert', 'subscription_optimization'].includes(i.type)).length}
                                </p>
                                <p className={summaryStat.sub}>Require your attention</p>
                            </div>
                            <div className={summaryStat.card}>
                                <div className="mb-2 flex items-center justify-between">
                                    <p className={typography.label}>Potential savings</p>
                                    <div className={iconBadge.success}><DollarSign className="h-4 w-4" /></div>
                                </div>
                                <p className={`${summaryStat.value} text-emerald-600`}>${potentialSavings.toFixed(0)}</p>
                                <p className={summaryStat.sub}>Per month if optimized</p>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <InsightTypeFilter
                            types={uniqueTypes}
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                        />

                        {/* Insights Grid */}
                        {filteredInsights.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className={`${iconBadge.sm} mx-auto mb-3 h-10 w-10`}>
                                    <Brain className="h-5 w-5" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">No insights yet</h3>
                                <p className="mx-auto mb-4 max-w-md text-sm text-slate-600">
                                    Connect bank accounts and track transactions to get personalized AI insights.
                                </p>
                                <button onClick={generateInsights} className={buttons.primary}>
                                    Generate your first insights
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                {filteredInsights.map((insight, index) => (
                                    <div key={insight.id}>
                                        <InsightCard insight={insight} onDelete={handleDeleteInsight} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : activeTab === 'recommendations' ? (
                    <RecommendationsDashboard />
                ) : (
                    <FinancialHealthDashboard />
                )}
            </div>
        </PageShell>
    );
}