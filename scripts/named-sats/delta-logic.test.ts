import { describe, expect, it } from "vitest";

import { buildWordSet } from "../../src/core/named-sat-classify";
import { nameToSat } from "../../src/core/sat-math";
import { candidateFromInscription } from "./delta-logic";

describe("candidateFromInscription", () => {
  const words = buildWordSet(["ghost", "flight", "excrescence"]);

  it("returns a delta pair for a classified new name", () => {
    const sat = nameToSat("ghostflight");
    const entry = candidateFromInscription({
      sat,
      inscriptionNumber: 100,
      inscriptionId: "abci0",
      words,
      allowlist: new Set(),
      existingNames: new Set(),
    });
    expect(entry?.satname).toBe("ghostflight");
    expect(entry?.kind).toBe("pair");
    expect(entry?.source).toBe("delta");
    expect(entry?.firstSeenInscriptionNumber).toBe(100);
  });

  it("skips names already present", () => {
    const sat = nameToSat("excrescence");
    expect(
      candidateFromInscription({
        sat,
        inscriptionNumber: 101,
        words,
        allowlist: new Set(),
        existingNames: new Set(["excrescence"]),
      }),
    ).toBeNull();
  });

  it("keeps allowlist names even when unclassified", () => {
    const sat = nameToSat("agooddoctor");
    const entry = candidateFromInscription({
      sat,
      inscriptionNumber: 102,
      words: buildWordSet([]),
      allowlist: new Set(["agooddoctor"]),
      existingNames: new Set(),
    });
    expect(entry?.satname).toBe("agooddoctor");
    expect(entry?.source).toBe("allowlist");
  });
});
