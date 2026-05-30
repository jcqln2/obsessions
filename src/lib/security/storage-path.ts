/** Storage paths must be scoped to the authenticated user: `{userId}/{filename}` */
export function isOwnedStoragePath(storagePath: string, userId: string): boolean {
  const normalized = storagePath.replace(/^\/+/, "").trim();
  if (!normalized || normalized.includes("..")) return false;
  return normalized.startsWith(`${userId}/`);
}

export function validateImageStoragePaths(
  items: { item_type: string; storagePath?: string }[],
  userId: string
): string | null {
  for (const item of items) {
    if (item.item_type !== "image") continue;
    if (!item.storagePath || !isOwnedStoragePath(item.storagePath, userId)) {
      return "Invalid image storage path";
    }
  }
  return null;
}
