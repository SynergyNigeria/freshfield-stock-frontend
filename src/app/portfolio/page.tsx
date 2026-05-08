import AppShell from "@/components/layout/AppShell";
import PortfolioContent from "./PortfolioContent";

export const metadata = {
  title: "Portfolio — Freshfield",
  description: "Your stock portfolio and performance",
};

export default function PortfolioPage() {
  return (
    <AppShell>
      <PortfolioContent />
    </AppShell>
  );
}
