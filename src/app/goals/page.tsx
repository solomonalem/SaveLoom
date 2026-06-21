// src/app/goals/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Calendar, DollarSign, CheckCircle, AlertTriangle, Edit2, Trash2, X } from 'lucide-react';
import AppNav from '~/app/_components/AppNav';
import PageShell from '~/app/_components/PageShell';
import { CategoryIcon, getGoalCategoryIcon } from '~/lib/category-icons';
import { buttons, iconBadge, layout, summaryStat, surfaces, typography } from '~/lib/design';
import { useAppModal } from '~/app/_components/modal/ModalProvider';
import { parseApiError } from '~/lib/parse-api-error';

// Import types
import type { BankAccount, FinancialGoal } from '~/types';

const goalCategories = [
    { value: 'emergency', label: 'Emergency Fund' },
    { value: 'purchase', label: 'Major Purchase' },
    { value: 'investment', label: 'Investment' },
    { value: 'debt', label: 'Debt Payoff' },
    { value: 'education', label: 'Education' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'other', label: 'Other' },
];

const CreateGoalModal = ({
    isOpen,
    onClose,
    onSave,
    editingGoal,
    userAccounts
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: any) => void;
    editingGoal?: FinancialGoal;
    userAccounts: BankAccount[]; // ✅ Now properly typed
}) => {
    const { showAlert } = useAppModal();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        category: 'emergency',
        priority: '1',
        monthlyContribution: ''
    });

    useEffect(() => {
        if (editingGoal) {
            setFormData({
                title: editingGoal.title,
                description: editingGoal.description || '',
                targetAmount: editingGoal.targetAmount.toString(),
                currentAmount: editingGoal.currentAmount.toString(),
                targetDate: editingGoal.targetDate ? editingGoal.targetDate.split('T')[0] : '',
                category: editingGoal.category,
                priority: editingGoal.priority.toString(),
                monthlyContribution: editingGoal.monthlyContribution?.toString() || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                targetAmount: '',
                currentAmount: '0',
                targetDate: '',
                category: 'emergency',
                priority: '1',
                monthlyContribution: ''
            });
        }
    }, [editingGoal, isOpen]);

    const handleSubmit = async () => {
        if (!formData.title || !formData.targetAmount) {
            await showAlert({
                title: 'Missing information',
                message: 'Please fill in the goal title and target amount.',
                variant: 'warning',
            });
            return;
        }

        onSave({
            id: editingGoal?.id,
            title: formData.title,
            description: formData.description,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: parseFloat(formData.currentAmount || '0'),
            targetDate: formData.targetDate || null,
            category: formData.category,
            priority: parseInt(formData.priority),
            monthlyContribution: formData.monthlyContribution ? parseFloat(formData.monthlyContribution) : null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card my-8 w-full max-w-2xl rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className={typography.pageTitle}>
                        {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Goal Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Goal Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Emergency Fund"
                            className="fancy-input"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Why is this goal important to you?"
                            rows={3}
                            className="fancy-input resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {goalCategories.map((cat) => {
                                const Icon = getGoalCategoryIcon(cat.value);
                                return (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    className={`rounded-xl p-3 text-sm font-medium transition-all ${formData.category === cat.value
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <Icon className="mx-auto mb-1 h-5 w-5" />
                                    <div className="text-xs">{cat.label}</div>
                                </button>
                            );})}
                        </div>
                    </div>

                    {/* Target Amount & Current Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="number"
                                    value={formData.targetAmount}
                                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                    placeholder="10000"
                                    className="fancy-input fancy-input-icon"
                                    required
                                    min="0"
                                    step="100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Amount
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="number"
                                    value={formData.currentAmount}
                                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                    placeholder="0"
                                    className="fancy-input fancy-input-icon"
                                    min="0"
                                    step="100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Target Date & Monthly Contribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                    className="fancy-input fancy-input-icon"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Monthly Contribution
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="number"
                                    value={formData.monthlyContribution}
                                    onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                                    placeholder="500"
                                    className="fancy-input fancy-input-icon"
                                    min="0"
                                    step="50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Priority (1 = highest)
                        </label>
                        <input
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="fancy-input"
                            min="1"
                            max="10"
                        />
                    </div>

                    {/* Connected Accounts Info (if available) */}
                    {userAccounts.length > 0 && (
                        <div className="rounded-xl bg-indigo-50/60 p-4 ring-1 ring-indigo-200/40">
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">💡</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 mb-1">Track Your Progress</div>
                                    <p className="text-sm text-gray-600">
                                        You have {userAccounts.length} connected account{userAccounts.length !== 1 ? 's' : ''}.
                                        After creating this goal, you can add contributions from any of your accounts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            className={`${buttons.secondary} flex-1 py-3`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={`${buttons.primary} flex-1 py-3`}
                        >
                            {editingGoal ? 'Update Goal' : 'Create Goal'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GoalCard = ({ goal, onEdit, onDelete, onUpdateProgress }: {
    goal: FinancialGoal;
    onEdit: (goal: FinancialGoal) => void;
    onDelete: (id: string) => void;
    onUpdateProgress: (id: string, amount: number) => void;
}) => {
    const progress = goal.progress || 0;
    const CategoryIconComponent = getGoalCategoryIcon(goal.category);
    const isCompleted = goal.isCompleted || progress >= 100;
    const remaining = goal.targetAmount - goal.currentAmount;

    const monthsToGoal = goal.monthlyContribution && goal.monthlyContribution > 0
        ? Math.ceil(remaining / goal.monthlyContribution)
        : null;

    return (
        <div className={`${surfaces.cardHover} p-6 ${isCompleted ? 'ring-2 ring-emerald-500' : ''}`}>
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className={iconBadge.muted}>
                        <CategoryIconComponent className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                        {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(goal)}
                        className="p-2 hover:bg-indigo-100 rounded-xl transition-colors"
                    >
                        <Edit2 className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                        onClick={() => onDelete(goal.id)}
                        className="p-2 hover:bg-red-100 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-2 rounded-full transition-all duration-1000 ${isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                            }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${goal.currentAmount.toLocaleString()}</span>
                    <span className="font-bold text-gray-900">${goal.targetAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-white/60 p-3 ring-1 ring-white/40">
                    <div className="text-xs text-gray-600 mb-1">Remaining</div>
                    <div className="font-bold text-gray-900">${remaining.toLocaleString()}</div>
                </div>
                {monthsToGoal && (
                    <div className="rounded-xl bg-white/60 p-3 ring-1 ring-white/40">
                        <div className="text-xs text-gray-600 mb-1">Months to Goal</div>
                        <div className="font-bold text-gray-900">{monthsToGoal}</div>
                    </div>
                )}
            </div>

            {/* Quick Add */}
            {!isCompleted && (
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        placeholder="Add amount"
                        className="flex-1 p-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const amount = parseFloat(input.value);
                                if (amount > 0) {
                                    onUpdateProgress(goal.id, goal.currentAmount + amount);
                                    input.value = '';
                                }
                            }
                        }}
                    />
                    <button
                        onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            const amount = parseFloat(input.value);
                            if (amount > 0) {
                                onUpdateProgress(goal.id, goal.currentAmount + amount);
                                input.value = '';
                            }
                        }}
                        className="px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                        Add
                    </button>
                </div>
            )}

            {isCompleted && (
                <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Goal Completed! 🎉</span>
                </div>
            )}

            {/* Target Date */}
            {goal.targetDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                        {goal.monthlyContribution && (
                            <div className="flex items-center space-x-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>${goal.monthlyContribution}/mo</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function GoalsPage() {
    const { showAlert, showConfirm } = useAppModal();
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [userAccounts, setUserAccounts] = useState<BankAccount[]>([]); // ✅ State for bank accounts
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<FinancialGoal | undefined>(undefined);

    useEffect(() => {
        // ✅ Fetch both goals and bank accounts
        Promise.all([
            fetchGoals(),
            fetchBankAccounts()
        ]).finally(() => setLoading(false));
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/goals');
            if (response.ok) {
                const data = await response.json();
                setGoals(data.goals || []);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    // ✅ NEW: Fetch user's bank accounts
    const fetchBankAccounts = async () => {
        try {
            const response = await fetch('/api/bank-accounts');
            if (response.ok) {
                const data = await response.json();
                setUserAccounts(data.accounts || []);
                console.log('✅ Loaded bank accounts:', data.accounts?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
        }
    };

    const handleSaveGoal = async (goalData: any) => {
        try {
            const isEditing = !!goalData.id;
            const url = '/api/goals';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goalData)
            });

            if (response.ok) {
                await fetchGoals();
                setShowCreateModal(false);
                setEditingGoal(undefined);
                await showAlert({
                    title: isEditing ? 'Goal updated' : 'Goal created',
                    message: isEditing
                        ? 'Your goal changes have been saved.'
                        : 'Your new financial goal is ready to track.',
                    variant: 'success',
                });
            } else {
                await showAlert({
                    title: 'Save failed',
                    message: await parseApiError(response, 'Failed to save goal'),
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error saving goal:', error);
            await showAlert({
                title: 'Save failed',
                message: 'A network error occurred. Please try again.',
                variant: 'error',
            });
        }
    };

    const handleDeleteGoal = async (id: string) => {
        const confirmed = await showConfirm({
            title: 'Delete goal',
            message: 'Are you sure you want to delete this goal? This action cannot be undone.',
            confirmLabel: 'Delete',
            destructive: true,
            variant: 'warning',
        });
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/goals?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchGoals();
                await showAlert({
                    title: 'Goal deleted',
                    message: 'The goal has been removed.',
                    variant: 'success',
                });
            } else {
                await showAlert({
                    title: 'Delete failed',
                    message: await parseApiError(response, 'Failed to delete goal'),
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            await showAlert({
                title: 'Delete failed',
                message: 'A network error occurred. Please try again.',
                variant: 'error',
            });
        }
    };

    const handleUpdateProgress = async (id: string, newAmount: number) => {
        try {
            const response = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, currentAmount: newAmount })
            });

            if (response.ok) {
                await fetchGoals();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleEditGoal = (goal: FinancialGoal) => {
        setEditingGoal(goal);
        setShowCreateModal(true);
    };

    // Calculate summary stats
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedGoals = goals.filter(g => g.isCompleted || (g.progress && g.progress >= 100)).length;
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    if (loading) {
        return (
            <PageShell>
                <AppNav subtitle="Goals" />
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <AppNav subtitle="Goals" />

            <div className={layout.page}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className={`${typography.pageTitle} mb-1`}>Financial goals</h1>
                        <p className={typography.pageSubtitle}>Track your progress toward financial freedom</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGoal(undefined);
                            setShowCreateModal(true);
                        }}
                        className={`${buttons.primary} mt-4 md:mt-0`}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create goal</span>
                    </button>
                </div>

                {goals.length > 0 && (
                    <div className={layout.gridStats}>
                        <div className={summaryStat.card}>
                            <p className={typography.label}>Total goals</p>
                            <p className={`${summaryStat.value} mt-1`}>{goals.length}</p>
                        </div>
                        <div className={summaryStat.card}>
                            <p className={typography.label}>Completed</p>
                            <p className={`${summaryStat.value} mt-1 text-emerald-600`}>{completedGoals}</p>
                        </div>
                        <div className={summaryStat.card}>
                            <p className={typography.label}>Total target</p>
                            <p className={`${summaryStat.value} mt-1`}>${totalTargetAmount.toLocaleString()}</p>
                        </div>
                        <div className={summaryStat.card}>
                            <p className={typography.label}>Overall progress</p>
                            <p className={`${summaryStat.value} mt-1 text-emerald-600`}>{overallProgress.toFixed(0)}%</p>
                        </div>
                    </div>
                )}
                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className={`${iconBadge.sm} mx-auto mb-3 h-10 w-10`}>
                            <Target className="h-5 w-5" />
                        </div>
                        <h2 className="mb-2 text-lg font-semibold text-slate-900">No goals yet</h2>
                        <p className="mb-4 text-sm text-slate-600">Set your first financial goal and start tracking progress</p>
                        <button onClick={() => setShowCreateModal(true)} className={buttons.primary}>
                            <Plus className="h-4 w-4" />
                            <span>Create your first goal</span>
                        </button>
                    </div>
                ) : (
                    <div className={layout.gridCards}>
                        {goals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={handleEditGoal}
                                onDelete={handleDeleteGoal}
                                onUpdateProgress={handleUpdateProgress}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Goal Modal */}
            <CreateGoalModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingGoal(undefined);
                }}
                onSave={handleSaveGoal}
                editingGoal={editingGoal}
                userAccounts={userAccounts} // ✅ Pass bank accounts to modal
            />
        </PageShell>
    );
}