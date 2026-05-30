import { getCollageBounds } from "./collage";
import type { CollageItemRecord, CreateCollageItemPayload, Entry } from "./types";

export async function fetchEntries(): Promise<Entry[]> {
  const res = await fetch("/api/entries", { cache: "no-store", credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = typeof err.error === "string" ? err.error : `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return res.json();
}

export async function createEntry(payload: {
  title?: string;
  createdAt?: string;
  items: CreateCollageItemPayload[];
}): Promise<Entry> {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const step = err.step ? ` (${err.step})` : "";
    throw new Error((err.error || "Failed to create entry") + step);
  }
  return res.json();
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete entry");
}

export async function updateEntry(
  id: string,
  payload: { title?: string | null }
): Promise<Entry> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update entry");
  }
  return res.json();
}

export function entryHeight(entry: Entry): number {
  const headerBlock = 120;

  if (!entry.items.length) {
    return 280 + headerBlock;
  }

  const placements = entry.items.map((item) => ({
    x: item.position_x,
    y: item.position_y,
    rotation: item.rotation_degrees,
    scale: item.scale_factor,
    width: item.width_px,
    height: item.height_px,
    zIndex: item.z_index,
  }));

  const { height: collageH } = getCollageBounds(placements);
  return collageH + headerBlock;
}

export function buildTimelineMarkers(
  entries: Entry[],
  entryOffsets: Map<string, number>
): { year: number; month: number; label: string; entryId: string; y: number }[] {
  const markers: { year: number; month: number; label: string; entryId: string; y: number }[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const d = new Date(entry.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const y = entryOffsets.get(entry.id) ?? 0;
    markers.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      entryId: entry.id,
      y,
    });
  }

  return markers;
}

export type { CollageItemRecord };
