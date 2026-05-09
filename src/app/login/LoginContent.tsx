"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, CheckCircle2, ChevronDown, Search } from "lucide-react";
import { useAuth, APIError } from "@/lib/auth";
import { COUNTRIES, Country } from "@/lib/countries";

export default function LoginContent() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "verified">("login");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState<Country | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  function selectCountry(c: Country) {
    setCountry(c);
    setCountrySearch("");
    setShowCountryDropdown(false);
  }

  const phoneValue = country ? `${country.dialCode} ${phoneLocal}` : phoneLocal;

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError(null);
    setPassword("");
    setPassword2("");
    setPhoneLocal("");
    setCountry(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/");
      } else {
        await register({
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phoneValue,
          country: country?.name ?? "",
          password,
          password2,
        });
        setMode("verified");
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message || (mode === "login" ? "Invalid email or password." : "Registration failed."));
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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

        {/* ── Right: Login/Register card ── */}
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
            {/* ── Email verified confirmation ── */}
            {mode === "verified" ? (
              <div className="flex flex-col items-center text-center gap-5 py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(6,208,1,0.15)" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#06d001" }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    We sent a verification link to <span className="text-white font-medium">{email}</span>.<br />
                    Click the link to activate your account.
                  </p>
                </div>
                <p className="text-white/30 text-xs">
                  During development, the link is printed in the Django console.
                </p>
                <button
                  onClick={() => switchMode("login")}
                  className="mt-2 text-sm font-semibold"
                  style={{ color: "#06d001" }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1.5">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {mode === "login" ? "Sign in to your account to continue" : "Start trading in minutes — it's free"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Register-only: name fields */}
                  {mode === "register" && (
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">First name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#06d001")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Last name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#06d001")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                    </div>
                  )}

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
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#06d001")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    />
                  </div>

                  {/* Register-only: Country + Phone */}
                  {mode === "register" && (
                    <>
                      {/* Country picker */}
                      <div className="flex flex-col gap-1.5" ref={countryRef}>
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Country</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown((v) => !v)}
                            className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm text-left transition-all"
                            style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${showCountryDropdown ? "#06d001" : "rgba(255,255,255,0.12)"}` }}
                          >
                            {country ? (
                              <span className="flex items-center gap-2 text-white">
                                <span className="text-lg">{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-white/40">{country.dialCode}</span>
                              </span>
                            ) : (
                              <span className="text-white/30">Select your country…</span>
                            )}
                            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                          </button>

                          {showCountryDropdown && (
                            <div
                              className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden"
                              style={{ background: "rgba(10,20,10,0.97)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
                            >
                              {/* Search */}
                              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
                                <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                                <input
                                  autoFocus
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder="Search country…"
                                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                                />
                              </div>
                              {/* List */}
                              <div className="max-h-52 overflow-y-auto">
                                {filteredCountries.length === 0 ? (
                                  <p className="text-center text-white/30 text-sm py-4">No results</p>
                                ) : (
                                  filteredCountries.map((c) => (
                                    <button
                                      key={c.code}
                                      type="button"
                                      onClick={() => selectCountry(c)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors text-left"
                                    >
                                      <span className="text-lg w-6 text-center">{c.flag}</span>
                                      <span className="flex-1">{c.name}</span>
                                      <span className="text-white/40 text-xs">{c.dialCode}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone number */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Phone number</label>
                        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                          {/* Dial code prefix */}
                          <div
                            className="flex items-center gap-1.5 px-3 border-r border-white/10 flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            {country ? (
                              <>
                                <span className="text-base">{country.flag}</span>
                                <span className="text-sm text-white/60 font-medium">{country.dialCode}</span>
                              </>
                            ) : (
                              <span className="text-sm text-white/25">+--</span>
                            )}
                          </div>
                          <input
                            type="tel"
                            required
                            value={phoneLocal}
                            onChange={(e) => setPhoneLocal(e.target.value.replace(/[^0-9\s\-]/g, ""))}
                            placeholder={country ? "000 000 0000" : "Select country first"}
                            disabled={!country}
                            className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/30 outline-none disabled:opacity-40"
                            onFocus={(e) => { const el = e.currentTarget.closest("div") as HTMLElement; if (el) el.style.borderColor = "#06d001"; }}
                            onBlur={(e) => { const el = e.currentTarget.closest("div") as HTMLElement; if (el) el.style.borderColor = "rgba(255,255,255,0.12)"; }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
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

                  {/* Register-only: confirm password */}
                  {mode === "register" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Confirm password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#06d001")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <p className="text-red-400 text-sm text-center rounded-xl py-2 px-3" style={{ background: "rgba(239,68,68,0.15)" }}>
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all mt-1 active:scale-[0.98] disabled:opacity-70"
                    style={{ background: loading ? "#06d00180" : "#06d001", boxShadow: "0 8px 24px #06d00140" }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {mode === "login" ? "Signing in…" : "Creating account…"}
                      </span>
                    ) : (
                      <>
                        {mode === "login" ? "Sign in" : "Create account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  {mode === "login" ? (
                    <p className="text-white/40 text-sm">
                      Don&apos;t have an account?{" "}
                      <button onClick={() => switchMode("register")} className="font-semibold" style={{ color: "#06d001" }}>
                        Create one free
                      </button>
                    </p>
                  ) : (
                    <p className="text-white/40 text-sm">
                      Already have an account?{" "}
                      <button onClick={() => switchMode("login")} className="font-semibold" style={{ color: "#06d001" }}>
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
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
