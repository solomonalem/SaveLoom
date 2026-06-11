// src/app/goals/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Calendar, DollarSign, CheckCircle, AlertTriangle, Edit2, Trash2, X } from 'lucide-react';
import Link from 'next/link';

// Import types
import type { BankAccount, FinancialGoal } from '~/types';

const goalCategories = [
    { value: 'emergency', label: 'Emergency Fund', emoji: '🛡️' },
    { value: 'purchase', label: 'Major Purchase', emoji: '🏠' },
    { value: 'investment', label: 'Investment', emoji: '📈' },
    { value: 'debt', label: 'Debt Payoff', emoji: '💳' },
    { value: 'education', label: 'Education', emoji: '🎓' },
    { value: 'vacation', label: 'Vacation', emoji: '✈️' },
    { value: 'retirement', label: 'Retirement', emoji: '🏖️' },
    { value: 'other', label: 'Other', emoji: '🎯' }
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

    const handleSubmit = () => {
        if (!formData.title || !formData.targetAmount) {
            alert('Please fill in required fields');
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
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/50 my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                            className="w-full p-4 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                            className="w-full p-4 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {goalCategories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${formData.category === cat.value
                                        ? 'bg-indigo-500 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{cat.emoji}</div>
                                    <div className="text-xs">{cat.label}</div>
                                </button>
                            ))}
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
                                    className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                    className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                    className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                    className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                            className="w-full p-4 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                            min="1"
                            max="10"
                        />
                    </div>

                    {/* Connected Accounts Info (if available) */}
                    {userAccounts.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
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
                            className="flex-1 p-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all font-semibold"
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
    const categoryEmoji = goalCategories.find(c => c.value === goal.category)?.emoji || '🎯';
    const isCompleted = goal.isCompleted || progress >= 100;
    const remaining = goal.targetAmount - goal.currentAmount;

    const monthsToGoal = goal.monthlyContribution && goal.monthlyContribution > 0
        ? Math.ceil(remaining / goal.monthlyContribution)
        : null;

    return (
        <div className={`group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ${isCompleted ? 'ring-2 ring-green-500' : ''}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="text-4xl">{categoryEmoji}</div>
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
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all duration-1000 ${isCompleted
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
                <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">Remaining</div>
                    <div className="font-bold text-gray-900">${remaining.toLocaleString()}</div>
                </div>
                {monthsToGoal && (
                    <div className="bg-gray-50 p-3 rounded-xl">
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
                alert(isEditing ? '✅ Goal updated!' : '✅ Goal created!');
            } else {
                const error = await response.json();
                alert(`❌ Failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const response = await fetch(`/api/goals?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchGoals();
                alert('✅ Goal deleted!');
            } else {
                alert('❌ Failed to delete goal');
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('❌ Network error');
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-gray-600 text-lg">Loading goals...</p>
                </div>
            </div>
        );
    }

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
                                    <p className="text-sm text-gray-500 font-medium">Financial Goals</p>
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50">
                                Dashboard
                            </Link>
                            <Link href="/analytics" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50">
                                Analytics
                            </Link>
                            <Link href="/budgets" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50">
                                Budgets
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                    <div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Financial Goals
                        </h1>
                        <p className="text-xl text-gray-600">Track your progress toward financial freedom</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGoal(undefined);
                            setShowCreateModal(true);
                        }}
                        className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold inline-flex items-center space-x-2 hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Goal</span>
                    </button>
                </div>

                {/* Summary Stats */}
                {goals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                            <div className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Goals</div>
                            <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{goals.length}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                            <div className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Completed</div>
                            <div className="text-4xl font-black text-green-600">{completedGoals}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                            <div className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Target</div>
                            <div className="text-4xl font-black text-gray-900">${totalTargetAmount.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                            <div className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Overall Progress</div>
                            <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{overallProgress.toFixed(0)}%</div>
                        </div>
                    </div>
                )}
                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-8xl mb-6">🎯</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Goals Yet</h2>
                        <p className="text-gray-600 text-lg mb-8">Set your first financial goal and start tracking your progress</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold inline-flex items-center space-x-2 hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Your First Goal</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    );
}