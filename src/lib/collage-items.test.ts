import { describe, expect, it } from "vitest";
import {
  linkDomain,
  noteDimensions,
  validateLinkUrl,
  validateNoteText,
} from "./collage-items";

describe("collage-items", () => {
  it("noteDimensions grows with line count", () => {
    const short = noteDimensions("hello");
    const long = noteDimensions("line one\nline two\nline three\nline four");
    expect(short.height).toBeLessThanOrEqual(long.height);
    expect(short.width).toBe(180);
  });

  it("validateNoteText rejects empty notes", () => {
    expect(validateNoteText("  ")).toBe("Note text is required");
    expect(validateNoteText("build idea")).toBeNull();
  });

  it("validateLinkUrl requires http(s)", () => {
    expect(validateLinkUrl("not-a-url")).toBe("Enter a valid URL");
    expect(validateLinkUrl("https://example.com/item")).toBeNull();
  });

  it("linkDomain strips www prefix", () => {
    expect(linkDomain("https://www.example.com/path")).toBe("example.com");
  });
});
