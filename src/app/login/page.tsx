"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "signin" | "waitlist";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Use a full email address (e.g. you@example.com).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Use a full email address (e.g. you@example.com).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not join waitlist.");
        return;
      }
      setMessage(
        typeof data.message === "string"
          ? data.message
          : "You're on the list — we'll email you when it's your turn."
      );
      setEmail("");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="brand-wordmark">Obsessions</h1>
        <p className="mt-2 font-sans text-sm text-muted">
          {tab === "signin"
            ? "Sign in to your archive"
            : "Join the waitlist for early access"}
        </p>

        <div className="mt-8 flex gap-6 border-b border-muted/20 font-sans text-sm">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
              setMessage(null);
            }}
            className={`pb-2 transition ${
              tab === "signin"
                ? "border-b border-ink text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("waitlist");
              setError(null);
              setMessage(null);
            }}
            className={`pb-2 transition ${
              tab === "waitlist"
                ? "border-b border-ink text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            Waitlist
          </button>
        </div>

        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="mt-8 space-y-4">
            <label className="block">
              <span className="font-mono text-xs text-muted">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border-b border-muted/30 bg-transparent py-2 font-sans text-ink outline-none placeholder:text-muted/50 focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs text-muted">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border-b border-muted/30 bg-transparent py-2 font-sans text-ink outline-none focus:border-ink"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-ink/70">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink py-3 font-sans text-sm text-canvas disabled:opacity-50"
            >
              {loading ? "…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleWaitlist} className="mt-8 space-y-4">
            <p className="font-sans text-sm leading-relaxed text-muted">
              Obsessions is invite-only for now. Leave your email and we will let you know when
              you can get in.
            </p>
            <label className="block">
              <span className="font-mono text-xs text-muted">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border-b border-muted/30 bg-transparent py-2 font-sans text-ink outline-none placeholder:text-muted/50 focus:border-ink"
              />
            </label>
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-ink/70">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink py-3 font-sans text-sm text-canvas disabled:opacity-50"
            >
              {loading ? "…" : "Join waitlist"}
            </button>
          </form>
        )}

        {tab === "signin" && (
          <p className="mt-6 font-sans text-xs text-muted">
            No account yet?{" "}
            <button
              type="button"
              onClick={() => {
                setTab("waitlist");
                setError(null);
                setMessage(null);
              }}
              className="text-ink underline-offset-2 hover:underline"
            >
              Join the waitlist
            </button>
          </p>
        )}

        <p className="mt-8 font-mono text-[10px] text-muted/70">
          <a href="/skills" className="hover:text-muted">
            AI &amp; developer manifest →
          </a>
        </p>
      </div>
    </div>
  );
}
