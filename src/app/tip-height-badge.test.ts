import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteControls } from "./site-controls";
import { TipHeightBadge } from "./tip-height-badge";

describe("SiteControls", () => {
  it("stacks theme toggle and tip height badge", () => {
    const markup = renderToStaticMarkup(createElement(SiteControls));

    expect(markup).toContain('class="site-controls"');
    expect(markup).toContain('class="theme-toggle"');
    expect(markup).toContain('class="tip-height-badge"');
  });
});

describe("TipHeightBadge", () => {
  it("renders a loading placeholder before the tip fetch resolves", () => {
    const markup = renderToStaticMarkup(createElement(TipHeightBadge));

    expect(markup).toContain('class="tip-height-badge"');
    expect(markup).toContain("…");
    expect(markup).toContain("Latest confirmed mined block height");
  });
});
