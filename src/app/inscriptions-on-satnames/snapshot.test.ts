import { describe, expect, it } from "vitest";

import {
  getNamedSatsSnapshot,
  getSnapshotSections,
  isSatnameInSnapshot,
} from "./snapshot";

describe("named sats snapshot loader", () => {
  it("includes allowlist names and excludes blobnwthems", () => {
    const names = getNamedSatsSnapshot().entries.map((e) => e.satname);
    expect(names).toContain("agooddoctor");
    expect(names).toContain("cyclisation");
    expect(names).not.toContain("blobnwthems");
    expect(isSatnameInSnapshot("agooddoctor")).toBe(true);
    expect(isSatnameInSnapshot("blobnwthems")).toBe(false);
  });

  it("builds Osura-style sections", () => {
    const sections = getSnapshotSections();
    expect(sections.singles.length + sections.pairs.length).toBeGreaterThan(0);
    expect(sections.series.length).toBeGreaterThan(0);
  });
});
