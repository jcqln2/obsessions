import { create } from "zustand";
import {
  clampPan,
  clampScroll,
  computeZoomAtAnchor,
} from "@/lib/timeline-viewport";

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 2.5;
/** Comfortable overview — full timeline at readable size (shown as 0% in UI) */
export const DEFAULT_ZOOM = 1;
const ZOOM_STEP = 1.12;

/** UI label: 0% = default zoom, +50% = 1.5×, etc. */
export function formatZoomPercent(scale: number) {
  return Math.round((scale / DEFAULT_ZOOM - 1) * 100);
}

export interface ZoomContext {
  anchorX: number;
  anchorY: number;
  viewportWidth: number;
  viewportHeight: number;
  totalHeight: number;
}

interface TimelineState {
  scale: number;
  scrollY: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  setScale: (scale: number) => void;
  setScrollY: (y: number) => void;
  setPan: (x: number, y: number) => void;
  setIsPanning: (v: boolean) => void;
  /** @deprecated Prefer zoomByFactor */
  zoomBy: (delta: number) => void;
  zoomByFactor: (factor: number, ctx: ZoomContext) => void;
  zoomIn: (ctx: ZoomContext) => void;
  zoomOut: (ctx: ZoomContext) => void;
  resetView: () => void;
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function applyZoom(
  get: () => TimelineState,
  set: (partial: Partial<TimelineState>) => void,
  nextScale: number,
  ctx: ZoomContext
) {
  const { scale, panX, panY, scrollY } = get();
  const clampedScale = clampScale(nextScale);
  if (clampedScale === scale) return;

  const raw = computeZoomAtAnchor({
    scale,
    nextScale: clampedScale,
    panX,
    panY,
    scrollY,
    anchorX: ctx.anchorX,
    anchorY: ctx.anchorY,
    viewportWidth: ctx.viewportWidth,
  });

  const { panX: nextPanX, panY: nextPanY } = clampPan(
    raw.panX,
    panY,
    ctx.viewportWidth,
    ctx.viewportHeight,
    ctx.totalHeight,
    clampedScale
  );

  set({
    scale: clampedScale,
    panX: nextPanX,
    panY: nextPanY,
    scrollY: clampScroll(
      raw.scrollY,
      ctx.viewportWidth,
      ctx.viewportHeight,
      ctx.totalHeight,
      clampedScale
    ),
  });
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  scale: DEFAULT_ZOOM,
  scrollY: 0,
  panX: 0,
  panY: 0,
  isPanning: false,
  setScale: (scale) => set({ scale: clampScale(scale) }),
  setScrollY: (scrollY) => set({ scrollY }),
  setPan: (panX, panY) => set({ panX, panY }),
  setIsPanning: (isPanning) => set({ isPanning }),
  zoomBy: (delta) => {
    const { scale } = get();
    set({ scale: clampScale(scale + delta) });
  },
  zoomByFactor: (factor, ctx) => {
    applyZoom(get, set, get().scale * factor, ctx);
  },
  zoomIn: (ctx) => applyZoom(get, set, get().scale * ZOOM_STEP, ctx),
  zoomOut: (ctx) => applyZoom(get, set, get().scale / ZOOM_STEP, ctx),
  resetView: () => set({ scale: DEFAULT_ZOOM, panX: 0, panY: 0, scrollY: 0 }),
}));
