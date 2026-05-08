import AppShell from "@/components/layout/AppShell";
import WalletContent from "./WalletContent";

export const metadata = {
  title: "Wallet — Freshfield",
  description: "Manage your trading wallet",
};

export default function WalletPage() {
  return (
    <AppShell>
      <WalletContent />
    </AppShell>
  );
}
