"use client";

import { useEffect } from "react";
import { clampScroll, getPanBounds } from "@/lib/timeline-viewport";
import { useTimelineStore } from "@/store/timeline";

export function useKeyboardNav(
  totalHeight: number,
  viewportHeight: number,
  viewportWidth: number
) {
  const { scrollY, panX, panY, scale, setScrollY, setPan, zoomIn, zoomOut, resetView } =
    useTimelineStore();

  useEffect(() => {
    const zoomCtx = () => ({
      anchorX: viewportWidth / 2,
      anchorY: viewportHeight / 2,
      viewportWidth,
      viewportHeight,
      totalHeight,
    });

    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { maxScroll } = getPanBounds(
        viewportWidth,
        viewportHeight,
        totalHeight,
        scale
      );
      const maxPanX = Math.max(0, (viewportWidth * (scale - 1)) / 2 + 48);

      const small = 80;
      const large = viewportHeight * 0.85;

      const nextScroll = (delta: number) =>
        clampScroll(
          scrollY + delta,
          viewportWidth,
          viewportHeight,
          totalHeight,
          scale
        );

      switch (e.key) {
        case "ArrowLeft":
          if (scale > 1) {
            e.preventDefault();
            setPan(Math.max(-maxPanX, panX - small), panY);
          }
          break;
        case "ArrowRight":
          if (scale > 1) {
            e.preventDefault();
            setPan(Math.min(maxPanX, panX + small), panY);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setScrollY(nextScroll(-small));
          break;
        case "ArrowDown":
          e.preventDefault();
          setScrollY(nextScroll(small));
          break;
        case "PageUp":
          e.preventDefault();
          setScrollY(nextScroll(-large));
          break;
        case "PageDown":
          e.preventDefault();
          setScrollY(nextScroll(large));
          break;
        case "Home":
          e.preventDefault();
          setScrollY(0);
          break;
        case "End":
          e.preventDefault();
          setScrollY(maxScroll);
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn(zoomCtx());
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomOut(zoomCtx());
          break;
        case "r":
        case "R":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            resetView();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    scrollY,
    panX,
    panY,
    scale,
    setScrollY,
    setPan,
    zoomIn,
    zoomOut,
    resetView,
    totalHeight,
    viewportHeight,
    viewportWidth,
  ]);
}
