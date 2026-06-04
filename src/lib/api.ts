// ─── API Client ────────────────────────────────────────────────────────────
// Thin wrapper around fetch that:
// • Prefixes the base URL
// • Attaches the JWT access token from localStorage
// • Auto-refreshes the access token on 401 and retries the request once
// • Throws a typed APIError on non-2xx responses

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// ── Token helpers ──────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}
export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  // Set a lightweight cookie so middleware can guard routes server-side
  document.cookie = `access_token=${access}; path=/; SameSite=Lax; max-age=3600`;
}
export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  document.cookie = "access_token=; path=/; max-age=0";
}

// ── Refresh ────────────────────────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

// ── Core fetch ─────────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const isFormData = init.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, init, false);
    }
    // Refresh failed — send user to login
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new APIError(401, "Session expired. Please log in again.");
  }

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    const message =
      typeof data === "object" && data !== null
        ? Object.values(data as Record<string, unknown>)
            .flat()
            .join(" ")
        : res.statusText;
    throw new APIError(res.status, message, data);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Public helpers ─────────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),

  postForm: <T>(path: string, formData: FormData) =>
    apiFetch<T>(path, { method: "POST", body: formData }),
};

// ── Typed API calls ────────────────────────────────────────────────────────
export interface APIStock {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  change_percent: string;
  volume: number;
  market_cap: number;
  high_52w: string;
  low_52w: string;
  pe: string;
  dividend: string;
  logo: string;
  is_positive: boolean;
}

export interface APIWallet {
  id: number;
  balance: string;
}

export interface APITransaction {
  id: number;
  type: "deposit" | "withdrawal" | "buy" | "sell";
  amount: string;
  status: "pending" | "completed" | "failed";
  description: string;
  created_at: string;
}

export interface APIHolding {
  id: number;
  stock: APIStock;
  shares: string;
  avg_cost: string;
  current_value: string;
  cost_basis: string;
  pnl: string;
  pnl_percent: string;
}

export interface APIPortfolio {
  holdings: APIHolding[];
  summary: {
    total_value: number;
    total_cost: number;
    total_pnl: number;
    total_pnl_percent: number;
  };
}

export interface APIWatchlistItem {
  id: number;
  stock: APIStock;
  stock_id: number;
}

export interface APIUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  country: string;
  email_verified: boolean;
  date_joined: string;
}

// Stock endpoints
export const stocksApi = {
  list: (params?: { search?: string; filter?: string; sector?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.filter) qs.set("filter", params.filter);
    if (params?.sector) qs.set("sector", params.sector);
    const query = qs.toString();
    return api.get<APIStock[]>(`/stocks/${query ? `?${query}` : ""}`);
  },
  detail: (ticker: string) => api.get<APIStock>(`/stocks/${ticker}/`),
  watchlist: () => api.get<APIWatchlistItem[]>("/stocks/watchlist/"),
  addWatchlist: (stockId: number) =>
    api.post<APIWatchlistItem>("/stocks/watchlist/", { stock_id: stockId }),
  removeWatchlist: (id: number) => api.delete<void>(`/stocks/watchlist/${id}/`),
};

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access: string; refresh: string }>("/auth/login/", { email, password }),
  register: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
    password: string;
    password2: string;
  }) => api.post<{ detail: string }>("/auth/register/", data),
  verifyEmail: (token: string) =>
    api.post<{ access: string; refresh: string; user: APIUser }>("/auth/verify-email/", { token }),
  profile: () => api.get<APIUser>("/auth/profile/"),
  logout: (refresh: string) => api.post<void>("/auth/logout/", { refresh }),
};

export interface APITransferMethod {
  id: number;
  method_type: "bank_transfer" | "paypal" | "zelle";
  method_type_display: string;
  display_name: string;
  account_name: string;
  account_identifier: string;
  bank_name: string;
  routing_number: string;
  reference: string;
  instructions: string;
  is_active: boolean;
  order: number;
}

// Wallet endpoints
export const walletApi = {
  get: () => api.get<APIWallet>("/wallet/"),
  transactions: () => api.get<APITransaction[]>("/wallet/transactions/"),
  deposit: (formData: FormData) => api.postForm<{ id: number }>("/wallet/deposit/", formData),
  withdraw: (data: {
    amount: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    routing_number: string;
  }) => api.post<{ id: number }>("/wallet/withdraw/", data),
  transferMethods: () => api.get<APITransferMethod[]>("/wallet/transfer-methods/"),
};

// Orders endpoints
export const ordersApi = {
  place: (ticker: string, type: "buy" | "sell", shares: number) =>
    api.post<{ id: number; total: string; price_at_order: string }>("/orders/", {
      ticker,
      type,
      shares,
    }),
  history: () => api.get<unknown[]>("/orders/history/"),
  portfolio: () => api.get<APIPortfolio>("/orders/portfolio/"),
};

// ── Admin types ──────────────────────────────────────────────────────────────
export interface AdminUserSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  phone: string;
  email_verified: boolean;
  is_active: boolean;
  date_joined: string;
  wallet_balance: string;
  portfolio_value: string;
  holdings_count: number;
}

export interface AdminHolding {
  id: number;
  stock: { id: number; ticker: string; name: string; price: string };
  shares: string;
  avg_cost: string;
  current_value: string;
  cost_basis: string;
  pnl: string;
  pnl_percent: string;
}

export interface AdminTransaction {
  id: number;
  type: string;
  amount: string;
  status: string;
  description: string;
  created_at: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  holdings: AdminHolding[];
  recent_transactions: AdminTransaction[];
}

// Admin API endpoints
export const adminApi = {
  users: (search?: string) =>
    api.get<AdminUserSummary[]>(`/admin/users/${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  userDetail: (id: number) => api.get<AdminUserDetail>(`/admin/users/${id}/`),
  adjustWallet: (id: number, action: "set" | "add" | "subtract", amount: number) =>
    api.post<{ balance: string }>(`/admin/users/${id}/wallet/`, { action, amount }),
  updateUser: (id: number, data: Partial<Pick<AdminUserSummary, "first_name" | "last_name" | "email" | "phone" | "country" | "is_active" | "email_verified">>) =>
    api.patch<AdminUserDetail>(`/admin/users/${id}/profile/`, data),
  addHolding: (id: number, ticker: string, shares: number, avg_cost: number) =>
    api.post<AdminHolding>(`/admin/users/${id}/holdings/`, { ticker, shares, avg_cost }),
  removeHolding: (userId: number, holdingId: number) =>
    api.delete<void>(`/admin/users/${userId}/holdings/${holdingId}/`),
};

// Admin Transfer Methods API
export const adminTransferMethodsApi = {
  list: () => api.get<APITransferMethod[]>("/wallet/admin/transfer-methods/"),
  create: (data: Omit<APITransferMethod, "id" | "method_type_display">) =>
    api.post<APITransferMethod>("/wallet/admin/transfer-methods/", data),
  update: (id: number, data: Partial<Omit<APITransferMethod, "id" | "method_type_display">>) =>
    api.patch<APITransferMethod>(`/wallet/admin/transfer-methods/${id}/`, data),
  delete: (id: number) => api.delete<void>(`/wallet/admin/transfer-methods/${id}/`),
};
