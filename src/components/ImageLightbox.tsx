"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ImageRecord } from "@/lib/types";
import { formatEntryDate } from "@/lib/collage";

interface ImageLightboxProps {
  image: ImageRecord | null;
  entryTitle?: string | null;
  entryDate?: string;
  imageIndex?: number;
  imageCount?: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function ImageLightbox({
  image,
  entryTitle,
  entryDate,
  imageIndex,
  imageCount,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "ArrowLeft" && onPrev) {
        e.stopPropagation();
        onPrev();
      }
      if (e.key === "ArrowRight" && onNext) {
        e.stopPropagation();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [image, onClose, onPrev, onNext]);

  useEffect(() => {
    if (image) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [image]);

  const showNav = imageCount !== undefined && imageCount > 1;

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-blush-700/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            className="relative z-10 flex max-h-full max-w-full flex-col items-center"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {(entryTitle || entryDate) && (
              <div className="mb-4 text-center">
                {entryTitle && (
                  <p className="text-lg font-medium text-blush-50 md:text-xl">
                    {entryTitle}
                  </p>
                )}
                {entryDate && (
                  <p className="mt-1 font-mono text-xs text-blush-50/70">
                    {formatEntryDate(entryDate)}
                  </p>
                )}
                {showNav && imageIndex !== undefined && (
                  <p className="mt-1 font-mono text-[10px] text-blush-50/50">
                    {imageIndex + 1} of {imageCount}
                  </p>
                )}
              </div>
            )}

            <div className="relative flex items-center gap-2">
              {showNav && onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="hidden shrink-0 px-2 py-4 font-mono text-2xl text-blush-50/80 transition hover:text-blush-50 md:block"
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.image_url}
                alt={entryTitle ? `From ${entryTitle}` : "Obsession image"}
                className="max-h-[75vh] max-w-[min(92vw,900px)] object-contain shadow-scrap"
                draggable={false}
              />

              {showNav && onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="hidden shrink-0 px-2 py-4 font-mono text-2xl text-blush-50/80 transition hover:text-blush-50 md:block"
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 font-sans text-sm text-blush-50/80 underline-offset-4 hover:text-blush-50 hover:underline"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
