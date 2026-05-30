import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in · Miniature Studio",
  description:
    "Sign in to Miniature Studio or join the waitlist for early access to your creative archive for dioramas, custom dolls, and scale builds.",
  openGraph: {
    title: "Miniature Studio — Sign in or join waitlist",
    description:
      "Invite-only creative archive for miniatures, dioramas, and custom dolls. Join the waitlist for access.",
    url: `${SITE_URL}/login`,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen bg-app-surface">{children}</div>
  );
}
