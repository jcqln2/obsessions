import { createClient } from "@/lib/supabase/client";
import { v4 as uuid } from "uuid";

export async function uploadEntryImages(
  files: File[],
  userId: string
): Promise<{ storagePath: string; imageUrl: string }[]> {
  const supabase = createClient();
  const results: { storagePath: string; imageUrl: string }[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${uuid()}.${ext}`;

    const { error } = await supabase.storage
      .from("entry-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from("entry-images").getPublicUrl(path);

    // For private buckets, use signed URL
    const { data: signed } = await supabase.storage
      .from("entry-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    results.push({
      storagePath: path,
      imageUrl: signed?.signedUrl ?? publicUrl,
    });
  }

  return results;
}

export function loadImageDimensions(
  file: File
): Promise<{ width: number; height: number; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, previewUrl: url });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
