import { describe, it, expect } from "vitest";
import {
  SUPPLY,
  nameToSat,
  satToName,
  satToBlock,
  blockFirstSat,
  blockSubsidy,
} from "./sat-math";

describe("nameToSat / satToName", () => {
  it("maps 'a' to the last sat ever", () => {
    expect(nameToSat("a")).toBe(SUPPLY - 1n);
  });

  it("maps sat 0 to an 11-letter name", () => {
    expect(satToName(0n).length).toBe(11);
  });

  it("round-trips names", () => {
    for (const name of ["a", "bhang", "bhangaaaaaa", "bhangzzzzzz", "satoshi"]) {
      expect(satToName(nameToSat(name))).toBe(name);
    }
  });

  it("matches the known BHANG range endpoints", () => {
    expect(nameToSat("bhangaaaaaa")).toBe(1_773_906_329_777_337n);
    expect(nameToSat("bhangzzzzzz")).toBe(1_773_906_020_861_562n);
  });
});

describe("blockSubsidy", () => {
  it("is 50 BTC for epoch 0", () => {
    expect(blockSubsidy(0n)).toBe(5_000_000_000n);
  });
  it("is 12.5 BTC for epoch 2 (block 579124)", () => {
    expect(blockSubsidy(579_124n)).toBe(1_250_000_000n);
  });
});

describe("blockFirstSat / satToBlock", () => {
  it("block 0 starts at sat 0", () => {
    expect(blockFirstSat(0n)).toBe(0n);
  });
  it("satToBlock is the inverse of blockFirstSat at a block boundary", () => {
    expect(satToBlock(blockFirstSat(579_124n))).toBe(579_124n);
  });
  it("places the BHANG range start in block 579124", () => {
    expect(satToBlock(1_773_906_020_861_562n)).toBe(579_124n);
  });
  it("places the BHANG range end in block 579125", () => {
    expect(satToBlock(1_773_906_329_777_337n)).toBe(579_125n);
  });
});
