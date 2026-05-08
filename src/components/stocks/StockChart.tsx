"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";

interface StockChartProps {
  data: ChartDataPoint[];
  color?: string;
  ticker: string;
}

const RANGES = [
  { label: "1W", days: 5 },
  { label: "1M", days: 22 },
  { label: "3M", days: 66 },
  { label: "6M", days: 132 },
  { label: "1Y", days: 252 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-left">
        <p className="text-xs text-gray-500 mb-1">{formatShortDate(point.time)}</p>
        <p className="text-sm font-bold text-gray-900">{formatCurrency(point.close)}</p>
        <div className="mt-1 flex gap-3 text-[10px] text-gray-500">
          <span>O: {formatCurrency(point.open)}</span>
          <span>H: {formatCurrency(point.high)}</span>
          <span>L: {formatCurrency(point.low)}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function StockChart({ data, color = "#06d001", ticker }: StockChartProps) {
  const [activeRange, setActiveRange] = useState("1M");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedRange = RANGES.find((r) => r.label === activeRange)!;
  const chartData = data.slice(-selectedRange.days);

  const firstClose = chartData[0]?.close ?? 0;
  const lastClose = chartData[chartData.length - 1]?.close ?? 0;
  const isPositive = lastClose >= firstClose;
  const chartColor = isPositive ? "#16a34a" : "#ef4444";

  return (
    <div className="w-full">
      {/* Range selector */}
      <div className="flex items-center gap-1 mb-4">
        {RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() => setActiveRange(range.label)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeRange === range.label
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[220px] md:h-[280px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(v) => formatShortDate(v)}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                domain={["auto", "auto"]}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#grad-${ticker})`}
                dot={false}
                activeDot={{ r: 4, fill: chartColor, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
