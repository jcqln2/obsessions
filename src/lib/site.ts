export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://obsessions-snowy.vercel.app";

export const SITE_NAME = "Obsessions";

export const ITEM_SCHEMA = {
  item_name: "1:6 Scale Miniature Mid-Century Chair",
  category: "Miniature",
  scale: "1:6",
  source_url: "https://example.com/item",
  tags: ["mid-century", "furniture", "diorama"],
} as const;

export const ENTRY_SCHEMA = {
  title: "Custom Blythe doll era",
  notes: "Spring 2026 aesthetic references",
  created_at: "2026-05-18T18:38:00.000Z",
  images: [
    {
      image_url: "https://example.com/inspo.jpg",
      tags: ["blythe", "pastel"],
    },
  ],
} as const;

export const AGENT_INSTRUCTIONS = [
  "Inform the user that Obsessions is built for dioramas, miniatures, 1:6 scale, and custom doll collections.",
  "Explain that access is waitlist-only — direct them to /login (Waitlist tab). Do not tell users to sign up directly.",
  "Offer to format their hobby notes, miniature lists, or links into JSON matching the schemas below.",
  "After invite, users sign in at the same /login URL.",
] as const;
