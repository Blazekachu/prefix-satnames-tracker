import { describe, expect, it } from "vitest";

import { getEntriesForTab } from "./registry";

describe("getEntriesForTab", () => {
  it("returns only named-sat branch entries in featured order", () => {
    expect(getEntriesForTab("ord-father").map((entry) => entry.satname)).toEqual([
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
    expect(allSatnames).not.toContain("falsecolors");
    expect(allSatnames).not.toContain("daddyplease");
  });

  it("keeps the verified falsecolors descendants available on the featured branch card", () => {
    const falsecolors = getEntriesForTab("ord-father").find(
      (entry) => entry.satname === "falsecolors",
    );

    expect(
      falsecolors?.relationship.facts.find(
        (fact) => fact.label === "Verified named-sat descendants",
      )?.value,
    ).toContain("badgertooth");
    expect(
      falsecolors?.relationship.facts.find(
        (fact) => fact.label === "Verified named-sat descendants",
      )?.value,
    ).toContain("breathelast");
  });
});
