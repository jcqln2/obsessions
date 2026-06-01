import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Skills & AI Manifest",
  description: `Machine-readable capabilities, waitlist policy, and data schemas for ${SITE_NAME} — diorama, miniature, and doll collection tracking.`,
  openGraph: {
    title: `${SITE_NAME} — AI-Ready Hobby Space`,
    description:
      "Structured collection tracker for 1:6 scale miniatures, custom doll inventories, and diorama inspiration.",
    url: `${SITE_URL}/skills`,
  },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen bg-blush-100">{children}</div>
  );
}
