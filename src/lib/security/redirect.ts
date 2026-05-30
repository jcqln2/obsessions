/** Allow only same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  if (next.includes("\\") || next.includes("\0")) {
    return "/";
  }
  return next;
}
