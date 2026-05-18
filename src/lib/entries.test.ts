import { describe, expect, it, vi, afterEach } from "vitest";
import { buildTimelineMarkers, entryHeight, fetchEntries } from "./entries";
import type { Entry } from "./types";

function mockEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "entry-1",
    user_id: "user-1",
    title: "test era",
    notes: null,
    created_at: "2026-05-17T12:00:00.000Z",
    updated_at: "2026-05-17T12:00:00.000Z",
    images: [
      {
        id: "img-1",
        entry_id: "entry-1",
        image_url: "https://example.com/a.png",
        storage_path: "user/a.png",
        position_x: 0,
        position_y: 0,
        rotation_degrees: 0,
        scale_factor: 1,
        width_px: 180,
        height_px: 120,
        z_index: 0,
        created_at: "2026-05-17T12:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("entries", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("entryHeight includes collage height plus padding", () => {
    const h = entryHeight(mockEntry());
    expect(h).toBe(280 + 140);
  });

  it("buildTimelineMarkers dedupes months", () => {
    const entries = [
      mockEntry({ id: "a", created_at: "2026-05-10T12:00:00.000Z" }),
      mockEntry({ id: "b", created_at: "2026-05-20T12:00:00.000Z" }),
    ];
    const offsets = new Map([
      ["a", 100],
      ["b", 500],
    ]);
    const markers = buildTimelineMarkers(entries, offsets);
    expect(markers).toHaveLength(1);
    expect(markers[0].entryId).toBe("a");
    expect(markers[0].y).toBe(100);
  });

  it("fetchEntries throws with API error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "permission denied" }),
      })
    );

    await expect(fetchEntries()).rejects.toThrow("permission denied");
  });

  it("fetchEntries returns parsed entries on success", async () => {
    const data = [mockEntry()];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => data,
      })
    );

    await expect(fetchEntries()).resolves.toEqual(data);
  });
});
