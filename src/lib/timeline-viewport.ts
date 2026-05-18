export function getPanBounds(
  viewportWidth: number,
  viewportHeight: number,
  totalHeight: number,
  scale: number
) {
  const maxPanX = Math.max(0, (viewportWidth * (scale - 1)) / 2 + 48);
  const scaledHeight = totalHeight * scale;
  const maxPanY = Math.max(0, (scaledHeight - viewportHeight) / 2);
  const maxScroll = Math.max(0, totalHeight - viewportHeight);

  return { maxPanX, maxPanY, maxScroll };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Screen-space offset to center `element` inside `container`. */
export function centerOffset(
  element: HTMLElement,
  container: HTMLElement
): { dx: number; dy: number } {
  const c = container.getBoundingClientRect();
  const r = element.getBoundingClientRect();
  const viewCX = c.left + c.width / 2;
  const viewCY = c.top + c.height / 2;
  const elCX = r.left + r.width / 2;
  const elCY = r.top + r.height / 2;
  return { dx: viewCX - elCX, dy: viewCY - elCY };
}

export function clampPan(
  panX: number,
  panY: number,
  viewportWidth: number,
  viewportHeight: number,
  totalHeight: number,
  scale: number
) {
  const { maxPanX, maxPanY } = getPanBounds(
    viewportWidth,
    viewportHeight,
    totalHeight,
    scale
  );
  return {
    panX: clamp(panX, -maxPanX, maxPanX),
    panY: clamp(panY, -maxPanY, maxPanY),
  };
}
