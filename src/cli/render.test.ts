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

  describe("Series 1 supply banner", () => {
    it("shows the missing banner above series for a prefix whose 11-letter range is past supply", () => {
      const out = renderText(buildReport("ordpool", 900_000));
      // Banner names the prefix and its z..a 11-letter range
      expect(out).toContain("No 11-letter series exists for `ordpool`");
      // Range example is in z..a order (sat-ascending), names within ~10 chars of each other
      expect(out).toMatch(/ordpoolzzzz.{1,10}ordpoolaaaa/);
      expect(out).toContain("21M-BTC supply");
      // Positioned BEFORE the first series-card header (which uses ` · ` separator)
      expect(out.indexOf("No 11-letter series")).toBeLessThan(
        out.indexOf("Series 2  ·"),
      );
    });

    it("shows the partial banner for a prefix whose 11-letter series straddles supply", () => {
      // Prefix 'n' straddles: satStart was clamped from negative.
      const out = renderText(buildReport("n", 900_000));
      expect(out).toContain("Series 1 (11-letter names) is partial for `n`");
      expect(out).toContain("21M-BTC supply");
      expect(out.indexOf("is partial for")).toBeLessThan(
        out.indexOf("Series 1  ·"),
      );
    });

    it("shows no Series 1 banner for a prefix whose 11-letter series is whole", () => {
      const out = renderText(buildReport("bhang", 900_000));
      expect(out).not.toContain("No 11-letter series");
      expect(out).not.toContain("is partial for");
    });

    it("uses the user-supplied prefix verbatim in the banner, not a placeholder", () => {
      const out = renderText(buildReport("ordpool", 900_000));
      expect(out).not.toMatch(/`prefix`|\{prefix\}/);
    });
  });
});
