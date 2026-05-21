import { nameToSat, satToName } from "./sat-math";

export interface SeriesRange {
  /** 1 = 11-letter names; equals 12 - nameLength. */
  id: number;
  nameLength: number;
  /** Alphabetically-first name (prefix + "aa...a"). */
  firstName: string;
  /** Alphabetically-last existing name (prefix + "zz...z", or the clamped boundary). */
  lastName: string;
  /** Lowest in-supply sat of the series (clamped to 0 on a supply straddle). */
  satStart: bigint;
  /** Highest sat of the series. */
  satEnd: bigint;
  satCount: bigint;
}

/**
 * Enumerate every series for a prefix, from 11-letter names down to the prefix
 * itself. Series fully beyond Bitcoin's sat supply are dropped silently. A series
 * that straddles the supply boundary keeps only its existing portion.
 */
export function buildSeriesRanges(prefix: string): SeriesRange[] {
  const result: SeriesRange[] = [];
  for (let nameLength = 11; nameLength >= prefix.length; nameLength--) {
    const suffixLen = nameLength - prefix.length;
    const firstName = prefix + "a".repeat(suffixLen);
    let lastName = prefix + "z".repeat(suffixLen);

    // "aa...a" suffix -> smaller x -> larger sat; "zz...z" -> larger x -> smaller sat.
    const satEnd = nameToSat(firstName);
    let satStart = nameToSat(lastName);

    // Existence rule: sats must lie in [0, SUPPLY-1].
    if (satEnd < 0n) {
      continue; // whole series is beyond supply -- not a real series
    }
    if (satStart < 0n) {
      // Supply straddle: keep only the existing portion.
      satStart = 0n;
      lastName = satToName(satStart);
    }

    result.push({
      id: 12 - nameLength,
      nameLength,
      firstName,
      lastName,
      satStart,
      satEnd,
      satCount: satEnd - satStart + 1n,
    });
  }
  return result;
}
