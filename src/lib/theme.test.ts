import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "./theme";

describe("theme", () => {
  it("uses stable storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("obsessions-theme");
  });
});
