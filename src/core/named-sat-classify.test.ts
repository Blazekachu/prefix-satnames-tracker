import { describe, expect, it } from "vitest";

import { buildWordSet, classifySatname } from "./named-sat-classify";

describe("classifySatname", () => {
  const words = buildWordSet([
    "ghost",
    "flight",
    "excrescence",
    "eco",
    "friendly",
  ]);

  it("marks a whole dictionary word as single", () => {
    expect(classifySatname("excrescence", words)).toEqual({ kind: "single" });
  });

  it("marks a valid two-word join as pair with parts", () => {
    expect(classifySatname("ghostflight", words)).toEqual({
      kind: "pair",
      parts: ["ghost", "flight"],
    });
  });

  it("returns none when no whole-word or split match exists", () => {
    expect(classifySatname("ezcubunuovm", words)).toEqual({ kind: "none" });
  });

  it("prefers single over pair when both would match", () => {
    const both = buildWordSet(["eco", "friendly", "ecofriendly"]);
    expect(classifySatname("ecofriendly", both)).toEqual({ kind: "single" });
  });
});
