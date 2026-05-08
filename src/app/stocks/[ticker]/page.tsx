import AppShell from "@/components/layout/AppShell";
import StockDetailContent from "./StockDetailContent";
import { STOCKS } from "@/lib/mockData";
import { notFound } from "next/navigation";

interface StockPageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateStaticParams() {
  return STOCKS.map((s) => ({ ticker: s.ticker }));
}

export async function generateMetadata({ params }: StockPageProps) {
  const { ticker } = await params;
  const stock = STOCKS.find((s) => s.ticker === ticker);
  return {
    title: stock ? `${stock.ticker} — ${stock.name} | Freshfield` : "Stock — Freshfield",
  };
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const stock = STOCKS.find((s) => s.ticker === ticker);
  if (!stock) notFound();

  return (
    <AppShell>
      <StockDetailContent ticker={ticker} />
    </AppShell>
  );
}
