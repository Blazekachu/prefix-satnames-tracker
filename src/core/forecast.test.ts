import { describe, it, expect } from "vitest";
import { classifyBlock, estimateDate } from "./forecast";

describe("classifyBlock", () => {
  it("marks a block at or below the tip as mined", () => {
    expect(classifyBlock(579_124n, 900_000n)).toBe("mined");
    expect(classifyBlock(900_000n, 900_000n)).toBe("mined");
  });
  it("marks a block above the tip as future", () => {
    expect(classifyBlock(1_568_922n, 900_000n)).toBe("future");
  });
});

describe("estimateDate", () => {
  it("estimates a future date ~10 minutes per block ahead of the tip", () => {
    const now = new Date("2026-05-21T00:00:00Z");
    // 144 blocks ahead = 1 day
    const est = estimateDate(900_144n, 900_000n, now);
    expect(est.isoDate).toBe("2026-05-22");
    expect(est.year).toBe("2026");
  });
});
