import { describe, expect, it, beforeEach } from "vitest";
import {
  DEFAULT_ZOOM,
  formatZoomPercent,
  MAX_SCALE,
  MIN_SCALE,
  useTimelineStore,
} from "./timeline";

const zoomCtx = {
  anchorX: 600,
  anchorY: 400,
  viewportWidth: 1200,
  viewportHeight: 800,
  totalHeight: 3000,
};

describe("timeline store", () => {
  beforeEach(() => {
    useTimelineStore.setState({
      scale: DEFAULT_ZOOM,
      scrollY: 0,
      panX: 0,
      panY: 0,
      isPanning: false,
    });
  });

  it("starts at default zoom", () => {
    expect(useTimelineStore.getState().scale).toBe(DEFAULT_ZOOM);
  });

  it("formatZoomPercent shows 0% at default zoom", () => {
    expect(formatZoomPercent(DEFAULT_ZOOM)).toBe(0);
    expect(formatZoomPercent(DEFAULT_ZOOM * 1.5)).toBe(50);
  });

  it("resetView restores default zoom and clears pan/scroll", () => {
    useTimelineStore.setState({ scale: 2, panX: 100, panY: 50, scrollY: 200 });
    useTimelineStore.getState().resetView();
    const state = useTimelineStore.getState();
    expect(state.scale).toBe(DEFAULT_ZOOM);
    expect(state.panX).toBe(0);
    expect(state.panY).toBe(0);
    expect(state.scrollY).toBe(0);
  });

  it("zoomIn and zoomOut clamp between min and max scale", () => {
    useTimelineStore.getState().zoomIn(zoomCtx);
    expect(useTimelineStore.getState().scale).toBeGreaterThan(DEFAULT_ZOOM);

    for (let i = 0; i < 30; i++) {
      useTimelineStore.getState().zoomIn(zoomCtx);
    }
    expect(useTimelineStore.getState().scale).toBe(MAX_SCALE);

    for (let i = 0; i < 30; i++) {
      useTimelineStore.getState().zoomOut(zoomCtx);
    }
    expect(useTimelineStore.getState().scale).toBe(MIN_SCALE);
  });

  it("zoomByFactor keeps anchor point stable", () => {
    useTimelineStore.setState({ scale: 1, scrollY: 500, panX: 0, panY: 0 });
    const anchorX = 600;
    const anchorY = 300;
    useTimelineStore.getState().zoomByFactor(1.5, { ...zoomCtx, anchorX, anchorY });
    const after = useTimelineStore.getState();
    expect(after.scale).toBe(1.5);
    expect(after.scrollY).not.toBe(500);
  });
});
