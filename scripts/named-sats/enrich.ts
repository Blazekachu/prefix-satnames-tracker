import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NamedSatEntry } from "../../src/core/named-sats-snapshot";
import {
  extractInscriptionIdsFromSatResponse,
  fetchSatInscriptions,
} from "./ordinals";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const snapshotPath = path.join(
  root,
  "src/app/inscriptions-on-satnames/data/named-sats-snapshot.json",
);

type SnapshotFile = {
  meta: { generatedAt: string; bootstrapSource?: string };
  entries: NamedSatEntry[];
};

function parseArgs(argv: string[]) {
  let concurrency = 3;
  let limit: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--concurrency") concurrency = Number(argv[++i]);
    else if (arg === "--limit") limit = Number(argv[++i]);
  }
  return { concurrency, limit };
}

async function enrichOne(entry: NamedSatEntry): Promise<NamedSatEntry> {
  if (entry.primaryInscriptionId) return entry;
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

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as SnapshotFile;
  let targets = snapshot.entries.filter((e) => !e.primaryInscriptionId);
  if (args.limit != null && Number.isFinite(args.limit)) {
    targets = targets.slice(0, args.limit);
  }

  console.log(
    `Enriching ${targets.length} / ${snapshot.entries.length} entries (concurrency=${args.concurrency})`,
  );

  const updatedByName = new Map<string, NamedSatEntry>();
  const enriched = await mapPool(targets, args.concurrency, async (entry, i) => {
    const next = await enrichOne(entry);
    if ((i + 1) % 25 === 0 || i === targets.length - 1) {
      console.log(`… ${i + 1}/${targets.length}`);
    }
    await new Promise((r) => setTimeout(r, 30));
    return next;
  });
  for (const entry of enriched) {
    updatedByName.set(entry.satname, entry);
  }

  const entries = snapshot.entries.map(
    (entry) => updatedByName.get(entry.satname) ?? entry,
  );
  const withId = entries.filter((e) => e.primaryInscriptionId).length;
  const takenAt = new Date().toISOString();
  writeFileSync(
    snapshotPath,
    `${JSON.stringify({ meta: { ...snapshot.meta, generatedAt: takenAt }, entries }, null, 2)}\n`,
    "utf8",
  );
  console.log(`Done. ${withId}/${entries.length} entries have inscription ids.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
