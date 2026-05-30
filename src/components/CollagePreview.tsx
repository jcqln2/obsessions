"use client";

import { useState } from "react";
import type { CollageItemRecord } from "@/lib/types";
import { getCollageBounds } from "@/lib/collage";
import { ItemDetailOverlay } from "./ItemDetailOverlay";
import { PinnedLink } from "./PinnedLink";
import { PinnedNote } from "./PinnedNote";

interface CollagePreviewProps {
  items: CollageItemRecord[];
  className?: string;
  entryTitle?: string | null;
  entryDate?: string;
  interactive?: boolean;
  onItemClick?: (item: CollageItemRecord, element: HTMLElement) => void;
}

function itemLabel(item: CollageItemRecord, index: number, entryTitle?: string | null): string {
  const suffix = entryTitle ? ` from ${entryTitle}` : "";
  if (item.item_type === "image") return `View image ${index + 1}${suffix}`;
  if (item.item_type === "note") return `View note ${index + 1}${suffix}`;
  return `View link ${index + 1}${suffix}`;
}

export function CollagePreview({
  items,
  className = "",
  entryTitle,
  entryDate,
  interactive = true,
  onItemClick,
}: CollagePreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const canOpen = interactive && !items.some((item) => item.id.startsWith("preview-"));

  if (!items.length) {
    return (
      <div
        className={`relative min-h-[200px] rounded-lg border border-dashed border-blush-200 bg-blush-100/50 ${className}`}
      />
    );
  }

  const placements = items.map((item) => ({
    x: item.position_x,
    y: item.position_y,
    rotation: item.rotation_degrees,
    scale: item.scale_factor,
    width: item.width_px,
    height: item.height_px,
    zIndex: item.z_index,
  }));

  const { width, height } = getCollageBounds(placements);
  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      <div
        className={`relative overflow-visible ${className}`}
        style={{ width, height, minHeight: height }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="absolute origin-center"
            style={{
              left: item.position_x,
              top: item.position_y,
              width: item.width_px,
              height: item.height_px,
              transform: `rotate(${item.rotation_degrees}deg) scale(${item.scale_factor})`,
              zIndex: item.z_index ?? i,
            }}
          >
            {canOpen ? (
              <button
                type="button"
                data-collage-item
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick?.(item, e.currentTarget);
                  window.setTimeout(() => setSelectedIndex(i), 320);
                }}
                className="block h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
                aria-label={itemLabel(item, i, entryTitle)}
              >
                {item.item_type === "image" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image_url}
                    alt=""
                    className="pointer-events-none block h-full w-full object-cover shadow-scrap"
                    draggable={false}
                  />
                )}
                {item.item_type === "note" && <PinnedNote text={item.text_content} />}
                {item.item_type === "link" && (
                  <PinnedLink url={item.link_url} label={item.link_label} />
                )}
              </button>
            ) : (
              <>
                {item.item_type === "image" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image_url}
                    alt=""
                    className="block h-full w-full object-cover shadow-scrap"
                    draggable={false}
                  />
                )}
                {item.item_type === "note" && <PinnedNote text={item.text_content} />}
                {item.item_type === "link" && (
                  <PinnedLink url={item.link_url} label={item.link_label} />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {canOpen && (
        <ItemDetailOverlay
          item={selectedItem}
          entryTitle={entryTitle}
          entryDate={entryDate}
          itemIndex={selectedIndex ?? undefined}
          itemCount={items.length}
          onClose={() => setSelectedIndex(null)}
          onPrev={
            selectedIndex !== null && selectedIndex > 0
              ? () => setSelectedIndex((idx) => (idx !== null ? idx - 1 : null))
              : undefined
          }
          onNext={
            selectedIndex !== null && selectedIndex < items.length - 1
              ? () => setSelectedIndex((idx) => (idx !== null ? idx + 1 : null))
              : undefined
          }
        />
      )}
    </>
  );
}
