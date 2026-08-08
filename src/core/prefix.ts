export interface PrefixOk {
  ok: true;
  prefix: string;
}

export interface PrefixError {
  ok: false;
  error: string;
}

export type PrefixResult = PrefixOk | PrefixError;

/** Validate a sat name prefix: 1-11 lowercase letters a-z. */
export function validatePrefix(input: string): PrefixResult {
  if (input.length === 0) {
    return { ok: false, error: "Prefix cannot be empty." };
  }
  if (input.length > 11) {
    return { ok: false, error: "Prefix cannot be longer than 11 letters." };
  }
  if (!/^[a-z]+$/.test(input)) {
    return { ok: false, error: "Prefix must contain only lowercase letters a-z." };
  }
  return { ok: true, prefix: input };
}
