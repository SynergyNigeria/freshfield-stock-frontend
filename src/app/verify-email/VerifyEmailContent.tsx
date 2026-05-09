"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authApi, setTokens } from "@/lib/api";

type State = "loading" | "success" | "error";

export default function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("Invalid or expired verification link.");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setState("error");
      setErrorMsg("No verification token found in the URL.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setTokens(res.access, res.refresh);
        setState("success");
        setTimeout(() => router.push("/"), 2000);
      })
      .catch((err) => {
        setErrorMsg(err?.message ?? "Invalid or expired verification link.");
        setState("error");
      });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050d05" }}>
      <div
        className="w-full max-w-sm rounded-3xl border border-white/10 p-10 flex flex-col items-center text-center gap-6"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)" }}
      >
        {state === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#06d001" }} />
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Verifying your email…</h2>
              <p className="text-white/40 text-sm">Please wait a moment.</p>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(6,208,1,0.15)" }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: "#06d001" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Email verified!</h2>
              <p className="text-white/40 text-sm">Redirecting you to the dashboard…</p>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Verification failed</h2>
              <p className="text-white/40 text-sm">{errorMsg}</p>
            </div>
            <a
              href="/login"
              className="text-sm font-semibold"
              style={{ color: "#06d001" }}
            >
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
