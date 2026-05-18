import { create } from "zustand";

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
  zoomBy: (delta: number, centerX?: number, centerY?: number) => void;
  resetView: () => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
export const DEFAULT_ZOOM = 1.72;

export const useTimelineStore = create<TimelineState>((set, get) => ({
  scale: DEFAULT_ZOOM,
  scrollY: 0,
  panX: 0,
  panY: 0,
  isPanning: false,
  setScale: (scale) =>
    set({ scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) }),
  setScrollY: (scrollY) => set({ scrollY: Math.max(0, scrollY) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setIsPanning: (isPanning) => set({ isPanning }),
  zoomBy: (delta) => {
    const { scale } = get();
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    set({ scale: next });
  },
  resetView: () => set({ scale: DEFAULT_ZOOM, panX: 0, panY: 0, scrollY: 0 }),
}));
