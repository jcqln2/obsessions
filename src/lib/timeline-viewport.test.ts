import { describe, expect, it } from "vitest";
import { clamp, clampPan, getPanBounds } from "./timeline-viewport";
import { DEFAULT_ZOOM } from "@/store/timeline";

describe("timeline-viewport", () => {
  it("clamp keeps values in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("getPanBounds returns scroll room when content is tall", () => {
    const { maxScroll, maxPanX } = getPanBounds(1200, 800, 3000, DEFAULT_ZOOM);
    expect(maxScroll).toBe(2200);
    expect(maxPanX).toBeGreaterThan(0);
  });

  it("clampPan limits pan when zoomed in", () => {
    const result = clampPan(5000, 5000, 1200, 800, 3000, 2);
    expect(Math.abs(result.panX)).toBeLessThan(5000);
    expect(Math.abs(result.panY)).toBeLessThan(5000);
  });
});
