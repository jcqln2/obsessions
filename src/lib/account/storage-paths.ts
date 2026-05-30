import type { SupabaseClient } from "@supabase/supabase-js";

/** All entry-image storage object paths for a user (`{userId}/...`). */
export async function listUserStoragePaths(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const paths = new Set<string>();

  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("id")
    .eq("user_id", userId);

  if (entriesError) throw new Error(entriesError.message);

  const entryIds = (entries ?? []).map((e) => e.id);
  if (entryIds.length === 0) {
    await addPathsFromBucketListing(supabase, userId, paths);
    return [...paths];
  }

  const { data: collageItems } = await supabase
    .from("collage_items")
    .select("storage_path, item_type")
    .in("entry_id", entryIds);

  for (const row of collageItems ?? []) {
    if (row.item_type === "image" && row.storage_path) {
      paths.add(row.storage_path as string);
    }
  }

  const { data: legacyImages } = await supabase
    .from("images")
    .select("storage_path")
    .in("entry_id", entryIds);

  for (const row of legacyImages ?? []) {
    if (row.storage_path) paths.add(row.storage_path as string);
  }

  await addPathsFromBucketListing(supabase, userId, paths);

  return [...paths];
}

async function addPathsFromBucketListing(
  supabase: SupabaseClient,
  userId: string,
  paths: Set<string>
) {
  const { data: files, error } = await supabase.storage.from("entry-images").list(userId, {
    limit: 1000,
  });
  if (error) return;
  for (const file of files ?? []) {
    if (file.name) paths.add(`${userId}/${file.name}`);
  }
}

export async function removeStoragePaths(
  supabase: SupabaseClient,
  storagePaths: string[]
): Promise<void> {
  const batchSize = 100;
  for (let i = 0; i < storagePaths.length; i += batchSize) {
    const batch = storagePaths.slice(i, i + batchSize);
    if (batch.length === 0) continue;
    const { error } = await supabase.storage.from("entry-images").remove(batch);
    if (error) throw new Error(error.message);
  }
}
