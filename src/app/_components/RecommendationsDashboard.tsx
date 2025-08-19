import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, DollarSign, Zap, ArrowRight, Target, TrendingUp, AlertCircle } from 'lucide-react';

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

    return (
        <div className={`bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] group ${recommendation.isActioned ? 'opacity-75' : ''
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${getPriorityColor()} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white">
                            {getPriorityIcon()}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold leading-tight ${recommendation.isActioned ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                            {recommendation.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPriorityColor()} text-white`}>
                                {recommendation.priority.toUpperCase()}
                            </span>
                            {getEffortBadge()}
                            {recommendation.metadata?.timeframe && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {recommendation.metadata.timeframe}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {recommendation.potentialSavings && (
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Potential Savings</div>
                            <div className="text-lg font-bold text-green-600">
                                ${Number(recommendation.potentialSavings || 0).toFixed(2)}/mo
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => onActionToggle(recommendation.id)}
                        className={`p-2 rounded-2xl transition-all duration-300 ${recommendation.isActioned
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                            }`}
                        title={recommendation.isActioned ? 'Mark as not completed' : 'Mark as completed'}
                    >
                        <CheckCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {recommendation.description}
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl mb-4">
                <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-800">Expected Impact</span>
                </div>
                <p className="text-sm text-indigo-700">{recommendation.impact}</p>
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
                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                            🤖 AI Generated
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
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedPriority === priority
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                            : 'bg-white/70 text-gray-600 hover:bg-white/90 hover:scale-105'
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
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedStatus === status.key
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                            : 'bg-white/70 text-gray-600 hover:bg-white/90 hover:scale-105'
                            }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function RecommendationsDashboard() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Mock data for demonstration
    const mockRecommendations: Recommendation[] = [
        {
            id: '1',
            title: '🚨 Cancel unused Netflix subscription',
            description: 'Your Netflix account shows no activity for the past 45 days, but you\'re still paying $15.99/month. Consider canceling or downgrading to save money.',
            impact: 'Save $192 annually with no lifestyle impact since you\'re not currently using the service.',
            priority: 'high',
            confidence: 0.95,
            potentialSavings: 15.99,
            isActioned: false,
            isRead: false,
            metadata: {
                effort: 'low',
                timeframe: 'immediate',
                steps: [
                    'Log into your Netflix account',
                    'Go to Account Settings',
                    'Click "Cancel Membership"',
                    'Confirm cancellation',
                    'Set a reminder to resubscribe if needed'
                ],
                claudeGenerated: true
            },
            createdAt: '2025-08-16T10:00:00Z'
        },
        {
            id: '2',
            title: '💰 Set up automated savings transfer',
            description: 'Based on your spending patterns, you could comfortably save an additional $200/month. Automating this transfer will help you reach your emergency fund goal 6 months faster.',
            impact: 'Build emergency fund faster and develop consistent saving habits without thinking about it.',
            priority: 'medium',
            confidence: 0.88,
            potentialSavings: 200,
            isActioned: false,
            isRead: true,
            metadata: {
                effort: 'low',
                timeframe: 'this_week',
                steps: [
                    'Open your banking app or website',
                    'Set up automatic transfer for $200/month',
                    'Schedule it for 2 days after your paycheck',
                    'Monitor for the first few months to ensure no overdrafts'
                ],
                claudeGenerated: true
            },
            createdAt: '2025-08-16T09:30:00Z'
        },
        {
            id: '3',
            title: '☕ Reduce coffee shop visits to 3x per week',
            description: 'You\'re spending $156/month on coffee shops (averaging $6.50 per visit). Reducing to 3 visits per week could save you money while still enjoying your coffee routine.',
            impact: 'Save approximately $75/month while maintaining some coffee shop enjoyment. Use saved money for debt payoff.',
            priority: 'medium',
            confidence: 0.82,
            potentialSavings: 75,
            isActioned: true,
            isRead: true,
            metadata: {
                effort: 'medium',
                timeframe: 'this_month',
                steps: [
                    'Calculate current weekly coffee shop visits',
                    'Identify which 3 days work best for your schedule',
                    'Invest in quality coffee for home brewing',
                    'Set up a weekly coffee shop budget of $60',
                    'Track progress for the first month'
                ],
                claudeGenerated: true
            },
            createdAt: '2025-08-15T14:20:00Z'
        },
        {
            id: '4',
            title: '📊 Increase 401k contribution to get full employer match',
            description: 'You\'re currently contributing 3% but your employer matches up to 6%. You\'re leaving free money on the table - increase your contribution to get the full match.',
            impact: 'Gain an additional $1,800/year in employer matching funds. This is a 100% instant return on investment.',
            priority: 'urgent',
            confidence: 0.98,
            potentialSavings: 150,
            isActioned: false,
            isRead: false,
            metadata: {
                effort: 'low',
                timeframe: 'immediate',
                steps: [
                    'Log into your company\'s 401k portal',
                    'Increase contribution percentage to 6%',
                    'Verify the change will take effect next payroll',
                    'Update your budget to account for the reduced take-home pay',
                    'Monitor your next few paystubs to confirm'
                ],
                claudeGenerated: true
            },
            createdAt: '2025-08-16T08:15:00Z'
        }
    ];

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);

            // Try to fetch real recommendations from API
            const response = await fetch('/api/ai/recommendations');
            if (response.ok) {
                const data = await response.json();
                if (data.recommendations && data.recommendations.length > 0) {
                    setRecommendations(data.recommendations);
                } else {
                    // Use mock data if no real recommendations
                    setRecommendations(mockRecommendations);
                }
            } else {
                // Use mock data if API fails
                setRecommendations(mockRecommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            // Use mock data as fallback
            setRecommendations(mockRecommendations);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-8 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Target className="w-12 h-12 text-indigo-500 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            Loading Recommendations
                        </h2>
                        <p className="text-gray-600 text-lg">Preparing your personalized action plan...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl">
                        <Target className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                    Smart Recommendations
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Personalized action items to optimize your finances and reach your goals faster.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Active Recommendations</h3>
                            <p className="text-3xl font-black text-blue-600">{recommendations.length}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Personalized action items</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Completed Actions</h3>
                            <p className="text-3xl font-black text-green-600">{completedActions}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Steps you've taken</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Potential Savings</h3>
                            <p className="text-3xl font-black text-purple-600">
                                ${(totalPotentialSavings || 0).toFixed(0)}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Per month if all completed</p>
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
                <div className="text-center py-16">
                    <div className="text-8xl mb-6">🎯</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No recommendations yet</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                        Connect your accounts and generate AI insights to get personalized recommendations.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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