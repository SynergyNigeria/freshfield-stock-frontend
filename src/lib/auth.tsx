"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  authApi,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  APIUser,
  APIError,
} from "@/lib/api";

interface AuthState {
  user: APIUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
    password: string;
    password2: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    async function restore() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authApi.profile();
        setUser(profile);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    setTokens(tokens.access, tokens.refresh);
    const profile = await authApi.profile();
    setUser(profile);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      country: string;
      password: string;
      password2: string;
    }) => {
      // Registration now requires email verification — no tokens issued yet
      await authApi.register(data);
    },
    []
  );

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // best-effort
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Re-export APIError for convenience
export { APIError };
