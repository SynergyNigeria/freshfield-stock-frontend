"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Building2, CreditCard, Smartphone, GripVertical } from "lucide-react";
import { adminTransferMethodsApi, APITransferMethod } from "@/lib/api";

type MethodType = "bank_transfer" | "paypal" | "zelle";

const METHOD_LABELS: Record<MethodType, string> = {
  bank_transfer: "Bank Transfer",
  paypal: "PayPal",
  zelle: "Zelle",
};

const METHOD_ICONS: Record<MethodType, React.ElementType> = {
  bank_transfer: Building2,
  paypal: CreditCard,
  zelle: Smartphone,
};

const EMPTY_FORM = {
  method_type: "bank_transfer" as MethodType,
  display_name: "",
  account_name: "",
  account_identifier: "",
  bank_name: "",
  routing_number: "",
  reference: "",
  instructions: "",
  is_active: true,
  order: 0,
};

export default function TransferMethodsContent() {
  const [methods, setMethods] = useState<APITransferMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    adminTransferMethodsApi.list().then(setMethods).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(m: APITransferMethod) {
    setForm({
      method_type: m.method_type,
      display_name: m.display_name,
      account_name: m.account_name,
      account_identifier: m.account_identifier,
      bank_name: m.bank_name,
      routing_number: m.routing_number,
      reference: m.reference,
      instructions: m.instructions,
      is_active: m.is_active,
      order: m.order,
    });
    setEditingId(m.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.display_name.trim() || !form.account_name.trim() || !form.account_identifier.trim()) {
      setError("Display name, account name and account identifier are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId !== null) {
        await adminTransferMethodsApi.update(editingId, form);
      } else {
        await adminTransferMethodsApi.create(form);
      }
      refresh();
      setShowForm(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await adminTransferMethodsApi.delete(id);
      refresh();
    } catch {
      // ignore
    } finally {
      setDeleteConfirm(null);
    }
  }

  async function toggleActive(m: APITransferMethod) {
    await adminTransferMethodsApi.update(m.id, { is_active: !m.is_active });
    refresh();
  }

  const inputCls = "w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#06d001]/60 focus:bg-white/8 transition-colors";
  const labelCls = "block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide";

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Transfer Methods</h1>
          <p className="text-white/40 text-sm">Manage deposit payment options shown to users</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "#06d001", color: "#050d05" }}
        >
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-4 w-40 bg-white/10 rounded mb-2" />
              <div className="h-3 w-64 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-10 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Building2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No transfer methods yet.</p>
          <p className="text-white/25 text-xs mt-1">Click &ldquo;Add Method&rdquo; to create the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => {
            const Icon = METHOD_ICONS[m.method_type] ?? Building2;
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-white/10 p-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: m.is_active ? "rgba(6,208,1,0.15)" : "rgba(255,255,255,0.06)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: m.is_active ? "#06d001" : "rgba(255,255,255,0.3)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{m.display_name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{
                      background: m.is_active ? "rgba(6,208,1,0.15)" : "rgba(255,255,255,0.06)",
                      color: m.is_active ? "#06d001" : "rgba(255,255,255,0.3)"
                    }}>
                      {m.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">
                    {METHOD_LABELS[m.method_type]} · {m.account_identifier}
                    {m.account_name && ` · ${m.account_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(m)}
                    title={m.is_active ? "Deactivate" : "Activate"}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8 text-white/40 hover:text-white"
                  >
                    <Check className="w-4 h-4" style={{ color: m.is_active ? "#06d001" : undefined }} />
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8 text-white/40 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === m.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-xs px-2 py-1 rounded-lg font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs px-2 py-1 rounded-lg text-white/40 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(m.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 text-white/40 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div
            className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[92dvh] flex flex-col"
            style={{ background: "#0e1f0e", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-base font-bold text-white">
                {editingId !== null ? "Edit Transfer Method" : "Add Transfer Method"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {error && (
                <div className="p-3 rounded-xl text-xs text-red-400 bg-red-500/10 border border-red-500/20">{error}</div>
              )}

              {/* Method type */}
              <div>
                <label className={labelCls}>Method Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(METHOD_LABELS) as MethodType[]).map((type) => {
                    const Icon = METHOD_ICONS[type];
                    const selected = form.method_type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, method_type: type }))}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: selected ? "#06d001" : "rgba(255,255,255,0.1)",
                          background: selected ? "rgba(6,208,1,0.1)" : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: selected ? "#06d001" : "rgba(255,255,255,0.4)" }} />
                        <span className="text-[10px] font-semibold" style={{ color: selected ? "#06d001" : "rgba(255,255,255,0.4)" }}>
                          {METHOD_LABELS[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className={labelCls}>Display Name <span className="text-red-400">*</span></label>
                <input
                  className={inputCls}
                  placeholder='e.g. "Business PayPal" or "Chase Bank"'
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                />
              </div>

              {/* Account Name */}
              <div>
                <label className={labelCls}>Account Name <span className="text-red-400">*</span></label>
                <input
                  className={inputCls}
                  placeholder='e.g. "Freshfield Trading Inc."'
                  value={form.account_name}
                  onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
                />
              </div>

              {/* Account Identifier */}
              <div>
                <label className={labelCls}>
                  {form.method_type === "bank_transfer" ? "Account Number" : "Email / Phone"} <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder={form.method_type === "bank_transfer" ? "e.g. 4892 0371 6654" : "e.g. payments@company.com"}
                  value={form.account_identifier}
                  onChange={(e) => setForm((f) => ({ ...f, account_identifier: e.target.value }))}
                />
              </div>

              {/* Bank-only fields */}
              {form.method_type === "bank_transfer" && (
                <>
                  <div>
                    <label className={labelCls}>Bank Name</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Chase Bank"
                      value={form.bank_name}
                      onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Routing Number</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. 021000021"
                      value={form.routing_number}
                      onChange={(e) => setForm((f) => ({ ...f, routing_number: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* Reference */}
              <div>
                <label className={labelCls}>Reference / Memo (optional)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. FLD-DEPOSIT"
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                />
              </div>

              {/* Instructions */}
              <div>
                <label className={labelCls}>Instructions (optional)</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="Any extra instructions shown to the user"
                  value={form.instructions}
                  onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                />
              </div>

              {/* Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Display Order</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex flex-col justify-end pb-0.5">
                  <label className={labelCls}>Status</label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-semibold"
                    style={{
                      borderColor: form.is_active ? "#06d001" : "rgba(255,255,255,0.1)",
                      background: form.is_active ? "rgba(6,208,1,0.1)" : "rgba(255,255,255,0.03)",
                      color: form.is_active ? "#06d001" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: form.is_active ? "#06d001" : "rgba(255,255,255,0.2)" }}
                    >
                      {form.is_active && <div className="w-2 h-2 rounded-full" style={{ background: "#06d001" }} />}
                    </div>
                    {form.is_active ? "Active" : "Hidden"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: "#06d001", color: "#050d05" }}
              >
                {saving ? "Saving…" : editingId !== null ? "Save Changes" : "Create Method"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
