import { nameToSat, satToName } from "./sat-math";

export interface SeriesRange {
  /** 1 = 11-letter names; equals 12 - nameLength. */
  id: number;
  nameLength: number;
  /** Name of satStart -- the lowest sat (prefix + "zz...z", or the clamped boundary). */
  satStartName: string;
  /** Name of satEnd -- the highest sat (prefix + "aa...a"). */
  satEndName: string;
  /** Lowest in-supply sat of the series (clamped to 0 on a supply straddle). */
  satStart: bigint;
  /** Highest sat of the series. */
  satEnd: bigint;
  satCount: bigint;
  /** True when the natural low end of the series fell past supply and was clamped to 0. */
  clamped: boolean;
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
    // "aa...a" suffix -> smaller x -> larger sat (satEnd);
    // "zz...z" suffix -> larger x -> smaller sat (satStart).
    const satEndName = prefix + "a".repeat(suffixLen);
    let satStartName = prefix + "z".repeat(suffixLen);

    const satEnd = nameToSat(satEndName);
    let satStart = nameToSat(satStartName);
    let clamped = false;

    // Existence rule: sats must lie in [0, SUPPLY-1].
    if (satEnd < 0n) {
      continue; // whole series is beyond supply -- not a real series
    }
    if (satStart < 0n) {
      // Supply straddle: keep only the existing portion.
      satStart = 0n;
      satStartName = satToName(satStart);
      clamped = true;
    }

    result.push({
      id: 12 - nameLength,
      nameLength,
      satStartName,
      satEndName,
      satStart,
      satEnd,
      satCount: satEnd - satStart + 1n,
      clamped,
    });
  }
  return result;
}
