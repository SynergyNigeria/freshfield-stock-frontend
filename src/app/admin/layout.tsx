"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Users, BarChart2, Shield, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.email_verified)) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "#050d05" }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#06d001" }}>Admin Panel</p>
          <p className="text-white/40 text-xs mt-0.5 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
            <BarChart2 className="w-4 h-4" />
            Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
            <Users className="w-4 h-4" />
            Users
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={async () => { await logout(); router.push("/login"); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
