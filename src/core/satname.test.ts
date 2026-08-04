import { describe, expect, it } from "vitest";

import { satnameToSat, validateSatname } from "./satname";

describe("validateSatname", () => {
  it("normalizes lowercase satnames", () => {
    expect(validateSatname(" ExQuIsItE ")).toEqual({
      ok: true,
      satname: "exquisite",
    });
  });

  it("rejects invalid characters", () => {
    expect(validateSatname("exquisite-1")).toEqual({
      ok: false,
      error: "Satnames must contain only letters a-z.",
    });
  });
});

describe("satnameToSat", () => {
  it("maps exquisite back to its known sat number", () => {
    expect(satnameToSat("exquisite")).toBe(2_098_757_593_392_471n);
  });
});
