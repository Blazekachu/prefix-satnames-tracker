# Named Sats Snapshot (Osura-Style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap an Osura-style named-sats snapshot (plus allowlist), rewire **All Named Sats Tracked Yet** to render Single / Series / Two-word sections from that snapshot, add monthly ordinals.com delta scanning from a cursor, and move Blobs to `/named-collection-series`.

**Architecture:** Pure classify + section builders in `src/core`; committed JSON under `src/app/inscriptions-on-satnames/data/`; Node scripts under `scripts/named-sats/` for bootstrap/delta I/O against `ordinals.com`; All tab reads snapshot only; ORD FATHER stays on `registry.ts`; Blobs become editorial collection data on a new route.

**Tech Stack:** TypeScript, Vitest, Next.js 16 static export, `tsx` for scripts, existing `src/core/satname.ts` math.

**Spec:** `docs/superpowers/specs/2026-10-12-named-sats-snapshot-osura-style-design.md`

## Global Constraints

- Keep `src/core/*` pure and deterministic (no `Date.now()` / `Math.random()` / network in core).
- Never rescan from inscription 0; advance cursor only after a fully successful delta.
- All tab = snapshot only (Osura-style sections); allowlist must include `agooddoctor` and `cyclisation`.
- `blobnwthems` must not appear on All tab; Blobs live under Named Collection Series.
- ORD FATHER tab / `registry.ts` ord-father entries unchanged in behavior.
- Site remains `output: "export"` GitHub Pages compatible (`basePath` in prod).
- Every core module keeps a colocated `.test.ts`.
- Do not commit secrets; Osura credentials are not required after bootstrap names are checked in.

## File map

| Path | Responsibility |
|------|----------------|
| `src/core/named-sat-classify.ts` | Wordlist load shape, classify one satname → single/pair/none |
| `src/core/named-sats-sections.ts` | Build Single / Series / Two-word sections from entries |
| `src/core/named-sats-snapshot.ts` | Types, merge entry, cursor helpers (pure) |
| `src/app/inscriptions-on-satnames/data/osura-bootstrap-names.json` | 334 Osura names |
| `src/app/inscriptions-on-satnames/data/named-sats-allowlist.json` | Forced inclusions |
| `src/app/inscriptions-on-satnames/data/named-sats-snapshot.json` | All-tab source of truth |
| `src/app/inscriptions-on-satnames/data/named-sats-cursor.json` | Delta cursor |
| `scripts/named-sats/wordlist.txt` | a–z words for delta classification |
| `scripts/named-sats/ordinals.ts` | Fetch helpers for ordinals.com |
| `scripts/named-sats/bootstrap.ts` | One-time bootstrap writer |
| `scripts/named-sats/delta.ts` | Monthly incremental updater |
| `src/app/inscriptions-on-satnames/snapshot-view.tsx` | All-tab Osura-style UI |
| `src/app/named-collection-series/*` | Collection index + Blobs page |
| `src/app/inscriptions-on-satnames/registry.ts` | ORD FATHER only for tabs; remove `tabs: ["all"]` entries |

---

### Task 1: Pure satname classification

**Files:**
- Create: `src/core/named-sat-classify.ts`
- Create: `src/core/named-sat-classify.test.ts`

**Interfaces:**
- Consumes: none (standalone pure module)
- Produces:
  - `export type ClassifyKind = "single" | "pair" | "none"`
  - `export type ClassifyResult = { kind: "single" } | { kind: "pair"; parts: [string, string] } | { kind: "none" }`
  - `export function buildWordSet(words: Iterable<string>): Set<string>`
  - `export function classifySatname(satname: string, words: Set<string>): ClassifyResult`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildWordSet, classifySatname } from "./named-sat-classify";

