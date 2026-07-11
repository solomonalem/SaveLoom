//src/app/budgets/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Target, TrendingUp, AlertTriangle, CheckCircle, Settings, Calendar, DollarSign } from 'lucide-react';
import AppNav from '~/app/_components/AppNav';
import PageShell from '~/app/_components/PageShell';
import { CategoryIcon } from '~/lib/category-icons';
import { buttons, iconBadge, iconBadgeTint, layout, summaryStat, surfaces, typography } from '~/lib/design';
import { useAppModal } from '~/app/_components/modal/ModalProvider';

const budgetCategories = [
    'Food and Drink',
    'Shops',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Travel',
    'Utilities',
    'Groceries',
    'Other'
];

const BudgetCard = ({ budget, onEdit, onDelete }) => {
    const percentage = ((budget.spent || 0) / (budget.amount || 1)) * 100;
    const remaining = (budget.amount || 0) - (budget.spent || 0);
    const isOverBudget = (budget.spent || 0) > (budget.amount || 0);
    const isNearLimit = percentage >= 80 && !isOverBudget;

    const getStatusBadge = () => {
        if (isOverBudget) return iconBadgeTint('red');
        if (isNearLimit) return iconBadgeTint('amber');
        return iconBadgeTint('emerald');
    };

    const getStatusIcon = () => {
        if (isOverBudget) return <AlertTriangle className="h-4 w-4 text-red-500" />;
        if (isNearLimit) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    };

    const getProgressColor = () => {
        if (isOverBudget) return 'bg-red-500';
        if (isNearLimit) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className={`${surfaces.cardHover} group p-4`}>
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={getStatusBadge()}>
                        <CategoryIcon category={budget.category} className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">{budget.category}</h3>
                        <p className="text-xs capitalize text-slate-500">{budget.period} budget</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {getStatusIcon()}
                    <button
                        onClick={() => onEdit(budget)}
                        className="rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
                    >
                        <Settings className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Spent</span>
                    <span className={`font-semibold tabular-nums ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                        ${(budget.spent || 0).toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Budget</span>
                    <span className="font-semibold tabular-nums text-slate-900">${(budget.amount || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Remaining</span>
                    <span className={`font-semibold tabular-nums ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                        {remaining < 0 && ' over'}
                    </span>
                </div>

                <div className="pt-1">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-slate-700'}`}>
                            {Math.min(percentage, 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full ${getProgressColor()} transition-all duration-700 rounded-full`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                    <span>
                        {new Date(budget.startDate).toLocaleDateString()} – {new Date(budget.endDate).toLocaleDateString()}
                    </span>
                    <button className="text-red-500 hover:text-red-600" onClick={onDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
};

const CreateBudgetModal = ({ isOpen, onClose, onSave, editingBudget }) => {
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        period: 'monthly'
    });

    useEffect(() => {
        if (editingBudget) {
            setFormData({
                category: editingBudget.category,
                amount: editingBudget.amount.toString(),
                period: editingBudget.period
            });
        } else {
            setFormData({ category: '', amount: '', period: 'monthly' });
        }
    }, [editingBudget, isOpen]);

    const handleSubmit = () => {
        if (!formData.category || !formData.amount) return;

        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        if (formData.period === 'weekly') {
            const dayOfWeek = now.getDay();
            startDate.setDate(now.getDate() - dayOfWeek);
            endDate.setDate(startDate.getDate() + 6);
        }

        onSave({
            category: formData.category,
            amount: parseFloat(formData.amount),
            period: formData.period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            isActive: true
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md rounded-2xl p-8">
                <h2 className={`${typography.pageTitle} mb-6`}>
                    {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="fancy-input"
                            required
                        >
                            <option value="">Select a category</option>
                            {budgetCategories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Amount</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="Enter amount"
                                className="fancy-input fancy-input-icon"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, period: 'weekly' })}
                                className={`rounded-xl border-2 p-3 transition-all ${formData.period === 'weekly'
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-300 bg-white/50 text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                <Calendar className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-sm font-semibold">Weekly</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, period: 'monthly' })}
                                className={`rounded-xl border-2 p-3 transition-all ${formData.period === 'monthly'
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-300 bg-white/50 text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                <Calendar className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-sm font-semibold">Monthly</span>
                            </button>
                        </div>
                    </div>

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
                            {editingBudget ? 'Update Budget' : 'Create Budget'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function BudgetClient() {
    const { showAlert, showConfirm } = useAppModal();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(undefined);

    // 🔥 REAL API INTEGRATION - NO MORE MOCK DATA
    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            console.log('🔄 Fetching budgets from API...');
            setLoading(true);

            const response = await fetch('/api/budgets');
            console.log('📡 API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('📊 Budgets data received:', data);

                if (data.budgets) {
                    setBudgets(data.budgets);
                    console.log(`✅ Loaded ${data.budgets.length} budgets`);
                } else {
                    console.log('📋 No budgets found');
                    setBudgets([]);
                }
            } else {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                setBudgets([]);
            }
        } catch (error) {
            console.error('❌ Network Error fetching budgets:', error);
            setBudgets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBudget = async (budgetData) => {
        try {
            console.log('💾 Saving budget:', budgetData);

            if (editingBudget) {
                console.log('✏️ Updating existing budget...');
                const response = await fetch('/api/budgets', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: editingBudget.id,
                        ...budgetData
                    }),
                });

                const data = await response.json();
                console.log('📝 Update response:', data);

                if (data.success) {
                    setBudgets(budgets.map(b =>
                        b.id === editingBudget.id ? data.budget : b
                    ));
                    await showAlert({
                        title: 'Budget updated',
                        message: 'Your budget has been saved successfully.',
                        variant: 'success',
                    });
                } else {
                    await showAlert({
                        title: 'Update failed',
                        message: data.error ?? 'Failed to update budget',
                        variant: 'error',
                    });
                }
                setEditingBudget(undefined);
            } else {
                console.log('➕ Creating new budget...');
                const response = await fetch('/api/budgets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(budgetData),
                });

                const data = await response.json();
                console.log('📝 Create response:', data);

                if (response.ok && data.success) {
                    setBudgets([...budgets, data.budget]);
                    await showAlert({
                        title: 'Budget created',
                        message: 'Your new budget is ready to track.',
                        variant: 'success',
                    });
                } else {
                    console.error('❌ API Error:', data);
                    await showAlert({
                        title: 'Create failed',
                        message: data.error ?? data.details ?? 'Failed to create budget',
                        variant: 'error',
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error saving budget:', error);
            await showAlert({
                title: 'Save failed',
                message: 'A network error occurred. Please try again.',
                variant: 'error',
            });
        }
    };

    const handleEditBudget = (budget) => {
        console.log('✏️ Editing budget:', budget);
        setEditingBudget(budget);
        setShowCreateModal(true);
    };

    const handleDeleteBudget = async (budget) => {
        const confirmed = await showConfirm({
            title: 'Delete budget',
            message: `Delete your ${budget.category} budget of $${Number(budget.amount).toLocaleString()}? This cannot be undone.`,
            confirmLabel: 'Delete',
            destructive: true,
            variant: 'warning',
        });
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/budgets?id=${budget.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setBudgets(budgets.filter(b => b.id !== budget.id));
                await showAlert({
                    title: 'Budget deleted',
                    message: 'The budget has been removed.',
                    variant: 'success',
                });
            } else {
                await showAlert({
                    title: 'Delete failed',
                    message: data.error ?? 'Failed to delete budget',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('❌ Error deleting budget:', error);
            await showAlert({
                title: 'Delete failed',
                message: 'A network error occurred. Please try again.',
                variant: 'error',
            });
        }
    };

    // Calculate totals from actual budget data
    const totalBudget = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCount = budgets.filter(b => (b.spent || 0) > (b.amount || 0)).length;
    const nearLimitCount = budgets.filter(b => {
        const percentage = ((b.spent || 0) / (b.amount || 1)) * 100;
        return percentage >= 80 && (b.spent || 0) <= (b.amount || 0);
    }).length;

    if (loading) {
        return (
            <PageShell>
                <AppNav subtitle="Budgets" />
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                        <p className="font-medium text-slate-900">Loading budgets</p>
                    </div>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <AppNav subtitle="Budgets" />

            <div className={layout.page}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <h1 className={`${typography.pageTitle} mb-1`}>
                            Budget management
                        </h1>
                        <p className={typography.pageSubtitle}>Take control of your spending with smart budgets</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className={buttons.primary}
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>Create budget</span>
                    </button>
                </div>

                <div className={layout.gridStats}>
                    <div className={summaryStat.card}>
                        <div className="mb-2 flex items-center justify-between">
                            <p className={typography.label}>Total budget</p>
                            <div className={iconBadge.sm}><Target className="h-4 w-4" /></div>
                        </div>
                        <p className={summaryStat.value}>${totalBudget.toLocaleString()}</p>
                    </div>
                    <div className={summaryStat.card}>
                        <div className="mb-2 flex items-center justify-between">
                            <p className={typography.label}>Total spent</p>
                            <div className={iconBadge.danger}><TrendingUp className="h-4 w-4" /></div>
                        </div>
                        <p className={`${summaryStat.value} text-red-600`}>${totalSpent.toLocaleString()}</p>
                    </div>
                    <div className={summaryStat.card}>
                        <div className="mb-2 flex items-center justify-between">
                            <p className={typography.label}>Remaining</p>
                            <div className={totalRemaining >= 0 ? iconBadge.success : iconBadge.danger}>
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <p className={`${summaryStat.value} ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${Math.abs(totalRemaining).toLocaleString()}
                        </p>
                    </div>
                    <div className={summaryStat.card}>
                        <div className="mb-2 flex items-center justify-between">
                            <p className={typography.label}>Alerts</p>
                            <div className={iconBadge.warning}><AlertTriangle className="h-4 w-4" /></div>
                        </div>
                        <p className={`${summaryStat.value} text-amber-600`}>{overBudgetCount + nearLimitCount}</p>
                        <p className={summaryStat.sub}>{overBudgetCount} over · {nearLimitCount} near limit</p>
                    </div>
                </div>

                {budgets.length > 0 ? (
                    <div className={layout.gridCards}>
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onEdit={handleEditBudget}
                                onDelete={() => handleDeleteBudget(budget)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className={`${iconBadge.sm} mx-auto mb-3 h-10 w-10`}>
                            <Target className="h-5 w-5" />
                        </div>
                        <h2 className="mb-2 text-lg font-semibold text-slate-900">No budgets yet</h2>
                        <p className="mb-4 text-sm text-slate-600">Create your first budget to start tracking spending</p>
                        <button onClick={() => setShowCreateModal(true)} className={buttons.primary}>
                            Create your first budget
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Budget Modal */}
            <CreateBudgetModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingBudget(undefined);
                }}
                onSave={handleSaveBudget}
                editingBudget={editingBudget}
            />
        </PageShell>
    );
};