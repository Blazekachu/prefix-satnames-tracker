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
  fetchInscriptionIdsPage,
  fetchInscriptionInfo,
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

  const tipIds = await fetchInscriptionIdsPage(0);
  if (tipIds.length === 0) {
    throw new Error("Could not fetch latest inscriptions from ordinals.com");
  }
  const tipInfo = await fetchInscriptionInfo(tipIds[0]!);
  if (!tipInfo) {
    throw new Error(`Could not resolve latest inscription ${tipIds[0]}`);
  }

  if (tipInfo.number <= cursor.lastInscriptionNumber) {
    console.log(
      `Already caught up (cursor=${cursor.lastInscriptionNumber}, tip=${tipInfo.number})`,
    );
    return;
  }

  const existingNames = new Set(snapshot.entries.map((e) => e.satname));
  const incoming: NamedSatEntry[] = [];
  let inspected = 0;
  let ok = true;
  let reachedCursor = false;
  const maxInspect =
    args.max != null && Number.isFinite(args.max) ? args.max : Number.POSITIVE_INFINITY;

  console.log(
    `Scanning newest inscriptions above cursor ${cursor.lastInscriptionNumber} (tip ${tipInfo.number})${args.dryRun ? " [dry-run]" : ""}`,
  );

  for (let page = 0; !reachedCursor && inspected < maxInspect; page++) {
    let ids: string[];
    try {
      ids = await fetchInscriptionIdsPage(page);
    } catch (err) {
      ok = false;
      console.error(`Failed fetching inscriptions page ${page}: ${String(err)}`);
      break;
    }
    if (ids.length === 0) break;

    for (const id of ids) {
      if (inspected >= maxInspect) break;
      try {
        const info = await fetchInscriptionInfo(id);
        inspected += 1;
        if (!info) continue;
        if (info.number <= cursor.lastInscriptionNumber) {
          reachedCursor = true;
          break;
        }
        if (info.sat != null) {
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
            console.log(`+ ${candidate.satname} (inscription ${info.number})`);
          }
        }
        await new Promise((r) => setTimeout(r, 40));
      } catch (err) {
        ok = false;
        console.error(`Failed at inscription ${id}: ${String(err)}`);
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 100));
    if (!ok) break;
  }

  if (!shouldAdvanceCursor(ok)) {
    console.error("Aborting without writing cursor (fail-closed).");
    process.exit(1);
  }

  const takenAt = new Date().toISOString();
  const caughtUp = reachedCursor || tipInfo.number <= cursor.lastInscriptionNumber;
  const canAdvance = caughtUp && !args.dryRun;

  if (args.dryRun) {
    console.log(
      `Dry run: inspected ${inspected}, would add ${incoming.length}; tip=${tipInfo.number}; reachedCursor=${reachedCursor}`,
    );
    return;
  }

  const merged = mergeEntries(snapshot.entries, incoming);
  writeFileSync(
    snapshotPath,
    `${JSON.stringify({ meta: { ...snapshot.meta, generatedAt: takenAt }, entries: merged }, null, 2)}\n`,
    "utf8",
  );

  if (canAdvance) {
    const next = nextCursor(cursor, tipInfo.number, takenAt);
    writeFileSync(cursorPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    console.log(
      `Updated snapshot (+${incoming.length}); cursor advanced to ${next.lastInscriptionNumber}`,
    );
  } else {
    console.log(
      `Updated snapshot (+${incoming.length}); cursor unchanged at ${cursor.lastInscriptionNumber} (pass without --max until the scan reaches the cursor, or raise cursor to tip to skip backlog)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
