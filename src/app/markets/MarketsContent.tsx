"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { STOCKS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import StockCard from "@/components/stocks/StockCard";
import Card from "@/components/ui/Card";

const SECTORS = ["All", "Technology", "Financials", "Healthcare", "Consumer Discretionary", "Consumer Staples", "Communication Services", "Energy"];
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Gainers", value: "gainers" },
  { label: "Losers", value: "losers" },
  { label: "Most Active", value: "active" },
];

export default function MarketsContent() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [filter, setFilter] = useState("all");
  const [showSectors, setShowSectors] = useState(false);

  const filtered = useMemo(() => {
    let list = [...STOCKS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }

    if (sector !== "All") {
      list = list.filter((s) => s.sector === sector);
    }

    if (filter === "gainers") list = list.filter((s) => s.change > 0).sort((a, b) => b.changePercent - a.changePercent);
    else if (filter === "losers") list = list.filter((s) => s.change < 0).sort((a, b) => a.changePercent - b.changePercent);

    return list;
  }, [search, sector, filter]);

  const gainersCount = STOCKS.filter((s) => s.change > 0).length;
  const losersCount = STOCKS.filter((s) => s.change < 0).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Markets</h1>
        <p className="text-sm text-gray-500 mt-0.5">US Stock Exchange · Real-time data</p>
      </div>

      {/* Market summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Advancing</p>
          <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {gainersCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Declining</p>
          <p className="text-lg font-bold text-red-500 flex items-center justify-center gap-1">
            <TrendingDown className="w-4 h-4" />
            {losersCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Listed</p>
          <p className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
            <BarChart2 className="w-4 h-4 text-gray-500" />
            {STOCKS.length}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks, tickers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowSectors(!showSectors)}
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center transition-all flex-shrink-0",
            showSectors
              ? "bg-green-600 border-green-600 text-white"
              : "bg-white border-gray-200 text-gray-500 hover:text-gray-900"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              filter === value
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sector filter */}
      {showSectors && (
        <div className="flex gap-2 flex-wrap">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                sector === s
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Stock list */}
      <Card padding="none">
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filtered.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">No stocks found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </Card>
    </div>
  );
}
