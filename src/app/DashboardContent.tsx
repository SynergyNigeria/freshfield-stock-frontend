"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, ArrowRight, Wallet, BarChart3, Activity } from "lucide-react";
import { STOCKS, MOCK_HOLDINGS, WALLET_BALANCE } from "@/lib/mockData";
import { formatCurrency, formatPercent, formatChange, cn } from "@/lib/utils";
import StockCard from "@/components/stocks/StockCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <DashboardSkeleton />;
  const topGainers = [...STOCKS]
    .filter((s) => s.change > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3);

  const topLosers = [...STOCKS]
    .filter((s) => s.change < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 3);

  const totalPortfolioValue = MOCK_HOLDINGS.reduce(
    (acc, h) => acc + h.shares * h.currentPrice,
    0
  );
  const totalCost = MOCK_HOLDINGS.reduce(
    (acc, h) => acc + h.shares * h.avgCost,
    0
  );
  const totalPnL = totalPortfolioValue - totalCost;
  const totalPnLPct = (totalPnL / totalCost) * 100;
  const isPortfolioPositive = totalPnL >= 0;

  const watchlist = STOCKS.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero strip + floating stat card */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Green band */}
        <div className="bg-green-600 px-4 sm:px-6 lg:px-8 pt-6 pb-14">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-white/70" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Cash Balance</span>
            </div>
            <Link href="/wallet">
              <span className="text-xs font-medium text-white/60 hover:text-white underline underline-offset-2 transition-colors">
                Manage
              </span>
            </Link>
          </div>
          <p className="text-4xl font-extrabold text-white tracking-tight">{formatCurrency(WALLET_BALANCE)}</p>
          <p className="text-xs text-white/50 mt-1">Available to invest</p>
        </div>

        {/* Floating white card — overlaps the green band */}
        <div className="absolute -bottom-10 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex divide-x divide-gray-100 overflow-hidden">
            {/* Portfolio value */}
            <div className="flex-1 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Portfolio</span>
              </div>
              <p className="text-base font-bold text-gray-900 leading-tight">{formatCurrency(totalPortfolioValue)}</p>
              <p className={cn("text-[10px] font-semibold mt-0.5 flex items-center gap-0.5", isPortfolioPositive ? "text-green-600" : "text-red-500")}>
                {isPortfolioPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(totalPnLPct)}
              </p>
            </div>

            {/* Market status */}
            <div className="flex-1 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Market</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-base font-bold text-gray-900">Open</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">NYSE · NASDAQ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to compensate for the floating card overlap */}
      <div className="h-6" />

      {/* Top Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gainers */}
        <Card padding="none">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Top Gainers</h2>
            </div>
            <Link href="/markets?filter=gainers" className="text-xs text-green-600 font-medium hover:text-green-700">
              See all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topGainers.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        </Card>

        {/* Losers */}
        <Card padding="none">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Top Losers</h2>
            </div>
            <Link href="/markets?filter=losers" className="text-xs text-green-600 font-medium hover:text-green-700">
              See all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topLosers.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        </Card>
      </div>

      {/* Watchlist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Watchlist</h2>
          <Link href="/markets">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              All stocks
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {watchlist.map((stock) => (
            <StockCard key={stock.ticker} stock={stock} variant="grid" />
          ))}
        </div>
      </div>

      {/* Holdings preview */}
      {MOCK_HOLDINGS.length > 0 && (
        <Card padding="none">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">My Holdings</h2>
            <Link href="/portfolio" className="text-xs text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_HOLDINGS.map((holding) => {
              const value = holding.shares * holding.currentPrice;
              const cost = holding.shares * holding.avgCost;
              const pnl = value - cost;
              const pnlPct = (pnl / cost) * 100;
              const positive = pnl >= 0;

              return (
                <Link key={holding.ticker} href={`/stocks/${holding.ticker}`}>
                  <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <Image
                        src={holding.logo}
                        alt={holding.name}
                        width={36}
                        height={36}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{holding.ticker}</p>
                      <p className="text-xs text-gray-400">{holding.shares} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(value)}</p>
                      <p className={cn("text-xs font-semibold", positive ? "text-green-600" : "text-red-500")}>
                        {positive ? "+" : ""}{formatChange(pnl)} ({formatPercent(pnlPct)})
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
