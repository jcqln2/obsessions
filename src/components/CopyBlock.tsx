"use client";

import { useState } from "react";

interface CopyBlockProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyBlock({ text, label = "Copy", className = "" }: CopyBlockProps) {
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

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-sm border border-muted/25 bg-canvas-highlight/40">
        <pre className="max-h-80 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-ink/90">
          {text}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="absolute right-3 top-3 border border-muted/30 bg-canvas/90 px-2 py-1 font-mono text-[10px] text-ink transition hover:border-ink/30"
        >
          {copied ? "Copied" : label}
        </button>
      </div>
    </div>
  );
}
