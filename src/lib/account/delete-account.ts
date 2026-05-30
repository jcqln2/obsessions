import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { listUserStoragePaths, removeStoragePaths } from "@/lib/account/storage-paths";
import { createAdminClient } from "@/lib/supabase/admin";

export const DELETE_CONFIRM_PHRASE = "delete my account";

export function isValidDeleteConfirmation(phrase: unknown): boolean {
  return (
    typeof phrase === "string" &&
    phrase.trim().toLowerCase() === DELETE_CONFIRM_PHRASE
  );
}

/** Removes storage, database rows, waitlist email, and the auth user. */
export async function deleteUserAccount(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const admin = createAdminClient();

  const storagePaths = await listUserStoragePaths(supabase, user.id);
  if (storagePaths.length > 0) {
    await removeStoragePaths(admin, storagePaths);
  }

  const { error: entriesError } = await supabase.from("entries").delete().eq("user_id", user.id);
  if (entriesError) throw new Error(entriesError.message);

  if (user.email) {
    await admin.from("waitlist").delete().eq("email", user.email.trim().toLowerCase());
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) throw new Error(authError.message);
}
