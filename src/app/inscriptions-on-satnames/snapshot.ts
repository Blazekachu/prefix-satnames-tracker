import {
  buildSections,
  type NamedSatEntry,
  type NamedSatsCursor,
  type NamedSatsSections,
} from "../../core/named-sats-snapshot";
import cursorJson from "./data/named-sats-cursor.json";
import snapshotJson from "./data/named-sats-snapshot.json";

export type NamedSatsSnapshotFile = {
  meta: { generatedAt: string; bootstrapSource?: string };
  entries: NamedSatEntry[];
};

export function getNamedSatsSnapshot(): NamedSatsSnapshotFile {
  return snapshotJson as NamedSatsSnapshotFile;
}

export function getNamedSatsCursor(): NamedSatsCursor {
  return cursorJson as NamedSatsCursor;
}

export function getSnapshotSections(): NamedSatsSections {
  return buildSections(getNamedSatsSnapshot().entries);
}

export function isSatnameInSnapshot(satname: string): boolean {
  const needle = satname.trim().toLowerCase();
  return getNamedSatsSnapshot().entries.some(
    (entry) => entry.satname === needle,
  );
}
