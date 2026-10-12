import { describe, expect, it } from "vitest";

import { buildWordSet, classifySatname } from "./named-sat-classify";
import {
  buildSections,
  entryFromClassification,
  mergeEntries,
  nextCursor,
  shouldAdvanceCursor,
} from "./named-sats-snapshot";

const words = buildWordSet([
  "ghost",
  "flight",
  "fields",
  "excrescence",
  "friday",
  "baked",
  "blues",
]);

function make(
  name: string,
  source: "osura-bootstrap" | "allowlist" | "delta" = "osura-bootstrap",
) {
  const classified = classifySatname(name, words);
  const entry = entryFromClassification(name, "1", source, classified);
  if (!entry) throw new Error(`expected entry for ${name}`);
  return entry;
}

describe("named-sats-snapshot", () => {
  it("merges by satname without duplicates", () => {
    const a = make("excrescence");
    const b = { ...make("excrescence", "delta"), inscriptionCount: 2 };
    expect(mergeEntries([a], [b])).toHaveLength(1);
    expect(mergeEntries([a], [b])[0]?.inscriptionCount).toBe(2);
  });

  it("builds single, series, and leftover pair sections", () => {
    const entries = [
      make("excrescence"),
      make("ghostflight"),
      make("ghostfields"),
      make("fridaybaked"),
      make("fridayblues"),
    ];
    const lonely = entryFromClassification("onlypairxx", "2", "delta", {
      kind: "pair",
      parts: ["only", "pairxx"],
    });
    const sections = buildSections([...entries, lonely!]);
    expect(sections.singles.map((e) => e.satname)).toContain("excrescence");
    expect(sections.series.map((g) => g.key).sort()).toEqual([
      "friday",
      "ghost",
    ]);
    expect(sections.pairs.map((e) => e.satname)).toContain("onlypairxx");
  });

  it("advances cursor only when ok", () => {
    expect(shouldAdvanceCursor(false)).toBe(false);
    expect(shouldAdvanceCursor(true)).toBe(true);
    const prev = {
      lastInscriptionNumber: 10,
      takenAt: "2026-10-01T00:00:00.000Z",
      source: "ordinals.com" as const,
    };
    expect(nextCursor(prev, 20, "2026-10-12T00:00:00.000Z", 900000)).toEqual({
      lastInscriptionNumber: 20,
      tipHeight: 900000,
      takenAt: "2026-10-12T00:00:00.000Z",
      source: "ordinals.com",
    });
  });
});
