import type { ClassifyResult } from "./named-sat-classify";

export type NamedSatSource = "osura-bootstrap" | "allowlist" | "delta";

export type NamedSatEntry = {
  satname: string;
  sat: string;
  kind: "single" | "pair" | "series-member";
  parts?: [string, string];
  seriesKey?: string;
  inscriptionCount?: number;
  primaryInscriptionId?: string;
  firstSeenInscriptionNumber?: number;
  source: NamedSatSource;
};

export type NamedSatsCursor = {
  lastInscriptionNumber: number;
  tipHeight?: number;
  takenAt: string;
  source: "ordinals.com";
};

export type NamedSatsSections = {
  singles: NamedSatEntry[];
  series: Array<{ key: string; members: NamedSatEntry[] }>;
  pairs: NamedSatEntry[];
};

export function entryFromClassification(
  satname: string,
  sat: string,
  source: NamedSatSource,
  classified: ClassifyResult,
  extras?: Partial<NamedSatEntry>,
): NamedSatEntry | null {
  if (classified.kind === "none") return null;

  if (classified.kind === "single") {
    return {
      satname,
      sat,
      kind: "single",
      source,
      ...extras,
    };
  }

  return {
    satname,
    sat,
    kind: "pair",
    parts: classified.parts,
    source,
    ...extras,
  };
}

export function mergeEntries(
  existing: NamedSatEntry[],
  incoming: NamedSatEntry[],
): NamedSatEntry[] {
  const byName = new Map<string, NamedSatEntry>();
  for (const entry of existing) {
    byName.set(entry.satname, entry);
  }
  for (const entry of incoming) {
    const prev = byName.get(entry.satname);
    byName.set(entry.satname, prev ? { ...prev, ...entry } : entry);
  }
  return [...byName.values()].sort((a, b) =>
    a.satname.localeCompare(b.satname),
  );
}

function leadingKey(entry: NamedSatEntry): string | null {
  if (entry.seriesKey) return entry.seriesKey;
  if (entry.parts?.[0]) return entry.parts[0];
  return null;
}

export function buildSections(entries: NamedSatEntry[]): NamedSatsSections {
  const singles = entries
    .filter((entry) => entry.kind === "single")
    .slice()
    .sort((a, b) => a.satname.localeCompare(b.satname));

  const pairLike = entries.filter(
    (entry) =>
      entry.kind === "pair" ||
      entry.kind === "series-member" ||
      (entry.parts != null && entry.kind !== "single"),
  );

  const groups = new Map<string, NamedSatEntry[]>();
  for (const entry of pairLike) {
    const key = leadingKey(entry);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  const series: NamedSatsSections["series"] = [];
  const pairedIntoSeries = new Set<string>();

  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const normalized = members
      .map((member) => ({
        ...member,
        kind: "series-member" as const,
        seriesKey: key,
        parts: member.parts,
      }))
      .sort((a, b) => a.satname.localeCompare(b.satname));
    for (const member of normalized) {
      pairedIntoSeries.add(member.satname);
    }
    series.push({ key, members: normalized });
  }

  series.sort((a, b) => {
    if (b.members.length !== a.members.length) {
      return b.members.length - a.members.length;
    }
    return a.key.localeCompare(b.key);
  });

  const pairs = pairLike
    .filter((entry) => !pairedIntoSeries.has(entry.satname))
    .map((entry) => ({
      ...entry,
      kind: "pair" as const,
    }))
    .sort((a, b) => a.satname.localeCompare(b.satname));

  return { singles, series, pairs };
}

export function nextCursor(
  prev: NamedSatsCursor,
  lastInscriptionNumber: number,
  takenAt: string,
  tipHeight?: number,
): NamedSatsCursor {
  return {
    lastInscriptionNumber,
    tipHeight: tipHeight ?? prev.tipHeight,
    takenAt,
    source: "ordinals.com",
  };
}

export function shouldAdvanceCursor(ok: boolean): boolean {
  return ok;
}
