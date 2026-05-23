/** Fixed header overlay — not usable for content at the top of the viewport */
export const TIMELINE_HEADER_INSET = 88;
/** Extra scroll room above/below content so entries are not clipped at edges */
export const TIMELINE_SCROLL_OVERSCROLL = 240;

export function getPanBounds(
  viewportWidth: number,
  viewportHeight: number,
  totalHeight: number,
  scale: number
) {
  const maxPanX = Math.max(0, (viewportWidth * (scale - 1)) / 2 + 48);
  const scaledHeight = totalHeight * scale;
  const maxPanY = Math.max(0, (scaledHeight - viewportHeight) / 2);
  const visibleHeight = Math.max(200, viewportHeight - TIMELINE_HEADER_INSET);
  const maxScroll = Math.max(
    0,
    scaledHeight - visibleHeight + TIMELINE_SCROLL_OVERSCROLL
  );
  const minScroll = -Math.min(120, TIMELINE_SCROLL_OVERSCROLL / 2);

  return { maxPanX, maxPanY, maxScroll, minScroll };
}

export function clampScroll(
  scrollY: number,
  viewportWidth: number,
  viewportHeight: number,
  totalHeight: number,
  scale: number
) {
  const { minScroll, maxScroll } = getPanBounds(
    viewportWidth,
    viewportHeight,
    totalHeight,
    scale
  );
  return clamp(scrollY, minScroll, maxScroll);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Visual center of the timeline viewport (below the fixed header). */
export function getViewportVisualCenter(
  viewportWidth: number,
  viewportHeight: number
) {
  return {
    x: viewportWidth / 2,
    y: TIMELINE_HEADER_INSET + (viewportHeight - TIMELINE_HEADER_INSET) / 2,
  };
}

/** Screen-space offset to center `element` inside `container`. */
export function centerOffset(
  element: HTMLElement,
  container: HTMLElement
) {
  const c = container.getBoundingClientRect();
  const r = element.getBoundingClientRect();
  const target = getViewportVisualCenter(c.width, c.height);
  const elCX = r.left + r.width / 2 - c.left;
  const elCY = r.top + r.height / 2 - c.top;
  return { dx: target.x - elCX, dy: target.y - elCY };
}

/**
 * Pan/scroll/zoom so `element` lands at the visual center at `targetScale`.
 * Matches translate(panX, -scrollY + panY) scale(scale) with origin center top.
 */
export function computeFocusOnElement(params: {
  element: HTMLElement;
  container: HTMLElement;
  targetScale: number;
  currentScale: number;
  panX: number;
  panY: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
}) {
  const {
    element,
    container,
    targetScale,
    currentScale,
    panX,
    panY,
    scrollY,
    viewportWidth,
    viewportHeight,
  } = params;

  const cRect = container.getBoundingClientRect();
  const eRect = element.getBoundingClientRect();
  const anchorX = eRect.left + eRect.width / 2 - cRect.left;
  const anchorY = eRect.top + eRect.height / 2 - cRect.top;

  const originX = viewportWidth / 2;
  const translateY = -scrollY + panY;
  const worldX = (anchorX - panX - originX) / currentScale + originX;
  const worldY = (anchorY - translateY) / currentScale;

  const target = getViewportVisualCenter(viewportWidth, viewportHeight);
  const nextPanX = target.x - originX - (worldX - originX) * targetScale;
  const nextTranslateY = target.y - worldY * targetScale;
  const nextScrollY = panY - nextTranslateY;

  return {
    scale: targetScale,
    panX: nextPanX,
    panY,
    scrollY: nextScrollY,
  };
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

/**
 * Keep the point under (anchorX, anchorY) fixed while changing scale.
 * Matches transform: translate(panX, -scrollY + panY) scale(scale) with origin center top.
 */
export function computeZoomAtAnchor(params: {
  scale: number;
  nextScale: number;
  panX: number;
  panY: number;
  scrollY: number;
  anchorX: number;
  anchorY: number;
  viewportWidth: number;
}) {
  const { scale, nextScale, panX, panY, scrollY, anchorX, anchorY, viewportWidth } =
    params;
  const originX = viewportWidth / 2;
  const translateY = -scrollY + panY;

  const worldX = (anchorX - panX - originX) / scale + originX;
  const worldY = (anchorY - translateY) / scale;

  const nextPanX = anchorX - originX - (worldX - originX) * nextScale;
  const nextTranslateY = anchorY - worldY * nextScale;
  const nextScrollY = panY - nextTranslateY;

  return { panX: nextPanX, scrollY: nextScrollY, scale: nextScale };
}

/** Map wheel deltaY to a multiplicative zoom factor (trackpad + mouse wheel). */
export function wheelZoomFactor(deltaY: number) {
  return Math.exp(-deltaY * 0.002);
}
