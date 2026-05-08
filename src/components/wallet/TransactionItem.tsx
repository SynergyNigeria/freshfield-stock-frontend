"use client";

import { ArrowDownLeft, ArrowUpRight, ShoppingCart, Package } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
}

const typeConfig = {
  deposit: {
    icon: ArrowDownLeft,
    label: "Deposit",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    amountColor: "text-green-600",
    prefix: "+",
  },
  withdrawal: {
    icon: ArrowUpRight,
    label: "Withdrawal",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    amountColor: "text-red-500",
    prefix: "-",
  },
  buy: {
    icon: ShoppingCart,
    label: "Buy",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    amountColor: "text-gray-900",
    prefix: "-",
  },
  sell: {
    icon: Package,
    label: "Sell",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    amountColor: "text-green-600",
    prefix: "+",
  },
};

const statusStyles = {
  completed: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
};

export default function TransactionItem({ transaction: txn }: TransactionItemProps) {
  const config = typeConfig[txn.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.iconBg)}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900">
            {txn.ticker ? `${config.label} ${txn.ticker}` : config.label}
          </p>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", statusStyles[txn.status])}>
            {txn.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {txn.shares ? `${txn.shares} shares @ ${formatCurrency(txn.pricePerShare!)} · ` : ""}
          {formatDate(txn.date)}
        </p>
      </div>

      <p className={cn("text-sm font-bold flex-shrink-0", config.amountColor)}>
        {config.prefix}{formatCurrency(txn.amount)}
      </p>
    </div>
  );
}
