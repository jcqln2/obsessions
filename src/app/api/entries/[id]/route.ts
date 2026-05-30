import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchImageStoragePaths } from "@/lib/api/collage-items";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title =
    body.title === undefined
      ? undefined
      : typeof body.title === "string"
        ? body.title.slice(0, 100) || null
        : null;

  if (title === undefined) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: entry, error } = await supabase
    .from("entries")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storagePaths = await fetchImageStoragePaths(supabase, id);

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (storagePaths.length) {
    await supabase.storage.from("entry-images").remove(storagePaths);
  }

  return NextResponse.json({ ok: true });
}
