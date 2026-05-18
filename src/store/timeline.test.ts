import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_ZOOM, useTimelineStore } from "./timeline";

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

  it("resetView restores default zoom and clears pan/scroll", () => {
    useTimelineStore.setState({ scale: 2, panX: 100, panY: 50, scrollY: 200 });
    useTimelineStore.getState().resetView();
    const state = useTimelineStore.getState();
    expect(state.scale).toBe(DEFAULT_ZOOM);
    expect(state.panX).toBe(0);
    expect(state.panY).toBe(0);
    expect(state.scrollY).toBe(0);
  });

  it("zoomBy clamps between min and max scale", () => {
    useTimelineStore.getState().zoomBy(10);
    expect(useTimelineStore.getState().scale).toBe(3);
    useTimelineStore.getState().zoomBy(-10);
    expect(useTimelineStore.getState().scale).toBe(0.1);
  });
});
