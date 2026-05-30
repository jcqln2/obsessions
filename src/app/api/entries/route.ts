import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_ITEMS_PER_ENTRY,
  MAX_LINK_LABEL_LENGTH,
  MAX_LINK_URL_LENGTH,
  validateLinkLabel,
  validateLinkUrl,
  validateNoteText,
} from "@/lib/collage-items";
import { fetchSignedItemsForEntries } from "@/lib/api/collage-items";
import type { CollageItemRecord, CreateCollageItemPayload, Entry } from "@/lib/types";

function layoutFields(item: CreateCollageItemPayload) {
  return {
    position_x: item.position_x,
    position_y: item.position_y,
    rotation_degrees: item.rotation_degrees,
    scale_factor: item.scale_factor,
    width_px: Math.round(item.width_px),
    height_px: Math.round(item.height_px),
    z_index: item.z_index,
  };
}

function validateItems(items: CreateCollageItemPayload[]): string | null {
  if (!items?.length) return "At least one item required";
  if (items.length > MAX_ITEMS_PER_ENTRY) {
    return `Maximum ${MAX_ITEMS_PER_ENTRY} items per entry`;
  }

  for (const item of items) {
    if (item.item_type === "image") {
      if (!item.storagePath || !item.imageUrl) return "Image storage path and URL required";
    } else if (item.item_type === "note") {
      const err = validateNoteText(item.text_content);
      if (err) return err;
    } else if (item.item_type === "link") {
      const urlErr = validateLinkUrl(item.link_url);
      if (urlErr) return urlErr;
      const labelErr = validateLinkLabel(item.link_label);
      if (labelErr) return labelErr;
      if (item.link_url.length > MAX_LINK_URL_LENGTH) {
        return `URL must be ${MAX_LINK_URL_LENGTH} characters or fewer`;
      }
      if (item.link_label && item.link_label.length > MAX_LINK_LABEL_LENGTH) {
        return `Label must be ${MAX_LINK_LABEL_LENGTH} characters or fewer`;
      }
    } else {
      return "Invalid item type";
    }
  }

  return null;
}

function toInsertRow(entryId: string, item: CreateCollageItemPayload) {
  const base = { entry_id: entryId, ...layoutFields(item) };

  if (item.item_type === "image") {
    return {
      ...base,
      item_type: "image" as const,
      image_url: item.imageUrl,
      storage_path: item.storagePath,
      text_content: null,
      link_url: null,
      link_label: null,
    };
  }
  if (item.item_type === "note") {
    return {
      ...base,
      item_type: "note" as const,
      image_url: null,
      storage_path: null,
      text_content: item.text_content.trim(),
      link_url: null,
      link_label: null,
    };
  }
  return {
    ...base,
    item_type: "link" as const,
    image_url: null,
    storage_path: null,
    text_content: null,
    link_url: item.link_url.trim(),
    link_label: item.link_label?.trim().slice(0, MAX_LINK_LABEL_LENGTH) || null,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: entries, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/entries] entries:", error.message);
    return NextResponse.json({ error: error.message, step: "entries" }, { status: 500 });
  }

  const entryIds = (entries ?? []).map((e) => e.id);
  if (entryIds.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const byEntry = await fetchSignedItemsForEntries(supabase, entryIds);
    const result: Entry[] = (entries ?? []).map((e) => ({
      ...e,
      items: byEntry.get(e.id) ?? [],
    }));
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load items";
    console.error("[GET /api/entries] items:", message);
    return NextResponse.json({ error: message, step: "items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, createdAt, items } = body as {
    title?: string;
    createdAt?: string;
    items: CreateCollageItemPayload[];
  };

  const validationError = validateItems(items);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data: entry, error } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      title: title?.slice(0, 100) || null,
      ...(createdAt ? { created_at: createdAt } : {}),
    })
    .select()
    .single();

  if (error || !entry) {
    console.error("[POST /api/entries] entries:", error?.message);
    return NextResponse.json(
      { error: error?.message ?? "Insert failed", step: "entries" },
      { status: 500 }
    );
  }

  const rows = items.map((item) => toInsertRow(entry.id, item));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("collage_items")
    .insert(rows)
    .select();

  if (itemsError) {
    console.error("[POST /api/entries] collage_items:", itemsError.message);

    const legacyImageRows = items
      .filter((i): i is Extract<CreateCollageItemPayload, { item_type: "image" }> => i.item_type === "image")
      .map((img) => ({
        entry_id: entry.id,
        image_url: img.imageUrl,
        storage_path: img.storagePath,
        ...layoutFields(img),
      }));

    if (legacyImageRows.length !== items.length) {
      await supabase.from("entries").delete().eq("id", entry.id);
      return NextResponse.json(
        {
          error:
            "collage_items table not available — run 005_collage_items.sql. Notes and links require migration.",
          step: "collage_items",
        },
        { status: 500 }
      );
    }

    const { data: legacyImages, error: legacyError } = await supabase
      .from("images")
      .insert(legacyImageRows)
      .select();

    if (legacyError) {
      await supabase.from("entries").delete().eq("id", entry.id);
      return NextResponse.json({ error: legacyError.message, step: "images" }, { status: 500 });
    }

    const result: Entry = {
      ...entry,
      items: (legacyImages ?? []).map((img) => ({
        ...img,
        item_type: "image" as const,
      })) as CollageItemRecord[],
    };
    return NextResponse.json(result);
  }

  const result: Entry = {
    ...entry,
    items: (insertedItems ?? []) as CollageItemRecord[],
  };

  return NextResponse.json(result);
}
