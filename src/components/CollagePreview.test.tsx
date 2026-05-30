import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CollagePreview } from "./CollagePreview";
import type { CollageItemRecord } from "@/lib/types";

const imageItem: CollageItemRecord = {
  id: "img-1",
  entry_id: "e1",
  item_type: "image",
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
};

const noteItem: CollageItemRecord = {
  id: "note-1",
  entry_id: "e1",
  item_type: "note",
  text_content: "Blythe eye chip ideas",
  position_x: 120,
  position_y: 40,
  rotation_degrees: 3,
  scale_factor: 1,
  width_px: 180,
  height_px: 100,
  z_index: 1,
  created_at: "2026-05-17T00:00:00.000Z",
};

describe("CollagePreview", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders collage images", () => {
    const { container } = render(<CollagePreview items={[imageItem]} entryTitle="pink era" />);
    const img = container.querySelector(`img[src="${imageItem.image_url}"]`);
    expect(img).toBeTruthy();
  });

  it("renders pinned notes", () => {
    render(<CollagePreview items={[noteItem]} />);
    expect(screen.getByText("Blythe eye chip ideas")).toBeInTheDocument();
  });

  it("calls onItemClick when an item is clicked", () => {
    const onItemClick = vi.fn();
    render(
      <CollagePreview items={[imageItem]} entryTitle="pink era" onItemClick={onItemClick} />
    );

    fireEvent.click(screen.getByRole("button", { name: /view image 1 from pink era/i }));
    expect(onItemClick).toHaveBeenCalledOnce();
    expect(onItemClick.mock.calls[0][0].id).toBe("img-1");
  });

  it("does not render click targets for preview ids", () => {
    const previewItems = [imageItem].map((item) => ({ ...item, id: "preview-0" }));
    render(<CollagePreview items={previewItems} interactive />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
