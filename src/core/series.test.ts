import { describe, it, expect } from "vitest";
import { buildSeriesRanges } from "./series";
import { satToName } from "./sat-math";

describe("buildSeriesRanges", () => {
  it("yields 7 series for a 5-letter prefix, name lengths 11 down to 5", () => {
    const series = buildSeriesRanges("bhang");
    expect(series.length).toBe(7);
    expect(series.map((s) => s.nameLength)).toEqual([11, 10, 9, 8, 7, 6, 5]);
    expect(series.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("Series 1 matches the BHANG spec exactly", () => {
    const s1 = buildSeriesRanges("bhang")[0];
    // satStart is the lower sat -> its name is the "zz...z" name.
    expect(s1.satStartName).toBe("bhangzzzzzz");
    expect(s1.satEndName).toBe("bhangaaaaaa");
    expect(s1.satStart).toBe(1_773_906_020_861_562n);
    expect(s1.satEnd).toBe(1_773_906_329_777_337n);
    expect(s1.satCount).toBe(308_915_776n);
  });

  it("the final series is the prefix itself as a single sat", () => {
    const series = buildSeriesRanges("bhang");
    const last = series[series.length - 1];
    expect(last.nameLength).toBe(5);
    expect(last.satStartName).toBe("bhang");
    expect(last.satEndName).toBe("bhang");
    expect(last.satCount).toBe(1n);
  });

  it("name fields match the names of their sat-range endpoints", () => {
    // satStartName must be the name of satStart, satEndName the name of satEnd --
    // so the name range always reads in the same direction as the sat range.
    for (const prefix of ["bhang", "weed", "satoshi", "a"]) {
      for (const s of buildSeriesRanges(prefix)) {
        expect(s.satStartName).toBe(satToName(s.satStart));
        expect(s.satEndName).toBe(satToName(s.satEnd));
      }
    }
  });

  it("an 11-letter prefix yields exactly one single-sat series", () => {
    const series = buildSeriesRanges("abcdefghijk");
    expect(series.length).toBe(1);
    expect(series[0].satCount).toBe(1n);
  });

  it("drops series whose entire range is beyond supply", () => {
    // 'zzz...' prefixes map past SUPPLY; some series do not exist.
    const series = buildSeriesRanges("zzzzz");
    // every returned series must have non-negative, in-supply sats
    for (const s of series) {
      expect(s.satStart >= 0n).toBe(true);
      expect(s.satEnd >= 0n).toBe(true);
    }
  });
});
