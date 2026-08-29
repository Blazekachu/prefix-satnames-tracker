import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home header CTA", () => {
  it("renders inscriptions on sat names as a promoted call-to-action", () => {
    const markup = renderToStaticMarkup(createElement(Home));

    expect(markup).toContain('href="42069/"');
    expect(markup).toContain("Trace sat locations locally");
    expect(markup).toContain('class="header-link header-link-cta"');
    expect(markup).toContain("Explore inscriptions on sat names");
    expect(markup).toContain("Trace locations with track-prefix");
    expect(markup).toContain('class="trust-note"');
    expect(markup).toContain("Runs in your browser.");
    expect(markup).toContain("Only tip height is fetched.");
  });
});

describe("Home exquisite example supply", () => {
  it("uses the exact scheduled sat supply, not the rounded 21M figure", () => {
    const markup = renderToStaticMarkup(createElement(Home));

    expect(markup).toContain("2,099,999,997,690,000");
    expect(markup).not.toContain("2,100,000,000,000,000");
  });
});
