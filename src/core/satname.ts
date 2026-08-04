import { nameToSat } from "./sat-math";

export type SatnameValidationResult =
  | { ok: true; satname: string }
  | { ok: false; error: string };

export function validateSatname(input: string): SatnameValidationResult {
  const satname = input.trim().toLowerCase();

  if (satname.length === 0) {
    return { ok: false, error: "Enter a satname." };
  }

  if (!/^[a-z]+$/.test(satname)) {
    return { ok: false, error: "Satnames must contain only letters a-z." };
  }

  return { ok: true, satname };
}

export function satnameToSat(satname: string): bigint {
  return nameToSat(satname);
}
