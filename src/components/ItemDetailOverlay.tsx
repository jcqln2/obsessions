"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CollageItemRecord } from "@/lib/types";
import { formatEntryDate } from "@/lib/collage";
import { linkDomain } from "@/lib/collage-items";
import { PinnedLink } from "./PinnedLink";
import { PinnedNote } from "./PinnedNote";

interface ItemDetailOverlayProps {
  item: CollageItemRecord | null;
  entryTitle?: string | null;
  entryDate?: string;
  itemIndex?: number;
  itemCount?: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function ItemDetailOverlay({
  item,
  entryTitle,
  entryDate,
  itemIndex,
  itemCount,
  onClose,
  onPrev,
  onNext,
}: ItemDetailOverlayProps) {
  useEffect(() => {
    if (!item) return;
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
  }, [item, onClose, onPrev, onNext]);

  useEffect(() => {
    if (item) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  const showNav = itemCount !== undefined && itemCount > 1;

  return (
    <AnimatePresence>
      {item && (
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
                  <p className="text-lg font-medium text-blush-50 md:text-xl">{entryTitle}</p>
                )}
                {entryDate && (
                  <p className="mt-1 font-mono text-xs text-blush-50/70">
                    {formatEntryDate(entryDate)}
                  </p>
                )}
                {showNav && itemIndex !== undefined && (
                  <p className="mt-1 font-mono text-[10px] text-blush-50/50">
                    {itemIndex + 1} of {itemCount}
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
                  aria-label="Previous item"
                >
                  ‹
                </button>
              )}

              {item.item_type === "image" && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.image_url}
                  alt={entryTitle ? `From ${entryTitle}` : "Collage image"}
                  className="max-h-[75vh] max-w-[min(92vw,900px)] object-contain shadow-scrap"
                  draggable={false}
                />
              )}

              {item.item_type === "note" && (
                <div className="w-[min(92vw,360px)]">
                  <PinnedNote text={item.text_content} compact={false} />
                </div>
              )}

              {item.item_type === "link" && (
                <div className="w-[min(92vw,360px)] space-y-4">
                  <PinnedLink url={item.link_url} label={item.link_label} compact={false} />
                  <p className="text-center font-mono text-xs text-blush-50/70">{item.link_url}</p>
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-blush-400 px-5 py-2.5 text-center text-sm font-medium text-blush-50 hover:bg-blush-500"
                  >
                    Open link
                  </a>
                </div>
              )}

              {showNav && onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="hidden shrink-0 px-2 py-4 font-mono text-2xl text-blush-50/80 transition hover:text-blush-50 md:block"
                  aria-label="Next item"
                >
                  ›
                </button>
              )}
            </div>

            {item.item_type === "link" && (
              <p className="mt-2 font-mono text-[10px] text-blush-50/50">{linkDomain(item.link_url)}</p>
            )}

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
