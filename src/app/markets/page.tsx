import AppShell from "@/components/layout/AppShell";
import MarketsContent from "./MarketsContent";

export const metadata = {
  title: "Markets — Freshfield",
  description: "Browse US stock markets in real-time",
};

export default function MarketsPage() {
  return (
    <AppShell>
      <MarketsContent />
    </AppShell>
  );
}
