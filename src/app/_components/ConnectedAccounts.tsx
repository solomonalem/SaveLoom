"use client";

import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface BankAccount {
    id: string;
    accountName: string;
    bankName: string;
    accountType: string;
    currentBalance: number;
    mask: string;
    isActive: boolean;
    createdAt: string;
}

interface RemovalConfirmationProps {
    account: BankAccount;
    onConfirm: () => void;
    onCancel: () => void;
    isRemoving: boolean;
}

interface StatusModalProps {
    type: 'success' | 'error';
    title: string;
    message: string;
    onClose: () => void;
}

const StatusModal = ({ type, title, message, onClose }: StatusModalProps) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50">
            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-6 ${type === 'success'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                    }`}>
                    {type === 'success' ? (
                        <CheckCircle className="w-8 h-8" />
                    ) : (
                        <AlertTriangle className="w-8 h-8" />
                    )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

                <button
                    onClick={onClose}
                    className={`w-full px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${type === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                        }`}
                >
                    Got it
                </button>
            </div>
        </div>
    </div>
);

const RemovalConfirmationModal = ({ account, onConfirm, onCancel, isRemoving }: RemovalConfirmationProps) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-100 rounded-2xl">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Remove Account?</h3>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                    <div className="font-semibold text-gray-900">{account.accountName}</div>
                    <div className="text-sm text-gray-600">{account.bankName} •••• {account.mask}</div>
                    <div className="text-lg font-bold text-gray-900 mt-2">
                        ${account.currentBalance.toLocaleString()}
                    </div>
                </div>

                <div className="text-gray-600 text-sm leading-relaxed">
                    <p className="mb-3">
                        <strong>What happens when you remove this account:</strong>
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Account will be hidden from your dashboard</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Transaction history will be preserved</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>You can reconnect this account later</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>Your data remains secure</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-semibold"
                    disabled={isRemoving}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isRemoving}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                    {isRemoving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Removing...</span>
                        </>
                    ) : (
                        <span>Remove Account</span>
                    )}
                </button>
            </div>
        </div>
    </div>
);

export default function ConnectedAccounts() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRemoved, setShowRemoved] = useState(false);
    const [showAllActive, setShowAllActive] = useState(false);
    const [showAllRemoved, setShowAllRemoved] = useState(false);
    const [accountToRemove, setAccountToRemove] = useState<BankAccount | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [statusModal, setStatusModal] = useState<{
        show: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    const MAX_ACCOUNTS_DISPLAY = 8;

    useEffect(() => {
        fetchAccounts();
    }, []);

    const showStatusModal = (type: 'success' | 'error', title: string, message: string) => {
        setStatusModal({
            show: true,
            type,
            title,
            message
        });
    };

    const hideStatusModal = () => {
        setStatusModal(prev => ({ ...prev, show: false }));
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bank-accounts');
            const data = await response.json();

            // Include both active and inactive accounts
            setAccounts(data.accounts || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            showStatusModal(
                'error',
                'Failed to Load Accounts',
                'There was an error loading your bank accounts. Please refresh the page and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAccount = async (account: BankAccount) => {
        setAccountToRemove(account);
    };

    const confirmRemoval = async () => {
        if (!accountToRemove) return;

        try {
            setIsRemoving(true);
            const response = await fetch(`/api/bank-accounts/${accountToRemove.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Update local state to mark account as inactive
                setAccounts(prev =>
                    prev.map(acc =>
                        acc.id === accountToRemove.id
                            ? { ...acc, isActive: false }
                            : acc
                    )
                );

                // Close removal modal first
                setAccountToRemove(null);

                // Show success modal
                showStatusModal(
                    'success',
                    'Account Removed Successfully!',
                    `${accountToRemove.accountName} has been removed from your dashboard. Your transaction history is preserved and you can reconnect this account anytime.`
                );
            } else {
                const errorData = await response.json();
                showStatusModal(
                    'error',
                    'Failed to Remove Account',
                    `We couldn't remove your account: ${errorData.error}. Please try again or contact support if the problem persists.`
                );
            }
        } catch (error) {
            console.error('Error removing account:', error);
            showStatusModal(
                'error',
                'Connection Error',
                'There was a network error while removing your account. Please check your connection and try again.'
            );
        } finally {
            setIsRemoving(false);
            setAccountToRemove(null);
        }
    };

    const handleReconnectAccount = async (account: BankAccount) => {
        try {
            const response = await fetch(`/api/bank-accounts/${account.id}/reconnect`, {
                method: 'POST',
            });

            if (response.ok) {
                // Update local state to mark account as active
                setAccounts(prev =>
                    prev.map(acc =>
                        acc.id === account.id
                            ? { ...acc, isActive: true }
                            : acc
                    )
                );

                showStatusModal(
                    'success',
                    'Account Reconnected!',
                    `${account.accountName} has been successfully reconnected and will appear in your dashboard.`
                );
            } else {
                const errorData = await response.json();
                showStatusModal(
                    'error',
                    'Failed to Reconnect Account',
                    `We couldn't reconnect your account: ${errorData.error || 'Unknown error'}. Please try again.`
                );
            }
        } catch (error) {
            console.error('Error reconnecting account:', error);
            showStatusModal(
                'error',
                'Connection Error',
                'There was a network error while reconnecting your account. Please check your connection and try again.'
            );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getAccountTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'checking': return '🏦';
            case 'savings': return '💰';
            case 'credit': return '💳';
            case 'investment': return '📈';
            default: return '🏛️';
        }
    };

    const activeAccounts = accounts.filter(acc => acc.isActive);
    const removedAccounts = accounts.filter(acc => !acc.isActive);

    // Display logic for active accounts
    const displayedActiveAccounts = showAllActive
        ? activeAccounts
        : activeAccounts.slice(0, MAX_ACCOUNTS_DISPLAY);

    const hiddenActiveCount = activeAccounts.length - MAX_ACCOUNTS_DISPLAY;
    const shouldShowExpandActive = hiddenActiveCount > 0;

    // Display logic for removed accounts  
    const displayedRemovedAccounts = showAllRemoved
        ? removedAccounts
        : removedAccounts.slice(0, MAX_ACCOUNTS_DISPLAY);

    const hiddenRemovedCount = removedAccounts.length - MAX_ACCOUNTS_DISPLAY;
    const shouldShowExpandRemoved = hiddenRemovedCount > 0;

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-2xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🏦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No accounts connected</h3>
                <p className="text-gray-600">Connect your first bank account to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Accounts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                            Active Accounts ({activeAccounts.length})
                        </h4>

                        <p className="text-sm text-gray-600 mt-1">
                            {activeAccounts.length} account{activeAccounts.length !== 1 ? 's' : ''} total
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {shouldShowExpandActive && (
                            <button
                                onClick={() => setShowAllActive(!showAllActive)}
                                className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl"
                            >
                                {showAllActive ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        <span>Show Less</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        <span>Show All ({activeAccounts.length})</span>
                                    </>
                                )}
                            </button>
                        )}
                        {removedAccounts.length > 0 && (
                            <button
                                onClick={() => setShowRemoved(!showRemoved)}
                                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl"
                            >
                                {showRemoved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                <span>{showRemoved ? 'Hide' : 'Show'} removed ({removedAccounts.length})</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {displayedActiveAccounts.map((account) => (
                        <div key={account.id} className="group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-3xl">
                                        {getAccountTypeIcon(account.accountType)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{account.accountName}</h4>
                                        <p className="text-sm text-gray-600">{account.bankName}</p>
                                        <p className="text-xs text-gray-500">•••• {account.mask}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(account.currentBalance)}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {account.accountType}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveAccount(account)}
                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl transition-all duration-200"
                                        title="Remove account"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show collapsed accounts indicator */}
                {!showAllActive && shouldShowExpandActive && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setShowAllActive(true)}
                            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-4 py-3 rounded-2xl border border-gray-200 hover:border-indigo-200"
                        >
                            <span>+{hiddenActiveCount} more account{hiddenActiveCount > 1 ? 's' : ''} hidden</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Removed Accounts (if shown) */}
            {showRemoved && removedAccounts.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                            Removed Accounts ({removedAccounts.length})
                        </h4>
                        {shouldShowExpandRemoved && (
                            <button
                                onClick={() => setShowAllRemoved(!showAllRemoved)}
                                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl"
                            >
                                {showAllRemoved ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        <span>Show Less</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        <span>Show All ({removedAccounts.length})</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {displayedRemovedAccounts.map((account) => (
                            <div key={account.id} className="bg-gray-100/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/40 opacity-75">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-3xl opacity-50">
                                            {getAccountTypeIcon(account.accountType)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-700">{account.accountName}</h4>
                                            <p className="text-sm text-gray-500">{account.bankName}</p>
                                            <p className="text-xs text-gray-400">•••• {account.mask} • Removed</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleReconnectAccount(account)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm font-semibold"
                                    >
                                        Reconnect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show collapsed removed accounts indicator */}
                    {!showAllRemoved && shouldShowExpandRemoved && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setShowAllRemoved(true)}
                                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-2xl border border-gray-200 hover:border-gray-300"
                            >
                                <span>+{hiddenRemovedCount} more removed account{hiddenRemovedCount > 1 ? 's' : ''} hidden</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Status Modal (Success/Error) */}
            {statusModal.show && (
                <StatusModal
                    type={statusModal.type}
                    title={statusModal.title}
                    message={statusModal.message}
                    onClose={hideStatusModal}
                />
            )}

            {/* Removal Confirmation Modal */}
            {accountToRemove && (
                <RemovalConfirmationModal
                    account={accountToRemove}
                    onConfirm={confirmRemoval}
                    onCancel={() => setAccountToRemove(null)}
                    isRemoving={isRemoving}
                />
            )}
        </div>
    );
}