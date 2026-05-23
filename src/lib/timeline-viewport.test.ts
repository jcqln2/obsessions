import { describe, expect, it } from "vitest";
import {
  clamp,
  clampPan,
  computeFocusOnElement,
  computeZoomAtAnchor,
  getPanBounds,
  wheelZoomFactor,
} from "./timeline-viewport";
import { DEFAULT_ZOOM } from "@/store/timeline";

describe("timeline-viewport", () => {
  it("clamp keeps values in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("getPanBounds returns scale-aware scroll room with overscroll padding", () => {
    const { maxScroll, maxPanX, minScroll } = getPanBounds(1200, 800, 3000, DEFAULT_ZOOM);
    expect(maxScroll).toBeGreaterThan(3000 - 800);
    expect(minScroll).toBeLessThan(0);
    expect(maxPanX).toBeGreaterThan(0);
  });

  it("clampPan limits pan when zoomed in", () => {
    const result = clampPan(5000, 5000, 1200, 800, 3000, 2);
    expect(Math.abs(result.panX)).toBeLessThan(5000);
    expect(Math.abs(result.panY)).toBeLessThan(5000);
  });

  it("wheelZoomFactor zooms in for negative deltaY", () => {
    expect(wheelZoomFactor(-100)).toBeGreaterThan(1);
    expect(wheelZoomFactor(100)).toBeLessThan(1);
  });

  it("computeFocusOnElement moves a low element toward the visual center when zooming", () => {
    const container = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1200,
        height: 800,
        right: 1200,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    const element = {
      getBoundingClientRect: () => ({
        left: 700,
        top: 500,
        width: 200,
        height: 200,
        right: 900,
        bottom: 700,
        x: 700,
        y: 500,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    const result = computeFocusOnElement({
      element,
      container,
      targetScale: 1.5,
      currentScale: 1,
      panX: 0,
      panY: 0,
      scrollY: 0,
      viewportWidth: 1200,
      viewportHeight: 800,
    });

    expect(result.scale).toBe(1.5);
    expect(result.scrollY).toBeGreaterThan(0);
  });

  it("computeZoomAtAnchor adjusts scroll when zooming at a point", () => {
    const result = computeZoomAtAnchor({
      scale: 1,
      nextScale: 2,
      panX: 0,
      panY: 0,
      scrollY: 400,
      anchorX: 600,
      anchorY: 300,
      viewportWidth: 1200,
    });
    expect(result.scale).toBe(2);
    expect(result.scrollY).not.toBe(400);
  });
});
