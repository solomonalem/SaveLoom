"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, Target, Coffee, CreditCard, Lightbulb, RefreshCw, Trash } from 'lucide-react';
import RecommendationsDashboard from './RecommendationsDashboard';

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
                return insight.change && insight.change > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />;
            case 'subscription_optimization':
                return <CreditCard className="w-6 h-6" />;
            case 'budget_alert':
                return <AlertTriangle className="w-6 h-6" />;
            case 'budget_performance':
                return <Target className="w-6 h-6" />;
            case 'saving_opportunity':
                return <Coffee className="w-6 h-6" />;
            case 'spending_alert':
                return <DollarSign className="w-6 h-6" />;
            case 'income_analysis':
                return <Calendar className="w-6 h-6" />;
            case 'category_analysis':
                return <Target className="w-6 h-6" />;
            default:
                return <Lightbulb className="w-6 h-6" />;
        }
    };

    const getInsightColor = () => {
        switch (insight.type) {
            case 'spending_trend':
                return insight.change && insight.change > 0 ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500';
            case 'subscription_optimization':
                return 'from-purple-500 to-indigo-500';
            case 'budget_alert':
                return 'from-red-500 to-pink-500';
            case 'budget_performance':
                return 'from-green-500 to-teal-500';
            case 'saving_opportunity':
                return 'from-blue-500 to-cyan-500';
            case 'spending_alert':
                return 'from-amber-500 to-orange-500';
            case 'income_analysis':
                return 'from-indigo-500 to-purple-500';
            case 'category_analysis':
                return 'from-pink-500 to-rose-500';
            default:
                return 'from-gray-500 to-slate-500';
        }
    };

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
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${getInsightColor()} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                        {getInsightIcon()}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {insight.title}
                        </h3>
                        {insight.value && insight.metric && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getInsightColor()} text-white`}>
                                {formatValue(insight.value, insight.metric)}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {insight.content}
                    </p>
                    {/* Delete button - add this */}
                    <div className="flex items-center justify-end mb-2">
                        <button
                            onClick={() => onDelete(insight.id)}
                            className="opacity-30 bg-gray-300 text-gray-600 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-100 rounded-lg hover:text-red-500 hover:text-red-700"
                            title="Delete insight"
                        >

                            <Trash className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                            {insight.timeframe.replace('_', ' ')}
                        </span>
                        <span>
                            {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
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
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedType === type
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white/70 text-gray-600 hover:bg-white/90 hover:scale-105'
                        }`}
                >
                    {typeLabels[type] || type}
                </button>
            ))}
        </div>
    );
};

