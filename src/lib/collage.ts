import type { CollagePlacement } from "./types";

const MAX_WIDTH = 520;
const MAX_HEIGHT = 420;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Size {
  width: number;
  height: number;
}

function overlaps(
  x: number,
  y: number,
  w: number,
  h: number,
  placed: { x: number; y: number; w: number; h: number }[]
): boolean {
  const pad = 24;
  for (const p of placed) {
    if (
      x < p.x + p.w - pad &&
      x + w - pad > p.x &&
      y < p.y + p.h - pad &&
      y + h - pad > p.y
    ) {
      return true;
    }
  }
  return false;
}

function fitDimensions(naturalW: number, naturalH: number, scale: number): Size {
  const maxSide = 180 * scale;
  const ratio = naturalW / naturalH;
  if (naturalW >= naturalH) {
    return { width: Math.round(maxSide), height: Math.round(maxSide / ratio) };
  }
  return { width: Math.round(maxSide * ratio), height: Math.round(maxSide) };
}

export function generateCollageLayout(
  sizes: { width: number; height: number }[]
): CollagePlacement[] {
  const shuffled = shuffle(sizes.map((s, i) => ({ ...s, index: i })));
  const placedRects: { x: number; y: number; w: number; h: number }[] = [];
  const results: CollagePlacement[] = new Array(sizes.length);

  shuffled.forEach((item, zIndex) => {
    const scale = Math.random() * 0.7 + 0.6;
    const rotation = (Math.random() - 0.5) * 24;
    const { width, height } = fitDimensions(item.width, item.height, scale);

    let x = 0;
    let y = 0;
    let found = false;

    for (let attempt = 0; attempt < 12; attempt++) {
      x = Math.random() * Math.max(40, MAX_WIDTH - width - 20);
      y = Math.random() * Math.max(40, MAX_HEIGHT - height - 20);

      if (!overlaps(x, y, width, height, placedRects)) {
        found = true;
        break;
      }
    }

    if (!found) {
      const lowest = placedRects.reduce((m, p) => Math.max(m, p.y + p.h), 0);
      x = 20 + Math.random() * 80;
      y = lowest + 16;
    }

    placedRects.push({ x, y, w: width, h: height });
    results[item.index] = {
      x,
      y,
      rotation,
      scale,
      width,
      height,
      zIndex,
    };
  });

  return results;
}

export function getCollageBounds(placements: CollagePlacement[]): {
  width: number;
  height: number;
} {
  let maxX = MAX_WIDTH;
  let maxY = MAX_HEIGHT;

  for (const p of placements) {
    maxX = Math.max(maxX, p.x + p.width + 40);
    maxY = Math.max(maxY, p.y + p.height + 40);
  }

  return { width: maxX, height: maxY };
}

export function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
