import { describe, it, expect } from "vitest";
import { formatBigInt } from "./format";

describe("formatBigInt", () => {
  it("groups thousands with commas", () => {
    expect(formatBigInt(308_915_776n)).toBe("308,915,776");
    expect(formatBigInt(1_773_906_020_861_562n)).toBe("1,773,906,020,861,562");
  });
  it("handles small numbers", () => {
    expect(formatBigInt(0n)).toBe("0");
    expect(formatBigInt(7n)).toBe("7");
  });
});
