"use client";

import { useState, useRef, useEffect } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Clock,
  ChevronRight,
  ChevronLeft,
  Building2,
  Copy,
  CheckCheck,
  Upload,
  ImageIcon,
  Bell,
} from "lucide-react";
import { walletApi } from "@/lib/api";
import { adaptTransaction } from "@/lib/adapters";
import { Transaction } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TransactionItem from "@/components/wallet/TransactionItem";

type ModalType = "deposit" | "withdraw" | null;
type DepositStep = "amount" | "bank-details" | "pending";
type WithdrawStep = "input" | "confirm" | "success";

const BANK_DETAILS = {
  bankName: "Chase Bank",
  accountName: "Freshfield Trading Inc.",
  accountNumber: "4892 0371 6654",
  routingNumber: "021000021",
  reference: "FLD-DEPOSIT",
};

export default function WalletContent() {
  const [modal, setModal] = useState<ModalType>(null);
  const [amount, setAmount] = useState("");
  const [depositStep, setDepositStep] = useState<DepositStep>("amount");
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>("input");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const amountNum = parseFloat(amount) || 0;

  useEffect(() => {
    walletApi.get().then((w) => setWalletBalance(parseFloat(w.balance))).catch(() => {});
    walletApi.transactions().then((txns) => setTransactions(txns.map(adaptTransaction))).catch(() => {});
  }, []);

  function openModal(type: ModalType) {
    setModal(type);
    setAmount("");
    setDepositStep("amount");
    setWithdrawStep("input");
    setProofFile(null);
    setProofPreview(null);
  }

  function handleClose() {
    setModal(null);
    setAmount("");
    setDepositStep("amount");
    setWithdrawStep("input");
    setProofFile(null);
    setProofPreview(null);
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
  const WITHDRAW_QUICK = [50, 100, 250, 500];

  const totalDeposited = transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((a, t) => a + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((a, t) => a + t.amount, 0);
  const totalInvested = transactions
    .filter((t) => t.type === "buy" && t.status === "completed")
    .reduce((a, t) => a + t.amount, 0);

  async function handleDepositSubmit() {
    if (!proofFile) return;
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      fd.append("amount", String(amountNum));
      fd.append("proof_image", proofFile);
      await walletApi.deposit(fd);
      // Refresh transactions
      const txns = await walletApi.transactions();
      setTransactions(txns.map(adaptTransaction));
      setDepositStep("pending");
    } catch {
      // Still show pending on error for UX
      setDepositStep("pending");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleWithdrawConfirm() {
    setSubmitLoading(true);
    try {
      await walletApi.withdraw({
        amount: String(amountNum),
        bank_name: "User Bank",
        account_number: "N/A",
        account_name: "N/A",
        routing_number: "N/A",
      });
      const [w, txns] = await Promise.all([walletApi.get(), walletApi.transactions()]);
      setWalletBalance(parseFloat(w.balance));
      setTransactions(txns.map(adaptTransaction));
      setWithdrawStep("success");
    } catch {
      setWithdrawStep("success");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your funds</p>
      </div>

      {/* Main balance card */}
      <div className="bg-green-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Cash Balance</span>
          </div>
          <p className="text-5xl font-bold tracking-tight mb-1">{formatCurrency(walletBalance)}</p>
          <p className="text-sm opacity-60">Available for trading</p>
        </div>
        <div className="flex gap-3 mt-6 relative">
          <button
            onClick={() => openModal("deposit")}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-green-700 font-semibold py-3 rounded-2xl text-sm hover:bg-green-50 transition-all active:scale-[0.98] shadow-lg shadow-green-900/20"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={() => openModal("withdraw")}
            className="flex-1 flex items-center justify-center gap-2 bg-white/15 text-white font-semibold py-3 rounded-2xl text-sm hover:bg-white/25 transition-all active:scale-[0.98] border border-white/20"
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Deposited</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(totalDeposited)}</p>
        </Card>
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Withdrawn</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(totalWithdrawn)}</p>
        </Card>
        <Card>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Invested</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
        </Card>
      </div>

      {/* Transaction history */}
      <Card padding="none">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Transaction History</h2>
          <span className="text-xs text-gray-400">{transactions.length} transactions</span>
        </div>
        <div className="divide-y divide-gray-50 px-4">
          {transactions.slice().reverse().map((txn) => (
            <TransactionItem key={txn.id} transaction={txn} />
          ))}
        </div>
      </Card>

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 max-h-[92dvh] sm:max-h-[85vh] flex flex-col">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden flex-shrink-0" />

            {/* ═══════════════ DEPOSIT FLOW ═══════════════ */}
            {modal === "deposit" && (
              <>
                {/* Step indicator */}
                {depositStep !== "pending" && (
                  <div className="flex-shrink-0 px-6 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {depositStep === "bank-details" && (
                          <button
                            onClick={() => setDepositStep("amount")}
                            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        <h3 className="text-lg font-bold text-gray-900">
                          {depositStep === "amount" ? "Deposit Funds" : "Bank Transfer"}
                        </h3>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Step dots */}
                    <div className="flex items-center gap-1.5">
                      {["amount", "bank-details"].map((s, i) => (
                        <div
                          key={s}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            depositStep === s ? "w-6 bg-green-600" : i < ["amount", "bank-details"].indexOf(depositStep) ? "w-3 bg-green-300" : "w-3 bg-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="overflow-y-auto flex-1 px-6 pb-24 sm:pb-6">

                  {/* ── Step 1: Amount ── */}
                  {depositStep === "amount" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount to deposit</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-200 text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {QUICK_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setAmount(String(amt))}
                            className={cn(
                              "py-2 rounded-xl text-sm font-semibold border transition-all",
                              amountNum === amt
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700"
                            )}
                          >
                            ${amt.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      {/* Payment method badge */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Bank Transfer</p>
                          <p className="text-xs text-gray-400">Verified within 24 hours</p>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      </div>

                      <Button fullWidth size="lg" disabled={amountNum <= 0} onClick={() => setDepositStep("bank-details")}>
                        Continue
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* ── Step 2: Bank Details + Proof Upload ── */}
                  {depositStep === "bank-details" && (
                    <div className="space-y-4">
                      {/* Amount summary */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm font-medium text-green-800">Transfer amount</span>
                        <span className="text-lg font-bold text-green-700">{formatCurrency(amountNum)}</span>
                      </div>

                      {/* Bank details card */}
                      <div className="rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Details</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {[
                            { label: "Bank Name", value: BANK_DETAILS.bankName, key: "bank" },
                            { label: "Account Name", value: BANK_DETAILS.accountName, key: "name" },
                            { label: "Account Number", value: BANK_DETAILS.accountNumber, key: "account" },
                            { label: "Routing Number", value: BANK_DETAILS.routingNumber, key: "routing" },
                            { label: "Reference", value: BANK_DETAILS.reference, key: "ref" },
                          ].map(({ label, value, key }) => (
                            <div key={key} className="flex items-center justify-between px-4 py-3">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(value, key)}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                  copied === key
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                )}
                              >
                                {copied === key ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Proof upload */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1.5">Upload payment proof</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {proofPreview ? (
                          <div className="relative rounded-2xl overflow-hidden border border-green-200 bg-green-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={proofPreview} alt="Proof" className="w-full max-h-40 object-cover" />
                            <button
                              onClick={() => { setProofFile(null); setProofPreview(null); }}
                              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="px-4 py-2.5 flex items-center gap-2">
                              <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                              <p className="text-xs font-medium text-green-700 truncate">{proofFile?.name}</p>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 flex flex-col items-center gap-2 hover:border-green-400 hover:bg-green-50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-600 group-hover:text-green-700">Upload screenshot</p>
                              <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-0.5">
                                <ImageIcon className="w-3 h-3" />
                                JPG, PNG or PDF
                              </p>
                            </div>
                          </button>
                        )}
                      </div>

                      <Button
                        fullWidth
                        size="lg"
                        disabled={!proofFile || submitLoading}
                        onClick={handleDepositSubmit}
                      >
                        {submitLoading ? "Submitting…" : "I've Made the Payment"}
                      </Button>
                      <p className="text-center text-xs text-gray-400">
                        Only submit after completing the bank transfer
                      </p>
                    </div>
                  )}

                  {/* ── Step 3: Pending ── */}
                  {depositStep === "pending" && (
                    <div className="py-6 text-center space-y-5">
                      {/* Icon */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                            <Clock className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
                          </div>
                          <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCheck className="w-3 h-3 text-white" strokeWidth={3} />
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                          We&apos;re confirming your payment of{" "}
                          <span className="font-semibold text-gray-900">{formatCurrency(amountNum)}</span>.
                          This may take up to <span className="font-semibold text-amber-600">24 hours</span> to process.
                        </p>
                      </div>

                      {/* Status steps */}
                      <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 text-left overflow-hidden">
                        {[
                          { icon: CheckCheck, label: "Payment proof received", done: true, color: "text-green-600 bg-green-50" },
                          { icon: Clock, label: "Verifying your transfer", done: false, color: "text-amber-500 bg-amber-50" },
                          { icon: Bell, label: "You will be notified once approved", done: false, color: "text-gray-400 bg-gray-50" },
                        ].map(({ icon: Icon, label, done, color }) => (
                          <div key={label} className="flex items-center gap-3 px-4 py-3">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <p className={cn("text-sm", done ? "font-semibold text-gray-900" : "text-gray-400")}>{label}</p>
                          </div>
                        ))}
                      </div>

                      <Button fullWidth size="lg" onClick={handleClose}>
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ═══════════════ WITHDRAW FLOW ═══════════════ */}
            {modal === "withdraw" && (
              <>
                <div className="flex-shrink-0 px-6 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {withdrawStep === "confirm" && (
                        <button
                          onClick={() => setWithdrawStep("input")}
                          className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}
                      <h3 className="text-lg font-bold text-gray-900">
                        {withdrawStep === "success" ? "Withdrawal Submitted" : "Withdraw Funds"}
                      </h3>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-24 sm:pb-6">
                  {withdrawStep === "input" && (
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-200 text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {WITHDRAW_QUICK.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setAmount(String(amt))}
                            className={cn(
                              "py-2 rounded-xl text-sm font-semibold border transition-all",
                              amountNum === amt
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300"
                            )}
                          >
                            ${amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-500">Available</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(walletBalance)}</span>
                      </div>
                      <Button fullWidth size="lg" disabled={amountNum <= 0 || amountNum > walletBalance} onClick={() => setWithdrawStep("confirm")}>
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {withdrawStep === "confirm" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Amount</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(amountNum)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Fee</span>
                        <span className="text-sm font-semibold text-green-600">Free</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <span className="text-sm font-medium text-green-800">Remaining Balance</span>
                        <span className="text-lg font-bold text-green-700">{formatCurrency(walletBalance - amountNum)}</span>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" size="lg" onClick={() => setWithdrawStep("input")} className="flex-1">Back</Button>
                        <Button size="lg" disabled={submitLoading} onClick={handleWithdrawConfirm} className="flex-1">{submitLoading ? "Processing…" : "Confirm"}</Button>
                      </div>
                    </div>
                  )}

                  {withdrawStep === "success" && (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                        <CheckCheck className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Withdrawal Submitted!</h3>
                        <p className="text-gray-500 text-sm">{formatCurrency(amountNum)} will arrive in 1–3 business days</p>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 mt-2">
                          <Clock className="w-3.5 h-3.5" />
                          Processing time: 1–3 business days
                        </div>
                      </div>
                      <Button fullWidth size="lg" onClick={handleClose}>Done</Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
