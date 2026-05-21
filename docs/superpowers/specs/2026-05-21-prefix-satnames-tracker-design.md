# Prefix Satnames Tracker — Design

**Date:** 2026-05-21
**Status:** Approved design — ready for implementation planning

## Goal

Given a sat-name prefix (e.g. `bhang`), enumerate every **series** for that prefix —
from the longest 11-letter names down to the prefix itself as a single targeted sat —
and report each series' sat ranges, the Bitcoin blocks those ranges fall in, and
whether each block is already mined or a future unmined block.

The tool is pure computation plus one small live lookup (current tip height). No
database, no indexing, no tracing.

## Background: how sat names work

Ordinal theory assigns every sat a name via `x = SUPPLY - sat`, where `x` is encoded
base-26 (`a`=1 … `z`=26). `SUPPLY = 2,099,999,997,690,000`.

- Sat numbers count **forward in time**. Sat `0` is the genesis sat (2009); the last
  sat ever is `SUPPLY - 1 = 2,099,999,997,689,999` (~year 2140).
- Because `x` shrinks as `sat` grows: **earliest sats have the longest (11-letter)
  names; the latest sat has the shortest name, `"a"`.**
- As the chain advances: sat number increases, name length decreases (11 → 10 → … → 1).

### Prefix series

For a prefix `P` of length `L_p`, a **series** is the set of all names of one fixed
length that share `P`:

- Series 1 = 11-letter names (`P` + `(11 - L_p)` suffix chars) — earliest in time,
  lowest sat numbers.
- Series 2 = 10-letter names — later, higher sat numbers.
- … each later series has a shorter name, higher sat numbers, higher block height.
- Final series = `P` itself as a name — a single targeted sat, far-future.

Number of series for a prefix = `12 - L_p` (e.g. `bhang`, length 5 → 7 series,
name lengths 11 down to 5).

Within one series, names run from `P + "aa…a"` to `P + "zz…z"`; the `"aa…a"` name has
the larger sat number. A series of name length `L` contains exactly `26^(L - L_p)`
names (= sats), one contiguous sat range.

### Existence rule

A name exists only if its sat lands in `[0, SUPPLY - 1]` (equivalently `x ∈ [1, SUPPLY]`).

- A series whose entire range falls beyond supply (`satEnd < 0`) **is not a series** —
  it is dropped silently, with no error, no negative numbers, no flag.
- For exactly one prefix per name length, a series' block of names straddles the
  supply boundary: some names exist, some do not. Such a series keeps **only its
  existing portion** — `satStart` is clamped to `0` — consistent with the same rule.
- A prefix with zero existing series is not an error; the report simply has
  `seriesCount: 0`.

## Approach

**Approach A — pure client-side computation, one shared `core/`, two faces.**

Every computation (series enumeration, sat ranges, block segmentation, mined/future
classification) is a pure function. The only I/O is fetching the current tip height.
A Next.js web app and a CLI both consume the same `core/` module and render the same
report object. The web build is statically exportable (no server, no API routes, no DB).

This mirrors `bhang-tracker`'s structure minus its entire `indexer/`, `db/`, and
`providers/` layer.

## Architecture

```
prefix-satnames-tracker/
  src/
    core/                 pure, no I/O, fully unit-tested
      sat-math.ts         SUPPLY, nameToSat, satToName, satToBlock,
                          blockFirstSat, blockSubsidy
      prefix.ts           validatePrefix
      series.ts           buildSeries
      segments.ts         splitIntoBlocks
      forecast.ts         classifyBlock, estimateDate
      report.ts           buildReport — assembles a PrefixReport
    lib/
      tip.ts              fetchTipHeight (the only I/O)
    app/                  Next.js page (statically exportable)
  scripts/
    cli.ts                CLI entry point
  docs/superpowers/specs/
```

### Module responsibilities

| Module | Does | Depends on |
|--------|------|-----------|
| `sat-math.ts` | name ↔ sat conversion, sat → block, block subsidy/first-sat | — |
| `prefix.ts` | validate prefix input | — |
| `series.ts` | enumerate series for a prefix, apply existence rule | `sat-math` |
| `segments.ts` | split a sat range into per-block segments | `sat-math` |
| `forecast.ts` | mined/future classification, future date estimate | — |
| `report.ts` | assemble the full `PrefixReport` | all `core/` |
| `lib/tip.ts` | fetch current tip height | network |
| `app/` | web UI: input, render report | `core`, `lib/tip` |
| `scripts/cli.ts` | CLI: parse args, render report | `core`, `lib/tip` |

## Data model

