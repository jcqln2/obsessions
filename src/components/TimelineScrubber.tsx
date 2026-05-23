"use client";

import { getPanBounds } from "@/lib/timeline-viewport";
import type { TimelineMarker } from "@/lib/types";

interface TimelineScrubberProps {
  markers: TimelineMarker[];
  scrollY: number;
  totalHeight: number;
  viewportHeight: number;
  viewportWidth: number;
  scale: number;
  onJump: (y: number) => void;
}

export function TimelineScrubber({
  markers,
  scrollY,
  totalHeight,
  viewportHeight,
  viewportWidth,
  scale,
  onJump,
}: TimelineScrubberProps) {
  const trackHeight = Math.max(viewportHeight - 120, 200);
  const { minScroll, maxScroll } = getPanBounds(
    viewportWidth,
    viewportHeight,
    totalHeight,
    scale
  );
  const scrollRange = maxScroll - minScroll;
  const thumbTop =
    scrollRange > 0
      ? ((scrollY - minScroll) / scrollRange) * (trackHeight - 24)
      : 0;

  const years = Array.from(new Set(markers.map((m) => m.year))).sort(
    (a, b) => b - a
  );

  return (
    <aside className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 md:block">
      <div
        className="relative flex flex-col items-end"
        style={{ height: trackHeight }}
      >
        <div className="absolute right-3 top-0 h-full w-px bg-timeline/20" />

        <div
          className="absolute right-2 h-6 w-1.5 rounded-full bg-timeline transition-[top] duration-150"
          style={{ top: thumbTop }}
          role="slider"
          aria-valuenow={scrollY}
          aria-valuemin={minScroll}
          aria-valuemax={maxScroll}
        />

        {years.map((year) => {
          const yearMarkers = markers.filter((m) => m.year === year);
          const first = yearMarkers[0];
          if (!first) return null;
          const pos = maxScroll > 0 ? (first.y / maxScroll) * trackHeight : 0;

          return (
            <button
              key={year}
              type="button"
              onClick={() => onJump(first.y)}
              className="absolute right-0 font-mono text-[11px] text-muted transition hover:text-ink"
              style={{ top: Math.min(pos, trackHeight - 20) }}
            >
              {year}
            </button>
          );
        })}

        <div className="mt-auto flex flex-col gap-2 pt-4">
          {markers.slice(0, 8).map((m) => (
            <button
              key={`${m.entryId}-${m.label}`}
              type="button"
              onClick={() => onJump(m.y)}
              className="text-right font-mono text-[10px] text-muted/80 transition hover:text-ink"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
