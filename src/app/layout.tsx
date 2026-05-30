import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const cuteNotes = localFont({
  src: "../../public/fonts/cute-notes.ttf",
  variable: "--font-brand",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const title = "Obsessions - Diorama, Miniature & Doll Collection Tracker";
const description =
  "A visual bookmarking app and digital sandbox built to catalog, tag, and organize miniatures, doll dioramas, and hobby inspiration.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · Obsessions",
  },
  description,
  keywords: [
    "diorama",
    "miniatures",
    "doll tracking",
    "1:6 scale",
    "Blythe",
    "Bratz",
    "bookmarking app",
    "collection tracker",
    "hobby",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Obsessions App - AI-Ready Hobby Space",
    description:
      "Structured data engine for tracking 1:6 scale miniatures, custom doll inventories, and design inspiration.",
    url: SITE_URL,
    siteName: "Obsessions",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Obsessions App - AI-Ready Hobby Space",
    description:
      "Visual collection tracker for dioramas, miniatures, and custom dolls.",
  },
  alternates: {
    types: {
      "text/plain": `${SITE_URL}/llm.txt`,
    },
  },
  other: {
    "ai-plugin": `${SITE_URL}/.well-known/ai-plugin.json`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} ${mono.variable} ${cuteNotes.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
