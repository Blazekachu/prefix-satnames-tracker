import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RequestForm } from "./request-form";

describe("RequestForm", () => {
  it("renders prefilled readonly satname and inscription id fields", () => {
    const html = renderToStaticMarkup(
      createElement(RequestForm, {
        satname: "exquisite",
        sat: 2_098_757_593_392_471n,
        inscriptionId:
          "db044cb57073abf71bbab6111415e3c0a38cce1428d364c8f275e9d8995252dbi201",
        inscriptionUrl:
          "https://ordinals.com/inscription/db044cb57073abf71bbab6111415e3c0a38cce1428d364c8f275e9d8995252dbi201",
        endpoint: "https://formspree.io/f/test",
      }),
    );

    expect(html).toContain('name="satname"');
    expect(html).toContain('value="exquisite"');
    expect(html).toContain('readOnly=""');
    expect(html).toContain('name="inscription_id"');
    expect(html).toContain(
      'value="db044cb57073abf71bbab6111415e3c0a38cce1428d364c8f275e9d8995252dbi201"',
    );
  });
});
