import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BrandHero, STORY_HERO } from "./brand-hero";

describe("STORY_HERO", () => {
  it("matches the on-chain OP_RETURN message", () => {
    expect(STORY_HERO).toBe("Every sat has a story");
  });
});

describe("BrandHero", () => {
  it("renders story as h1.title and pageTitle as p.page-title", () => {
    const html = renderToStaticMarkup(
      createElement(BrandHero, { pageTitle: "Prefix Sat Names Tracker" }),
    );

    expect(html).toContain('<h1 class="title">Every sat has a story</h1>');
    expect(html).toContain(
      '<p class="page-title">Prefix Sat Names Tracker</p>',
    );
    expect(html).not.toContain("mempool.space");
  });
});
