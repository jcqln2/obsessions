export interface ImageRecord {
  id: string;
  entry_id: string;
  image_url: string;
  storage_path: string;
  position_x: number;
  position_y: number;
  rotation_degrees: number;
  scale_factor: number;
  width_px: number;
  height_px: number;
  z_index: number;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  images: ImageRecord[];
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
