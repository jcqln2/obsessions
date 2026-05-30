import { Link2 } from "lucide-react";
import { linkDomain } from "@/lib/collage-items";

interface PinnedLinkProps {
  url: string;
  label?: string | null;
  compact?: boolean;
}

export function PinnedLink({ url, label, compact = true }: PinnedLinkProps) {
  const domain = linkDomain(url);
  const display = label?.trim() || domain;

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush-400 shadow-sm ring-2 ring-blush-200"
        aria-hidden
      />
      <div
        className={`flex h-full w-full flex-col justify-center rounded-sm border border-blush-200 bg-blush-50 shadow-scrap ${
          compact ? "gap-0.5 px-2.5 py-2 pt-3" : "gap-1 px-4 py-3 pt-4"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3 w-3 shrink-0 text-blush-400" aria-hidden />
          <p
            className={`truncate font-medium text-blush-700 ${
              compact ? "text-[11px]" : "text-sm"
            }`}
          >
            {display}
          </p>
        </div>
        {label?.trim() && (
          <p className={`truncate text-blush-400 ${compact ? "text-[9px]" : "text-xs"}`}>
            {domain}
          </p>
        )}
      </div>
    </div>
  );
}
