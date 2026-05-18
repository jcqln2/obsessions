"use client";

import { useEffect } from "react";
import { useTimelineStore } from "@/store/timeline";

export function useKeyboardNav(
  totalHeight: number,
  viewportHeight: number
) {
  const { scrollY, panX, panY, scale, setScrollY, setPan, zoomBy, resetView } =
    useTimelineStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const maxScroll = Math.max(0, totalHeight - viewportHeight);
      const maxPanX = Math.max(0, (window.innerWidth * (scale - 1)) / 2 + 48);
      const small = 80;
      const large = viewportHeight * 0.85;

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
          setScrollY(Math.max(0, scrollY - small));
          break;
        case "ArrowDown":
          e.preventDefault();
          setScrollY(Math.min(maxScroll, scrollY + small));
          break;
        case "PageUp":
          e.preventDefault();
          setScrollY(Math.max(0, scrollY - large));
          break;
        case "PageDown":
          e.preventDefault();
          setScrollY(Math.min(maxScroll, scrollY + large));
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
          zoomBy(0.15);
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomBy(-0.15);
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
    zoomBy,
    resetView,
    totalHeight,
    viewportHeight,
  ]);
}
