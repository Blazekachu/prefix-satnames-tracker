import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildWordSet } from "../../src/core/named-sat-classify";
import {
  mergeEntries,
  nextCursor,
  shouldAdvanceCursor,
  type NamedSatEntry,
  type NamedSatsCursor,
} from "../../src/core/named-sats-snapshot";
import { candidateFromInscription } from "./delta-logic";
import {
  fetchInscriptionInfo,
  fetchLatestInscriptionIds,
} from "./ordinals";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "src/app/inscriptions-on-satnames/data");

type SnapshotFile = {
  meta: { generatedAt: string; bootstrapSource?: string };
  entries: NamedSatEntry[];
};

function parseArgs(argv: string[]) {
  let dryRun = false;
  let max: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--max") max = Number(argv[++i]);
  }
  return { dryRun, max };
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = path.join(dataDir, "named-sats-snapshot.json");
  const cursorPath = path.join(dataDir, "named-sats-cursor.json");
  const snapshot = readJson<SnapshotFile>(snapshotPath);
  const cursor = readJson<NamedSatsCursor>(cursorPath);
  const allowlist = new Set(
    readJson<string[]>(path.join(dataDir, "named-sats-allowlist.json")),
  );
  const words = buildWordSet(
    readFileSync(path.join(root, "scripts/named-sats/wordlist.txt"), "utf8").split(
      /\r?\n/,
    ),
  );

  const latestIds = await fetchLatestInscriptionIds();
  if (latestIds.length === 0) {
    throw new Error("Could not fetch latest inscriptions from ordinals.com");
  }
  const latestInfo = await fetchInscriptionInfo(latestIds[0]!);
  if (!latestInfo) {
    throw new Error(`Could not resolve latest inscription ${latestIds[0]}`);
  }

  const start = cursor.lastInscriptionNumber + 1;
  const end = latestInfo.number;
  if (end < start) {
    console.log(
      `Already caught up (cursor=${cursor.lastInscriptionNumber}, tip=${end})`,
    );
    return;
  }

  const existingNames = new Set(snapshot.entries.map((e) => e.satname));
  const incoming: NamedSatEntry[] = [];
  let processed = 0;
  let ok = true;
  let lastSuccessful = cursor.lastInscriptionNumber;

  const limit =
    args.max != null && Number.isFinite(args.max)
      ? Math.min(end, start + args.max - 1)
      : end;

  console.log(
    `Scanning inscriptions ${start}..${limit} (tip ${end})${args.dryRun ? " [dry-run]" : ""}`,
  );

  for (let n = start; n <= limit; n++) {
    try {
      const info = await fetchInscriptionInfo(n);
      processed += 1;
      if (info?.sat != null) {
        const candidate = candidateFromInscription({
          sat: info.sat,
          inscriptionNumber: info.number,
          inscriptionId: info.id,
          words,
          allowlist,
          existingNames,
        });
        if (candidate) {
          incoming.push(candidate);
          existingNames.add(candidate.satname);
          console.log(`+ ${candidate.satname} (inscription ${n})`);
        }
      }
      lastSuccessful = n;
      if (processed % 25 === 0) {
        await new Promise((r) => setTimeout(r, 200));
      } else {
        await new Promise((r) => setTimeout(r, 40));
      }
    } catch (err) {
      ok = false;
      console.error(`Failed at inscription ${n}: ${String(err)}`);
      break;
    }
  }

  if (!shouldAdvanceCursor(ok)) {
    console.error("Aborting without writing cursor (fail-closed).");
    process.exit(1);
  }

  const merged = mergeEntries(snapshot.entries, incoming);
  const takenAt = new Date().toISOString();
  const next = nextCursor(cursor, lastSuccessful, takenAt);

  if (args.dryRun) {
    console.log(
      `Dry run: would add ${incoming.length} names; cursor -> ${next.lastInscriptionNumber}`,
    );
    return;
  }

  // Only advance fully when we reached the intended limit.
  if (lastSuccessful < limit) {
    console.error("Incomplete scan; not writing files.");
    process.exit(1);
  }

  writeFileSync(
    snapshotPath,
    `${JSON.stringify({ meta: { ...snapshot.meta, generatedAt: takenAt }, entries: merged }, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(cursorPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(
    `Updated snapshot (+${incoming.length}); cursor=${next.lastInscriptionNumber}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
