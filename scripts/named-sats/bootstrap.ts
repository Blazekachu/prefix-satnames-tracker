import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildWordSet, classifySatname } from "../../src/core/named-sat-classify";
import {
  entryFromClassification,
  mergeEntries,
  type NamedSatEntry,
  type NamedSatSource,
  type NamedSatsCursor,
} from "../../src/core/named-sats-snapshot";
import { satnameToSat } from "../../src/core/satname";
import {
  extractInscriptionIdsFromSatResponse,
  fetchSatInscriptions,
} from "./ordinals";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "src/app/inscriptions-on-satnames/data");

function parseArgs(argv: string[]) {
  let cursor: number | undefined;
  let enrich = true;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--cursor") cursor = Number(argv[++i]);
    else if (arg === "--no-enrich") enrich = false;
  }
  return { cursor, enrich };
}

function readJsonArray(filePath: string): string[] {
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(raw) || !raw.every((item) => typeof item === "string")) {
    throw new Error(`Expected string array in ${filePath}`);
  }
  return raw;
}

function loadWordSet(): Set<string> {
  const text = readFileSync(
    path.join(root, "scripts/named-sats/wordlist.txt"),
    "utf8",
  );
  return buildWordSet(text.split(/\r?\n/));
}

function buildEntry(
  satname: string,
  source: NamedSatSource,
  words: Set<string>,
): NamedSatEntry {
  const sat = satnameToSat(satname).toString();
  const classified = classifySatname(satname, words);
  const fromClass = entryFromClassification(satname, sat, source, classified);
  if (fromClass) return fromClass;
  // Preserve Osura/allowlist membership even when the local wordlist misses.
  return {
    satname,
    sat,
    kind: "single",
    source,
  };
}

async function maybeEnrich(entry: NamedSatEntry): Promise<NamedSatEntry> {
  try {
    const payload = await fetchSatInscriptions(BigInt(entry.sat));
    const ids = extractInscriptionIdsFromSatResponse(payload);
    if (ids.length === 0) return entry;
    return {
      ...entry,
      primaryInscriptionId: ids[0],
      inscriptionCount: ids.length,
    };
  } catch (err) {
    console.warn(`enrich failed for ${entry.satname}: ${String(err)}`);
    return entry;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.cursor == null || !Number.isInteger(args.cursor) || args.cursor < 0) {
    console.error(
      "Usage: npm run named-sats:bootstrap -- --cursor <inscriptionNumber> [--no-enrich]",
    );
    process.exit(1);
  }

  const osura = readJsonArray(path.join(dataDir, "osura-bootstrap-names.json"));
  const allow = readJsonArray(path.join(dataDir, "named-sats-allowlist.json"));
  const words = loadWordSet();

  const incoming: NamedSatEntry[] = [];
  for (const satname of osura) {
    incoming.push(buildEntry(satname, "osura-bootstrap", words));
  }
  for (const satname of allow) {
    incoming.push(buildEntry(satname, "allowlist", words));
  }

  let entries = mergeEntries([], incoming);

  if (args.enrich) {
    const enriched: NamedSatEntry[] = [];
    for (const entry of entries) {
      enriched.push(await maybeEnrich(entry));
      await new Promise((r) => setTimeout(r, 50));
    }
    entries = mergeEntries([], enriched);
  }

  if (entries.some((e) => e.satname === "blobnwthems")) {
    throw new Error("blobnwthems must not appear in All-tab snapshot");
  }
  for (const required of ["agooddoctor", "cyclisation"]) {
    if (!entries.some((e) => e.satname === required)) {
      throw new Error(`missing required allowlist name: ${required}`);
    }
  }

  const generatedAt = new Date().toISOString();
  const snapshot = {
    meta: {
      generatedAt,
      bootstrapSource: "osura+allowlist",
    },
    entries,
  };

  const cursor: NamedSatsCursor = {
    lastInscriptionNumber: args.cursor,
    takenAt: generatedAt,
    source: "ordinals.com",
  };

  writeFileSync(
    path.join(dataDir, "named-sats-snapshot.json"),
    `${JSON.stringify(snapshot, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    path.join(dataDir, "named-sats-cursor.json"),
    `${JSON.stringify(cursor, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Wrote snapshot with ${entries.length} entries; cursor=${args.cursor}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
