"use client";

import MerchantIcon from "~/app/_components/MerchantIcon";
import { listRow, typography } from "~/lib/design";
import { formatCurrency, parseMoney } from "~/lib/money";
import { getMerchantDisplayName } from "~/lib/merchant-icons";
import type { Transaction } from "~/types";

type TransactionListItemProps = {
  transaction: Transaction;
  showAccount?: boolean;
};

export function TransactionListItem({
  transaction,
  showAccount = true,
}: TransactionListItemProps) {
  const isExpense = parseMoney(transaction.amount) < 0;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className={listRow.item}>
      <MerchantIcon
        merchantName={transaction.merchantName}
        description={transaction.description}
        category={transaction.category}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate ${typography.listTitle}`}>
          {getMerchantDisplayName(transaction.merchantName, transaction.description)}
        </p>
        <p className={`truncate ${typography.listMeta}`}>
          {transaction.category} · {formatDate(transaction.date)}
          {showAccount && transaction.bankAccount
            ? ` · ${transaction.bankAccount.accountName}`
            : ""}
        </p>
      </div>
      <span
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          isExpense ? "text-red-600" : "text-emerald-600"
        }`}
      >
                {isExpense ? "-" : "+"}
                {formatCurrency(Math.abs(parseMoney(transaction.amount)))}
      </span>
    </div>
  );
}
