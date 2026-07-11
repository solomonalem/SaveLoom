"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { TransactionListItem } from '~/app/_components/TransactionListItem';
import { buttons, listRow, surfaces, typography } from '~/lib/design';
import { useAppModal } from '~/app/_components/modal/ModalProvider';
import type { Transaction } from '~/types';

interface TransactionHistoryProps {
    previewCount?: number;
    showImport?: boolean;
}

export default function TransactionHistory({
    previewCount = 8,
    showImport = true,
}: TransactionHistoryProps = {}) {
    const { showAlert } = useAppModal();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    useEffect(() => {
        void fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/transactions');
            const data = await response.json();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            await showAlert({
                title: 'Failed to load transactions',
                message: 'Please refresh the page and try again.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const importTransactions = async () => {
        setImporting(true);
        try {
            const response = await fetch('/api/transactions/import', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                await fetchTransactions();
                await showAlert({
                    title: 'Import complete',
                    message: `Imported ${data.imported} new transaction${data.imported === 1 ? '' : 's'}.`,
                    variant: 'success',
                });
            } else {
                await showAlert({
                    title: 'Import failed',
                    message: data.error ?? 'Please check your bank connection and try again.',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error importing transactions:', error);
            await showAlert({
                title: 'Connection error',
                message: 'Could not import transactions.',
                variant: 'error',
            });
        } finally {
            setImporting(false);
        }
    };

    const displayed = showAllTransactions ? transactions : transactions.slice(0, previewCount);
    const hiddenCount = transactions.length - previewCount;

    if (loading) {
        return (
            <div className={`${surfaces.list} animate-pulse`}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-11 bg-slate-50" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className={typography.listTitle}>No transactions yet</p>
                <p className={`mx-auto mt-1 mb-4 max-w-xs ${typography.listMeta}`}>
                    Import from your connected accounts to see spending history.
                </p>
                {showImport && (
                    <button
                        type="button"
                        onClick={() => void importTransactions()}
                        disabled={importing}
                        className={`${buttons.primary} mx-auto`}
                    >
                        {importing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Import transactions
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <p className={typography.listMeta}>{transactions.length} total</p>
                <div className="flex items-center gap-1">
                    {hiddenCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                            className={buttons.ghost}
                        >
                            {showAllTransactions ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                            )}
                            <span className="text-xs">{showAllTransactions ? 'Less' : `+${hiddenCount}`}</span>
                        </button>
                    )}
                    {showImport && (
                        <button
                            type="button"
                            onClick={() => void importTransactions()}
                            disabled={importing}
                            className={buttons.secondary}
                        >
                            {importing ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            <span className="text-xs">Import</span>
                        </button>
                    )}
                </div>
            </div>

            <div className={`${surfaces.list} ${listRow.scroll} compact-scroll`}>
                {displayed.map((transaction) => (
                    <TransactionListItem key={transaction.id} transaction={transaction} />
                ))}
            </div>
        </div>
    );
}
