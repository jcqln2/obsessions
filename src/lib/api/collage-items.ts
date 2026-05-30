import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollageItemRecord } from "@/lib/types";

type DbCollageItem = {
  id: string;
  entry_id: string;
  item_type: "image" | "note" | "link";
  position_x: number;
  position_y: number;
  rotation_degrees: number;
  scale_factor: number;
  width_px: number;
  height_px: number;
  z_index: number;
  image_url: string | null;
  storage_path: string | null;
  text_content: string | null;
  link_url: string | null;
  link_label: string | null;
  created_at: string;
};

type DbImage = {
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
};

function mapDbItem(row: DbCollageItem): CollageItemRecord {
  const base = {
    id: row.id,
    entry_id: row.entry_id,
    position_x: row.position_x,
    position_y: row.position_y,
    rotation_degrees: row.rotation_degrees,
    scale_factor: row.scale_factor,
    width_px: row.width_px,
    height_px: row.height_px,
    z_index: row.z_index,
    created_at: row.created_at,
  };

  if (row.item_type === "image") {
    return {
      ...base,
      item_type: "image",
      image_url: row.image_url ?? "",
      storage_path: row.storage_path ?? "",
    };
  }
  if (row.item_type === "note") {
    return {
      ...base,
      item_type: "note",
      text_content: row.text_content ?? "",
    };
  }
  return {
    ...base,
    item_type: "link",
    link_url: row.link_url ?? "",
    link_label: row.link_label,
  };
}

function mapLegacyImage(row: DbImage): CollageItemRecord {
  return {
    id: row.id,
    entry_id: row.entry_id,
    item_type: "image",
    image_url: row.image_url,
    storage_path: row.storage_path,
    position_x: row.position_x,
    position_y: row.position_y,
    rotation_degrees: row.rotation_degrees,
    scale_factor: row.scale_factor,
    width_px: row.width_px,
    height_px: row.height_px,
    z_index: row.z_index,
    created_at: row.created_at,
  };
}

async function signImageItems(
  supabase: SupabaseClient,
  items: CollageItemRecord[],
  signSeconds = 60 * 60 * 24
): Promise<CollageItemRecord[]> {
  const signed: CollageItemRecord[] = [];
  for (const item of items) {
    if (item.item_type !== "image" || !item.storage_path) {
      signed.push(item);
      continue;
    }
    const { data } = await supabase.storage
      .from("entry-images")
      .createSignedUrl(item.storage_path, signSeconds);
    signed.push({
      ...item,
      image_url: data?.signedUrl ?? item.image_url,
    });
  }
  return signed;
}

export async function fetchItemsByEntryIds(
  supabase: SupabaseClient,
  entryIds: string[]
): Promise<Map<string, CollageItemRecord[]>> {
  const byEntry = new Map<string, CollageItemRecord[]>();
  if (entryIds.length === 0) return byEntry;

  const { data: collageItems, error: collageError } = await supabase
    .from("collage_items")
    .select("*")
    .in("entry_id", entryIds)
    .order("z_index", { ascending: true });

  if (!collageError && collageItems?.length) {
    for (const row of collageItems as DbCollageItem[]) {
      const list = byEntry.get(row.entry_id) ?? [];
      list.push(mapDbItem(row));
      byEntry.set(row.entry_id, list);
    }
    return byEntry;
  }

  if (collageError && !collageError.message.includes("collage_items")) {
    throw new Error(collageError.message);
  }

  const { data: images, error: imgError } = await supabase
    .from("images")
    .select("*")
    .in("entry_id", entryIds)
    .order("z_index", { ascending: true });

  if (imgError) throw new Error(imgError.message);

  for (const row of (images ?? []) as DbImage[]) {
    const list = byEntry.get(row.entry_id) ?? [];
    list.push(mapLegacyImage(row));
    byEntry.set(row.entry_id, list);
  }

  return byEntry;
}

export async function fetchSignedItemsForEntries(
  supabase: SupabaseClient,
  entryIds: string[],
  signSeconds = 60 * 60 * 24
): Promise<Map<string, CollageItemRecord[]>> {
  const byEntry = await fetchItemsByEntryIds(supabase, entryIds);
  const signedByEntry = new Map<string, CollageItemRecord[]>();

  for (const [entryId, items] of byEntry) {
    signedByEntry.set(entryId, await signImageItems(supabase, items, signSeconds));
  }

  return signedByEntry;
}

export async function fetchImageStoragePaths(
  supabase: SupabaseClient,
  entryId: string
): Promise<string[]> {
  const { data: collageItems } = await supabase
    .from("collage_items")
    .select("storage_path, item_type")
    .eq("entry_id", entryId);

  if (collageItems?.length) {
    return collageItems
      .filter((i) => i.item_type === "image" && i.storage_path)
      .map((i) => i.storage_path as string);
  }

  const { data: images } = await supabase
    .from("images")
    .select("storage_path")
    .eq("entry_id", entryId);

  return (images ?? []).map((i) => i.storage_path);
}

export { mapDbItem };
