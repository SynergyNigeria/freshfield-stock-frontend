"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  BriefcaseBusiness,
  ArrowRight,
  PieChart,
} from "lucide-react";
import { MOCK_HOLDINGS, WALLET_BALANCE } from "@/lib/mockData";
import { formatCurrency, formatPercent, formatChange, cn } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = ["#06d001", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];

export default function PortfolioContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const holdings = MOCK_HOLDINGS;

  const positions = holdings.map((h) => {
    const value = h.shares * h.currentPrice;
    const cost = h.shares * h.avgCost;
    const pnl = value - cost;
    const pnlPct = (pnl / cost) * 100;
    return { ...h, value, cost, pnl, pnlPct };
  });

  const totalValue = positions.reduce((a, p) => a + p.value, 0);
  const totalCost = positions.reduce((a, p) => a + p.cost, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const totalAssets = totalValue + WALLET_BALANCE;

  const isPositive = totalPnL >= 0;

  // Sector breakdown for pie chart
  const sectorMap = positions.reduce<Record<string, number>>((acc, p) => {
    acc[p.sector] = (acc[p.sector] ?? 0) + p.value;
    return acc;
  }, {});
  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const pieData = [
    ...sectorData,
    { name: "Cash", value: parseFloat(WALLET_BALANCE.toFixed(2)) },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your investments</p>
      </div>

      {/* Total value card */}
      <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <BriefcaseBusiness className="w-4 h-4 opacity-60" />
            <span className="text-sm opacity-60">Total Assets</span>
          </div>
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(totalAssets)}</p>
          <div className="flex items-center gap-3 mt-3">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold", isPositive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300")}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {formatChange(totalPnL)} ({formatPercent(totalPnLPct)})
            </div>
            <span className="text-xs opacity-40">All time P&L</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Invested</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(totalCost)}</p>
        </Card>
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Current Value</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(totalValue)}</p>
        </Card>
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Gain/Loss</p>
          <p className={cn("text-base font-bold", isPositive ? "text-green-600" : "text-red-500")}>
            {formatChange(totalPnL)}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Cash</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(WALLET_BALANCE)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allocation pie chart */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-bold text-gray-900">Allocation</h2>
          </div>
          <div className="h-44">
            {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        _.name === "Cash"
                          ? "#e5e7eb"
                          : CHART_COLORS[index % CHART_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => typeof v === "number" ? formatCurrency(v) : String(v)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
            ) : null}
          </div>
          {/* Legend */}
          <div className="space-y-1.5 mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        entry.name === "Cash"
                          ? "#e5e7eb"
                          : CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-xs text-gray-600 truncate max-w-[120px]">{entry.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  {((entry.value / totalAssets) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Holdings list */}
        <Card padding="none">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Holdings ({positions.length})</h2>
            <Link href="/markets">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Browse
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {positions.map((pos) => (
              <Link key={pos.ticker} href={`/stocks/${pos.ticker}`}>
                <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <Image
                      src={pos.logo}
                      alt={pos.name}
                      width={36}
                      height={36}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{pos.ticker}</p>
                    <p className="text-xs text-gray-400">{pos.shares} sh · avg {formatCurrency(pos.avgCost)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(pos.value)}</p>
                    <p className={cn("text-xs font-semibold", pos.pnl >= 0 ? "text-green-600" : "text-red-500")}>
                      {pos.pnl >= 0 ? "+" : ""}{formatCurrency(pos.pnl)} ({formatPercent(pos.pnlPct)})
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {positions.length === 0 && (
        <Card className="py-16 text-center">
          <BriefcaseBusiness className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">No holdings yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Start investing by buying your first stock</p>
          <Link href="/markets">
            <Button>Browse Markets</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
