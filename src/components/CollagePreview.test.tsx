import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CollagePreview } from "./CollagePreview";
import type { ImageRecord } from "@/lib/types";

const images: ImageRecord[] = [
  {
    id: "img-1",
    entry_id: "e1",
    image_url: "https://example.com/one.png",
    storage_path: "u/one.png",
    position_x: 0,
    position_y: 0,
    rotation_degrees: 0,
    scale_factor: 1,
    width_px: 100,
    height_px: 80,
    z_index: 0,
    created_at: "2026-05-17T00:00:00.000Z",
  },
];

describe("CollagePreview", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders collage images", () => {
    const { container } = render(<CollagePreview images={images} entryTitle="pink era" />);
    const img = container.querySelector(`img[src="${images[0].image_url}"]`);
    expect(img).toBeTruthy();
  });

  it("calls onImageClick when an image is clicked", () => {
    const onImageClick = vi.fn();
    render(
      <CollagePreview images={images} entryTitle="pink era" onImageClick={onImageClick} />
    );

    fireEvent.click(screen.getByRole("button", { name: /view image 1 from pink era/i }));
    expect(onImageClick).toHaveBeenCalledOnce();
    expect(onImageClick.mock.calls[0][0].id).toBe("img-1");
  });

  it("does not render click targets for preview ids", () => {
    const previewImages = images.map((img) => ({ ...img, id: "preview-0" }));
    render(<CollagePreview images={previewImages} interactive />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
