"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoginCard } from "./LoginCard";
import { LoginHero } from "./LoginHero";
import { LoginTrustBar } from "./LoginTrustBar";
import { SignInForm } from "./SignInForm";
import { WaitlistForm } from "./WaitlistForm";

type Tab = "signin" | "waitlist";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const switchTab = (next: Tab) => {
    setTab(next);
    setError(null);
    setMessage(null);
  };

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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <LoginCard>
        <LoginHero />

        <section className="bg-blush-50 px-6 py-5">
          <div
            className="flex gap-6 border-b border-blush-200 text-sm"
            role="tablist"
            aria-label="Authentication"
          >
            <button
              type="button"
              role="tab"
              id="tab-signin"
              aria-selected={tab === "signin"}
              aria-controls="panel-signin"
              onClick={() => switchTab("signin")}
              className={`pb-2 transition ${
                tab === "signin"
                  ? "border-b-2 border-blush-400 text-blush-500"
                  : "text-gray-400 hover:text-blush-400"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              id="tab-waitlist"
              aria-selected={tab === "waitlist"}
              aria-controls="panel-waitlist"
              onClick={() => switchTab("waitlist")}
              className={`pb-2 transition ${
                tab === "waitlist"
                  ? "border-b-2 border-blush-400 text-blush-500"
                  : "text-gray-400 hover:text-blush-400"
              }`}
            >
              Waitlist
            </button>
          </div>

          <div className="mt-5">
            {tab === "signin" ? (
              <div
                role="tabpanel"
                id="panel-signin"
                aria-labelledby="tab-signin"
              >
                <SignInForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  error={error}
                  message={message}
                  onSubmit={handleSignIn}
                  onJoinWaitlist={() => switchTab("waitlist")}
                />
              </div>
            ) : (
              <div
                role="tabpanel"
                id="panel-waitlist"
                aria-labelledby="tab-waitlist"
              >
                <WaitlistForm
                  email={email}
                  setEmail={setEmail}
                  website={website}
                  setWebsite={setWebsite}
                  loading={loading}
                  error={error}
                  message={message}
                  onSubmit={handleWaitlist}
                />
              </div>
            )}
          </div>
        </section>

        <LoginTrustBar />
      </LoginCard>

      <p className="mt-6 text-[10px] text-blush-300">
        <a href="/skills" className="hover:text-blush-500">
          AI &amp; developer manifest →
        </a>
      </p>
    </div>
  );
}
