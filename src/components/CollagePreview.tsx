"use client";

import type { ImageRecord } from "@/lib/types";
import { getCollageBounds } from "@/lib/collage";

interface CollagePreviewProps {
  images: ImageRecord[];
  className?: string;
}

export function CollagePreview({ images, className = "" }: CollagePreviewProps) {
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

  return (
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.image_url}
            alt=""
            className="block h-full w-full object-cover shadow-scrap"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
