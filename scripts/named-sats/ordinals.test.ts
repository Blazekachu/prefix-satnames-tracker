import { describe, expect, it } from "vitest";

import {
  extractInscriptionIdFromSatResponse,
  parseInscriptionInfo,
} from "./ordinals";

describe("ordinals parsers", () => {
  it("extracts the first sat inscription id", () => {
    expect(
      extractInscriptionIdFromSatResponse({
        ids: ["abci0", "defi1"],
      }),
    ).toBe("abci0");
    expect(extractInscriptionIdFromSatResponse({ ids: [] })).toBeNull();
    expect(extractInscriptionIdFromSatResponse(null)).toBeNull();
  });

  it("parses inscription info payloads", () => {
    expect(
      parseInscriptionInfo({
        id: "abci0",
        number: 42,
        sat: "123",
      }),
    ).toEqual({
      id: "abci0",
      number: 42,
      sat: 123n,
    });
  });
});
