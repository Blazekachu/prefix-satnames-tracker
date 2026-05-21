import { describe, it, expect } from "vitest";
import { splitIntoBlocks } from "./segments";

describe("splitIntoBlocks", () => {
  it("splits the BHANG Series 1 range into blocks 579124 and 579125", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_329_777_337n);
    expect(segs.map((s) => s.height)).toEqual([579_124n, 579_125n]);
  });

  it("each segment's sat count is consistent with its range", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_329_777_337n);
    for (const s of segs) {
      expect(s.satCount).toBe(s.satRangeEnd - s.satRangeStart + 1n);
    }
  });

  it("the segments cover the whole range with no gap", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_329_777_337n);
    const total = segs.reduce((sum, s) => sum + s.satCount, 0n);
    expect(total).toBe(308_915_776n);
  });

  it("a single-sat range yields one segment", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_020_861_562n);
    expect(segs.length).toBe(1);
    expect(segs[0].satCount).toBe(1n);
  });
});