```ts
interface BlockSegment {
  height: number;
  satRangeStart: bigint;
  satRangeEnd: bigint;
  satCount: bigint;
  status: "mined" | "future";
  estimatedDate?: string;   // ISO date, future blocks only
  estimatedYear?: string;   // future blocks only
}

interface BlockSummary {        // used when a series spans > 10 blocks
  startHeight: number;
  endHeight: number;
  blockCount: number;
  status: "mined" | "future" | "partial";
}

interface Series {
  id: number;                 // 1 = 11-letter names
  nameLength: number;
  firstName: string;          // existing-portion first name
  lastName: string;
  satStart: bigint;
  satEnd: bigint;
  satCount: bigint;
  overallStatus: "mined" | "future" | "partial";
  blockSegments?: BlockSegment[];   // present when <= 10 blocks
  blockSummary?: BlockSummary;      // present when > 10 blocks
}

interface PrefixReport {
  prefix: string;
  prefixLength: number;
  seriesCount: number;
  tipHeight: number;
  series: Series[];           // Series 1 first (earliest / longest names)
}
```

## Behavior details

### Tip height

- `lib/tip.ts` fetches `https://mempool.space/api/blocks/tip/height`.
- Web: called client-side on submit. CLI: called on run.
- CLI `--tip <height>` overrides the fetch (offline use).
- On failure: one retry with short backoff, then — CLI errors out and suggests
  `--tip`; web shows a "couldn't reach mempool.space" message with a manual
  tip-height input as fallback.

### Block classification

- `classifyBlock(height, tip)` → `"mined"` if `height <= tip`, else `"future"`.
- `estimateDate(height, tip)` for future blocks → `now + (height - tip) * 10 min`,
  returning an ISO date and year.
- Mined blocks show no real timestamp (that would need a per-block API call) — only
  future blocks carry an estimated date.

### Many-block collapse

`splitIntoBlocks` always computes true per-block segments. The report layer collapses
any series spanning **more than 10 blocks** into a single `BlockSummary` instead of a
long segment list (e.g. a short 1–3 letter prefix's 11-letter series can span tens of
thousands of blocks). Series within the threshold keep full per-block detail. A CLI
`--no-collapse` flag and a web "show all blocks" expander force full detail.

## Interfaces

### CLI

```
npx tsx scripts/cli.ts <prefix> [--tip N] [--json] [--no-collapse]
```

- Default: readable table — one block per series, indented per-block segment
  sub-rows showing height, sat sub-range, sat count, and `✓ mined` /
  `⧗ future ~YYYY`.
- `--json`: prints the raw `PrefixReport`.
- Invalid prefix: one-line error to stderr, exit code 1.
- `package.json` exposes this as `npm run prefix`.

### Web

- Next.js page, statically exportable.
- Prefix input box + submit. On submit: validate → fetch tip → compute → render.
- One card per series, Series 1 at top (earliest / longest names). Each card shows
  first/last name, sat range, sat count, and the block-segment table.
- Mined vs future segments visually distinguished (solid vs. dimmed/badged with
  estimated year). Collapsed series show the summary row with a "show all blocks"
  expander.
- Invalid prefix → inline error under the input.

## Error handling

| Case | Handling |
|------|----------|
| Invalid prefix (empty, uppercase, digit, space, > 11 chars) | `validatePrefix` rejects before compute. CLI: stderr + exit 1. Web: inline error. |
| Tip fetch fails | One retry + backoff, then CLI errors (suggests `--tip`); web offers manual tip input. |
| Prefix with zero existing series | Not an error. Report `seriesCount: 0` + plain "no real series exist" message. |
| Series straddling supply boundary | Keep existing portion only; `satStart` clamped to 0. |

## Testing

`vitest`, mirroring `bhang-tracker`.

- **`sat-math`** — `nameToSat`/`satToName` round-trip; `nameToSat("a") === SUPPLY - 1n`;
  `satToName(0n)` is 11 chars.
- **`series`** — `buildSeries("bhang")` yields 7 series, name lengths 11→5; Series 1
  must match the BHANG spec exactly: `satStart 1,773,906,020,861,562`,
  `satEnd 1,773,906,329,777,337`, `satCount 308,915,776`.
- **existence** — a high prefix (`zzz…`) drops out-of-supply series; a known straddle
  prefix keeps only its existing portion.
- **`segments`** — BHANG Series 1 splits into blocks `579,124` + `579,125`; collapse
  triggers past 10 blocks.
- **`prefix`** — rejects uppercase, digits, empty, spaces, and prefixes longer than
  11 chars.

## Tech stack

TypeScript, Next.js 16, React 19, Tailwind 4, `tsx`, `vitest`. No `better-sqlite3`,
no database, no API routes.

## Project setup

- Folder: `prefix-satnames-tracker/` — a new directory (no spaces in path).
- Own `git init`.
- `package.json` scripts: `dev`, `build`, `test`, `prefix` (= `tsx scripts/cli.ts`).
- `sat-math` functions are copied from `bhang-tracker` and adapted (added
  `blockFirstSat`, `blockSubsidy`). The two projects are otherwise independent.

## Out of scope (YAGNI)

- Sat tracing / following sats through transactions (that is `bhang-tracker`'s job).
- Any database or persistence.
- Real mined-block timestamps (only future-block estimates are shown).
- Multi-prefix or batch queries.
