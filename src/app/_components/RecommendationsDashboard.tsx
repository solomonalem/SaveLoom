import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, DollarSign, Zap, ArrowRight, Target, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { buttons, iconBadge, iconBadgeTint, summaryStat, surfaces, typography } from '~/lib/design';

interface Recommendation {
    id: string;
    title: string;
    description: string;
    impact: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    confidence: number;
    potentialSavings?: number;
    isActioned: boolean;
    isRead: boolean;
    metadata?: {
        effort: 'low' | 'medium' | 'high';
        timeframe: string;
        steps: string[];
        claudeGenerated?: boolean;
    };
    createdAt: string;
}

const RecommendationCard = ({ recommendation, onActionToggle, onMarkRead }: {
    recommendation: Recommendation;
    onActionToggle: (id: string) => void;
    onMarkRead: (id: string) => void;
}) => {
    const getPriorityColor = () => {
        switch (recommendation.priority) {
            case 'urgent': return 'from-red-500 to-pink-500';
            case 'high': return 'from-orange-500 to-red-500';
            case 'medium': return 'from-blue-500 to-indigo-500';
            case 'low': return 'from-green-500 to-emerald-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    const getPriorityIcon = () => {
        switch (recommendation.priority) {
            case 'urgent': return <AlertCircle className="w-5 h-5" />;
            case 'high': return <Zap className="w-5 h-5" />;
            case 'medium': return <Target className="w-5 h-5" />;
            case 'low': return <TrendingUp className="w-5 h-5" />;
            default: return <Target className="w-5 h-5" />;
        }
    };

    const getEffortBadge = () => {
        if (!recommendation.metadata?.effort) return null;

        const effortColors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${effortColors[recommendation.metadata.effort]}`}>
                {recommendation.metadata.effort.toUpperCase()} EFFORT
            </span>
        );
    };

    useEffect(() => {
        if (!recommendation.isRead) {
            const timer = setTimeout(() => {
                onMarkRead(recommendation.id);
            }, 3000); // Mark as read after 3 seconds of viewing
            return () => clearTimeout(timer);
        }
    }, [recommendation.id, recommendation.isRead, onMarkRead]);

    const getPriorityTone = (): 'indigo' | 'emerald' | 'red' | 'amber' | 'slate' => {
        switch (recommendation.priority) {
            case 'urgent': return 'red';
            case 'high': return 'amber';
            case 'medium': return 'indigo';
            case 'low': return 'emerald';
            default: return 'slate';
        }
    };

    return (
        <div className={`${surfaces.cardHover} group p-4 ${recommendation.isActioned ? 'opacity-75' : ''}`}>
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                    <div className={iconBadgeTint(getPriorityTone())}>
                        {getPriorityIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className={`text-sm font-semibold leading-tight ${recommendation.isActioned ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {recommendation.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-600">
                                {recommendation.priority}
                            </span>
                            {getEffortBadge()}
                            {recommendation.metadata?.timeframe && (
                                <span className="flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {recommendation.metadata.timeframe}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {recommendation.potentialSavings && (
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500">Savings</div>
                            <div className="text-sm font-semibold tabular-nums text-emerald-600">
                                ${Number(recommendation.potentialSavings || 0).toFixed(0)}/mo
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => onActionToggle(recommendation.id)}
                        className={`rounded-md p-1.5 transition-colors ${recommendation.isActioned
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                        title={recommendation.isActioned ? 'Mark as not completed' : 'Mark as completed'}
                    >
                        <CheckCircle className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-slate-600">
                {recommendation.description}
            </p>

            <div className={`${surfaces.inset} mb-3 p-3`}>
                <div className="mb-1 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="text-xs font-medium text-slate-700">Expected impact</span>
                </div>
                <p className="text-xs text-slate-600">{recommendation.impact}</p>
            </div>

            {recommendation.metadata?.steps && recommendation.metadata.steps.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Action Steps
                    </h4>
                    <div className="space-y-2">
                        {recommendation.metadata.steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {index + 1}
                                </div>
                                <span className="text-sm text-gray-700 flex-1">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Confidence: {(recommendation.confidence * 100).toFixed(0)}%</span>
                    <span>{new Date(recommendation.createdAt).toLocaleDateString()}</span>
                    {recommendation.metadata?.claudeGenerated && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                            <Sparkles className="h-3 w-3" />
                            AI generated
                        </span>
                    )}
                </div>
                {!recommendation.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
            </div>
        </div>
    );
};

const RecommendationFilters = ({ selectedPriority, onPriorityChange, selectedStatus, onStatusChange }: {
    selectedPriority: string;
    onPriorityChange: (priority: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
}) => {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
                <span className="text-sm font-medium text-gray-700 py-2">Priority:</span>
                {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                    <button
                        key={priority}
                        onClick={() => onPriorityChange(priority)}
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${selectedPriority === priority
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white/60 text-slate-600 hover:bg-white/90'
                            }`}
                    >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <span className="text-sm font-medium text-gray-700 py-2">Status:</span>
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'completed', label: 'Completed' }
                ].map((status) => (
                    <button
                        key={status.key}
                        onClick={() => onStatusChange(status.key)}
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${selectedStatus === status.key
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white/60 text-slate-600 hover:bg-white/90'
                            }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function RecommendationsDashboard({
    status,
    onRefresh,
    refreshKey = 0,
}: {
    status?: {
        accountsConnected: number;
        transactionCount: number;
        canGenerate: boolean;
        needsSync: boolean;
        blockReason: string | null;
        hasInsights: boolean;
    } | null;
    onRefresh?: () => void | Promise<void>;
    refreshKey?: number;
}) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');


    useEffect(() => {
        fetchRecommendations();
    }, [refreshKey]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);

            // Try to fetch real recommendations from API
            const response = await fetch('/api/ai/recommendations');
            if (response.ok) {
                const data = await response.json();
                if (data.recommendations && data.recommendations.length > 0) {
                    setRecommendations(data.recommendations);
                }
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);

        } finally {
            setTimeout(() => setLoading(false), 1000); // Simulate loading time
        }
    };

    const handleActionToggle = async (recommendationId: string) => {
        try {
            const recommendation = recommendations.find(r => r.id === recommendationId);
            if (!recommendation) return;

            // Update local state immediately for better UX
            setRecommendations(prev =>
                prev.map(rec =>
                    rec.id === recommendationId
                        ? { ...rec, isActioned: !rec.isActioned }
                        : rec
                )
            );

            // Try to update on server
            const response = await fetch(`/api/ai/recommendations/${recommendationId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActioned: !recommendation.isActioned })
            });

            if (!response.ok) {
                // Revert on error
                setRecommendations(prev =>
                    prev.map(rec =>
                        rec.id === recommendationId
                            ? { ...rec, isActioned: recommendation.isActioned }
                            : rec
                    )
                );
            }
        } catch (error) {
            console.error('Error updating recommendation:', error);
        }
    };

    const handleMarkRead = async (recommendationId: string) => {
        setRecommendations(prev =>
            prev.map(rec =>
                rec.id === recommendationId
                    ? { ...rec, isRead: true }
                    : rec
            )
        );

        // Try to update on server (optional)
        try {
            await fetch(`/api/ai/recommendations/${recommendationId}/read`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error marking recommendation as read:', error);
        }
    };

    const filteredRecommendations = recommendations.filter(rec => {
        const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority;
        const statusMatch = selectedStatus === 'all' ||
            (selectedStatus === 'pending' && !rec.isActioned) ||
            (selectedStatus === 'completed' && rec.isActioned);

        return priorityMatch && statusMatch;
    });

    const totalPotentialSavings = recommendations
        .filter(rec => !rec.isActioned)
        .reduce((sum, rec) => {
            const savings = rec.potentialSavings;
            const numericSavings = typeof savings === 'number' ? savings : parseFloat(savings?.toString() || '0');
            return sum + (isNaN(numericSavings) ? 0 : numericSavings);
        }, 0) || 0;

    const completedActions = recommendations.filter(rec => rec.isActioned).length || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                    <p className="font-medium text-slate-900">Loading recommendations</p>
                    <p className="mt-1 text-sm text-slate-500">Preparing your personalized action plan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className={`${iconBadge.success} mx-auto mb-3 h-10 w-10`}>
                    <Target className="h-5 w-5" />
                </div>
                <h1 className={`${typography.pageTitle} mb-2`}>Smart recommendations</h1>
                <p className={`${typography.pageSubtitle} mx-auto max-w-2xl`}>
                    Personalized action items to optimize your finances and reach your goals faster.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className={summaryStat.card}>
                    <div className="mb-2 flex items-center justify-between">
                        <p className={typography.label}>Active</p>
                        <div className={iconBadge.sm}><Target className="h-4 w-4" /></div>
                    </div>
                    <p className={summaryStat.value}>{recommendations.length}</p>
                    <p className={summaryStat.sub}>Personalized action items</p>
                </div>
                <div className={summaryStat.card}>
                    <div className="mb-2 flex items-center justify-between">
                        <p className={typography.label}>Completed</p>
                        <div className={iconBadge.success}><CheckCircle className="h-4 w-4" /></div>
                    </div>
                    <p className={`${summaryStat.value} text-emerald-600`}>{completedActions}</p>
                    <p className={summaryStat.sub}>Steps you&apos;ve taken</p>
                </div>
                <div className={summaryStat.card}>
                    <div className="mb-2 flex items-center justify-between">
                        <p className={typography.label}>Potential savings</p>
                        <div className={iconBadge.sm}><DollarSign className="h-4 w-4" /></div>
                    </div>
                    <p className={`${summaryStat.value} text-emerald-600`}>${totalPotentialSavings.toFixed(0)}</p>
                    <p className={summaryStat.sub}>Per month if optimized</p>
                </div>
            </div>

            {/* Filters */}
            <RecommendationFilters
                selectedPriority={selectedPriority}
                onPriorityChange={setSelectedPriority}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            {/* Recommendations Grid */}
            {filteredRecommendations.length === 0 ? (
                <div className="py-12 text-center">
                    <div className={`${iconBadge.sm} mx-auto mb-3 h-10 w-10`}>
                        <Target className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">No recommendations yet</h3>
                    <p className="mx-auto mb-4 max-w-md text-sm text-slate-600">
                        {status?.transactionCount && status.transactionCount > 0
                            ? `You have ${status.transactionCount} transactions ready. Refresh insights to generate recommendations.`
                            : status?.needsSync
                                ? 'Your bank is connected but no transactions are stored yet. On the dashboard, use Import in Transaction History to pull them from Plaid.'
                                : status?.accountsConnected === 0
                                    ? 'Connect a bank account from the dashboard to get personalized recommendations.'
                                    : status?.canGenerate
                                        ? 'Refresh insights to generate recommendations from your transaction data.'
                                        : (status?.blockReason ?? 'Add transaction data to unlock recommendations.')}
                    </p>
                    {status?.canGenerate && onRefresh && (
                        <button onClick={onRefresh} className={buttons.primary}>
                            Refresh insights
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {filteredRecommendations.map((recommendation, index) => (
                        <div
                            key={recommendation.id}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className="animate-fadeInUp"
                        >
                            <RecommendationCard
                                recommendation={recommendation}
                                onActionToggle={handleActionToggle}
                                onMarkRead={handleMarkRead}
                            />
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
        </div>
    );
}