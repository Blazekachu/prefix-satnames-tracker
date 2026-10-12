import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getEntriesForTab } from "./registry";
import {
  nextFocusedSatname,
  RegistryView,
  ViewModePicker,
} from "./view-modes";

describe("ViewModePicker", () => {
  it("renders compact and large view mode buttons only", () => {
    const html = renderToStaticMarkup(
      createElement(ViewModePicker, {
        value: "large",
        onChange: () => undefined,
      }),
    );

    expect(html).not.toContain("Table");
    expect(html).toContain("Compact");
    expect(html).toContain("Large");
  });
});

describe("RegistryView", () => {
  it("renders compact tiles with inscription previews", () => {
    const html = renderToStaticMarkup(
      createElement(RegistryView, {
        entries: getEntriesForTab("ord-father"),
        mode: "compact",
        tabId: "ord-father",
        renderLargeCard: (entry: { satname: string }) =>
          createElement("div", null, entry.satname),
      }),
    );

    expect(html).toContain("compact-tile");
    expect(html).toContain("falsecolors");
    expect(html).toContain("/preview/");
  });

  it("does not render a focused detail card by default", () => {
    const html = renderToStaticMarkup(
      createElement(RegistryView, {
        entries: getEntriesForTab("ord-father"),
        mode: "compact",
        tabId: "ord-father",
        renderLargeCard: (entry: { satname: string }) =>
          createElement("div", { className: "focused-marker" }, entry.satname),
      }),
    );

    expect(html).not.toContain("focused-marker");
  });
});

describe("nextFocusedSatname", () => {
  it("selects an entry when nothing is focused", () => {
    expect(nextFocusedSatname(null, "falsecolors")).toBe("falsecolors");
  });

  it("clears focus when the same entry is clicked again", () => {
    expect(nextFocusedSatname("falsecolors", "falsecolors")).toBeNull();
  });
});
