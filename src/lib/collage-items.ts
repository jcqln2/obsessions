import { generateCollageLayout } from "./collage";
import type {
  CollageItemRecord,
  CollagePlacement,
  CreateCollageItemPayload,
  DraftItem,
} from "./types";

export const MAX_ITEMS_PER_ENTRY = 8;
export const MAX_NOTE_LENGTH = 2000;
export const MAX_LINK_URL_LENGTH = 2048;
export const MAX_LINK_LABEL_LENGTH = 100;

export function noteDimensions(text: string): { width: number; height: number } {
  const lines = Math.max(1, text.split("\n").length, Math.ceil(text.length / 28));
  const height = Math.min(220, Math.max(80, 80 + lines * 20));
  return { width: 180, height };
}

export function linkDimensions(): { width: number; height: number } {
  return { width: 180, height: 72 };
}

export function draftNaturalSize(draft: DraftItem): { width: number; height: number } {
  if (draft.kind === "image") {
    return { width: draft.width, height: draft.height };
  }
  if (draft.kind === "note") {
    return noteDimensions(draft.text.trim() || "Note");
  }
  return linkDimensions();
}

export function layoutDrafts(drafts: DraftItem[]): CollagePlacement[] {
  return generateCollageLayout(drafts.map(draftNaturalSize));
}

export function validateNoteText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "Note text is required";
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return `Note must be ${MAX_NOTE_LENGTH} characters or fewer`;
  }
  return null;
}

export function validateLinkUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "URL is required";
  if (trimmed.length > MAX_LINK_URL_LENGTH) {
    return `URL must be ${MAX_LINK_URL_LENGTH} characters or fewer`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "URL must start with http:// or https://";
    }
  } catch {
    return "Enter a valid URL";
  }
  return null;
}

export function validateLinkLabel(label?: string): string | null {
  if (label && label.trim().length > MAX_LINK_LABEL_LENGTH) {
    return `Label must be ${MAX_LINK_LABEL_LENGTH} characters or fewer`;
  }
  return null;
}

export function draftsToPreviewItems(
  drafts: DraftItem[],
  layout: CollagePlacement[]
): CollageItemRecord[] {
  const now = new Date().toISOString();
  return drafts.map((draft, i) => {
    const base = {
      id: `preview-${draft.clientId}`,
      entry_id: "preview",
      position_x: layout[i].x,
      position_y: layout[i].y,
      rotation_degrees: layout[i].rotation,
      scale_factor: layout[i].scale,
      width_px: Math.round(layout[i].width),
      height_px: Math.round(layout[i].height),
      z_index: layout[i].zIndex,
      created_at: now,
    };

    if (draft.kind === "image") {
      return {
        ...base,
        item_type: "image" as const,
        image_url: draft.previewUrl,
        storage_path: "",
      };
    }
    if (draft.kind === "note") {
      return {
        ...base,
        item_type: "note" as const,
        text_content: draft.text.trim(),
      };
    }
    return {
      ...base,
      item_type: "link" as const,
      link_url: draft.url.trim(),
      link_label: draft.label?.trim() || null,
    };
  });
}

export function buildCreatePayload(
  drafts: DraftItem[],
  layout: CollagePlacement[],
  uploadedImages: { storagePath: string; imageUrl: string }[]
): CreateCollageItemPayload[] {
  let imageIndex = 0;
  return drafts.map((draft, i) => {
    const layoutFields = {
      position_x: layout[i].x,
      position_y: layout[i].y,
      rotation_degrees: layout[i].rotation,
      scale_factor: layout[i].scale,
      width_px: Math.round(layout[i].width),
      height_px: Math.round(layout[i].height),
      z_index: layout[i].zIndex,
    };

    if (draft.kind === "image") {
      const uploaded = uploadedImages[imageIndex];
      imageIndex += 1;
      return {
        item_type: "image" as const,
        storagePath: uploaded.storagePath,
        imageUrl: uploaded.imageUrl,
        ...layoutFields,
      };
    }
    if (draft.kind === "note") {
      return {
        item_type: "note" as const,
        text_content: draft.text.trim(),
        ...layoutFields,
      };
    }
    return {
      item_type: "link" as const,
      link_url: draft.url.trim(),
      link_label: draft.label?.trim() || undefined,
      ...layoutFields,
    };
  });
}

export function linkDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function newClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
