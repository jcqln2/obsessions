import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Entry, ImageRecord } from "@/lib/types";

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

  const { data: images, error: imgError } = await supabase
    .from("images")
    .select("*")
    .in("entry_id", entryIds)
    .order("z_index", { ascending: true });

  if (imgError) {
    console.error("[GET /api/entries] images:", imgError.message);
    return NextResponse.json({ error: imgError.message, step: "images" }, { status: 500 });
  }

  const byEntry = new Map<string, ImageRecord[]>();
  for (const img of images ?? []) {
    const list = byEntry.get(img.entry_id) ?? [];
    list.push(img as ImageRecord);
    byEntry.set(img.entry_id, list);
  }

  const result: Entry[] = [];

  for (const e of entries ?? []) {
    const entryImages = byEntry.get(e.id) ?? [];
    const signedImages: ImageRecord[] = [];

    for (const img of entryImages) {
      const { data: signed } = await supabase.storage
        .from("entry-images")
        .createSignedUrl(img.storage_path, 60 * 60 * 24);

      signedImages.push({
        ...img,
        image_url: signed?.signedUrl ?? img.image_url,
      });
    }

    result.push({ ...e, images: signedImages });
  }

  return NextResponse.json(result);
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
  const { title, createdAt, images } = body as {
    title?: string;
    createdAt?: string;
    images: {
      storagePath: string;
      imageUrl: string;
      position_x: number;
      position_y: number;
      rotation_degrees: number;
      scale_factor: number;
      width_px: number;
      height_px: number;
      z_index: number;
    }[];
  };

  if (!images?.length || images.length < 1) {
    return NextResponse.json({ error: "At least one image required" }, { status: 400 });
  }

  if (images.length > 8) {
    return NextResponse.json({ error: "Maximum 8 images per entry" }, { status: 400 });
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

  const imageRows = images.map((img) => ({
    entry_id: entry.id,
    image_url: img.imageUrl,
    storage_path: img.storagePath,
    position_x: img.position_x,
    position_y: img.position_y,
    rotation_degrees: img.rotation_degrees,
    scale_factor: img.scale_factor,
    width_px: Math.round(img.width_px),
    height_px: Math.round(img.height_px),
    z_index: img.z_index,
  }));

  const { data: insertedImages, error: imgError } = await supabase
    .from("images")
    .insert(imageRows)
    .select();

  if (imgError) {
    console.error("[POST /api/entries] images:", imgError.message);
    await supabase.from("entries").delete().eq("id", entry.id);
    return NextResponse.json({ error: imgError.message, step: "images" }, { status: 500 });
  }

  const result: Entry = {
    ...entry,
    images: (insertedImages ?? []) as ImageRecord[],
  };

  return NextResponse.json(result);
}
