import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { fetchSignedItemsForEntries } from "@/lib/api/collage-items";
import type { Entry } from "@/lib/types";

const EXPORT_SIGN_SECONDS = 60 * 60 * 24 * 7;

export type AccountExportPayload = {
  exportedAt: string;
  formatVersion: 1;
  account: {
    id: string;
    email: string | undefined;
    createdAt: string | undefined;
  };
  entries: Entry[];
  notes: {
    imageSignedUrlsExpireAfterSeconds: number;
    imageUrlsAreTemporary: boolean;
  };
};

export async function buildAccountExport(
  supabase: SupabaseClient,
  user: User
): Promise<AccountExportPayload> {
  const { data: entries, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const entryIds = (entries ?? []).map((e) => e.id);
  const byEntry = await fetchSignedItemsForEntries(supabase, entryIds, EXPORT_SIGN_SECONDS);

  const result: Entry[] = (entries ?? []).map((e) => ({
    ...e,
    items: byEntry.get(e.id) ?? [],
  }));

  return {
    exportedAt: new Date().toISOString(),
    formatVersion: 1,
    account: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
    entries: result,
    notes: {
      imageSignedUrlsExpireAfterSeconds: EXPORT_SIGN_SECONDS,
      imageUrlsAreTemporary: true,
    },
  };
}
