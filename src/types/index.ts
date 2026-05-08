export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  high52w: number;
  low52w: number;
  pe: number;
  dividend: number;
  sector: string;
  logo: string;
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "buy" | "sell";
  amount: number;
  ticker?: string;
  stockName?: string;
  shares?: number;
  pricePerShare?: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface Holding {
  ticker: string;
  name: string;
  logo: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  sector: string;
}

export interface WalletState {
  balance: number;
  invested: number;
  transactions: Transaction[];
}
