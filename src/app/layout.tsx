import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Obsessions",
  description: "Visual memory snapshots of temporary aesthetic eras",
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
