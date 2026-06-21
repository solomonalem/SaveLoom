"use client";

import { useState, useEffect } from 'react';
import {
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
    X,
    ChevronDown,
    ChevronUp,
    Building2,
} from 'lucide-react';
import MerchantIcon from '~/app/_components/MerchantIcon';
import { buttons, listRow, surfaces, typography } from '~/lib/design';
import { useAppModal } from '~/app/_components/modal/ModalProvider';

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

const accountTypeCategory: Record<string, string> = {
    checking: 'Banking & Finance',
    savings: 'Banking & Finance',
    credit: 'Payment',
    investment: 'Income',
};

interface RemovalConfirmationProps {
    account: BankAccount;
    onConfirm: () => void;
    onCancel: () => void;
    isRemoving: boolean;
}

const RemovalConfirmationModal = ({ account, onConfirm, onCancel, isRemoving }: RemovalConfirmationProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
        <div className={`${surfaces.card} w-full max-w-md p-5`}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className={typography.sectionTitle}>Remove account?</h3>
                <button type="button" onClick={onCancel} className={buttons.ghost} aria-label="Close">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className={`${surfaces.inset} mb-4 p-3`}>
                <div className="text-sm font-medium text-slate-900">{account.accountName}</div>
                <div className={typography.listMeta}>{account.bankName} •••• {account.mask}</div>
                <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                    ${account.currentBalance.toLocaleString()}
                </div>
            </div>
            <p className="mb-4 text-sm text-slate-600">
                The account will be hidden from your dashboard. Transaction history is preserved and you can reconnect later.
            </p>
            <div className="flex gap-2">
                <button type="button" onClick={onCancel} className={`${buttons.secondary} flex-1`} disabled={isRemoving}>
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isRemoving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {isRemoving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Remove
                </button>
            </div>
        </div>
    </div>
);

function AccountRow({
    account,
    muted = false,
    onRemove,
    onReconnect,
}: {
    account: BankAccount;
    muted?: boolean;
    onRemove?: () => void;
    onReconnect?: () => void;
}) {
    return (
        <div className={`${listRow.item} group ${muted ? 'opacity-70' : ''}`}>
            <MerchantIcon
                bankName={account.bankName}
                category={accountTypeCategory[account.accountType.toLowerCase()] ?? 'Banking & Finance'}
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className={`truncate ${typography.listTitle}`}>{account.accountName}</p>
                    <span className="hidden shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500 sm:inline">
                        {account.accountType}
                    </span>
                </div>
                <p className={`truncate ${typography.listMeta}`}>
                    {account.bankName} •••• {account.mask}
                    {muted ? ' · Removed' : ''}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {!muted && (
                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.currentBalance)}
                    </span>
                )}
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        title="Remove account"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
                {onReconnect && (
                    <button type="button" onClick={onReconnect} className={buttons.secondary}>
                        Reconnect
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ConnectedAccounts() {
    const { showAlert } = useAppModal();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRemoved, setShowRemoved] = useState(false);
    const [showAllActive, setShowAllActive] = useState(false);
    const [showAllRemoved, setShowAllRemoved] = useState(false);
    const [accountToRemove, setAccountToRemove] = useState<BankAccount | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const PREVIEW_COUNT = 5;

    useEffect(() => {
        void fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bank-accounts');
            const data = await response.json();
            setAccounts(data.accounts || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            await showAlert({
                title: 'Failed to load accounts',
                message: 'Please refresh the page and try again.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmRemoval = async () => {
        if (!accountToRemove) return;

        try {
            setIsRemoving(true);
            const response = await fetch(`/api/bank-accounts/${accountToRemove.id}`, { method: 'DELETE' });

            if (response.ok) {
                setAccounts(prev =>
                    prev.map(acc =>
                        acc.id === accountToRemove.id ? { ...acc, isActive: false } : acc
                    )
                );
                setAccountToRemove(null);
                await showAlert({
                    title: 'Account removed',
                    message: `${accountToRemove.accountName} was removed from your dashboard.`,
                    variant: 'success',
                });
            } else {
                const errorData = await response.json();
                await showAlert({
                    title: 'Remove failed',
                    message: errorData.error ?? 'Please try again.',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error removing account:', error);
            await showAlert({
                title: 'Connection error',
                message: 'Could not remove the account. Check your connection.',
                variant: 'error',
            });
        } finally {
            setIsRemoving(false);
        }
    };

    const handleReconnectAccount = async (account: BankAccount) => {
        try {
            const response = await fetch(`/api/bank-accounts/${account.id}/reconnect`, { method: 'POST' });

            if (response.ok) {
                setAccounts(prev =>
                    prev.map(acc => (acc.id === account.id ? { ...acc, isActive: true } : acc))
                );
                await showAlert({
                    title: 'Account reconnected',
                    message: `${account.accountName} is active again.`,
                    variant: 'success',
                });
            } else {
                const errorData = await response.json();
                await showAlert({
                    title: 'Reconnect failed',
                    message: errorData.error ?? 'Please try again.',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error reconnecting account:', error);
            await showAlert({
                title: 'Connection error',
                message: 'Could not reconnect the account.',
                variant: 'error',
            });
        }
    };

    const activeAccounts = accounts.filter(acc => acc.isActive);
    const removedAccounts = accounts.filter(acc => !acc.isActive);

    const displayedActive = showAllActive ? activeAccounts : activeAccounts.slice(0, PREVIEW_COUNT);
    const displayedRemoved = showAllRemoved ? removedAccounts : removedAccounts.slice(0, PREVIEW_COUNT);

    if (loading) {
        return (
            <div className={`${surfaces.list} animate-pulse`}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-11 bg-slate-50" />
                ))}
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-500/[0.06] text-slate-500">
                    <Building2 className="h-4 w-4" />
                </div>
                <p className={typography.listTitle}>No accounts connected</p>
                <p className={`mt-1 ${typography.listMeta}`}>Connect a bank to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <p className={typography.listMeta}>
                    {activeAccounts.length} active
                    {removedAccounts.length > 0 ? ` · ${removedAccounts.length} removed` : ''}
                </p>
                <div className="flex items-center gap-1">
                    {activeAccounts.length > PREVIEW_COUNT && (
                        <button type="button" onClick={() => setShowAllActive(!showAllActive)} className={buttons.ghost}>
                            {showAllActive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            <span className="text-xs">{showAllActive ? 'Less' : 'All'}</span>
                        </button>
                    )}
                    {removedAccounts.length > 0 && (
                        <button type="button" onClick={() => setShowRemoved(!showRemoved)} className={buttons.ghost}>
                            {showRemoved ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            <span className="text-xs">Removed</span>
                        </button>
                    )}
                </div>
            </div>

            <div className={`${surfaces.list} ${listRow.scroll} compact-scroll`}>
                {displayedActive.map((account) => (
                    <AccountRow
                        key={account.id}
                        account={account}
                        onRemove={() => setAccountToRemove(account)}
                    />
                ))}
            </div>

            {showRemoved && removedAccounts.length > 0 && (
                <div>
                    <p className={`mb-2 ${typography.label}`}>Removed</p>
                    <div className={`${surfaces.list} ${showAllRemoved ? listRow.scroll : ''} compact-scroll`}>
                        {displayedRemoved.map((account) => (
                            <AccountRow
                                key={account.id}
                                account={account}
                                muted
                                onReconnect={() => void handleReconnectAccount(account)}
                            />
                        ))}
                    </div>
                    {removedAccounts.length > PREVIEW_COUNT && (
                        <button
                            type="button"
                            onClick={() => setShowAllRemoved(!showAllRemoved)}
                            className={`${buttons.ghost} mt-2 w-full justify-center`}
                        >
                            {showAllRemoved ? 'Show less' : `Show all ${removedAccounts.length} removed`}
                        </button>
                    )}
                </div>
            )}

            {accountToRemove && (
                <RemovalConfirmationModal
                    account={accountToRemove}
                    onConfirm={() => void confirmRemoval()}
                    onCancel={() => setAccountToRemove(null)}
                    isRemoving={isRemoving}
                />
            )}
        </div>
    );
}
