export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOADS_PER_BATCH = 8;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateUploadFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Each image must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller`;
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed";
  }
  return null;
}

export function extensionForMime(mime: string): string {
  return EXT_BY_MIME[mime] ?? "jpg";
}
