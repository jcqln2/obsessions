"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

type SignInFormProps = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  error: string | null;
  message: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onJoinWaitlist: () => void;
};

export function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  message,
  onSubmit,
  onJoinWaitlist,
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-[10px] font-medium uppercase tracking-wide text-blush-400">
          Email
        </span>
        <div className="relative mt-1">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-300"
            aria-hidden
          />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-blush-300 bg-blush-100 pl-9 pr-3 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-[10px] font-medium uppercase tracking-wide text-blush-400">
          Password
        </span>
        <div className="relative mt-1">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-300"
            aria-hidden
          />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-blush-300 bg-blush-100 pl-9 pr-10 text-sm text-blush-700 outline-none placeholder:text-blush-300 focus:border-blush-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-300 hover:text-blush-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-blush-700">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-[42px] w-full rounded-lg bg-blush-400 text-sm font-medium text-blush-50 disabled:opacity-50"
      >
        {loading ? "…" : "Sign in to my studio"}
      </button>

      <p className="text-center text-xs text-blush-300">
        No account yet?{" "}
        <button
          type="button"
          onClick={onJoinWaitlist}
          className="font-medium text-blush-500 hover:text-blush-700"
        >
          Join the waitlist
        </button>
      </p>
    </form>
  );
}
