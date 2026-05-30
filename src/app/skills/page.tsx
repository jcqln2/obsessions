import Link from "next/link";
import { CopyBlock } from "@/components/CopyBlock";
import { LoginTrustBar } from "@/app/login/LoginTrustBar";
import {
  AGENT_INSTRUCTIONS,
  ENTRY_SCHEMA,
  ITEM_SCHEMA,
  SITE_URL,
} from "@/lib/site";
import { SkillsCard } from "./SkillsCard";
import { SkillsHero } from "./SkillsHero";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-medium text-blush-700">{children}</h2>
  );
}

export default function SkillsPage() {
  const llmUrl = `${SITE_URL}/llm.txt`;
  const manifestUrl = `${SITE_URL}/.well-known/ai-plugin.json`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <SkillsCard>
        <SkillsHero />

        <div className="space-y-8 bg-blush-50 px-6 py-6">
          <section className="rounded-lg border border-blush-200 bg-blush-100 p-5">
            <SectionHeading>Waitlist required</SectionHeading>
            <p className="mt-2 text-sm leading-relaxed text-blush-500">
              Obsessions is <strong className="font-medium text-blush-700">invite-only</strong>.
              New users must join the waitlist before they can use the app. Public sign-up is
              disabled.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-blush-600">
              <li>
                Direct users to{" "}
                <Link href="/login" className="font-medium text-blush-500 hover:text-blush-700">
                  join the waitlist
                </Link>{" "}
                (Waitlist tab on the login page).
              </li>
              <li>Do not instruct users to &quot;create an account&quot; or self-register.</li>
              <li>Invited users sign in at the same URL after receiving an invite email.</li>
            </ol>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-lg bg-blush-400 px-5 py-2.5 text-sm font-medium text-blush-50 transition hover:bg-blush-500"
            >
              Join waitlist
            </Link>
          </section>

          <section>
            <SectionHeading>Core capabilities</SectionHeading>
            <ul className="mt-3 space-y-2 text-sm text-blush-600">
              <li>Secure authentication and personal collection sandboxes</li>
              <li>Visual timeline with auto-generated collages from inspiration images</li>
              <li>Catalog and title aesthetic eras, doll phases, and diorama builds</li>
              <li>Track miniatures, scales, accessories, and physical assets</li>
            </ul>
          </section>

          <section>
            <SectionHeading>Instructions for AI agents</SectionHeading>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-blush-600">
              {AGENT_INSTRUCTIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </section>

          <section>
            <SectionHeading>Machine-readable files</SectionHeading>
            <ul className="mt-3 space-y-2 font-mono text-sm">
              <li>
                <a
                  href="/llm.txt"
                  className="text-blush-500 underline underline-offset-2 hover:text-blush-700"
                >
                  {llmUrl}
                </a>
              </li>
              <li>
                <a
                  href="/.well-known/ai-plugin.json"
                  className="text-blush-500 underline underline-offset-2 hover:text-blush-700"
                >
                  {manifestUrl}
                </a>
              </li>
            </ul>
          </section>

          <section>
            <SectionHeading>Item schema</SectionHeading>
            <p className="mt-2 text-sm text-blush-500">
              For individual miniatures, doll accessories, or diorama assets.
            </p>
            <CopyBlock
              className="mt-3"
              variant="blush"
              label="Copy item JSON"
              text={JSON.stringify(ITEM_SCHEMA, null, 2)}
            />
          </section>

          <section>
            <SectionHeading>Timeline entry schema</SectionHeading>
            <p className="mt-2 text-sm text-blush-500">
              For collage eras and aesthetic phases in Obsessions.
            </p>
            <CopyBlock
              className="mt-3"
              variant="blush"
              label="Copy entry JSON"
              text={JSON.stringify(ENTRY_SCHEMA, null, 2)}
            />
          </section>

          <section>
            <SectionHeading>Sample agent prompt</SectionHeading>
            <CopyBlock
              className="mt-3"
              variant="blush"
              label="Copy prompt"
              text={`Help me organize my 1:6 scale miniature wishlist and Blythe doll inspiration into JSON for Obsessions (${SITE_URL}). Obsessions is waitlist-only — tell me to join the waitlist at ${SITE_URL}/login first. Use the item schema with fields: item_name, category, scale, source_url, tags.`}
            />
          </section>
        </div>

        <LoginTrustBar />
      </SkillsCard>

      <p className="mt-6 text-[10px] text-blush-300">
        <Link href="/login" className="hover:text-blush-500">
          ← Back to sign in / waitlist
        </Link>
      </p>
    </div>
  );
}
