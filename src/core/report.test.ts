import { describe, it, expect } from "vitest";
import { buildReport } from "./report";

describe("buildReport", () => {
  it("reports 7 series for prefix 'bhang'", () => {
    const r = buildReport("bhang", 900_000);
    expect(r.prefix).toBe("bhang");
    expect(r.prefixLength).toBe(5);
    expect(r.seriesCount).toBe(7);
    expect(r.tipHeight).toBe(900_000);
  });

  it("marks Series 1 of 'bhang' as mined with 2 block segments", () => {
    const s1 = buildReport("bhang", 900_000).series[0];
    expect(s1.overallStatus).toBe("mined");
    expect(s1.blockSegments?.map((s) => s.height)).toEqual([579_124, 579_125]);
    expect(s1.blockSummary).toBeUndefined();
  });

  it("marks the far-future final series as future with an estimated date", () => {
    const series = buildReport("bhang", 900_000).series;
    const last = series[series.length - 1];
    expect(last.overallStatus).toBe("future");
    expect(last.blockSegments?.[0].estimatedYear).toBeDefined();
  });

  it("collapses a series spanning more than 10 blocks into a summary", () => {
    // A 1-letter prefix's 11-letter series spans tens of thousands of blocks.
    const s1 = buildReport("a", 900_000).series[0];
    expect(s1.blockSummary).toBeDefined();
    expect(s1.blockSummary!.blockCount).toBeGreaterThan(10);
    expect(s1.blockSegments).toBeUndefined();
  });

  it("does not collapse when collapse:false is passed", () => {
    const s1 = buildReport("a", 900_000, { collapse: false }).series[0];
    expect(s1.blockSegments).toBeDefined();
    expect(s1.blockSummary).toBeUndefined();
  });

  it("reports zero series for a prefix entirely beyond sat supply", () => {
    // 11 z's map far past SUPPLY -- no series exists.
    const r = buildReport("zzzzzzzzzzz", 900_000);
    expect(r.seriesCount).toBe(0);
    expect(r.series).toEqual([]);
  });

  it("marks series1Status 'present' when 11-letter series is whole", () => {
    const r = buildReport("bhang", 900_000);
    expect(r.series1Status).toBe("present");
  });

  it("marks series1Status 'missing' when 11-letter series is past supply", () => {
    // 'ordpool' (7 letters): 11-letter range maps past SUPPLY entirely.
    const r = buildReport("ordpool", 900_000);
    expect(r.series1Status).toBe("missing");
  });

  it("marks series1Status 'partial' when 11-letter series straddles supply", () => {
    // Prefix 'n': 11-letter satEnd is in supply but satStart clamps from negative.
    const r = buildReport("n", 900_000);
    expect(r.series1Status).toBe("partial");
  });
});
