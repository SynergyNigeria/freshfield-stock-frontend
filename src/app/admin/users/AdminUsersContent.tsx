"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { adminApi, AdminUserSummary } from "@/lib/api";

export default function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminApi.users(query).then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, [query]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search);
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-white/40 text-sm mb-6">Manage all registered users</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-md">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#06d001" }}>
          Search
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 overflow-x-auto" style={{ background: "rgba(255,255,255,0.03)" }}>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Country</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Cash Balance</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Portfolio</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Holdings</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 bg-white/10 rounded animate-pulse" style={{ width: j === 0 ? "80%" : "60%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-white/30 text-sm">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{u.first_name} {u.last_name}</p>
                    <p className="text-white/40 text-xs">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-white/60 text-xs">{u.country || "—"}</td>
                  <td className="px-5 py-3.5 text-right text-white font-medium tabular-nums">
                    ${parseFloat(u.wallet_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right text-white/70 tabular-nums">
                    ${parseFloat(u.portfolio_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right text-white/60">{u.holdings_count}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active && u.email_verified ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                      {u.is_active && u.email_verified ? "Active" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center justify-end text-white/40 hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