export default function AIInsightsDashboard() {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [activeTab, setActiveTab] = useState('insights');
    const [generating, setGenerating] = useState(false);


    // Delete insight handler
    const handleDeleteInsight = async (insightId: string) => {
        if (!confirm('Are you sure you want to delete this insight?')) return;

        try {
            const response = await fetch(`/api/ai/insights/${insightId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove from local state
                setInsights(prev => prev.filter(insight => insight.id !== insightId));
            } else {
                alert('Failed to delete insight');
            }
        } catch (error) {
            console.error('Error deleting insight:', error);
            alert('Error deleting insight');
        }
    };

    // Mock data for demonstration
    const mockInsights: AIInsight[] = [
        {
            id: '1',
            type: 'spending_trend',
            title: '📈 Food and Drink spending increased 32%',
            content: 'Your food and drink spending has increased by 32.1% this month compared to last month. Current: $487.50, Previous: $369.20.',
            timeframe: 'this_month',
            metric: 'spending',
            value: 487.50,
            change: 32.1,
            createdAt: '2025-08-14T10:00:00Z'
        },
        {
            id: '2',
            type: 'subscription_optimization',
            title: '💳 You have 6 subscriptions costing $127.94/month',
            content: 'We detected recurring charges from services like Netflix, Spotify, Amazon Prime. Review these subscriptions to ensure you\'re still using them.',
            timeframe: 'this_month',
            metric: 'subscription_cost',
            value: 127.94,
            createdAt: '2025-08-14T09:30:00Z'
        },
        {
            id: '3',
            type: 'budget_alert',
            title: '🚨 Entertainment budget almost exceeded',
            content: 'You\'ve spent 94% of your Entertainment budget this month. Consider reducing spending in this category.',
            timeframe: 'monthly',
            metric: 'budget_usage',
            value: 94,
            createdAt: '2025-08-14T09:15:00Z'
        },
        {
            id: '4',
            type: 'saving_opportunity',
            title: '☕ Small purchases add up: $156.75 this month',
            content: 'You\'ve made 23 small purchases averaging $6.81 each. Consider setting a weekly limit for discretionary spending.',
            timeframe: 'this_month',
            metric: 'small_purchases',
            value: 156.75,
            createdAt: '2025-08-14T09:00:00Z'
        },
        {
            id: '5',
            type: 'budget_performance',
            title: '🎉 Great job on Transportation spending',
            content: 'You\'re doing well with your Transportation budget, using only 43% so far this month.',
            timeframe: 'monthly',
            metric: 'budget_usage',
            value: 43,
            createdAt: '2025-08-14T08:45:00Z'
        }
    ];

    useEffect(() => {
        fetchInsights();
    }, []);


    // Replace your fetchInsights function with this:

    const fetchInsights = async () => {
        try {
            setLoading(true);
            console.log('🔍 Starting to fetch insights...');

            const response = await fetch('/api/ai/insights');
            console.log('🔍 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 DADATA--', data); // Your existing log

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
                } else {
                    setInsights(mockInsights);
                }
            } else {
                console.error('❌ API failed with status:', response.status);
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                setInsights(mockInsights);
            }
        } catch (error) {
            console.error('❌ Error fetching insights:', error);
            setInsights(mockInsights);
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
                // Refresh insights after generation
                await fetchInsights();
                alert('🧠 New AI insights generated successfully!');
            } else {
                alert('❌ Failed to generate insights. Please try again.');
            }
        } catch (error) {
            console.error('Error generating insights:', error);
            alert('❌ Error generating insights. Please try again.');
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between h-20">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mr-5 shadow-2xl">
                                        <span className="text-lg font-black text-white">SL</span>
                                    </div>
                                    <div>
                                        <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            SaveLoom
                                        </span>
                                        <p className="text-sm text-gray-500 font-medium">AI Insights</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/analytics"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Analytics
                                </Link>
                                <Link
                                    href="/budgets"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Budgets
                                </Link>
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
                                <Brain className="w-12 h-12 text-indigo-500 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            AI Analyzing Your Data
                        </h2>
                        <p className="text-gray-600 text-lg">Generating personalized financial insights...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Navigation */}
            <nav className="relative bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50 z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mr-5 shadow-2xl">
                                    <span className="text-lg font-black text-white">SL</span>
                                </div>
                                <div>
                                    <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        SaveLoom
                                    </span>
                                    <p className="text-sm text-gray-500 font-medium">AI Insights</p>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/analytics"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Analytics
                            </Link>
                            <Link
                                href="/budgets"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Budgets
                            </Link>
                            <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50">
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'insights'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-white/50'
                                        }`}
                                >
                                    🧠 Insights
                                </button>
                                <button
                                    onClick={() => setActiveTab('recommendations')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'recommendations'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-white/50'
                                        }`}
                                >
                                    🎯 Recommendations
                                </button>
                            </div>
                            <button
                                onClick={generateInsights}
                                disabled={generating}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2 disabled:opacity-50"
                            >
                                <Brain className="w-4 h-4" />
                                <span>{generating ? 'Generating...' : 'Generate New'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-7xl mx-auto p-6 lg:p-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center justify-center space-x-4 mb-6">
                            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
                                <Brain className="w-12 h-12 text-white" />
                            </div>
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                <span>🤖</span>
                                <span>Powered by Claude AI</span>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
                            <Brain className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        AI Financial Insights
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Your personal AI financial advisor analyzes your spending patterns, identifies opportunities, and provides actionable recommendations.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50">
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 'insights'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            <Brain className="w-4 h-4" />
                            <span>Insights</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('recommendations')}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 'recommendations'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            <Target className="w-4 h-4" />
                            <span>Recommendations</span>
                        </button>
                    </div>
                </div>

                {/* Conditional Content Based on Active Tab */}
                {activeTab === 'insights' ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                                        <Lightbulb className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Total Insights</h3>
                                        <p className="text-3xl font-black text-blue-600">{insights.length}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">AI-generated recommendations</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Action Items</h3>
                                        <p className="text-3xl font-black text-red-600">
                                            {insights.filter(i => ['budget_alert', 'spending_alert', 'subscription_optimization'].includes(i.type)).length}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Require your attention</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Potential Savings</h3>
                                        <p className="text-3xl font-black text-green-600">
                                            ${potentialSavings.toFixed(0)}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Per month if optimized</p>
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
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">🧠</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">No insights yet</h3>
                                <p className="text-gray-600 mb-8 text-lg">
                                    Connect your bank accounts and start tracking transactions to get personalized AI insights.
                                </p>
                                <button
                                    onClick={generateInsights}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                                >
                                    Generate Your First Insights
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredInsights.map((insight, index) => (
                                    <div key={insight.id}>
                                        <InsightCard insight={insight} onDelete={handleDeleteInsight} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <RecommendationsDashboard />
                )}
            </div>
        </div>
    );
}