"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          window.location.href = "/";
        } else {
          setMessage(
            "Account created. Check your email to confirm, then sign in — or turn off “Confirm email” in Supabase."
          );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          window.location.href = "/";
        }
      }
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
          Your private obsession collage tool
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
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
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full font-sans text-xs text-muted hover:text-ink"
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
