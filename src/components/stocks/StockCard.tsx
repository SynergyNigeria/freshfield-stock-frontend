"use client";

import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Stock } from "@/types";
import { formatCurrency, formatPercent, formatChange, cn } from "@/lib/utils";

interface StockCardProps {
  stock: Stock;
  variant?: "list" | "grid";
}

export default function StockCard({ stock, variant = "list" }: StockCardProps) {
  const positive = stock.change >= 0;

  if (variant === "grid") {
    return (
      <Link href={`/stocks/${stock.ticker}`}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 hover:border-green-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] flex flex-col gap-2">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Image
                  src={stock.logo}
                  alt={stock.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `<span class="text-xs font-bold text-gray-500">${stock.ticker.slice(0, 2)}</span>`;
                  }}
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{stock.ticker}</p>
                <p className="text-[9px] text-gray-400 truncate">{stock.sector}</p>
              </div>
            </div>
            <div
              className={cn(
                "flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold",
                positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              )}
            >
              {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {formatPercent(stock.changePercent)}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(stock.price)}</p>
            <p className={cn("text-[10px] font-medium", positive ? "text-green-600" : "text-red-500")}>
              {formatChange(stock.change)} today
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/stocks/${stock.ticker}`}>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100 rounded-xl">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
          <Image
            src={stock.logo}
            alt={stock.name}
            width={40}
            height={40}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              target.parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-500">${stock.ticker.slice(0, 2)}</span>`;
            }}
            unoptimized
          />
        </div>

        {/* Name & ticker */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{stock.name}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="font-medium text-gray-600">{stock.ticker}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{stock.sector}</span>
          </p>
        </div>

        {/* Price & change */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-gray-900">{formatCurrency(stock.price)}</p>
          <p
            className={cn(
              "text-xs font-semibold flex items-center justify-end gap-0.5",
              positive ? "text-green-600" : "text-red-500"
            )}
          >
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercent(stock.changePercent)}
          </p>
        </div>
      </div>
    </Link>
  );
}
