import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: images } = await supabase
    .from("images")
    .select("storage_path")
    .eq("entry_id", id);

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (images?.length) {
    const paths = images.map((i) => i.storage_path);
    await supabase.storage.from("entry-images").remove(paths);
  }

  return NextResponse.json({ ok: true });
}
