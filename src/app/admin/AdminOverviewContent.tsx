"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, DollarSign, TrendingUp, UserCheck } from "lucide-react";
import { adminApi, AdminUserSummary } from "@/lib/api";

export default function AdminOverviewContent() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.users().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalWallet = users.reduce((s, u) => s + parseFloat(u.wallet_balance), 0);
  const totalPortfolio = users.reduce((s, u) => s + parseFloat(u.portfolio_value), 0);
  const verified = users.filter((u) => u.email_verified).length;

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "#06d001" },
    { label: "Verified Users", value: verified, icon: UserCheck, color: "#4ade80" },
    { label: "Total Cash (all wallets)", value: `$${totalWallet.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#06d001" },
    { label: "Total Portfolio Value", value: `$${totalPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "#4ade80" },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
      <p className="text-white/40 text-sm mb-8">Platform-wide summary</p>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-3 w-20 bg-white/10 rounded mb-3" />
              <div className="h-7 w-28 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/40 font-medium">{s.label}</p>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Users</h2>
        <Link href="/admin/users" className="text-sm font-medium" style={{ color: "#06d001" }}>View all →</Link>
      </div>
      <div className="rounded-2xl border border-white/10 overflow-x-auto" style={{ background: "rgba(255,255,255,0.03)" }}>
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Country</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Cash</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Portfolio</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map((u, i) => (
              <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : ""}`}>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/users/${u.id}`} className="hover:underline" style={{ color: "#06d001" }}>
                    {u.first_name} {u.last_name}
                  </Link>
                  <p className="text-white/40 text-xs">{u.email}</p>
                </td>
                <td className="px-5 py-3.5 text-white/60">{u.country || "—"}</td>
                <td className="px-5 py-3.5 text-right text-white font-medium">${parseFloat(u.wallet_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5 text-right text-white/70">${parseFloat(u.portfolio_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${u.email_verified ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                    {u.email_verified ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
