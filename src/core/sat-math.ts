export const SUPPLY = 2_099_999_997_690_000n;

const HALVING_INTERVAL = 210_000n;
const INITIAL_SUBSIDY = 5_000_000_000n;

/** Encode a sat number to its ordinal name. */
export function satToName(sat: bigint): string {
  let x = SUPPLY - sat;
  let name = "";
  while (x > 0n) {
    x -= 1n;
    name = String.fromCharCode(Number(x % 26n) + 97) + name;
    x = x / 26n;
  }
  return name;
}

/** Decode an ordinal name to its sat number. May be negative if beyond supply. */
export function nameToSat(name: string): bigint {
  let x = 0n;
  for (const ch of name) {
    x = x * 26n + BigInt(ch.charCodeAt(0) - 97) + 1n;
  }
  return SUPPLY - x;
}

/** Block subsidy (in sats) for a given block height. */
export function blockSubsidy(height: bigint): bigint {
  const epoch = height / HALVING_INTERVAL;
  if (epoch >= 64n) return 0n;
  return INITIAL_SUBSIDY >> epoch;
}

/** The first (lowest) sat number created by a given block. */
export function blockFirstSat(height: bigint): bigint {
  let sat = 0n;
  let subsidy = INITIAL_SUBSIDY;
  let h = 0n;
  for (let epoch = 0; epoch < 64; epoch++) {
    const epochEnd = h + HALVING_INTERVAL;
    if (height < epochEnd) {
      return sat + (height - h) * subsidy;
    }
    sat += HALVING_INTERVAL * subsidy;
    h = epochEnd;
    subsidy /= 2n;
  }
  return sat;
}

/** The block height that created a given sat number. */
export function satToBlock(sat: bigint): bigint {
  let remaining = sat;
  let subsidy = INITIAL_SUBSIDY;
  let height = 0n;
  for (let epoch = 0; epoch < 64; epoch++) {
    const epochSats = HALVING_INTERVAL * subsidy;
    if (remaining < epochSats) {
      return height + remaining / subsidy;
    }
    remaining -= epochSats;
    height += HALVING_INTERVAL;
    subsidy /= 2n;
  }
  return height;
}
