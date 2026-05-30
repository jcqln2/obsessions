import { describe, expect, it } from "vitest";
import {
  DELETE_CONFIRM_PHRASE,
  isValidDeleteConfirmation,
} from "./delete-account";

describe("isValidDeleteConfirmation", () => {
  it("accepts exact phrase case-insensitively", () => {
    expect(isValidDeleteConfirmation(DELETE_CONFIRM_PHRASE)).toBe(true);
    expect(isValidDeleteConfirmation("  DELETE MY ACCOUNT  ")).toBe(true);
  });

  it("rejects wrong or missing phrase", () => {
    expect(isValidDeleteConfirmation("delete")).toBe(false);
    expect(isValidDeleteConfirmation("")).toBe(false);
    expect(isValidDeleteConfirmation(null)).toBe(false);
    expect(isValidDeleteConfirmation(undefined)).toBe(false);
  });
});
