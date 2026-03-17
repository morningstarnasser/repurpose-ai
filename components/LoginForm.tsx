"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type Mode = "main" | "email" | "code";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("main");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setMode("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn("email-code", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid or expired code. Please try again.");
        setLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#FAFAFA]">
      <div className="brutal-card p-8 md:p-12 max-w-md w-full bg-white text-center">
        {/* Logo */}
        <div className="text-3xl font-bold uppercase mb-1">
          Repurpose<span className="text-secondary">AI</span>
        </div>
        <p className="text-dark/30 text-xs font-medium mb-1">by CreativeSync</p>
        <p className="text-dark/60 font-medium mb-8">Sign in to access your dashboard</p>

        {/* Main buttons */}
        {mode === "main" && (
          <>
            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="brutal-btn w-full py-4 text-base bg-white flex items-center justify-center gap-3 mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[3px] bg-black"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-dark/40">or</span>
              <div className="flex-1 h-[3px] bg-black"></div>
            </div>

            {/* Apple */}
            <button
              onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
              className="brutal-btn w-full py-4 text-base bg-black text-white flex items-center justify-center gap-3 mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign in with Apple
            </button>

            {/* Email */}
            <button
              onClick={() => { setMode("email"); setError(""); }}
              className="brutal-btn w-full py-4 text-base bg-accent flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
              Sign in with Email
            </button>
          </>
        )}

        {/* Email input */}
        {mode === "email" && (
          <form onSubmit={handleSendCode}>
            <div className="text-left mb-4">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full brutal-border px-4 py-3 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-dark/50 mb-4 text-left">
              We&apos;ll send a 6-digit code to your email.
            </p>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`brutal-btn w-full py-4 text-base ${loading ? "bg-dark/50 text-white" : "bg-primary"}`}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
            <button
              type="button"
              onClick={() => { setMode("main"); setError(""); }}
              className="mt-3 text-sm font-bold text-dark/40 hover:text-dark"
            >
              Back to login options
            </button>
          </form>
        )}

        {/* Code input */}
        {mode === "code" && (
          <form onSubmit={handleVerifyCode}>
            <div className="brutal-border bg-accent/10 px-4 py-3 mb-4 text-left">
              <p className="text-sm font-bold">Code sent to {email}</p>
              <p className="text-xs text-dark/50">Check your inbox (and spam folder)</p>
            </div>
            <div className="text-left mb-4">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">6-Digit Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full brutal-border px-4 py-4 font-bold text-2xl text-center tracking-[0.5em] bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`brutal-btn w-full py-4 text-base ${loading ? "bg-dark/50 text-white" : code.length === 6 ? "bg-primary" : "bg-dark/20 text-dark/40"}`}
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => { setMode("email"); setCode(""); setError(""); }}
                className="text-sm font-bold text-dark/40 hover:text-dark"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={(e) => { setCode(""); handleSendCode(e as unknown as React.FormEvent); }}
                className="text-sm font-bold text-accent hover:text-secondary"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="brutal-border bg-secondary/20 text-secondary px-4 py-3 font-bold text-sm mt-4">
            {error}
          </div>
        )}

        {/* Back to home */}
        <a
          href="/"
          className="inline-block mt-6 text-sm font-bold uppercase tracking-wider text-dark/40 hover:text-dark transition-colors"
        >
          &larr; Back to Home
        </a>
      </div>
    </div>
  );
}
