import { describe, expect, it } from "vitest";

import {
  findRegistryEntryBySatname,
  getEntriesForTab,
  isSatnameInRegistry,
} from "./registry";

describe("getEntriesForTab", () => {
  it("returns only named sat branch entries in featured order", () => {
    expect(getEntriesForTab("ord-father").map((entry) => entry.satname)).toEqual([
      "falsecolors",
      "daddyplease",
      "cargobroker",
      "acquisitive",
      "mixnetworks",
    ]);
  });

  it("leaves the All tab empty in the manual registry (snapshot-owned)", () => {
    expect(getEntriesForTab("all")).toEqual([]);
  });

  it("keeps the verified falsecolors descendants available on the featured branch card", () => {
    const falsecolors = getEntriesForTab("ord-father").find(
      (entry) => entry.satname === "falsecolors",
    );

    expect(
      falsecolors?.relationship.facts.find(
        (fact) => fact.label === "Verified named sat descendants",
      )?.value,
    ).toContain("badgertooth");
    expect(
      falsecolors?.relationship.facts.find(
        (fact) => fact.label === "Verified named sat descendants",
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
});

describe("findRegistryEntryBySatname", () => {
  it("finds top-level curated satnames", () => {
    expect(findRegistryEntryBySatname("falsecolors")?.satname).toBe(
      "falsecolors",
    );
  });

  it("finds nested child cards and normalizes case", () => {
    expect(findRegistryEntryBySatname("BadgerTooth")?.satname).toBe(
      "badgertooth",
    );
    expect(isSatnameInRegistry("breathelast")).toBe(true);
  });

  it("keeps holder socials on external links, not metadata", () => {
    const badgertooth = findRegistryEntryBySatname("badgertooth");
    const cactusseeds = findRegistryEntryBySatname("cactusseeds");

    expect(badgertooth?.externalLinks).toEqual([
      { label: "Holder on X", href: "https://x.com/lifofifo" },
    ]);
    expect(cactusseeds?.externalLinks).toEqual([
      { label: "Holder on X", href: "https://x.com/Brunno_UTXO" },
    ]);
  });

  it("returns null for satnames outside the curated registry", () => {
    expect(findRegistryEntryBySatname("notarealsatname")).toBeNull();
    expect(isSatnameInRegistry("notarealsatname")).toBe(false);
    expect(findRegistryEntryBySatname("blobnwthems")).toBeNull();
    expect(findRegistryEntryBySatname("agooddoctor")).toBeNull();
  });
});
