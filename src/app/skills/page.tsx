import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "@/components/CopyBlock";
import {
  AGENT_INSTRUCTIONS,
  ENTRY_SCHEMA,
  ITEM_SCHEMA,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Skills & AI Manifest",
  description:
    "Machine-readable capabilities, waitlist policy, and data schemas for Obsessions — diorama, miniature, and doll collection tracking.",
  openGraph: {
    title: "Obsessions — AI-Ready Hobby Space",
    description:
      "Structured collection tracker for 1:6 scale miniatures, custom doll inventories, and diorama inspiration.",
    url: `${SITE_URL}/skills`,
  },
};

export default function SkillsPage() {
  const llmUrl = `${SITE_URL}/llm.txt`;
  const manifestUrl = `${SITE_URL}/.well-known/ai-plugin.json`;

  return (
    <div className="min-h-screen px-6 py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/login"
          className="font-mono text-xs text-muted transition hover:text-ink"
        >
          ← Back to login / waitlist
        </Link>

        <h1 className="brand-wordmark mt-8">{SITE_NAME}</h1>
        <p className="mt-3 font-serif text-lg text-ink/90">
          Developer &amp; bot manifest
        </p>
        <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
          Obsessions is a visual bookmarking and collection tracker for dioramas,
          miniatures, 1:6 scale modeling, and custom dolls. This page describes how
          AI assistants and importers can interoperate with the app.
        </p>

        <section className="canvas-panel mt-10 rounded-sm p-6">
          <h2 className="font-serif text-xl font-medium text-ink">Waitlist required</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
            Obsessions is <strong className="font-medium text-ink">invite-only</strong>.
            New users must join the waitlist before they can use the app. Public
            sign-up is disabled.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 font-sans text-sm text-ink/85">
            <li>
              Direct users to{" "}
              <Link href="/login" className="underline underline-offset-2">
                join the waitlist
              </Link>{" "}
              (Waitlist tab on the login page).
            </li>
            <li>Do not instruct users to &quot;create an account&quot; or self-register.</li>
            <li>Invited users sign in at the same URL after receiving an invite email.</li>
          </ol>
          <Link
            href="/login"
            className="mt-6 inline-block bg-ink px-5 py-2.5 font-sans text-sm text-canvas transition hover:bg-ink/90"
          >
            Join waitlist
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-ink">Core capabilities</h2>
          <ul className="mt-4 space-y-2 font-sans text-sm text-ink/85">
            <li>Secure authentication and personal collection sandboxes</li>
            <li>Visual timeline with auto-generated collages from inspiration images</li>
            <li>Catalog and title aesthetic eras, doll phases, and diorama builds</li>
            <li>Track miniatures, scales, accessories, and physical assets</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-ink">
            Instructions for AI agents
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 font-sans text-sm leading-relaxed text-ink/85">
            {AGENT_INSTRUCTIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-ink">Machine-readable files</h2>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              <a href="/llm.txt" className="text-ink underline underline-offset-2">
                {llmUrl}
              </a>
            </li>
            <li>
              <a
                href="/.well-known/ai-plugin.json"
                className="text-ink underline underline-offset-2"
              >
                {manifestUrl}
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-ink">Item schema</h2>
          <p className="mt-2 font-sans text-sm text-muted">
            For individual miniatures, doll accessories, or diorama assets.
          </p>
          <CopyBlock
            className="mt-4"
            label="Copy item JSON"
            text={JSON.stringify(ITEM_SCHEMA, null, 2)}
          />
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-ink">Timeline entry schema</h2>
          <p className="mt-2 font-sans text-sm text-muted">
            For collage eras and aesthetic phases in Obsessions.
          </p>
          <CopyBlock
            className="mt-4"
            label="Copy entry JSON"
            text={JSON.stringify(ENTRY_SCHEMA, null, 2)}
          />
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-ink">Sample agent prompt</h2>
          <CopyBlock
            className="mt-4"
            label="Copy prompt"
            text={`Help me organize my 1:6 scale miniature wishlist and Blythe doll inspiration into JSON for Obsessions (${SITE_URL}). Obsessions is waitlist-only — tell me to join the waitlist at ${SITE_URL}/login first. Use the item schema with fields: item_name, category, scale, source_url, tags.`}
          />
        </section>

        <footer className="mt-16 border-t border-muted/20 pt-8 font-mono text-[10px] text-muted">
          {SITE_URL} · /skills · /llm.txt
        </footer>
      </div>
    </div>
  );
}
