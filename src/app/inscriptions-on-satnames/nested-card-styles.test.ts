import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("nested child card styles", () => {
  it("scopes open-state caption sizing to the current card summary", () => {
    const css = readFileSync(
      new URL("../globals.css", import.meta.url),
      "utf8",
    );

    expect(css).toContain(".asset-card[open] > summary .asset-caption span");
    expect(css).toContain(".nested-asset-card .asset-caption span");
    expect(css).toContain(".nested-asset-card[open] > summary .asset-caption span");
    expect(css).not.toContain(".asset-card[open] .asset-caption span {");
  });

  it("highlights featured compact tiles with gold satname text", () => {
    const css = readFileSync(
      new URL("../globals.css", import.meta.url),
      "utf8",
    );

    expect(css).toContain(
      '.compact-tile[data-featured="true"] .compact-tile-copy strong',
    );
  });
});
