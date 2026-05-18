"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EntryCard } from "./EntryCard";
import { TimelineScrubber } from "./TimelineScrubber";
import { CreateEntryModal } from "./CreateEntryModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { fetchEntries, deleteEntry, entryHeight, buildTimelineMarkers } from "@/lib/entries";
import type { Entry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { centerOffset, clamp, clampPan, getPanBounds } from "@/lib/timeline-viewport";
import { DEFAULT_ZOOM, useTimelineStore } from "@/store/timeline";

const ENTRY_GAP = 80;
const PADDING_TOP = 100;

export function TimelineView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [skipTransition, setSkipTransition] = useState(false);

  const {
    scale,
    scrollY,
    panX,
    panY,
    isPanning,
    setScrollY,
    setPan,
    setScale,
    setIsPanning,
    zoomBy,
    resetView,
  } = useTimelineStore();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchEntries();
      setEntries(data);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    load();
  }, [load]);

  const { offsets, totalHeight } = useMemo(() => {
    const offsets = new Map<string, number>();
    let y = PADDING_TOP;
    for (const entry of entries) {
      offsets.set(entry.id, y);
      y += entryHeight(entry) + ENTRY_GAP;
    }
    return { offsets, totalHeight: y + PADDING_TOP };
  }, [entries]);

  const markers = useMemo(
    () => buildTimelineMarkers(entries, offsets),
    [entries, offsets]
  );

  const applyPan = useCallback(
    (nextX: number, nextY: number) => {
      const clamped = clampPan(
        nextX,
        nextY,
        viewportWidth,
        viewportHeight,
        totalHeight,
        scale
      );
      setPan(clamped.panX, clamped.panY);
    },
    [viewportWidth, viewportHeight, totalHeight, scale, setPan]
  );

  useEffect(() => {
    const update = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    applyPan(panX, panY);
  }, [scale, viewportWidth, viewportHeight, totalHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboardNav(totalHeight, viewportHeight);

  // Wheel: vertical scroll + horizontal pan when zoomed
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomBy(e.deltaY > 0 ? -0.08 : 0.08);
        return;
      }
      e.preventDefault();

      const { maxScroll, maxPanX } = getPanBounds(
        viewportWidth,
        viewportHeight,
        totalHeight,
        scale
      );

      // Trackpad horizontal swipe, or Shift + scroll
      const horizontalDelta = e.shiftKey ? e.deltaY : e.deltaX;
      if (horizontalDelta !== 0 && (scale > 1 || e.shiftKey)) {
        const nextX = panX - horizontalDelta;
        applyPan(Math.max(-maxPanX, Math.min(maxPanX, nextX)), panY);
      }

      if (!e.shiftKey && e.deltaY !== 0) {
        setScrollY(Math.min(maxScroll, Math.max(0, scrollY + e.deltaY)));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [
    scrollY,
    panX,
    panY,
    scale,
    setScrollY,
    totalHeight,
    viewportHeight,
    viewportWidth,
    zoomBy,
    applyPan,
  ]);

  // Space + drag pan
  const [spaceHeld, setSpaceHeld] = useState(false);
  const dragRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpaceHeld(false);
        setIsPanning(false);
        dragRef.current = null;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [setIsPanning]);

  const canPan = scale > 1 || spaceHeld;

  const onPointerDown = (e: React.PointerEvent) => {
    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;
    if (!isMiddleClick && !(isLeftClick && canPan)) return;

    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea")) return;
    if (isLeftClick && target.closest("[data-collage-image]") && !spaceHeld) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    applyPan(dragRef.current.startPanX + dx, dragRef.current.startPanY + dy);
  };

  const onPointerUp = () => {
    setIsPanning(false);
    dragRef.current = null;
  };

  const focusOnImage = useCallback(
    (element: HTMLElement) => {
      const container = containerRef.current;
      if (!container) return;

      setSkipTransition(true);
      setScale(DEFAULT_ZOOM);

      const align = () => {
        const { panX, scrollY } = useTimelineStore.getState();
        const { dx, dy } = centerOffset(element, container);
        const { maxPanX, maxScroll } = getPanBounds(
          viewportWidth,
          viewportHeight,
          totalHeight,
          DEFAULT_ZOOM
        );

        setPan(clamp(panX + dx, -maxPanX, maxPanX), 0);
        setScrollY(clamp(scrollY - dy, 0, maxScroll));
        setSkipTransition(false);
      };

      requestAnimationFrame(() => requestAnimationFrame(align));
    },
    [viewportWidth, viewportHeight, totalHeight, setScale, setPan, setScrollY]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this entry from your archive?")) return;
    await deleteEntry(id);
    load();
  };

  const handleEntryUpdate = useCallback((updated: Entry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-canvas">
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-4">
        <h1 className="font-brand text-2xl font-normal tracking-wide text-ink">
          Obsessions
        </h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="font-sans text-sm text-ink underline-offset-4 hover:underline"
          >
            + New entry
          </button>
          <button
            type="button"
            onClick={resetView}
            className="hidden font-mono text-xs text-muted hover:text-ink sm:block"
            title="Reset zoom (R)"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-sans text-xs text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className={`h-full w-full touch-none ${
          isPanning ? "cursor-grabbing" : canPan ? "cursor-grab" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className={`relative mx-auto ${isPanning || skipTransition ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translate(${panX}px, ${-scrollY + panY}px) scale(${scale})`,
            transformOrigin: "top right",
            width: "100%",
            height: totalHeight,
            willChange: "transform",
          }}
        >
          {loading && (
            <p className="absolute right-16 top-40 font-sans text-muted sm:right-24 lg:right-28">
              Loading your archive…
            </p>
          )}

          {loadError && (
            <div className="absolute right-16 top-40 w-full max-w-md text-left sm:right-24 lg:right-28">
              <p className="font-sans text-sm text-red-600">{loadError}</p>
              <p className="mt-2 font-sans text-xs text-muted">
                Run <code className="text-ink">001_schema.sql</code> and{" "}
                <code className="text-ink">002_api_grants.sql</code> in Supabase SQL Editor,
                then refresh.
              </p>
              <button
                type="button"
                onClick={load}
                className="mt-4 font-sans text-sm text-ink underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !loadError && entries.length === 0 && (
            <div className="absolute right-16 top-40 w-full max-w-md text-left sm:right-24 lg:right-28">
              <p className="font-serif text-xl font-medium text-ink">Your timeline is empty</p>
              <p className="mt-2 font-sans text-sm text-muted">
                Capture your first aesthetic era — upload a few screenshots and we&apos;ll
                turn them into a collage.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-6 bg-ink px-6 py-3 font-sans text-sm text-canvas"
              >
                Create first entry
              </button>
            </div>
          )}

          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              y={offsets.get(entry.id) ?? 0}
              onDelete={handleDelete}
              onUpdate={handleEntryUpdate}
              onImageClick={(_image, element) => focusOnImage(element)}
            />
          ))}
        </div>
      </div>

      <TimelineScrubber
        markers={markers}
        scrollY={scrollY}
        totalHeight={totalHeight}
        viewportHeight={viewportHeight}
        onJump={setScrollY}
      />

      <footer className="fixed bottom-4 left-6 z-30 hidden font-mono text-[10px] text-muted/60 sm:block">
        ↑↓ scroll · click image to focus · drag to pan · +/- zoom · R reset
      </footer>

      {userId && (
        <CreateEntryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={load}
          userId={userId}
        />
      )}
    </div>
  );
}
