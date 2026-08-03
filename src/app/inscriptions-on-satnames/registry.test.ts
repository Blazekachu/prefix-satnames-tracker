import { describe, expect, it } from "vitest";

import { getEntriesForTab } from "./registry";

describe("getEntriesForTab", () => {
  it("returns the inscription 0 lineage entries in featured order", () => {
    expect(getEntriesForTab("ord-father").map((entry) => entry.satname)).toEqual([
      "ezcubunuovm",
      "falsecolors",
      "daddyplease",
      "cargobroker",
      "acquisitive",
      "mixnetworks",
    ]);
  });

  it("keeps the broader tracked registry separate from the featured tab", () => {
    const allSatnames = getEntriesForTab("all").map((entry) => entry.satname);

    expect(allSatnames).toContain("agooddoctor");
    expect(allSatnames).toContain("blobnwthems");
    expect(allSatnames.length).toBeGreaterThan(
      getEntriesForTab("ord-father").length,
    );
  });
});
