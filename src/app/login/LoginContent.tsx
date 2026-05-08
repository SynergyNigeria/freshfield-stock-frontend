"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock auth — navigate to dashboard after short delay
    setTimeout(() => router.push("/"), 1200);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Background photo ── */}
      <Image
        src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=80"
        alt=""
        fill
        priority
        className="object-cover object-center"
        unoptimized
      />

      {/* ── Gradient overlay (maintains brand green) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(2,12,2,0.96) 0%, rgba(4,26,8,0.92) 20%, rgba(7,61,16,0.88) 40%, rgba(6,95,15,0.82) 58%, rgba(4,137,42,0.75) 75%, rgba(6,208,1,0.55) 100%)",
        }}
      />

      {/* ── Noise/grain texture overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* ── Glowing orbs ── */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: "#06d001" }}
      />
      <div
        className="absolute bottom-[-8%] left-[-8%] w-[360px] h-[360px] rounded-full opacity-15 blur-3xl"
        style={{ background: "#4ade80" }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full opacity-10 blur-2xl"
        style={{ background: "#06d001" }}
      />

      {/* ── Content wrapper ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── Left: Brand / Hero ── */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-auto h-auto rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Image src="/logo.png" alt="Freshfield" width={64} height={64} className="w-16 h-16 object-contain" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Trade smarter.<br />
            <span style={{ color: "#06d001" }} className="drop-shadow-[0_0_24px_#06d00155]">
              Grow faster.
            </span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-md leading-relaxed mb-10">
            Access US stocks, track your portfolio, and manage your funds — all in one clean, powerful platform.
          </p>


        </div>

        {/* ── Right: Login card ── */}
        <div className="w-full max-w-sm lg:max-w-md flex-shrink-0">
          <div
            className="rounded-3xl border border-white/15 p-8 sm:p-10"
            style={{
              background: "rgba(255, 255, 255, 0.07)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1.5">Welcome back</h2>
              <p className="text-white/50 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#06d001")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Password
                  </label>
                  <button type="button" className="text-xs font-medium" style={{ color: "#06d001" }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#06d001")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all mt-1 active:scale-[0.98] disabled:opacity-70"
                style={{
                  background: loading ? "#06d00180" : "#06d001",
                  boxShadow: "0 8px 24px #06d00140",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-white/40 text-sm">
                Don&apos;t have an account?{" "}
                <button className="font-semibold" style={{ color: "#06d001" }}>
                  Create one free
                </button>
              </p>
            </div>
          </div>

          {/* Trust line */}
          <p className="text-center text-white/25 text-xs mt-5">
            Protected by 256-bit encryption · SIPC insured
          </p>
        </div>
      </div>
    </div>
  );
}
