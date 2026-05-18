"use client";

import { useState } from "react";
import type { ImageRecord } from "@/lib/types";
import { getCollageBounds } from "@/lib/collage";
import { ImageLightbox } from "./ImageLightbox";

interface CollagePreviewProps {
  images: ImageRecord[];
  className?: string;
  entryTitle?: string | null;
  entryDate?: string;
  interactive?: boolean;
  onImageClick?: (image: ImageRecord, element: HTMLElement) => void;
}

export function CollagePreview({
  images,
  className = "",
  entryTitle,
  entryDate,
  interactive = true,
  onImageClick,
}: CollagePreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const canOpen = interactive && !images.some((img) => img.id.startsWith("preview-"));

  if (!images.length) {
    return (
      <div
        className={`relative min-h-[200px] border border-dashed border-muted/30 bg-canvas/50 ${className}`}
      />
    );
  }

  const placements = images.map((img) => ({
    x: img.position_x,
    y: img.position_y,
    rotation: img.rotation_degrees,
    scale: img.scale_factor,
    width: img.width_px,
    height: img.height_px,
    zIndex: img.z_index,
  }));

  const { width, height } = getCollageBounds(placements);
  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div
        className={`relative overflow-visible ${className}`}
        style={{ width, height, minHeight: height }}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            className="absolute origin-center"
            style={{
              left: img.position_x,
              top: img.position_y,
              width: img.width_px,
              height: img.height_px,
              transform: `rotate(${img.rotation_degrees}deg) scale(${img.scale_factor})`,
              zIndex: img.z_index ?? i,
            }}
          >
            {canOpen ? (
              <button
                type="button"
                data-collage-image
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick?.(img, e.currentTarget);
                  window.setTimeout(() => setSelectedIndex(i), 320);
                }}
                className="block h-full w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                aria-label={`View image ${i + 1}${entryTitle ? ` from ${entryTitle}` : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt=""
                  className="pointer-events-none block h-full w-full object-cover shadow-scrap"
                  draggable={false}
                />
              </button>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={img.image_url}
                alt=""
                className="block h-full w-full object-cover shadow-scrap"
                draggable={false}
              />
            )}
          </div>
        ))}
      </div>

      {canOpen && (
        <ImageLightbox
          image={selectedImage}
          entryTitle={entryTitle}
          entryDate={entryDate}
          imageIndex={selectedIndex ?? undefined}
          imageCount={images.length}
          onClose={() => setSelectedIndex(null)}
          onPrev={
            selectedIndex !== null && selectedIndex > 0
              ? () => setSelectedIndex((i) => (i !== null ? i - 1 : null))
              : undefined
          }
          onNext={
            selectedIndex !== null && selectedIndex < images.length - 1
              ? () => setSelectedIndex((i) => (i !== null ? i + 1 : null))
              : undefined
          }
        />
      )}
    </>
  );
}