describe("classifySatname", () => {
  const words = buildWordSet(["ghost", "flight", "excrescence", "eco", "friendly"]);

  it("marks a whole dictionary word as single", () => {
    expect(classifySatname("excrescence", words)).toEqual({ kind: "single" });
  });

  it("marks a valid two-word join as pair with parts", () => {
    expect(classifySatname("ghostflight", words)).toEqual({
      kind: "pair",
      parts: ["ghost", "flight"],
    });
  });

  it("returns none when no whole-word or split match exists", () => {
    expect(classifySatname("ezcubunuovm", words)).toEqual({ kind: "none" });
  });

  it("prefers single over pair when both would match", () => {
    const both = buildWordSet(["eco", "friendly", "ecofriendly"]);
    expect(classifySatname("ecofriendly", both)).toEqual({ kind: "single" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/named-sat-classify.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```ts
export type ClassifyResult =
  | { kind: "single" }
  | { kind: "pair"; parts: [string, string] }
  | { kind: "none" };

export function buildWordSet(words: Iterable<string>): Set<string> {
  const set = new Set<string>();
  for (const raw of words) {
    const w = raw.trim().toLowerCase();
    if (/^[a-z]+$/.test(w)) set.add(w);
  }
  return set;
}

export function classifySatname(satname: string, words: Set<string>): ClassifyResult {
  const name = satname.trim().toLowerCase();
  if (!/^[a-z]+$/.test(name)) return { kind: "none" };
  if (words.has(name)) return { kind: "single" };
  for (let i = 1; i < name.length; i++) {
    const left = name.slice(0, i);
    const right = name.slice(i);
    if (words.has(left) && words.has(right)) {
      return { kind: "pair", parts: [left, right] };
    }
  }
  return { kind: "none" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/named-sat-classify.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/named-sat-classify.ts src/core/named-sat-classify.test.ts
git commit -m "$(cat <<'EOF'
feat: add pure satname wordlist classification

EOF
)"
```

---

### Task 2: Snapshot types, merge, sections, cursor helpers

**Files:**
- Create: `src/core/named-sats-snapshot.ts`
- Create: `src/core/named-sats-snapshot.test.ts`

**Interfaces:**
- Consumes: `ClassifyResult` / `classifySatname` from `./named-sat-classify`
- Produces:
  - `export type NamedSatSource = "osura-bootstrap" | "allowlist" | "delta"`
  - `export type NamedSatEntry = { satname: string; sat: string; kind: "single" | "pair" | "series-member"; parts?: [string, string]; seriesKey?: string; inscriptionCount?: number; primaryInscriptionId?: string; firstSeenInscriptionNumber?: number; source: NamedSatSource }`
  - `export type NamedSatsCursor = { lastInscriptionNumber: number; tipHeight?: number; takenAt: string; source: "ordinals.com" }`
  - `export type NamedSatsSections = { singles: NamedSatEntry[]; series: Array<{ key: string; members: NamedSatEntry[] }>; pairs: NamedSatEntry[] }`
  - `export function entryFromClassification(satname: string, sat: string, source: NamedSatSource, classified: ClassifyResult, extras?: Partial<NamedSatEntry>): NamedSatEntry | null`
  - `export function mergeEntries(existing: NamedSatEntry[], incoming: NamedSatEntry[]): NamedSatEntry[]`
  - `export function buildSections(entries: NamedSatEntry[]): NamedSatsSections`
  - `export function nextCursor(prev: NamedSatsCursor, lastInscriptionNumber: number, takenAt: string, tipHeight?: number): NamedSatsCursor`
  - `export function shouldAdvanceCursor(ok: boolean): boolean` — returns `ok` (fail-closed documentation helper used by scripts)

Rules for `buildSections`:
- Start from entries with `kind` single/pair (treat `series-member` as pair using `parts`/`seriesKey` if present).
- Cluster entries that have `parts[0]` shared and group size ≥ 2 into series (`seriesKey = parts[0]`, members become conceptually series-member).
- Singles = `kind === "single"` and not also listed only as series members (singles stay in singles even if a series shares a prefix word as a separate name).
- Pairs = remaining two-word entries not placed in a series group.
- Sort singles/pairs by satname; series groups by member count desc then key asc; members by satname.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildWordSet, classifySatname } from "./named-sat-classify";
import {
  buildSections,
  entryFromClassification,
  mergeEntries,
  nextCursor,
  shouldAdvanceCursor,
} from "./named-sats-snapshot";

const words = buildWordSet(["ghost", "flight", "fields", "excrescence", "friday", "baked", "blues"]);

function make(name: string, source: "osura-bootstrap" | "allowlist" | "delta" = "osura-bootstrap") {
  const classified = classifySatname(name, words);
  const entry = entryFromClassification(name, "1", source, classified);
  if (!entry) throw new Error(`expected entry for ${name}`);
  return entry;
}

describe("named-sats-snapshot", () => {
  it("merges by satname without duplicates", () => {
    const a = make("excrescence");
    const b = { ...make("excrescence", "delta"), inscriptionCount: 2 };
    expect(mergeEntries([a], [b])).toHaveLength(1);
    expect(mergeEntries([a], [b])[0]?.inscriptionCount).toBe(2);
  });

  it("builds single, series, and leftover pair sections", () => {
    const entries = [
      make("excrescence"),
      make("ghostflight"),
      make("ghostfields"),
      make("fridaybaked"),
      make("fridayblues"),
    ];
    // force a lonely pair that cannot form a series of size >= 2
    const lonely = entryFromClassification(
      "onlypairxx",
      "2",
      "delta",
      { kind: "pair", parts: ["only", "pairxx"] },
    );
    const sections = buildSections([...entries, lonely!]);
    expect(sections.singles.map((e) => e.satname)).toContain("excrescence");
    expect(sections.series.map((g) => g.key).sort()).toEqual(["friday", "ghost"]);
    expect(sections.pairs.map((e) => e.satname)).toContain("onlypairxx");
  });

  it("advances cursor only when ok", () => {
    expect(shouldAdvanceCursor(false)).toBe(false);
    expect(shouldAdvanceCursor(true)).toBe(true);
    const prev = {
      lastInscriptionNumber: 10,
      takenAt: "2026-10-01T00:00:00.000Z",
      source: "ordinals.com" as const,
    };
    expect(nextCursor(prev, 20, "2026-10-12T00:00:00.000Z", 900000)).toEqual({
      lastInscriptionNumber: 20,
      tipHeight: 900000,
      takenAt: "2026-10-12T00:00:00.000Z",
      source: "ordinals.com",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/named-sats-snapshot.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `named-sats-snapshot.ts`** to satisfy the tests (use `entryFromClassification`: return `null` on `kind: "none"`; map single/pair kinds; `mergeEntries` keyed by satname with incoming winning overlapping fields).

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/core/named-sat-classify.test.ts src/core/named-sats-snapshot.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/named-sats-snapshot.ts src/core/named-sats-snapshot.test.ts
git commit -m "$(cat <<'EOF'
feat: add named-sats snapshot merge and section builders

EOF
)"
```

---

### Task 3: Check in bootstrap fixtures (names, allowlist, wordlist stub)

**Files:**
- Create: `src/app/inscriptions-on-satnames/data/osura-bootstrap-names.json`
- Create: `src/app/inscriptions-on-satnames/data/named-sats-allowlist.json`
- Create: `scripts/named-sats/wordlist.txt` (start with a minimal set that covers tests + allowlist classification needs; expand later for real deltas)
- Create: `src/app/inscriptions-on-satnames/data/fixtures.test.ts` (asserts fixture invariants)

**Interfaces:**
- Consumes: none
- Produces: committed JSON arrays / wordlist file

- [ ] **Step 1: Write failing fixture test**

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataDir = path.join(__dirname);

describe("named-sats fixtures", () => {
  it("has 334 unique Osura bootstrap names and required allowlist", () => {
    const names = JSON.parse(
      readFileSync(path.join(dataDir, "osura-bootstrap-names.json"), "utf8"),
    ) as string[];
    const allow = JSON.parse(
      readFileSync(path.join(dataDir, "named-sats-allowlist.json"), "utf8"),
    ) as string[];
    expect(names).toHaveLength(334);
    expect(new Set(names).size).toBe(334);
    expect(allow).toEqual(expect.arrayContaining(["agooddoctor", "cyclisation"]));
    expect(names).not.toContain("blobnwthems");
    expect(allow).not.toContain("blobnwthems");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run src/app/inscriptions-on-satnames/data/fixtures.test.ts`

- [ ] **Step 3: Write fixture files**

`named-sats-allowlist.json`:

```json
["agooddoctor", "cyclisation"]
```

`osura-bootstrap-names.json`: JSON array of the 334 Osura names (export from `https://explore.osura.com/sats/names` links matching `/sat/{name}` — already verified count 334). Include every name from that page; do not include `blobnwthems`.

`scripts/named-sats/wordlist.txt`: one word per line, lowercase a–z. At minimum include words needed to classify common Osura pairs during bootstrap enrichment (e.g. ghost, flight, friday, baked, …) plus whatever is needed so allowlist names can optionally classify. For names that remain `none` under the wordlist, bootstrap will still keep them via allowlist/osura path (see Task 4).

- [ ] **Step 4: Run fixture test — PASS**

- [ ] **Step 5: Commit**

```bash
git add src/app/inscriptions-on-satnames/data scripts/named-sats/wordlist.txt
git commit -m "$(cat <<'EOF'
chore: add Osura bootstrap names and named-sats allowlist fixtures

EOF
)"
```

---

### Task 4: Ordinals fetch helpers + bootstrap script

**Files:**
- Create: `scripts/named-sats/ordinals.ts`
- Create: `scripts/named-sats/bootstrap.ts`
- Modify: `package.json` — add `"named-sats:bootstrap": "npx tsx scripts/named-sats/bootstrap.ts"`
- Create: `scripts/named-sats/ordinals.test.ts` for pure response parsers only

**Interfaces:**
- Consumes: `satnameToSat` from `src/core/satname`; classify + snapshot helpers from core; fixture JSON paths
- Produces:
  - `extractInscriptionIdFromSatResponse(payload: unknown): string | null` (may reuse discovery.ts logic — prefer importing from `src/app/inscriptions-on-satnames/discovery.ts` or extract shared parser into `src/lib/ordinals-sat.ts` if importing app from scripts is awkward)
  - `fetchSatInscriptions(sat: bigint, signal?: AbortSignal): Promise<{ ids: string[] }>`
  - `bootstrapNamedSatsSnapshot(options?: { enrich?: boolean }): Promise<void>` writing:
    - `named-sats-snapshot.json`
    - `named-sats-cursor.json` with `lastInscriptionNumber` set from optional `--cursor N` CLI flag (required for first run; document default: operator passes current tip inscription number from ordinals.com)

Bootstrap algorithm:
1. Read `osura-bootstrap-names.json` + `named-sats-allowlist.json` + wordlist.
2. For each unique satname (osura ∪ allowlist): compute sat string via `satnameToSat`.
3. Classify with wordlist. If Osura/allowlist name classifies as none, still include as `{ kind: "single", source }` **only for allowlist**; for Osura bootstrap names that fail classify, still include using best effort: if pair split fails and not single, store as `kind: "single"` with `source: "osura-bootstrap"` so Osura membership is preserved (Osura already decided they are named sats).
4. If `enrich` (default true): `GET https://ordinals.com/r/sat/{sat}` with Accept JSON; set `primaryInscriptionId` / `inscriptionCount` when present; backoff on 429.
5. `mergeEntries` → `buildSections` is UI-side; snapshot file stores **flat `entries: NamedSatEntry[]`** plus `meta: { generatedAt, bootstrapSource: "osura+allowlist" }`.
6. Write cursor JSON (from `--cursor`).

Snapshot file shape:

```ts
{
  meta: { generatedAt: string; bootstrapSource: string };
  entries: NamedSatEntry[];
}
```

- [ ] **Step 1: Write parser unit test** for sat response extraction (fail then implement).

- [ ] **Step 2: Implement `ordinals.ts` + `bootstrap.ts`.**

CLI:

```bash
npm run named-sats:bootstrap -- --cursor 125283379
# optional: --no-enrich
```

Use ISO `generatedAt` / cursor `takenAt` only inside scripts (not core).

- [ ] **Step 3: Run bootstrap once locally** (network). Verify:
  - snapshot contains `agooddoctor`, `cyclisation`
  - snapshot does not contain `blobnwthems`
  - entry count ≥ 334

- [ ] **Step 4: Add assert test** reading the committed snapshot after bootstrap (skip if file missing in fresh clones — prefer committing the generated snapshot in this task).

- [ ] **Step 5: Commit** generated snapshot + cursor + scripts

```bash
git add scripts/named-sats package.json src/app/inscriptions-on-satnames/data/named-sats-snapshot.json src/app/inscriptions-on-satnames/data/named-sats-cursor.json
git commit -m "$(cat <<'EOF'
feat: bootstrap named-sats snapshot from Osura list and allowlist

EOF
)"
```

---

### Task 5: Monthly delta script

**Files:**
- Create: `scripts/named-sats/delta.ts`
- Modify: `scripts/named-sats/ordinals.ts` — add inscription paging helpers
- Modify: `package.json` — `"named-sats:delta": "npx tsx scripts/named-sats/delta.ts"`
- Create: `scripts/named-sats/delta-logic.test.ts` for pure “filter new names” helper if extracted

**Interfaces:**
- Consumes: snapshot + cursor + wordlist + allowlist; `classifySatname`; `mergeEntries`
- Produces: updated snapshot + cursor on success

Ordinals.com strategy (v1):
1. Read cursor `lastInscriptionNumber`.
2. Discover latest inscription number: `GET https://ordinals.com/r/inscriptions` → first id → `GET https://ordinals.com/r/inscription/{id}` JSON and read numeric `number` / `inscription_number` field (inspect actual payload; write a narrow type guard).
3. For each inscription number `n` from `last + 1` … `latest` (inclusive), fetch inscription JSON; read `sat` field; if missing, skip; compute name via existing core **sat → name** (`satToName` from `src/core/sat-math.ts` — verify export; if only `nameToSat` exists, add `satToName` usage from sat-math).
4. Skip if satname already in snapshot entries.
5. Classify; if `none` and not allowlist, skip; if allowlist hit or classified, append entry `source: "delta"` with `firstSeenInscriptionNumber: n`.
6. Concurrency limit 2–4; exponential backoff on 429/503; on any unrecoverable error: exit non-zero **without writing cursor**.
7. On full success: write snapshot + `nextCursor(...)`.

Add CLI flags: `--dry-run`, `--max N` (process at most N new inscriptions — useful for testing).

- [ ] **Step 1: Confirm `satToName` (or equivalent) in `src/core/sat-math.ts`; add export + test if missing.**

- [ ] **Step 2: Write failing tests for any pure helpers (e.g. `collectDeltaCandidates`).**

- [ ] **Step 3: Implement delta script + wire npm script.**

- [ ] **Step 4: Dry-run locally** with `--max 20` against live ordinals.com; confirm cursor unchanged on dry-run.

- [ ] **Step 5: Commit**

```bash
git add scripts/named-sats package.json src/core/sat-math.ts src/core/sat-math.test.ts
git commit -m "$(cat <<'EOF'
feat: add monthly named-sats delta scanner via ordinals.com

EOF
)"
```

---

### Task 6: Strip All-tab registry entries; keep ORD FATHER; relocate Blobs data

**Files:**
- Modify: `src/app/inscriptions-on-satnames/registry.ts` — remove entries with `tabs: ["all"]` (`agooddoctor`, `blobnwthems`, `excrescence`, `cyclisation`, `ecofriendly`). Keep ORD FATHER tree intact.
- Create: `src/app/named-collection-series/blobs.ts` — move `blobnwthems` editorial object (including `childBrowser`) here as `blobsCollection`.
- Modify: `src/app/inscriptions-on-satnames/registry.test.ts` — drop All-tab expectations; keep ORD FATHER tests; move blob childBrowser assertions to `blobs.test.ts`.
- Modify: `src/app/inscriptions-on-satnames/registry.ts` `REGISTRY_TABS` note for `all` to describe Osura-style snapshot sections.
- Update `findRegistryEntryBySatname` / discovery “tracked” messaging as needed so ORD FATHER + nested children still resolve; blob lookup moves to collection module helper `findCollectionSatname`.

- [ ] **Step 1: Rewrite failing tests first** (All tab empty from registry; blob metadata tested via `blobs.ts`).

- [ ] **Step 2: Run tests — FAIL**

- [ ] **Step 3: Move data + update registry**

- [ ] **Step 4: Run `npx vitest run src/app/inscriptions-on-satnames/registry.test.ts src/app/named-collection-series/blobs.test.ts` — PASS**

- [ ] **Step 5: Commit**

```bash
git add src/app/inscriptions-on-satnames/registry.ts src/app/inscriptions-on-satnames/registry.test.ts src/app/named-collection-series
git commit -m "$(cat <<'EOF'
refactor: remove All-tab registry cards; relocate Blobs collection data

EOF
)"
```

---

### Task 7: All-tab Osura-style snapshot UI

**Files:**
- Create: `src/app/inscriptions-on-satnames/snapshot.ts` — load/parse committed snapshot JSON; `getSnapshotSections()` wrapping `buildSections`
- Create: `src/app/inscriptions-on-satnames/snapshot.test.ts`
- Create: `src/app/inscriptions-on-satnames/snapshot-view.tsx` — render intro + Single words / Series / Two-word names; support Table/Compact/Large lightly (Table = rows; Compact = dense chips/tiles; Large = cards with satname + split + ordinals link)
- Modify: `src/app/inscriptions-on-satnames/page.tsx` — when `activeTab === "all"`, render `SnapshotView` instead of `RegistryPanel`/`RegistryView`
- Modify: `src/app/globals.css` — section styles (match existing design tokens; no new purple/glow aesthetic)
- Modify: view-mode tests if they assumed All-tab registry entries

Item link target: `https://ordinals.com/inscription/{primaryInscriptionId}` when present, else `https://ordinals.com/sat/{sat}`.

Intro copy must include snapshot `meta.generatedAt` and counts from sections; mention cursor inscription number from `named-sats-cursor.json` import.

Footnote: `Includes curated extras: agooddoctor, cyclisation.`

- [ ] **Step 1: Write snapshot loader tests** (allowlist names present; blob absent).

- [ ] **Step 2: Implement loader + SnapshotView + page branch.**

- [ ] **Step 3: `npm test` && `npx tsc --noEmit`**

- [ ] **Step 4: Manually `npm run dev`** — open All tab; confirm three sections.

- [ ] **Step 5: Commit**

```bash
git add src/app/inscriptions-on-satnames src/app/globals.css
git commit -m "$(cat <<'EOF'
feat: render All Named Sats tab from Osura-style snapshot sections

EOF
)"
```

---

### Task 8: Named Collection Series pages (Blobs first)

**Files:**
- Create: `src/app/named-collection-series/page.tsx` — index listing Blobs
- Create: `src/app/named-collection-series/blobs/page.tsx` — Blobs detail using `blobs.ts` (preview iframe pattern from inscriptions page; child browser CTA)
- Modify: `src/app/inscriptions-on-satnames/page.tsx` — nav link “Named collection series”
- Modify: `src/app/page.tsx` — optional secondary link next to inscriptions link
- Create: smoke test importing blobs page data

Routes (static export + `trailingSlash`):
- `/named-collection-series/`
- `/named-collection-series/blobs/`

- [ ] **Step 1: Add blobs page data test (childBrowser preserved).**

- [ ] **Step 2: Implement pages + links.**

- [ ] **Step 3: `npm run build`** — confirm `out/named-collection-series/index.html` and `out/named-collection-series/blobs/index.html` exist.

- [ ] **Step 4: Commit**

```bash
git add src/app/named-collection-series src/app/inscriptions-on-satnames/page.tsx src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat: add Named Collection Series pages for Blobs

EOF
)"
```

---

### Task 9: Docs + operator runbook

**Files:**
- Modify: `README.md` — document All-tab snapshot, bootstrap/delta commands, monthly cadence
- Modify: `AGENTS.md` — note public deploy caution; list `named-sats:*` scripts

README section draft to include:

```markdown
### Named sats snapshot (All tab)

Bootstrap (once):

npm run named-sats:bootstrap -- --cursor <inscriptionNumber>

Monthly delta:

npm run named-sats:delta
npm run named-sats:delta -- --dry-run --max 50

Then commit updated `named-sats-snapshot.json` + `named-sats-cursor.json`, build, and deploy.
```

- [ ] **Step 1: Update README + AGENTS.md**

- [ ] **Step 2: Commit**

```bash
git add README.md AGENTS.md
git commit -m "$(cat <<'EOF'
docs: document named-sats snapshot bootstrap and monthly delta

EOF
)"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run full suite**

```bash
npm test
npx tsc --noEmit
npm run build
```

Expected: all green; static export succeeds.

- [ ] **Step 2: Checklist against spec**

- All tab Osura-style sections from snapshot  
- `agooddoctor` + `cyclisation` on All  
- `blobnwthems` not on All; present under Named Collection Series  
- ORD FATHER unchanged  
- Cursor fail-closed documented in delta script  
- No full rescan from 0  

- [ ] **Step 3: If anything failed, fix in a follow-up commit (do not amend unless hook auto-modified files per repo rules)**

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| Osura bootstrap + allowlist | 3, 4 |
| All tab replace with Osura sections | 6, 7 |
| Monthly ordinals.com delta + cursor | 5 |
| Never rescan from 0 / fail-closed cursor | 2, 5 |
| Drop analysis dispositions | 6, 7, 8 |
| Blobs Named Collection Series page | 6, 8 |
| ORD FATHER unchanged | 6 |
| Static export / GitHub Pages | 8, 10 |
| Tests + README | 1–5, 9–10 |

## Placeholder scan

No TBD / “implement later” steps. Concrete commands, types, and file paths included.

## Type consistency

Shared names: `NamedSatEntry`, `NamedSatsCursor`, `NamedSatsSections`, `classifySatname`, `buildSections`, `mergeEntries`, `nextCursor`, `shouldAdvanceCursor` — used identically across tasks.
