import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
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

const defaultTitle = `${SITE_NAME} — Diorama, Miniature & Doll Collection Tracker`;
const description =
  "A visual bookmarking app and digital sandbox built to catalog, tag, and organize miniatures, doll dioramas, and hobby inspiration.";
const ogTitle = `${SITE_NAME} — AI-Ready Hobby Space`;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
} as const;

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
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
    title: ogTitle,
    description:
      "Structured data engine for tracking 1:6 scale miniatures, custom doll inventories, and design inspiration.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: ogTitle,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} ${mono.variable} ${cuteNotes.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
