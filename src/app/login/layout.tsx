import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in · Join waitlist",
  description:
    "Sign in to Obsessions or join the waitlist for early access to the diorama, miniature, and doll collection tracker.",
  openGraph: {
    title: "Obsessions — Sign in or join waitlist",
    description:
      "Invite-only visual collection tracker for miniatures, dioramas, and custom dolls. Join the waitlist for access.",
    url: `${SITE_URL}/login`,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
