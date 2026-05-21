import { describe, it, expect } from "vitest";
import { buildReport } from "../core/report";
import { renderText } from "./render";

describe("renderText", () => {
  it("includes the prefix, series count and tip height", () => {
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("bhang");
    expect(out).toContain("7 series");
    expect(out).toContain("900,000");
  });

  it("shows per-block segments for Series 1", () => {
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("579,124");
    expect(out).toContain("579,125");
    expect(out).toContain("mined");
  });

  it("shows a future label for the final series", () => {
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("future");
  });

  it("shows a collapsed summary line for a short prefix", () => {
    const out = renderText(buildReport("a", 900_000));
    expect(out).toMatch(/blocks .* collapsed|\d+ blocks/);
  });

  it("shows a no-series message for a prefix beyond supply", () => {
    const out = renderText(buildReport("zzzzzzzzzzz", 900_000));
    expect(out).toContain("No real series");
  });

  it("prints the name range in the same direction as the sat range", () => {
    // satStart's name (bhangzzzzzz) is the lower sat; satEnd's name
    // (bhangaaaaaa) is the higher sat. The name range must read
    // low-sat -> high-sat so it matches the ascending sat range.
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("bhangzzzzzz … bhangaaaaaa");
  });
});
