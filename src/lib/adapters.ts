import { Stock, Holding, Transaction } from "@/types";
import { APIStock, APIHolding, APITransaction } from "@/lib/api";

export function adaptStock(s: APIStock): Stock {
  return {
    ticker: s.ticker,
    name: s.name,
    price: parseFloat(s.price),
    change: parseFloat(s.change),
    changePercent: parseFloat(s.change_percent),
    volume: formatVolume(s.volume),
    marketCap: formatMarketCap(s.market_cap),
    high52w: parseFloat(s.high_52w),
    low52w: parseFloat(s.low_52w),
    pe: parseFloat(s.pe),
    dividend: parseFloat(s.dividend),
    sector: s.sector,
    logo: s.logo,
  };
}

export function adaptHolding(h: APIHolding): Holding {
  return {
    ticker: h.stock.ticker,
    name: h.stock.name,
    logo: h.stock.logo,
    shares: parseFloat(h.shares),
    avgCost: parseFloat(h.avg_cost),
    currentPrice: parseFloat(h.stock.price),
    sector: h.stock.sector,
  };
}

export function adaptTransaction(t: APITransaction): Transaction {
  // Parse description for ticker/shares/price from buy/sell descriptions
  // e.g. "Bought 2 shares of AAPL" or "Sold 1 shares of TSLA"
  let ticker: string | undefined;
  let shares: number | undefined;
  const buyMatch = t.description.match(/Bought ([\d.]+) shares of ([A-Z.]+)/);
  const sellMatch = t.description.match(/Sold ([\d.]+) shares of ([A-Z.]+)/);
  const match = buyMatch ?? sellMatch;
  if (match) {
    shares = parseFloat(match[1]);
    ticker = match[2];
  }

  return {
    id: String(t.id),
    type: t.type as Transaction["type"],
    amount: parseFloat(t.amount),
    ticker,
    shares,
    pricePerShare: shares && parseFloat(t.amount) ? parseFloat(t.amount) / shares : undefined,
    date: t.created_at,
    status: t.status,
  };
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return String(vol);
}

function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) return `$${(cap / 1_000_000_000_000).toFixed(2)}T`;
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(1)}B`;
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(1)}M`;
  return `$${cap}`;
}
