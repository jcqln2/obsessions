"use client";

import { useState } from "react";

interface CopyBlockProps {
  text: string;
  label?: string;
  className?: string;
  variant?: "canvas" | "blush";
}

export function CopyBlock({
  text,
  label = "Copy",
  className = "",
  variant = "canvas",
}: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isBlush = variant === "blush";

  return (
    <div className={className}>
      <div
        className={
          isBlush
            ? "relative overflow-hidden rounded-lg border border-blush-200 bg-blush-100"
            : "relative overflow-hidden rounded-sm border border-muted/25 bg-canvas-highlight/40"
        }
      >
        <pre
          className={
            isBlush
              ? "max-h-80 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-blush-700"
              : "max-h-80 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-ink/90"
          }
        >
          {text}
        </pre>
        <button
          type="button"
          onClick={copy}
          className={
            isBlush
              ? "absolute right-3 top-3 rounded-md border border-blush-300 bg-blush-50 px-2 py-1 font-mono text-[10px] text-blush-500 transition hover:border-blush-400 hover:text-blush-700"
              : "absolute right-3 top-3 border border-muted/30 bg-canvas/90 px-2 py-1 font-mono text-[10px] text-ink transition hover:border-ink/30"
          }
        >
          {copied ? "Copied" : label}
        </button>
      </div>
    </div>
  );
}
