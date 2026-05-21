import { describe, it, expect } from "vitest";
import { validatePrefix } from "./prefix";

describe("validatePrefix", () => {
  it("accepts a normal lowercase prefix", () => {
    const r = validatePrefix("bhang");
    expect(r.ok).toBe(true);
  });

  it("accepts a single letter and an 11-letter prefix", () => {
    expect(validatePrefix("a").ok).toBe(true);
    expect(validatePrefix("abcdefghijk").ok).toBe(true);
  });

  it("rejects an empty prefix", () => {
    expect(validatePrefix("").ok).toBe(false);
  });

  it("rejects more than 11 letters", () => {
    expect(validatePrefix("abcdefghijkl").ok).toBe(false);
  });

  it("rejects uppercase, digits, and spaces", () => {
    expect(validatePrefix("BHANG").ok).toBe(false);
    expect(validatePrefix("bh4ng").ok).toBe(false);
    expect(validatePrefix("bh ng").ok).toBe(false);
  });
});
