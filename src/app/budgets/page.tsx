"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Target, TrendingUp, AlertTriangle, CheckCircle, Settings, Calendar, DollarSign } from 'lucide-react';

const categoryEmojis = {
    'Food and Drink': '🍔',
    'Shops': '🛍️',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Travel': '✈️',
    'Utilities': '💡',
    'Groceries': '🛒',
    'Other': '💰'
};

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

    const getStatusColor = () => {
        if (isOverBudget) return 'from-red-500 to-pink-500';
        if (isNearLimit) return 'from-amber-500 to-orange-500';
        return 'from-emerald-500 to-teal-500';
    };

    const getStatusIcon = () => {
        if (isOverBudget) return <AlertTriangle className="w-5 h-5 text-red-500" />;
        if (isNearLimit) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    };

    return (
        <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${getStatusColor()} shadow-lg`}>
                        <span className="text-2xl">{categoryEmojis[budget.category] || '💰'}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{budget.category}</h3>
                        <p className="text-sm text-gray-600 capitalize">{budget.period} Budget</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <button
                        onClick={() => onEdit(budget)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Spent</span>
                    <span className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        ${(budget.spent || 0).toLocaleString()}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Budget</span>
                    <span className="text-lg font-bold text-gray-900">${(budget.amount || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Remaining</span>
                    <span className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                        {remaining < 0 && ' over'}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600">Progress</span>
                        <span className={`text-xs font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
                            {Math.min(percentage, 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-1000 rounded-full`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Period Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Period: {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}</span>
                        <button className='cursor-pointer hover:text-red-500 hover:shadow-xl' onClick={onDelete}>Delete</button>
                    </div>

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
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                    {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-4 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                            required
                        >
                            <option value="">Select a category</option>
                            {budgetCategories.map(category => (
                                <option key={category} value={category}>
                                    {categoryEmojis[category]} {category}
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
                                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                className={`p-4 rounded-2xl border-2 transition-all ${formData.period === 'weekly'
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
                                className={`p-4 rounded-2xl border-2 transition-all ${formData.period === 'monthly'
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
                            className="flex-1 p-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all font-semibold"
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
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(undefined);
    const [deletingBudget, setDeletingBudget] = useState(undefined);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
                    alert('✅ Budget updated successfully!');
                } else {
                    alert('❌ Failed to update budget: ' + data.error);
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
                    alert('✅ Budget created successfully!');
                } else {
                    console.error('❌ API Error:', data);
                    alert(`❌ Failed to create budget: ${data.error || data.details || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('❌ Error saving budget:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    const handleEditBudget = (budget) => {
        console.log('✏️ Editing budget:', budget);
        setEditingBudget(budget);
        setShowCreateModal(true);
    };

    const handleDeleteBudget = async (budget) => {
        setDeletingBudget(budget);
        setShowDeleteModal(true);
    };

    const confirmDeleteBudget = async () => {
        if (!deletingBudget) return;

        try {
            console.log('🗑️ Deleting budget:', deletingBudget.id);
            const response = await fetch(`/api/budgets?id=${deletingBudget.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            console.log('🗑️ Delete response:', data);

            if (data.success) {
                setBudgets(budgets.filter(b => b.id !== deletingBudget.id));
                alert('✅ Budget deleted successfully!');
            } else {
                alert('❌ Failed to delete budget: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Error deleting budget:', error);
            alert('❌ Network error. Please try again.');
        } finally {
            setDeletingBudget(undefined);
            setShowDeleteModal(false);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

                <nav className="relative bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between h-20">
                            <div className="flex items-center animate-pulse">
                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mr-4"></div>
                                <div className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-8 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-4xl animate-pulse">🎯</div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            Loading Budgets
                        </h2>
                        <p className="text-gray-600 text-lg">Fetching your budget data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

            {/* Navigation */}
            <nav className="relative bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50 z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mr-5 shadow-2xl">
                                <span className="text-lg font-black text-white">SL</span>
                            </div>
                            <div>
                                <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    SaveLoom
                                </span>
                                <p className="text-sm text-gray-500 font-medium">Budget Management</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="/" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50">
                                Setup
                            </a>
                            <a href="/analytics" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50">
                                Analytics
                            </a>
                            <a href="/budgets" className="text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-50 shadow-sm">
                                Budgets
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Budget Management
                        </h1>
                        <p className="text-gray-600 text-xl">Take control of your spending with smart budgets</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Create Budget</span>
                    </button>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Budget</p>
                                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    ${totalBudget.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Spent</p>
                                <p className="text-4xl font-black text-red-600">
                                    ${totalSpent.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Remaining</p>
                                <p className={`text-4xl font-black ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    ${Math.abs(totalRemaining).toLocaleString()}
                                </p>
                            </div>
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${totalRemaining >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-pink-600'} shadow-lg`}>
                                <DollarSign className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Alerts</p>
                                <p className="text-4xl font-black text-amber-600">
                                    {overBudgetCount + nearLimitCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {overBudgetCount} over, {nearLimitCount} near limit
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                <AlertTriangle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget Cards Grid */}
                {budgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    <div className="text-center py-16">
                        <div className="text-8xl mb-6">🎯</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Budgets Yet</h2>
                        <p className="text-gray-600 text-lg mb-8">Create your first budget to start tracking your spending</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold"
                        >
                            Create Your First Budget
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingBudget(undefined);
                }}
                onConfirm={confirmDeleteBudget}
                budget={deletingBudget}
            />
        </div>
    );
};

// Enhanced Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, budget }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50">
                <div className="text-center">
                    <div className="text-6xl mb-4">🗑️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Delete Budget?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete your <strong>{budget?.category}</strong> budget
                        of <strong>${budget?.amount?.toLocaleString()}</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        This action cannot be undone, but you can always create a new budget for this category.
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 p-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 p-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:shadow-xl transition-all font-semibold"
                    >
                        Delete Budget
                    </button>
                </div>
            </div>
        </div>
    );
};