"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, DollarSign, X, Search, Pencil } from "lucide-react";
import { adminApi, stocksApi, APIStock, AdminUserDetail, AdminHolding, AdminUserSummary } from "@/lib/api";

type WalletAction = "set" | "add" | "subtract";
type ProfileForm = Pick<AdminUserSummary, "first_name" | "last_name" | "email" | "phone" | "country" | "is_active" | "email_verified">;

export default function AdminUserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = parseInt(id);

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wallet modal
  const [showWallet, setShowWallet] = useState(false);
  const [walletAction, setWalletAction] = useState<WalletAction>("add");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Add holding modal
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [allStocks, setAllStocks] = useState<APIStock[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<APIStock | null>(null);
  const [stockDropdownOpen, setStockDropdownOpen] = useState(false);
  const stockInputRef = useRef<HTMLInputElement>(null);
  const [holdingShares, setHoldingShares] = useState("");
  const [holdingCost, setHoldingCost] = useState("");
  const [holdingLoading, setHoldingLoading] = useState(false);
  const [holdingError, setHoldingError] = useState<string | null>(null);

  // Edit profile modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Load all stocks once
  useEffect(() => {
    stocksApi.list().then(setAllStocks).catch(() => {});
  }, []);

  const filteredStocks = allStocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(stockSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  function refresh() {
    adminApi.userDetail(userId).then(setUser).catch(() => setError("Failed to load user.")).finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, [userId]);

  async function handleWalletSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWalletLoading(true);
    setWalletError(null);
    try {
      const res = await adminApi.adjustWallet(userId, walletAction, parseFloat(walletAmount));
      setUser((u) => u ? { ...u, wallet_balance: res.balance } : u);
      setShowWallet(false);
      setWalletAmount("");
    } catch (err: unknown) {
      setWalletError((err as { message?: string })?.message ?? "Failed to update balance.");
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleAddHolding(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStock) return;
    setHoldingLoading(true);
    setHoldingError(null);
    try {
      const holding = await adminApi.addHolding(userId, selectedStock.ticker, parseFloat(holdingShares), parseFloat(holdingCost));
      setUser((u) => {
        if (!u) return u;
        const exists = u.holdings.find((h) => h.id === holding.id);
        return {
          ...u,
          holdings: exists
            ? u.holdings.map((h) => h.id === holding.id ? holding : h)
            : [...u.holdings, holding],
        };
      });
      setShowAddHolding(false);
      setSelectedStock(null); setStockSearch(""); setHoldingShares(""); setHoldingCost("");
    } catch (err: unknown) {
      setHoldingError((err as { message?: string })?.message ?? "Failed to add holding.");
    } finally {
      setHoldingLoading(false);
    }
  }

  async function handleRemoveHolding(holding: AdminHolding) {
    if (!confirm(`Remove ${holding.shares} shares of ${holding.stock.ticker}?`)) return;
    await adminApi.removeHolding(userId, holding.id);
    setUser((u) => u ? { ...u, holdings: u.holdings.filter((h) => h.id !== holding.id) } : u);
  }

  function openEditProfile() {
    if (!user) return;
    setProfileForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || "",
      country: user.country || "",
      is_active: user.is_active,
      email_verified: user.email_verified,
    });
    setProfileError(null);
    setShowEditProfile(true);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileForm) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const updated = await adminApi.updateUser(userId, profileForm);
      setUser(updated);
      setShowEditProfile(false);
    } catch (err: unknown) {
      setProfileError((err as { message?: string })?.message ?? "Failed to save changes.");
    } finally {
      setProfileLoading(false);
    }
  }

  if (loading) return (
    <div className="p-4 md:p-8">
      <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-6" />
      <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
    </div>
  );

  if (error || !user) return (
    <div className="p-4 md:p-8 text-white/40">{error ?? "User not found."}</div>
  );

  const portfolioValue = user.holdings.reduce((s, h) => s + parseFloat(h.current_value), 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <Link href="/admin/users" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{user.first_name} {user.last_name}</h1>
          <p className="text-white/40 text-sm mt-0.5">{user.email} · {user.country || "No country"} · {user.phone || "No phone"}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_active && user.email_verified ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
              {user.is_active && user.email_verified ? "Active" : "Unverified"}
            </span>
            <span className="text-white/25 text-xs">Joined {new Date(user.date_joined).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          onClick={openEditProfile}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-xs text-white/40 font-medium mb-1">Cash Balance</p>
          <p className="text-2xl font-bold text-white">${parseFloat(user.wallet_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <button
            onClick={() => setShowWallet(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#06d001", background: "rgba(6,208,1,0.1)" }}
          >
            <DollarSign className="w-3.5 h-3.5" /> Adjust balance
          </button>
        </div>
        <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-xs text-white/40 font-medium mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold text-white">${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-white/30 text-xs mt-1">{user.holdings.length} holding{user.holdings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Holdings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Holdings</h2>
          <button
            onClick={() => setShowAddHolding(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ color: "#06d001", background: "rgba(6,208,1,0.1)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add / Update holding
          </button>
        </div>

        {user.holdings.length === 0 ? (
          <p className="text-white/30 text-sm py-6 text-center rounded-2xl border border-white/10">No holdings</p>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Stock</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Shares</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Avg Cost</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Current Value</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">P&amp;L</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {user.holdings.map((h) => {
                  const pnl = parseFloat(h.pnl);
                  const pos = pnl >= 0;
                  return (
                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-white font-semibold">{h.stock.ticker}</p>
                        <p className="text-white/40 text-xs">{h.stock.name}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right text-white tabular-nums">{parseFloat(h.shares).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-white/60 tabular-nums">${parseFloat(h.avg_cost).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right text-white font-medium tabular-nums">${parseFloat(h.current_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span className={pos ? "text-green-400" : "text-red-400"}>
                          {pos ? "+" : ""}${Math.abs(pnl).toFixed(2)}<br />
                          <span className="text-xs">({pos ? "+" : ""}{parseFloat(h.pnl_percent).toFixed(2)}%)</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleRemoveHolding(h)} className="text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Transactions</h2>
        {user.recent_transactions.length === 0 ? (
          <p className="text-white/30 text-sm py-6 text-center rounded-2xl border border-white/10">No transactions</p>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Description</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Amount</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {user.recent_transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 capitalize">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.type === "deposit" ? "bg-green-500/15 text-green-400" :
                        t.type === "withdrawal" ? "bg-red-500/15 text-red-400" :
                        t.type === "buy" ? "bg-blue-500/15 text-blue-400" :
                        "bg-purple-500/15 text-purple-400"
                      }`}>{t.type}</span>
                    </td>
                    <td className="px-5 py-3 text-white/50 text-xs max-w-xs truncate">{t.description}</td>
                    <td className="px-5 py-3 text-right text-white tabular-nums">${parseFloat(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-right text-white/40 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wallet modal */}
      {showWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/15 p-6" style={{ background: "#0a160a" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Adjust Balance</h3>
              <button onClick={() => { setShowWallet(false); setWalletError(null); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-white/40 text-sm mb-4">Current: <span className="text-white font-semibold">${parseFloat(user.wallet_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
            <form onSubmit={handleWalletSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
                {(["add", "subtract", "set"] as WalletAction[]).map((a) => (
                  <button
                    key={a} type="button"
                    onClick={() => setWalletAction(a)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-colors"
                    style={{ background: walletAction === a ? "#06d001" : "rgba(255,255,255,0.08)", color: walletAction === a ? "#000" : "rgba(255,255,255,0.6)" }}
                  >{a}</button>
                ))}
              </div>
              <input
                type="number" min="0" step="0.01" required
                value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="Amount (USD)"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              {walletError && <p className="text-red-400 text-xs">{walletError}</p>}
              <button type="submit" disabled={walletLoading} className="w-full py-3 rounded-xl text-sm font-bold text-black" style={{ background: "#06d001" }}>
                {walletLoading ? "Saving…" : "Confirm"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add holding modal */}
      {showAddHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/15 p-6" style={{ background: "#0a160a" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add / Update Holding</h3>
              <button onClick={() => { setShowAddHolding(false); setHoldingError(null); setSelectedStock(null); setStockSearch(""); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddHolding} className="flex flex-col gap-4">
              {/* Stock picker */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-3 cursor-text"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  onClick={() => { setStockDropdownOpen(true); stockInputRef.current?.focus(); }}
                >
                  <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                  {selectedStock ? (
                    <span className="flex-1 text-sm text-white">
                      <span className="font-semibold" style={{ color: "#06d001" }}>{selectedStock.ticker}</span>
                      <span className="text-white/50 ml-2">{selectedStock.name}</span>
                    </span>
                  ) : (
                    <input
                      ref={stockInputRef}
                      value={stockSearch}
                      onChange={(e) => { setStockSearch(e.target.value); setStockDropdownOpen(true); }}
                      onFocus={() => setStockDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setStockDropdownOpen(false), 150)}
                      placeholder="Search stock…"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                    />
                  )}
                  {selectedStock && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedStock(null); setStockSearch(""); setTimeout(() => stockInputRef.current?.focus(), 0); }} className="text-white/30 hover:text-white ml-auto">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {stockDropdownOpen && !selectedStock && filteredStocks.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-white/15 overflow-y-auto z-50"
                    style={{ background: "#0e1f0e", maxHeight: "200px" }}
                  >
                    {filteredStocks.map((s) => (
                      <button
                        key={s.id} type="button"
                        onMouseDown={(e) => { e.preventDefault(); setSelectedStock(s); setStockDropdownOpen(false); setStockSearch(""); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/8 transition-colors text-left"
                      >
                        <span className="text-sm font-semibold" style={{ color: "#06d001" }}>{s.ticker}</span>
                        <span className="text-xs text-white/50 truncate ml-3 flex-1">{s.name}</span>
                        <span className="text-xs text-white/30 ml-3">${parseFloat(s.price).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number" min="0.000001" step="any" required value={holdingShares} onChange={(e) => setHoldingShares(e.target.value)}
                placeholder="Number of shares"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              <input
                type="number" min="0" step="0.0001" required value={holdingCost} onChange={(e) => setHoldingCost(e.target.value)}
                placeholder="Average cost per share (USD)"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              {holdingError && <p className="text-red-400 text-xs">{holdingError}</p>}
              <button
                type="submit"
                disabled={holdingLoading || !selectedStock}
                className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#06d001" }}
              >
                {holdingLoading ? "Saving…" : "Save Holding"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit profile modal */}
      {showEditProfile && profileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl border border-white/15 p-6" style={{ background: "#0a160a" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 font-medium block mb-1">First Name</label>
                  <input
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm((f) => f && { ...f, first_name: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-medium block mb-1">Last Name</label>
                  <input
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm((f) => f && { ...f, last_name: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 font-medium block mb-1">Email</label>
                <input
                  type="email" value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => f && { ...f, email: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 font-medium block mb-1">Phone</label>
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => f && { ...f, phone: e.target.value })}
                    placeholder="+1 555 0000"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-medium block mb-1">Country</label>
                  <input
                    value={profileForm.country}
                    onChange={(e) => setProfileForm((f) => f && { ...f, country: e.target.value })}
                    placeholder="US"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setProfileForm((f) => f && { ...f, is_active: !f.is_active })}
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ background: profileForm.is_active ? "#06d001" : "rgba(255,255,255,0.15)" }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: profileForm.is_active ? "calc(100% - 1.1rem)" : "0.1rem" }}
                    />
                  </div>
                  <span className="text-sm text-white/60">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setProfileForm((f) => f && { ...f, email_verified: !f.email_verified })}
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ background: profileForm.email_verified ? "#06d001" : "rgba(255,255,255,0.15)" }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: profileForm.email_verified ? "calc(100% - 1.1rem)" : "0.1rem" }}
                    />
                  </div>
                  <span className="text-sm text-white/60">Email Verified</span>
                </label>
              </div>
              {profileError && <p className="text-red-400 text-xs">{profileError}</p>}
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-black"
                style={{ background: "#06d001" }}
              >
                {profileLoading ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
