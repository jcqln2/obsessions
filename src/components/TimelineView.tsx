"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EntryCard } from "./EntryCard";
import { StudioLogo } from "./StudioLogo";
import { TimelineScrubber } from "./TimelineScrubber";
import { AccountSettingsModal } from "./AccountSettingsModal";
import { CreateEntryModal } from "./CreateEntryModal";
import { QuickLinkCapture } from "./QuickLinkCapture";
import { QuickNoteCapture } from "./QuickNoteCapture";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { fetchEntries, deleteEntry, entryHeight, buildTimelineMarkers } from "@/lib/entries";
import type { Entry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  clampPan,
  clampScroll,
  computeFocusOnElement,
  getPanBounds,
  wheelZoomFactor,
} from "@/lib/timeline-viewport";
import {
  DEFAULT_ZOOM,
  formatZoomPercent,
  type ZoomContext,
  useTimelineStore,
} from "@/store/timeline";

const ENTRY_GAP = 80;
const PADDING_TOP = 100;
const PADDING_BOTTOM = 160;

export function TimelineView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [noteCaptureOpen, setNoteCaptureOpen] = useState(false);
  const [linkCaptureOpen, setLinkCaptureOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [skipTransition, setSkipTransition] = useState(false);
  const zoomTransitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinchRef = useRef<{ distance: number } | null>(null);

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
    zoomByFactor,
    zoomIn,
    zoomOut,
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
    return { offsets, totalHeight: y + PADDING_BOTTOM };
  }, [entries]);

  const markers = useMemo(
    () => buildTimelineMarkers(entries, offsets),
    [entries, offsets]
  );

  const zoomContext = useCallback(
    (anchorX: number, anchorY: number): ZoomContext => ({
      anchorX,
      anchorY,
      viewportWidth,
      viewportHeight,
      totalHeight,
    }),
    [viewportWidth, viewportHeight, totalHeight]
  );

  const bumpZoomTransition = useCallback(() => {
    setSkipTransition(true);
    if (zoomTransitionRef.current) clearTimeout(zoomTransitionRef.current);
    zoomTransitionRef.current = setTimeout(() => setSkipTransition(false), 120);
  }, []);

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

  useKeyboardNav(totalHeight, viewportHeight, viewportWidth);

  // Wheel: vertical scroll + horizontal pan when zoomed
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        zoomByFactor(wheelZoomFactor(e.deltaY), {
          anchorX: e.clientX - rect.left,
          anchorY: e.clientY - rect.top,
          viewportWidth,
          viewportHeight,
          totalHeight,
        });
        bumpZoomTransition();
        return;
      }
      e.preventDefault();

      const { maxPanX } = getPanBounds(
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
        setScrollY(
          clampScroll(
            scrollY + e.deltaY,
            viewportWidth,
            viewportHeight,
            totalHeight,
            scale
          )
        );
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
    zoomByFactor,
    applyPan,
    bumpZoomTransition,
  ]);

  // Pinch-to-zoom (trackpads / touch)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const touchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { distance: touchDistance(e.touches) };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const dist = touchDistance(e.touches);
      const factor = dist / pinchRef.current.distance;
      if (Math.abs(factor - 1) < 0.002) return;

      const rect = el.getBoundingClientRect();
      const anchorX =
        (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const anchorY =
        (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      zoomByFactor(factor, {
        anchorX,
        anchorY,
        viewportWidth,
        viewportHeight,
        totalHeight,
      });
      pinchRef.current.distance = dist;
      bumpZoomTransition();
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    viewportWidth,
    viewportHeight,
    totalHeight,
    zoomByFactor,
    bumpZoomTransition,
  ]);

  // Space + drag pan
  const [spaceHeld, setSpaceHeld] = useState(false);
  const dragRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTypingTarget(e.target)) {
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

  const canPan = scale > 1.02 || spaceHeld;

  const onPointerDown = (e: React.PointerEvent) => {
    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;
    if (!isMiddleClick && !(isLeftClick && canPan)) return;

    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea")) return;
    if (isLeftClick && target.closest("[data-collage-item]") && !spaceHeld) return;

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

  const focusOnElement = useCallback(
    (element: HTMLElement) => {
      const container = containerRef.current;
      if (!container) return;

      setSkipTransition(true);

      const { scale, panX, panY, scrollY } = useTimelineStore.getState();
      const focused = computeFocusOnElement({
        element,
        container,
        targetScale: DEFAULT_ZOOM,
        currentScale: scale,
        panX,
        panY,
        scrollY,
        viewportWidth,
        viewportHeight,
      });

      const { panX: nextPanX, panY: nextPanY } = clampPan(
        focused.panX,
        0,
        viewportWidth,
        viewportHeight,
        totalHeight,
        DEFAULT_ZOOM
      );

      setScale(DEFAULT_ZOOM);
      setPan(nextPanX, nextPanY);
      setScrollY(
        clampScroll(
          focused.scrollY,
          viewportWidth,
          viewportHeight,
          totalHeight,
          DEFAULT_ZOOM
        )
      );

      requestAnimationFrame(() => setSkipTransition(false));
    },
    [viewportWidth, viewportHeight, totalHeight, setScale, setPan, setScrollY]
  );

  const focusOnEntry = useCallback(
    (entryId: string) => {
      const y = offsets.get(entryId);
      if (y === undefined) return;
      setSkipTransition(true);
      setScale(DEFAULT_ZOOM);
      setPan(0, 0);
      setScrollY(
        clampScroll(y - 80, viewportWidth, viewportHeight, totalHeight, DEFAULT_ZOOM)
      );
      requestAnimationFrame(() => setSkipTransition(false));
    },
    [offsets, viewportWidth, viewportHeight, totalHeight, setScale, setPan, setScrollY]
  );

  const handleCreated = useCallback(
    async (entryId?: string) => {
      await load();
      if (entryId) {
        window.setTimeout(() => focusOnEntry(entryId), 100);
      }
    },
    [load, focusOnEntry]
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
    <div className="relative h-screen w-full overflow-hidden">
      <div className="blush-canvas-bg pointer-events-none fixed inset-0 z-0" aria-hidden />

      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-blush-200 bg-blush-100/90 px-6 py-4 backdrop-blur-sm">
        <StudioLogo />
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setNoteCaptureOpen(true)}
            className="font-sans text-sm text-blush-500 hover:text-blush-700"
          >
            + Note
          </button>
          <button
            type="button"
            onClick={() => setLinkCaptureOpen(true)}
            className="font-sans text-sm text-blush-500 hover:text-blush-700"
          >
            + Link
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="font-sans text-sm text-blush-500 underline-offset-4 hover:text-blush-700 hover:underline"
          >
            + Images
          </button>
          <div className="hidden items-center gap-0.5 rounded-lg bg-blush-50 px-1 sm:flex">
            <button
              type="button"
              onClick={() => {
                zoomOut(zoomContext(viewportWidth / 2, viewportHeight / 2));
                bumpZoomTransition();
              }}
              className="flex h-8 w-8 items-center justify-center font-mono text-sm text-blush-400 hover:text-blush-700"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={resetView}
              className="min-w-[3.25rem] px-1 font-mono text-xs text-blush-400 hover:text-blush-700"
              title="Reset zoom (R)"
            >
              {formatZoomPercent(scale)}%
            </button>
            <button
              type="button"
              onClick={() => {
                zoomIn(zoomContext(viewportWidth / 2, viewportHeight / 2));
                bumpZoomTransition();
              }}
              className="flex h-8 w-8 items-center justify-center font-mono text-sm text-blush-400 hover:text-blush-700"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAccountSettingsOpen(true)}
            className="font-sans text-xs text-blush-400 hover:text-blush-700"
          >
            Account
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-sans text-xs text-blush-400 hover:text-blush-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className={`relative z-10 h-full w-full touch-none ${
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
            transformOrigin: "center top",
            width: "100%",
            height: totalHeight,
            willChange: "transform",
          }}
        >
          {loading && (
            <p className="absolute right-16 top-40 font-sans text-blush-500 sm:right-24 lg:right-28">
              Loading your archive…
            </p>
          )}

          {loadError && (
            <div className="absolute right-16 top-40 w-full max-w-md text-left sm:right-24 lg:right-28">
              <p className="font-sans text-sm text-red-600">{loadError}</p>
              <p className="mt-2 font-sans text-xs text-blush-500">
                Run <code className="text-blush-700">001_schema.sql</code> and{" "}
                <code className="text-blush-700">002_api_grants.sql</code> in Supabase SQL Editor,
                then refresh.
              </p>
              <button
                type="button"
                onClick={load}
                className="mt-4 font-sans text-sm text-blush-500 underline hover:text-blush-700"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !loadError && entries.length === 0 && (
            <div className="absolute right-16 top-40 w-full max-w-md text-left sm:right-24 lg:right-28">
              <p className="text-base font-medium text-blush-700">Your timeline is empty</p>
              <p className="mt-2 font-sans text-sm text-blush-500">
                Pin a note, save a link, or drop images to start your collage.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNoteCaptureOpen(true)}
                  className="rounded-lg bg-blush-400 px-4 py-2.5 font-sans text-sm font-medium text-blush-50 hover:bg-blush-500"
                >
                  + Note
                </button>
                <button
                  type="button"
                  onClick={() => setLinkCaptureOpen(true)}
                  className="rounded-lg bg-blush-400 px-4 py-2.5 font-sans text-sm font-medium text-blush-50 hover:bg-blush-500"
                >
                  + Link
                </button>
                <button
                  type="button"
                  onClick={() => setImageModalOpen(true)}
                  className="rounded-lg border border-blush-300 px-4 py-2.5 font-sans text-sm font-medium text-blush-600 hover:border-blush-400"
                >
                  + Images
                </button>
              </div>
            </div>
          )}

          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              y={offsets.get(entry.id) ?? 0}
              onDelete={handleDelete}
              onUpdate={handleEntryUpdate}
              onItemClick={(_item, element) => focusOnElement(element)}
            />
          ))}
        </div>
      </div>

      <TimelineScrubber
        markers={markers}
        scrollY={scrollY}
        totalHeight={totalHeight}
        viewportHeight={viewportHeight}
        viewportWidth={viewportWidth}
        scale={scale}
        onJump={setScrollY}
      />

      <footer className="fixed bottom-4 left-6 z-30 hidden font-mono text-[10px] text-blush-300 sm:block">
        Scroll · pinch or ⌘+scroll to zoom · drag to pan · R to reset
      </footer>

      {userId && (
        <>
          <CreateEntryModal
            open={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            onCreated={() => handleCreated()}
            userId={userId}
          />
          <QuickNoteCapture
            open={noteCaptureOpen}
            onClose={() => setNoteCaptureOpen(false)}
            onCreated={handleCreated}
          />
          <QuickLinkCapture
            open={linkCaptureOpen}
            onClose={() => setLinkCaptureOpen(false)}
            onCreated={handleCreated}
          />
        </>
      )}

      <AccountSettingsModal
        open={accountSettingsOpen}
        onClose={() => setAccountSettingsOpen(false)}
      />
    </div>
  );
}
