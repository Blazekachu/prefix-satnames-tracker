import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dataDir = path.dirname(fileURLToPath(import.meta.url));

describe("named-sats fixtures", () => {
  it("has 334 unique Osura bootstrap names and required allowlist", () => {
    const names = JSON.parse(
      readFileSync(path.join(dataDir, "osura-bootstrap-names.json"), "utf8"),
    ) as string[];
    const allow = JSON.parse(
      readFileSync(path.join(dataDir, "named-sats-allowlist.json"), "utf8"),
    ) as string[];
    expect(names).toHaveLength(334);
    expect(new Set(names).size).toBe(334);
    expect(allow).toEqual(
      expect.arrayContaining(["agooddoctor", "cyclisation"]),
    );
    expect(names).not.toContain("blobnwthems");
    expect(allow).not.toContain("blobnwthems");
  });
});
