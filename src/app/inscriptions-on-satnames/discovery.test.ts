import { describe, expect, it } from "vitest";

import { extractInscriptionIdFromSatResponse } from "./discovery";

describe("extractInscriptionIdFromSatResponse", () => {
  it("returns the first inscription id from an ord sat response", () => {
    expect(
      extractInscriptionIdFromSatResponse({
        ids: ["abc123i0", "def456i0"],
        more: false,
        page: 0,
      }),
    ).toBe("abc123i0");
  });

  it("returns null when no inscription ids exist", () => {
    expect(
      extractInscriptionIdFromSatResponse({
        ids: [],
        more: false,
        page: 0,
      }),
    ).toBeNull();
  });

  it("returns null for malformed payloads", () => {
    expect(extractInscriptionIdFromSatResponse({ nope: true })).toBeNull();
  });
});
