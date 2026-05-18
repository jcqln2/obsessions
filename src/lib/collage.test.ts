import { describe, expect, it, vi, afterEach } from "vitest";
import {
  formatEntryDate,
  formatShortDate,
  generateCollageLayout,
  getCollageBounds,
} from "./collage";

describe("collage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generateCollageLayout returns one placement per image with integer dimensions", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const sizes = [
      { width: 800, height: 600 },
      { width: 400, height: 400 },
    ];
    const layout = generateCollageLayout(sizes);

    expect(layout).toHaveLength(2);
    layout.forEach((p) => {
      expect(Number.isInteger(p.width)).toBe(true);
      expect(Number.isInteger(p.height)).toBe(true);
      expect(p.rotation).toBeGreaterThanOrEqual(-12);
      expect(p.rotation).toBeLessThanOrEqual(12);
      expect(p.scale).toBeGreaterThanOrEqual(0.6);
      expect(p.scale).toBeLessThanOrEqual(1.3);
    });
  });

  it("getCollageBounds expands to fit placements", () => {
    const bounds = getCollageBounds([
      { x: 10, y: 20, rotation: 0, scale: 1, width: 200, height: 150, zIndex: 0 },
    ]);
    expect(bounds.width).toBeGreaterThanOrEqual(250);
    expect(bounds.height).toBeGreaterThanOrEqual(210);
  });

  it("formatEntryDate formats ISO strings", () => {
    expect(formatEntryDate("2026-05-17T12:00:00.000Z")).toMatch(/May 2026/);
  });

  it("formatShortDate formats ISO strings", () => {
    expect(formatShortDate("2026-05-17T12:00:00.000Z")).toMatch(/May 2026/);
  });
});
