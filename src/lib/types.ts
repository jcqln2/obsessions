export type CollageItemType = "image" | "note" | "link";

export interface CollageItemBase {
  id: string;
  entry_id: string;
  item_type: CollageItemType;
  position_x: number;
  position_y: number;
  rotation_degrees: number;
  scale_factor: number;
  width_px: number;
  height_px: number;
  z_index: number;
  created_at: string;
}

export type CollageItemRecord =
  | (CollageItemBase & {
      item_type: "image";
      image_url: string;
      storage_path: string;
    })
  | (CollageItemBase & {
      item_type: "note";
      text_content: string;
    })
  | (CollageItemBase & {
      item_type: "link";
      link_url: string;
      link_label: string | null;
    });

/** @deprecated Use CollageItemRecord with item_type image */
export type ImageRecord = CollageItemBase & {
  item_type: "image";
  image_url: string;
  storage_path: string;
};

export interface Entry {
  id: string;
  user_id: string;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: CollageItemRecord[];
}

export interface CollagePlacement {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface TimelineMarker {
  year: number;
  month: number;
  label: string;
  entryId: string;
  y: number;
}

export interface LocalImageFile {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export type DraftNote = { kind: "note"; text: string; clientId: string };
export type DraftLink = { kind: "link"; url: string; label?: string; clientId: string };
export type DraftImage = LocalImageFile & { kind: "image"; clientId: string };
export type DraftItem = DraftNote | DraftLink | DraftImage;

export type CreateCollageItemPayload =
  | {
      item_type: "image";
      storagePath: string;
      imageUrl: string;
      position_x: number;
      position_y: number;
      rotation_degrees: number;
      scale_factor: number;
      width_px: number;
      height_px: number;
      z_index: number;
    }
  | {
      item_type: "note";
      text_content: string;
      position_x: number;
      position_y: number;
      rotation_degrees: number;
      scale_factor: number;
      width_px: number;
      height_px: number;
      z_index: number;
    }
  | {
      item_type: "link";
      link_url: string;
      link_label?: string;
      position_x: number;
      position_y: number;
      rotation_degrees: number;
      scale_factor: number;
      width_px: number;
      height_px: number;
      z_index: number;
    };
