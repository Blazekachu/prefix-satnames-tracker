# Named Sats Snapshot (Osura-Style) Design

Date: 2026-10-12  
Project: Prefix Satnames Tracker

## Goal

Replace the **All Named Sats Tracked Yet** tab on `/inscriptions-on-satnames` with an Osura-style curated list built from:

1. A one-time bootstrap of [Osura Explore Named sats](https://explore.osura.com/sats/names) (334 names from the 2 October 2026 full inscribed-sat snapshot), plus explicit allowlist extras.
2. Monthly **incremental** scans of **new inscriptions only** via public `ordinals.com` recursive endpoints — never rescan from inscription 0.

Also add a separate **Named Collection Series** page starting with the Blobs collection (`blobnwthems`), which leaves the All tab.

ORD FATHER tab stays unchanged.

## Decisions Locked

| Topic | Choice |
|-------|--------|
| Approach | Static snapshot JSON + thin monthly CLI (Approach 1) |
| Bootstrap source | Osura published name list |
| Monthly delta source | Public `ordinals.com` (`B`) |
| All tab content | Replace with Osura-style sections only (`A`) |
| Allowlist on All tab | `agooddoctor`, `cyclisation` |
| Blobs | New Named Collection Series page — not on All tab |
| Full rescan | Never; cursor advances only |

## Drop / Keep Analysis (bootstrap)

Compared curated registry satnames to Osura’s 334:

**Present in Osura (appear on new All tab via bootstrap):**  
`falsecolors`, `badgertooth`, `zonefruits`, `abysscalled`, `cactusseeds`, `carpetyarns`, `ghostflight`, `breathelast`, `daddyplease`, `cargobroker`, `acquisitive`, `mixnetworks`, `highwaystar`, `excrescence`, `ecofriendly`

**Not in Osura:**

| Satname | Disposition |
|---------|-------------|
| `agooddoctor` | **Keep on All** via allowlist |
| `cyclisation` | **Keep on All** via allowlist |
| `blobnwthems` | **Leave All**; ship on Named Collection Series (Blobs) |
| `necrowizard` | Not on All; **stays on ORD FATHER** under `falsecolors` |
| `hazasvignzf` | Not on All; **stays on ORD FATHER** under `cargobroker` |
| `ezcubunuovm` | Root context only; **stays as ORD FATHER root** |

## Architecture

Three layers:

1. **Offline snapshot pipeline** (Node scripts)  
   Bootstrap + monthly delta. Writes committed static artifacts. Network I/O lives only in scripts.

2. **Static page consumers**  
   - `/inscriptions-on-satnames` — ORD FATHER unchanged; All tab reads snapshot only.  
   - `/named-collection-series` — editorial collection index; Blobs first.

3. **Pure core**  
   Existing `src/core` name ↔ sat math reused. Classification / merge logic should be pure and unit-tested (either under `src/core/` or `scripts/named-sats/` with colocated tests). Live discovery bar may remain; it must not mutate the snapshot.

```text
Osura names + allowlist ──► bootstrap ──► named-sats-snapshot.json
                                              ▲
ordinals.com new inscriptions ──► delta ──────┘
                                              │
                         named-sats-cursor.json (last inscription #)

All tab ◄── snapshot.json
Blobs page ◄── collections/blobs (separate editorial data)
ORD FATHER ◄── existing registry.ts (unchanged)
```

## Data Model

### Artifacts (committed)

Suggested paths under `src/app/inscriptions-on-satnames/data/`:

| File | Role |
|------|------|
| `named-sats-snapshot.json` | All-tab source of truth |
| `named-sats-cursor.json` | Incremental scan cursor |
| `named-sats-allowlist.json` | Forced inclusions (`agooddoctor`, `cyclisation`, …) |
| Wordlist (e.g. `english-words.txt` or under `scripts/named-sats/`) | Used for **delta** classification |

Blob collection data lives separately (typed module or JSON under e.g. `src/app/named-collection-series/`).

### Cursor

```ts
{
  lastInscriptionNumber: number;
  tipHeight?: number;
  takenAt: string; // ISO timestamp
  source: "ordinals.com";
}
```

Rules:

- Advance cursor only after a successful, complete delta run.
- On partial failure / rate-limit abort: do **not** advance cursor.
- Re-running with an already-caught-up cursor is a no-op.

### Snapshot entry

```ts
{
  satname: string;
  sat: string; // decimal string (bigint-safe)
  kind: "single" | "pair" | "series-member";
  parts?: [string, string];
  seriesKey?: string;
  inscriptionCount?: number;
  primaryInscriptionId?: string;
  firstSeenInscriptionNumber?: number;
  source: "osura-bootstrap" | "allowlist" | "delta";
}
```

### Classification (Danny-shaped)

For each candidate satname (`a–z` only, valid sat name):

1. If the whole name is in the wordlist → **single**.
2. Else try all split points; if both halves are in the wordlist → **pair** (record `parts`).
3. After the full set is known, cluster pairs that share the same leading word into **series** when the group has ≥ 2 names (`seriesKey` = leading word; members become `series-member`).
4. Remaining pairs that are not part of a multi-name series go in the **Two-word names** section.
5. Allowlist names are always included even if they fail the wordlist; place them in the best-fitting section when classification succeeds, otherwise still list them (prefer fitting as single/pair when possible).

Bootstrap prefers Osura’s published membership for the initial 334. The wordlist’s primary job is classifying **new** delta names consistently.

## All-Tab Sections (Osura-Style)

1. **Intro** — snapshot date, counts (single / series groups / two-word), cursor inscription number.
2. **Single words** — whole name is one dictionary word.
3. **Series** — groups by `seriesKey`, sorted by group size then name (e.g. `friday… 8 names`).
4. **Two-word names** — valid dictionary splits not folded into a series group.

Optional quiet footnote: curated extras `agooddoctor`, `cyclisation`.

View modes (Table / Compact / Large) continue to apply where sensible.

## Snapshot Pipeline

### Bootstrap (one-time)

1. Import Osura’s 334 names (`source: "osura-bootstrap"`).
2. For each name: `satname → sat` via core math; optional `GET https://ordinals.com/r/sat/{sat}` for inscription id/count.
3. Merge allowlist the same way (`source: "allowlist"`).
4. Classify + build sections → write `named-sats-snapshot.json`.
5. Write initial `named-sats-cursor.json` to the tip / inscription watermark used at bootstrap time so deltas never go backwards.

Assert:

- Allowlist names present.
- `blobnwthems` absent from All snapshot.
- Section shape matches Osura-style (counts need not be identical to Osura if wordlist/enrichment differs slightly; bootstrap names themselves must match the published list plus allowlist).

### Monthly delta

CLI e.g. `npm run named-sats:delta`:

1. Read cursor.
2. Page newer inscriptions from `ordinals.com` until tip (e.g. `/r/inscriptions/{page}` and/or inscription-number based fetch as available).
3. For each **new** inscription: resolve sat → name; skip if satname already in snapshot.
4. Wordlist classify (or allowlist hit) → merge.
5. Recompute series groupings from the full snapshot (cheap at hundreds of rows).
6. On full success: bump cursor + `takenAt`; write files.
7. Human reviews diff → commit → `npm run build` → deploy (existing GitHub Pages flow).

### Guarantees

- Never rescan from inscription 0.
- Idempotent when already at tip.
- Rate-limit + retries; fail closed on cursor.
- No GitHub Action auto-PR in v1 (optional later).

## UI

### `/inscriptions-on-satnames`

- Tabs: **Named Sats by ORD FATHER** | **All Named Sats Tracked Yet**.
- Discovery bar may remain; does not write snapshot.
- **All tab** renders snapshot sections only (no old manual All-tab registry cards).
- Each item: satname, optional `word · word` split, inscription count/link when known, links to ordinals / existing destinations.

### `/named-collection-series`

- Index of named collection series.
- First series: **Blobs** — `blobnwthems` plus parent/children facts already documented in the registry / blob panel work.
- Linked from the inscriptions page (and optionally home).
- Editorial/collection UI — not wordlist output.

### ORD FATHER

Unchanged, including nested descendants and root context.

## Testing

- Pure unit tests: classify, series grouping, allowlist merge, cursor advance / fail-closed, snapshot schema.
- Bootstrap checks: allowlist present; `blobnwthems` not on All snapshot; ORD FATHER registry helpers unchanged.
- `npm test`, `npx tsc --noEmit`, `npm run build`.

## Rollout Order

1. This spec + implementation plan.
2. Bootstrap script + data artifacts (UI can still be old until rewired).
3. Rewire All tab to Osura-style sections.
4. Ship Named Collection Series (Blobs).
5. Document monthly delta in README / AGENTS.md.

## Out Of Scope (v1)

- Full re-scan of all ~125M inscribed sats.
- Auto-merge PRs / unattended production deploys.
- Live per-card enrichment on every page load for the whole list.
- Expanding Named Collection Series beyond Blobs (structure should allow more later).
- Changing ORD FATHER curation model.

## Risks

| Risk | Mitigation |
|------|------------|
| `ordinals.com` rate limits | Backoff; do not advance cursor on failure |
| Wordlist ≠ Osura for deltas | Bootstrap from Osura names; document wordlist choice for deltas |
| Missed allowlist names | Explicit allowlist file + bootstrap asserts |
| Blob disappearance from All | Dedicated collection page + nav link |

## Success Criteria

- All tab shows Osura-style Single / Series / Two-word sections from committed snapshot.
- `agooddoctor` and `cyclisation` appear on All tab.
- `blobnwthems` is not on All tab; Blobs live under Named Collection Series.
- ORD FATHER behavior unchanged.
- Monthly update path only processes inscriptions newer than cursor.
- Site remains static-export compatible (GitHub Pages).
