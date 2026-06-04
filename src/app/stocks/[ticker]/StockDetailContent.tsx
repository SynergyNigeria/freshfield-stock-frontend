"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  Share2,
  Info,
  ShoppingCart,
  Package,
  X,
  CheckCircle2,
} from "lucide-react";
import { stocksApi, ordersApi, APIError } from "@/lib/api";
import { adaptStock } from "@/lib/adapters";
import { generateChartData, STOCKS } from "@/lib/mockData";
import { Stock } from "@/types";
import {
  formatCurrency,
  formatPercent,
  formatChange,
  cn,
} from "@/lib/utils";
import StockChart from "@/components/stocks/StockChart";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface StockDetailContentProps {
  ticker: string;
}

type OrderType = "buy" | "sell";

export default function StockDetailContent({ ticker }: StockDetailContentProps) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [orderType, setOrderType] = useState<OrderType>("buy");
  const [shares, setShares] = useState("");
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ type: OrderType; shares: number; total: number } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    stocksApi.detail(ticker)
      .then((s) => setStock(adaptStock(s)))
      .catch(() => {
        const mock = STOCKS.find((s) => s.ticker === ticker);
        if (mock) setStock(mock);
      });
  }, [ticker]);

  if (!stock) return null;

  const chartData = generateChartData(stock.price, 365);
  const positive = stock.change >= 0;

  const sharesNum = parseFloat(shares) || 0;
  const orderTotal = sharesNum * stock.price;

  async function handleConfirmOrder() {
    if (sharesNum <= 0) return;
    setOrderLoading(true);
    setOrderError(null);
    try {
      const result = await ordersApi.place(stock!.ticker, orderType, sharesNum);
      const total = parseFloat(result.total);
      setShowOrderPanel(false);
      setShares("");
      setSuccessDetails({ type: orderType, shares: sharesNum, total });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      if (err instanceof APIError) {
        setOrderError(err.message);
      } else {
        setOrderError("Order failed. Please try again.");
      }
    } finally {
      setOrderLoading(false);
    }
  }

  const statsRows = [
    { label: "Open", value: formatCurrency(stock.price - stock.change) },
    { label: "52W High", value: formatCurrency(stock.high52w) },
    { label: "52W Low", value: formatCurrency(stock.low52w) },
    { label: "Volume", value: stock.volume },
    { label: "Market Cap", value: stock.marketCap },
    { label: "P/E Ratio", value: stock.pe.toFixed(1) },
    { label: "Dividend", value: stock.dividend > 0 ? `$${stock.dividend.toFixed(2)}` : "—" },
    { label: "Sector", value: stock.sector },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Back nav */}
      <Link
        href="/markets"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Markets
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
            <Image
              src={stock.logo}
              alt={stock.name}
              width={48}
              height={48}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{stock.ticker}</h1>
              <Badge variant="neutral" size="sm">{stock.sector}</Badge>
            </div>
            <p className="text-sm text-gray-500">{stock.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWatchlisted(!watchlisted)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
              watchlisted
                ? "bg-amber-50 border-amber-200 text-amber-500"
                : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
            )}
            aria-label={watchlisted ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star className="w-4 h-4" fill={watchlisted ? "currentColor" : "none"} />
          </button>
          <button
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3">
        <p className="text-4xl font-bold text-gray-900 tracking-tight">
          {formatCurrency(stock.price)}
        </p>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-sm font-semibold mb-1",
            positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          )}
        >
          {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {formatChange(stock.change)} ({formatPercent(stock.changePercent)})
        </div>
      </div>

      {/* Chart */}
      <Card>
        <StockChart data={chartData} ticker={stock.ticker} />
      </Card>

      {/* CTA buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          fullWidth
          size="lg"
          icon={ShoppingCart}
          onClick={() => { setOrderType("buy"); setOrderError(null); setShowOrderPanel(true); }}
        >
          Buy {stock.ticker}
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="outline"
          icon={Package}
          onClick={() => { setOrderType("sell"); setOrderError(null); setShowOrderPanel(true); }}
        >
          Sell {stock.ticker}
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-gray-900">Key Statistics</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0">
          {statsRows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Order modal */}
      {showOrderPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOrderPanel(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 z-10">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {orderType === "buy" ? "Buy" : "Sell"} {stock.ticker}
              </h3>
              <button
                onClick={() => setShowOrderPanel(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order type toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              {(["buy", "sell"] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setOrderType(type); setOrderError(null); }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                    orderType === type
                      ? type === "buy"
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-red-500 text-white shadow-sm"
                      : "text-gray-500"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Current price */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">Market Price</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(stock.price)}</span>
            </div>

            {/* Shares input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Number of Shares
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Order total */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl mb-4">
              <span className="text-sm font-medium text-green-800">Est. Total</span>
              <span className="text-lg font-bold text-green-700">{formatCurrency(orderTotal)}</span>
            </div>

            {/* Error */}
            {orderError && (
              <p className="text-red-500 text-sm mb-3 text-center rounded-xl py-2 px-3 bg-red-50">
                {orderError}
              </p>
            )}

            <Button
              fullWidth
              size="lg"
              variant={orderType === "buy" ? "primary" : "danger"}
              onClick={handleConfirmOrder}
              disabled={sharesNum <= 0 || orderLoading}
            >
              {orderLoading
                ? "Processing…"
                : orderType === "buy"
                ? "Confirm Purchase"
                : "Confirm Sale"}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Market order · Executes immediately at best available price
            </p>
          </div>
        </div>
      )}

      {/* ── Success toast popup ── */}
      {showSuccess && successDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
          <div
            className="pointer-events-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center gap-4 w-full max-w-xs animate-in fade-in zoom-in duration-300"
            style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(6,208,1,0.1)" }}
          >
            {/* Animated check circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%)" }}
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={1.8} />
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 mb-1">
                Order {successDetails.type === "buy" ? "Purchased" : "Sold"}!
              </p>
              <p className="text-sm text-gray-500">
                {successDetails.shares} {successDetails.shares === 1 ? "share" : "shares"} of{" "}
                <span className="font-semibold text-gray-900">{stock.ticker}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total: <span className="font-semibold text-gray-700">{formatCurrency(successDetails.total)}</span>
              </p>
            </div>

            {/* Progress bar that drains as toast expires */}
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ animation: "drain 4s linear forwards" }}
              />
            </div>

            <style>{`
              @keyframes drain {
                from { width: 100%; }
                to   { width: 0%; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );

}
