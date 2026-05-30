import { Bot, LayoutGrid } from "lucide-react";

export function SkillsHero() {
  return (
    <section className="border-b border-blush-200 bg-blush-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-blush-400">
          <LayoutGrid className="h-[18px] w-[18px] text-blush-50" aria-hidden />
        </div>
        <h1 className="text-xl font-medium text-blush-700">Miniature Studio</h1>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-blush-400" aria-hidden />
        <div>
          <p className="text-[13px] font-medium text-blush-700">
            Developer &amp; bot manifest
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-blush-500">
            Machine-readable capabilities, waitlist policy, and data schemas for
            dioramas, miniatures, 1:6 scale modeling, and custom dolls.
          </p>
        </div>
      </div>
    </section>
  );
}
