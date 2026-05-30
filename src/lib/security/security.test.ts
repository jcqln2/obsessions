import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";
import { isOwnedStoragePath, validateImageStoragePaths } from "./storage-path";
import { validateUploadFile } from "./upload-limits";

describe("safeRedirectPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeRedirectPath("/")).toBe("/");
    expect(safeRedirectPath("/timeline")).toBe("/timeline");
  });

  it("blocks open redirects", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("//evil.com")).toBe("/");
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath("/path\\evil")).toBe("/");
  });
});

describe("isOwnedStoragePath", () => {
  const userId = "abc-123";

  it("accepts user-scoped paths", () => {
    expect(isOwnedStoragePath(`${userId}/photo.jpg`, userId)).toBe(true);
  });

  it("rejects other users and traversal", () => {
    expect(isOwnedStoragePath("other-user/photo.jpg", userId)).toBe(false);
    expect(isOwnedStoragePath(`${userId}/../other/photo.jpg`, userId)).toBe(false);
    expect(isOwnedStoragePath("", userId)).toBe(false);
  });
});

describe("validateImageStoragePaths", () => {
  it("validates image items only", () => {
    const userId = "user-1";
    expect(
      validateImageStoragePaths(
        [{ item_type: "image", storagePath: `${userId}/a.jpg` }],
        userId
      )
    ).toBeNull();
    expect(
      validateImageStoragePaths(
        [{ item_type: "note" }, { item_type: "image", storagePath: "other/a.jpg" }],
        userId
      )
    ).toMatch(/Invalid image storage path/);
  });
});

describe("validateUploadFile", () => {
  it("rejects oversized files", () => {
    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(validateUploadFile(file)).toMatch(/10MB/);
  });

  it("rejects unsupported mime types", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    expect(validateUploadFile(file)).toMatch(/JPEG, PNG, WebP, and GIF/);
  });

  it("accepts allowed images", () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    expect(validateUploadFile(file)).toBeNull();
  });
});
