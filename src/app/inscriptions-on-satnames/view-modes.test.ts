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
  it("renders three view mode buttons", () => {
    const html = renderToStaticMarkup(
      createElement(ViewModePicker, {
        value: "large",
        onChange: () => undefined,
      }),
    );

    expect(html).toContain("Table");
    expect(html).toContain("Compact");
    expect(html).toContain("Large");
  });
});

describe("RegistryView", () => {
  it("renders inscription numbers for table rows", () => {
    const html = renderToStaticMarkup(
      createElement(RegistryView, {
        entries: getEntriesForTab("ord-father"),
        mode: "table",
        tabId: "ord-father",
        renderLargeCard: (entry: { satname: string }) =>
          createElement("div", null, entry.satname),
      }),
    );

    expect(html).toContain("64228106");
    expect(html).toContain("View details");
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
