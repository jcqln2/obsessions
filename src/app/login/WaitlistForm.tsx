"use client";

import { Mail } from "lucide-react";

type WaitlistFormProps = {
  email: string;
  setEmail: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  loading: boolean;
  error: string | null;
  message: string | null;
  onSubmit: (e: React.FormEvent) => void;
};

export function WaitlistForm({
  email,
  setEmail,
  website,
  setWebsite,
  loading,
  error,
  message,
  onSubmit,
}: WaitlistFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm leading-relaxed text-blush-500">
        Miniature Studio is invite-only for now. Leave your email and we will let
        you know when you can get in.
      </p>

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
      {message && <p className="text-sm text-blush-700">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-[42px] w-full rounded-lg bg-blush-400 text-sm font-medium text-blush-50 disabled:opacity-50"
      >
        {loading ? "…" : "Join waitlist"}
      </button>
    </form>
  );
}
