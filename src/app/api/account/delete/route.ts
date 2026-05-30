import { NextResponse } from "next/server";
import {
  DELETE_CONFIRM_PHRASE,
  deleteUserAccount,
  isValidDeleteConfirmation,
} from "@/lib/account/delete-account";
import { rateLimit, tooManyRequestsResponse } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { isAdminConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Account deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server environment.",
      },
      { status: 503 }
    );
  }

  const limit = await rateLimit(`account-delete:${user.id}`, "account-delete", 3, "1 h");
  if (!limit.success) {
    return tooManyRequestsResponse(limit);
  }

  let body: { confirmPhrase?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isValidDeleteConfirmation(body.confirmPhrase)) {
    return NextResponse.json(
      {
        error: `Type "${DELETE_CONFIRM_PHRASE}" to confirm account deletion.`,
      },
      { status: 400 }
    );
  }

  try {
    await deleteUserAccount(supabase, user);
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deletion failed";
    console.error("[POST /api/account/delete]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
