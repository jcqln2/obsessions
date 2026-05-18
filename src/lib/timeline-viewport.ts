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
