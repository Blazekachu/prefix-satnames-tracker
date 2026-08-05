import { describe, expect, it } from "vitest";

import {
  findRegistryEntryBySatname,
  getEntriesForTab,
  isSatnameInRegistry,
} from "./registry";

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

  it("stores the falsecolors descendants as nested child cards", () => {
    const falsecolors = getEntriesForTab("ord-father").find(
      (entry) => entry.satname === "falsecolors",
    );

    expect(falsecolors?.children?.map((child) => child.satname)).toEqual([
      "badgertooth",
      "zonefruits",
      "abysscalled",
      "cactusseeds",
      "carpetyarns",
      "necrowizard",
      "ghostflight",
      "breathelast",
    ]);
  });

  it("stores verified Blob child-browser metadata", () => {
    const blob = getEntriesForTab("all").find(
      (entry) => entry.satname === "blobnwthems",
    );

    expect(blob?.childBrowser).toEqual({
      count: "10,000",
      satnameRangeStart: "blobnwthdng",
      satnameRangeEnd: "blobnwtcgsj",
      satRangeStart: "1749358685270829",
      satRangeEnd: "1749358685356548",
      browseUrl:
        "https://ordinals.com/children/648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0",
      browseLabel: "View all 10,000 children on ordinals.com",
      note:
        "The full Blob child set is browsed on ordinals.com to keep this page fast while preserving verified range facts here.",
    });
  });

  it("keeps Blob child-browser metadata exclusive to blobnwthems", () => {
    const all = getEntriesForTab("all");
    const blob = all.find((entry) => entry.satname === "blobnwthems");
    const doctor = all.find((entry) => entry.satname === "agooddoctor");

    expect(Boolean(blob?.childBrowser)).toBe(true);
    expect(Boolean(doctor?.childBrowser)).toBe(false);
  });
});

describe("findRegistryEntryBySatname", () => {
  it("finds top-level curated satnames", () => {
    expect(findRegistryEntryBySatname("falsecolors")?.satname).toBe(
      "falsecolors",
    );
    expect(findRegistryEntryBySatname("blobnwthems")?.satname).toBe(
      "blobnwthems",
    );
  });

  it("finds nested child cards and normalizes case", () => {
    expect(findRegistryEntryBySatname("BadgerTooth")?.satname).toBe(
      "badgertooth",
    );
    expect(isSatnameInRegistry("breathelast")).toBe(true);
  });

  it("returns null for satnames outside the curated registry", () => {
    expect(findRegistryEntryBySatname("notarealsatname")).toBeNull();
    expect(isSatnameInRegistry("notarealsatname")).toBe(false);
  });
});
