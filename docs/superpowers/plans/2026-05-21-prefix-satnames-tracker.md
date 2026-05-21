# Prefix Satnames Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tool that, given a sat-name prefix, enumerates every series for that prefix and reports each series' sat ranges, the Bitcoin blocks they fall in, and whether each block is mined or a future unmined block — exposed as both a CLI and a static web app.

**Architecture:** All computation is pure functions in `src/core/` (no I/O), consumed by both a CLI (`scripts/cli.ts`) and a Next.js web page (`src/app/`). The only I/O is fetching the current tip height from mempool.space (`src/lib/tip.ts`). No database, no API routes; the web build is a static export.

**Tech Stack:** TypeScript, Next.js 16, React 19, Tailwind 4, `tsx`, `vitest`.

**Reference:** Design spec at `docs/superpowers/specs/2026-05-21-prefix-satnames-tracker-design.md`.

---

## File Structure

```
prefix-satnames-tracker/
  package.json            scripts + deps
  tsconfig.json
  next.config.ts          static export config
  postcss.config.mjs
  vitest.config.ts
  .gitignore
  src/
    core/                 pure, no I/O
      sat-math.ts         SUPPLY, nameToSat, satToName, satToBlock, blockFirstSat, blockSubsidy
      prefix.ts           validatePrefix
      series.ts           buildSeriesRanges
      segments.ts         splitIntoBlocks
      forecast.ts         classifyBlock, estimateDate
      report.ts           buildReport, PrefixReport
    lib/
      format.ts           formatBigInt (number grouping)
      tip.ts              fetchTipHeight (the only network I/O)
    cli/
      render.ts           renderText (pure: PrefixReport -> string)
    app/
      layout.tsx
      globals.css
      page.tsx            client component: input -> report -> cards
  scripts/
    cli.ts                CLI entry: argv + fetch + print
```

---

## Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "prefix-satnames-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "prefix": "npx tsx scripts/cli.ts"
  },
  "dependencies": {
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts
.DS_Store
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: completes with no errors; `node_modules/` created.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs vitest.config.ts .gitignore
git commit -m "chore: scaffold prefix-satnames-tracker project"
```

---

## Task 2: Core — `sat-math.ts`

Pure ordinal-theory math. Adapted from `bhang-tracker`'s `sat-math.ts`, with two added helpers (`blockFirstSat`, `blockSubsidy`).

**Files:**
- Create: `src/core/sat-math.ts`
- Test: `src/core/sat-math.test.ts`

- [ ] **Step 1: Write the failing test**

`src/core/sat-math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  SUPPLY,
  nameToSat,
  satToName,
  satToBlock,
  blockFirstSat,
  blockSubsidy,
} from "./sat-math";

describe("nameToSat / satToName", () => {
  it("maps 'a' to the last sat ever", () => {
    expect(nameToSat("a")).toBe(SUPPLY - 1n);
  });

  it("maps sat 0 to an 11-letter name", () => {
    expect(satToName(0n).length).toBe(11);
  });

  it("round-trips names", () => {
    for (const name of ["a", "bhang", "bhangaaaaaa", "bhangzzzzzz", "satoshi"]) {
      expect(satToName(nameToSat(name))).toBe(name);
    }
  });

  it("matches the known BHANG range endpoints", () => {
    expect(nameToSat("bhangaaaaaa")).toBe(1_773_906_329_777_337n);
    expect(nameToSat("bhangzzzzzz")).toBe(1_773_906_020_861_562n);
  });
});

describe("blockSubsidy", () => {
  it("is 50 BTC for epoch 0", () => {
    expect(blockSubsidy(0n)).toBe(5_000_000_000n);
  });
  it("is 12.5 BTC for epoch 2 (block 579124)", () => {
    expect(blockSubsidy(579_124n)).toBe(1_250_000_000n);
  });
});

describe("blockFirstSat / satToBlock", () => {
  it("block 0 starts at sat 0", () => {
    expect(blockFirstSat(0n)).toBe(0n);
  });
  it("satToBlock is the inverse of blockFirstSat at a block boundary", () => {
    expect(satToBlock(blockFirstSat(579_124n))).toBe(579_124n);
  });
  it("places the BHANG range start in block 579124", () => {
    expect(satToBlock(1_773_906_020_861_562n)).toBe(579_124n);
  });
  it("places the BHANG range end in block 579125", () => {
    expect(satToBlock(1_773_906_329_777_337n)).toBe(579_125n);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/sat-math.test.ts`
Expected: FAIL — `Failed to load url ./sat-math` / module not found.

- [ ] **Step 3: Write the implementation**

`src/core/sat-math.ts`:

```ts
export const SUPPLY = 2_099_999_997_690_000n;

const HALVING_INTERVAL = 210_000n;
const INITIAL_SUBSIDY = 5_000_000_000n;

/** Encode a sat number to its ordinal name. */
export function satToName(sat: bigint): string {
  let x = SUPPLY - sat;
  let name = "";
  while (x > 0n) {
    x -= 1n;
    name = String.fromCharCode(Number(x % 26n) + 97) + name;
    x = x / 26n;
  }
  return name;
}

/** Decode an ordinal name to its sat number. May be negative if beyond supply. */
export function nameToSat(name: string): bigint {
  let x = 0n;
  for (const ch of name) {
    x = x * 26n + BigInt(ch.charCodeAt(0) - 97) + 1n;
  }
  return SUPPLY - x;
}

/** Block subsidy (in sats) for a given block height. */
export function blockSubsidy(height: bigint): bigint {
  const epoch = height / HALVING_INTERVAL;
  if (epoch >= 64n) return 0n;
  return INITIAL_SUBSIDY >> epoch;
}

/** The first (lowest) sat number created by a given block. */
export function blockFirstSat(height: bigint): bigint {
  let sat = 0n;
  let subsidy = INITIAL_SUBSIDY;
  let h = 0n;
  for (let epoch = 0; epoch < 64; epoch++) {
    const epochEnd = h + HALVING_INTERVAL;
    if (height < epochEnd) {
      return sat + (height - h) * subsidy;
    }
    sat += HALVING_INTERVAL * subsidy;
    h = epochEnd;
    subsidy /= 2n;
  }
  return sat;
}

/** The block height that created a given sat number. */
export function satToBlock(sat: bigint): bigint {
  let remaining = sat;
  let subsidy = INITIAL_SUBSIDY;
  let height = 0n;
  for (let epoch = 0; epoch < 64; epoch++) {
    const epochSats = HALVING_INTERVAL * subsidy;
    if (remaining < epochSats) {
      return height + remaining / subsidy;
    }
    remaining -= epochSats;
    height += HALVING_INTERVAL;
    subsidy /= 2n;
  }
  return height;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/sat-math.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/sat-math.ts src/core/sat-math.test.ts
git commit -m "feat: add sat-math core (name<->sat, block helpers)"
```

---

## Task 3: Core — `prefix.ts`

**Files:**
- Create: `src/core/prefix.ts`
- Test: `src/core/prefix.test.ts`

- [ ] **Step 1: Write the failing test**

`src/core/prefix.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validatePrefix } from "./prefix";

describe("validatePrefix", () => {
  it("accepts a normal lowercase prefix", () => {
    const r = validatePrefix("bhang");
    expect(r.ok).toBe(true);
  });

  it("accepts a single letter and an 11-letter prefix", () => {
    expect(validatePrefix("a").ok).toBe(true);
    expect(validatePrefix("abcdefghijk").ok).toBe(true);
  });

  it("rejects an empty prefix", () => {
    expect(validatePrefix("").ok).toBe(false);
  });

  it("rejects more than 11 letters", () => {
    expect(validatePrefix("abcdefghijkl").ok).toBe(false);
  });

  it("rejects uppercase, digits, and spaces", () => {
    expect(validatePrefix("BHANG").ok).toBe(false);
    expect(validatePrefix("bh4ng").ok).toBe(false);
    expect(validatePrefix("bh ng").ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/prefix.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/core/prefix.ts`:

```ts
export interface PrefixOk {
  ok: true;
  prefix: string;
}

export interface PrefixError {
  ok: false;
  error: string;
}

export type PrefixResult = PrefixOk | PrefixError;

/** Validate a sat-name prefix: 1-11 lowercase letters a-z. */
export function validatePrefix(input: string): PrefixResult {
  if (input.length === 0) {
    return { ok: false, error: "Prefix cannot be empty." };
  }
  if (input.length > 11) {
    return { ok: false, error: "Prefix cannot be longer than 11 letters." };
  }
  if (!/^[a-z]+$/.test(input)) {
    return { ok: false, error: "Prefix must contain only lowercase letters a-z." };
  }
  return { ok: true, prefix: input };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/prefix.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/prefix.ts src/core/prefix.test.ts
git commit -m "feat: add prefix validation"
```

---

## Task 4: Core — `series.ts`

Enumerate the series for a prefix, applying the existence rule.

**Files:**
- Create: `src/core/series.ts`
- Test: `src/core/series.test.ts`

- [ ] **Step 1: Write the failing test**

`src/core/series.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildSeriesRanges } from "./series";

describe("buildSeriesRanges", () => {
  it("yields 7 series for a 5-letter prefix, name lengths 11 down to 5", () => {
    const series = buildSeriesRanges("bhang");
    expect(series.length).toBe(7);
    expect(series.map((s) => s.nameLength)).toEqual([11, 10, 9, 8, 7, 6, 5]);
    expect(series.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("Series 1 matches the BHANG spec exactly", () => {
    const s1 = buildSeriesRanges("bhang")[0];
    expect(s1.firstName).toBe("bhangaaaaaa");
    expect(s1.lastName).toBe("bhangzzzzzz");
    expect(s1.satStart).toBe(1_773_906_020_861_562n);
    expect(s1.satEnd).toBe(1_773_906_329_777_337n);
    expect(s1.satCount).toBe(308_915_776n);
  });

  it("the final series is the prefix itself as a single sat", () => {
    const series = buildSeriesRanges("bhang");
    const last = series[series.length - 1];
    expect(last.nameLength).toBe(5);
    expect(last.firstName).toBe("bhang");
    expect(last.lastName).toBe("bhang");
    expect(last.satCount).toBe(1n);
  });

  it("an 11-letter prefix yields exactly one single-sat series", () => {
    const series = buildSeriesRanges("abcdefghijk");
    expect(series.length).toBe(1);
    expect(series[0].satCount).toBe(1n);
  });

  it("drops series whose entire range is beyond supply", () => {
    // 'zzz...' prefixes map past SUPPLY; some series do not exist.
    const series = buildSeriesRanges("zzzzz");
    // every returned series must have non-negative, in-supply sats
    for (const s of series) {
      expect(s.satStart >= 0n).toBe(true);
      expect(s.satEnd >= 0n).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/series.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/core/series.ts`:

```ts
import { nameToSat, satToName } from "./sat-math";

export interface SeriesRange {
  /** 1 = 11-letter names; equals 12 - nameLength. */
  id: number;
  nameLength: number;
  /** Alphabetically-first name (prefix + "aa...a"). */
  firstName: string;
  /** Alphabetically-last existing name (prefix + "zz...z", or the clamped boundary). */
  lastName: string;
  /** Lowest in-supply sat of the series (clamped to 0 on a supply straddle). */
  satStart: bigint;
  /** Highest sat of the series. */
  satEnd: bigint;
  satCount: bigint;
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
    const firstName = prefix + "a".repeat(suffixLen);
    let lastName = prefix + "z".repeat(suffixLen);

    // "aa...a" suffix -> smaller x -> larger sat; "zz...z" -> larger x -> smaller sat.
    const satEnd = nameToSat(firstName);
    let satStart = nameToSat(lastName);

    // Existence rule: sats must lie in [0, SUPPLY-1].
    if (satEnd < 0n) {
      continue; // whole series is beyond supply -- not a real series
    }
    if (satStart < 0n) {
      // Supply straddle: keep only the existing portion.
      satStart = 0n;
      lastName = satToName(satStart);
    }

    result.push({
      id: 12 - nameLength,
      nameLength,
      firstName,
      lastName,
      satStart,
      satEnd,
      satCount: satEnd - satStart + 1n,
    });
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/series.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/series.ts src/core/series.test.ts
git commit -m "feat: add series enumeration with existence rule"
```

---

## Task 5: Core — `segments.ts`

Split a series sat range into per-block segments.

**Files:**
- Create: `src/core/segments.ts`
- Test: `src/core/segments.test.ts`

- [ ] **Step 1: Write the failing test**

`src/core/segments.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { splitIntoBlocks } from "./segments";

describe("splitIntoBlocks", () => {
  it("splits the BHANG Series 1 range into blocks 579124 and 579125", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_329_777_337n);
    expect(segs.map((s) => s.height)).toEqual([579_124n, 579_125n]);
  });

  it("each segment's sat count is consistent with its range", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_329_777_337n);
    for (const s of segs) {
      expect(s.satCount).toBe(s.satRangeEnd - s.satRangeStart + 1n);
    }
  });

  it("the segments cover the whole range with no gap", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_329_777_337n);
    const total = segs.reduce((sum, s) => sum + s.satCount, 0n);
    expect(total).toBe(308_915_776n);
  });

  it("a single-sat range yields one segment", () => {
    const segs = splitIntoBlocks(1_773_906_020_861_562n, 1_773_906_020_861_562n);
    expect(segs.length).toBe(1);
    expect(segs[0].satCount).toBe(1n);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/segments.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/core/segments.ts`:

```ts
import { blockFirstSat, blockSubsidy, satToBlock } from "./sat-math";

export interface RawSegment {
  height: bigint;
  satRangeStart: bigint;
  satRangeEnd: bigint;
  satCount: bigint;
}

/**
 * Split an inclusive sat range [satStart, satEnd] into one segment per block it
 * touches, intersecting the range with each block's subsidy span.
 */
export function splitIntoBlocks(satStart: bigint, satEnd: bigint): RawSegment[] {
  const segments: RawSegment[] = [];
  const startBlock = satToBlock(satStart);
  const endBlock = satToBlock(satEnd);

  for (let h = startBlock; h <= endBlock; h++) {
    const blockStart = blockFirstSat(h);
    const blockEnd = blockStart + blockSubsidy(h) - 1n;
    const segStart = satStart > blockStart ? satStart : blockStart;
    const segEnd = satEnd < blockEnd ? satEnd : blockEnd;
    if (segStart > segEnd) continue;
    segments.push({
      height: h,
      satRangeStart: segStart,
      satRangeEnd: segEnd,
      satCount: segEnd - segStart + 1n,
    });
  }
  return segments;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/segments.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/segments.ts src/core/segments.test.ts
git commit -m "feat: add per-block range segmentation"
```

---

## Task 6: Core — `forecast.ts`

Classify blocks as mined/future and estimate dates for future blocks.

**Files:**
- Create: `src/core/forecast.ts`
- Test: `src/core/forecast.test.ts`

- [ ] **Step 1: Write the failing test**

`src/core/forecast.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { classifyBlock, estimateDate } from "./forecast";

describe("classifyBlock", () => {
  it("marks a block at or below the tip as mined", () => {
    expect(classifyBlock(579_124n, 900_000n)).toBe("mined");
    expect(classifyBlock(900_000n, 900_000n)).toBe("mined");
  });
  it("marks a block above the tip as future", () => {
    expect(classifyBlock(1_568_922n, 900_000n)).toBe("future");
  });
});

describe("estimateDate", () => {
  it("estimates a future date ~10 minutes per block ahead of the tip", () => {
    const now = new Date("2026-05-21T00:00:00Z");
    // 144 blocks ahead = 1 day
    const est = estimateDate(900_144n, 900_000n, now);
    expect(est.isoDate).toBe("2026-05-22");
    expect(est.year).toBe("2026");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/forecast.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/core/forecast.ts`:

```ts
export type BlockStatus = "mined" | "future";

const BLOCK_MINUTES = 10;

/** A block is mined if its height is at or below the current tip. */
export function classifyBlock(height: bigint, tip: bigint): BlockStatus {
  return height <= tip ? "mined" : "future";
}

export interface FutureEstimate {
  isoDate: string; // YYYY-MM-DD
  year: string;
}

/** Estimate when a future block will be mined, at ~10 minutes per block. */
export function estimateDate(
  height: bigint,
  tip: bigint,
  now: Date = new Date(),
): FutureEstimate {
  const blocksAhead = Number(height - tip);
  const ms = now.getTime() + blocksAhead * BLOCK_MINUTES * 60_000;
  const d = new Date(ms);
  return {
    isoDate: d.toISOString().slice(0, 10),
    year: String(d.getUTCFullYear()),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/forecast.test.ts`
Expected: PASS — both suites green.

- [ ] **Step 5: Commit**

```bash
git add src/core/forecast.ts src/core/forecast.test.ts
git commit -m "feat: add block mined/future classification and date estimate"
```

---

## Task 7: Core — `report.ts`

Assemble the full `PrefixReport`, including the >10-block collapse.

**Files:**
- Create: `src/core/report.ts`
- Test: `src/core/report.test.ts`

- [ ] **Step 1: Write the failing test**

`src/core/report.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildReport } from "./report";

describe("buildReport", () => {
  it("reports 7 series for prefix 'bhang'", () => {
    const r = buildReport("bhang", 900_000);
    expect(r.prefix).toBe("bhang");
    expect(r.prefixLength).toBe(5);
    expect(r.seriesCount).toBe(7);
    expect(r.tipHeight).toBe(900_000);
  });

  it("marks Series 1 of 'bhang' as mined with 2 block segments", () => {
    const s1 = buildReport("bhang", 900_000).series[0];
    expect(s1.overallStatus).toBe("mined");
    expect(s1.blockSegments?.map((s) => s.height)).toEqual([579_124, 579_125]);
    expect(s1.blockSummary).toBeUndefined();
  });

  it("marks the far-future final series as future with an estimated date", () => {
    const series = buildReport("bhang", 900_000).series;
    const last = series[series.length - 1];
    expect(last.overallStatus).toBe("future");
    expect(last.blockSegments?.[0].estimatedYear).toBeDefined();
  });

  it("collapses a series spanning more than 10 blocks into a summary", () => {
    // A 1-letter prefix's 11-letter series spans tens of thousands of blocks.
    const s1 = buildReport("a", 900_000).series[0];
    expect(s1.blockSummary).toBeDefined();
    expect(s1.blockSummary!.blockCount).toBeGreaterThan(10);
    expect(s1.blockSegments).toBeUndefined();
  });

  it("does not collapse when collapse:false is passed", () => {
    const s1 = buildReport("a", 900_000, { collapse: false }).series[0];
    expect(s1.blockSegments).toBeDefined();
    expect(s1.blockSummary).toBeUndefined();
  });

  it("reports zero series for a prefix entirely beyond sat supply", () => {
    // 11 z's map far past SUPPLY -- no series exists.
    const r = buildReport("zzzzzzzzzzz", 900_000);
    expect(r.seriesCount).toBe(0);
    expect(r.series).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/report.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/core/report.ts`:

```ts
import { buildSeriesRanges, SeriesRange } from "./series";
import { splitIntoBlocks } from "./segments";
import { classifyBlock, estimateDate } from "./forecast";

const COLLAPSE_THRESHOLD = 10;

export type SeriesStatus = "mined" | "future" | "partial";

export interface BlockSegment {
  height: number;
  satRangeStart: bigint;
  satRangeEnd: bigint;
  satCount: bigint;
  status: "mined" | "future";
  estimatedDate?: string;
  estimatedYear?: string;
}

export interface BlockSummary {
  startHeight: number;
  endHeight: number;
  blockCount: number;
  status: SeriesStatus;
}

export interface ReportSeries {
  id: number;
  nameLength: number;
  firstName: string;
  lastName: string;
  satStart: bigint;
  satEnd: bigint;
  satCount: bigint;
  overallStatus: SeriesStatus;
  /** Present when the series spans <= 10 blocks. */
  blockSegments?: BlockSegment[];
  /** Present when the series spans > 10 blocks (unless collapse is disabled). */
  blockSummary?: BlockSummary;
}

export interface PrefixReport {
  prefix: string;
  prefixLength: number;
  seriesCount: number;
  tipHeight: number;
  series: ReportSeries[];
}

export interface ReportOptions {
  /** Reference time for future-date estimates. Defaults to now. */
  now?: Date;
  /** Collapse series spanning > 10 blocks into a summary. Defaults to true. */
  collapse?: boolean;
}

/** Build the full report for a (already-validated) prefix. */
export function buildReport(
  prefix: string,
  tipHeight: number,
  opts: ReportOptions = {},
): PrefixReport {
  const now = opts.now ?? new Date();
  const collapse = opts.collapse ?? true;
  const tip = BigInt(tipHeight);
  const series = buildSeriesRanges(prefix).map((r) =>
    toReportSeries(r, tip, now, collapse),
  );
  return {
    prefix,
    prefixLength: prefix.length,
    seriesCount: series.length,
    tipHeight,
    series,
  };
}

function toReportSeries(
  r: SeriesRange,
  tip: bigint,
  now: Date,
  collapse: boolean,
): ReportSeries {
  const segments: BlockSegment[] = splitIntoBlocks(r.satStart, r.satEnd).map(
    (s) => {
      const status = classifyBlock(s.height, tip);
      const seg: BlockSegment = {
        height: Number(s.height),
        satRangeStart: s.satRangeStart,
        satRangeEnd: s.satRangeEnd,
        satCount: s.satCount,
        status,
      };
      if (status === "future") {
        const est = estimateDate(s.height, tip, now);
        seg.estimatedDate = est.isoDate;
        seg.estimatedYear = est.year;
      }
      return seg;
    },
  );

  const minedCount = segments.filter((s) => s.status === "mined").length;
  const overallStatus: SeriesStatus =
    minedCount === segments.length
      ? "mined"
      : minedCount === 0
        ? "future"
        : "partial";

  const base: ReportSeries = {
    id: r.id,
    nameLength: r.nameLength,
    firstName: r.firstName,
    lastName: r.lastName,
    satStart: r.satStart,
    satEnd: r.satEnd,
    satCount: r.satCount,
    overallStatus,
  };

  if (collapse && segments.length > COLLAPSE_THRESHOLD) {
    base.blockSummary = {
      startHeight: segments[0].height,
      endHeight: segments[segments.length - 1].height,
      blockCount: segments.length,
      status: overallStatus,
    };
  } else {
    base.blockSegments = segments;
  }
  return base;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/report.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/report.ts src/core/report.test.ts
git commit -m "feat: add report assembly with block-collapse"
```

---

## Task 8: Lib — `format.ts`

Number-grouping helper shared by the CLI and the web UI.

**Files:**
- Create: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatBigInt } from "./format";

describe("formatBigInt", () => {
  it("groups thousands with commas", () => {
    expect(formatBigInt(308_915_776n)).toBe("308,915,776");
    expect(formatBigInt(1_773_906_020_861_562n)).toBe("1,773,906,020,861,562");
  });
  it("handles small numbers", () => {
    expect(formatBigInt(0n)).toBe("0");
    expect(formatBigInt(7n)).toBe("7");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/format.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/lib/format.ts`:

```ts
/** Format a bigint with comma thousands separators. */
export function formatBigInt(n: bigint): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/format.test.ts`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat: add bigint number formatting helper"
```

---

## Task 9: Lib — `tip.ts`

Fetch the current tip height from mempool.space (the only network I/O).

**Files:**
- Create: `src/lib/tip.ts`
- Test: `src/lib/tip.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/tip.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchTipHeight } from "./tip";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchTipHeight", () => {
  it("returns the parsed height on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("900123\n", { status: 200 })),
    );
    expect(await fetchTipHeight()).toBe(900123);
  });

  it("retries once then throws on persistent failure", async () => {
    const fetchMock = vi.fn(async () => new Response("err", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchTipHeight()).rejects.toThrow(/mempool\.space/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws on a non-numeric response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not-a-number", { status: 200 })),
    );
    await expect(fetchTipHeight()).rejects.toThrow(/mempool\.space/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/tip.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`src/lib/tip.ts`:

```ts
const TIP_URL = "https://mempool.space/api/blocks/tip/height";

/** Fetch the current Bitcoin tip height. Retries once before throwing. */
export async function fetchTipHeight(): Promise<number> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(TIP_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = (await res.text()).trim();
      const height = Number(text);
      if (!Number.isInteger(height) || height <= 0) {
        throw new Error(`unexpected response: "${text}"`);
      }
      return height;
    } catch (err) {
      lastErr = err;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw new Error(
    `Could not fetch tip height from mempool.space: ${String(lastErr)}`,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/tip.test.ts`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tip.ts src/lib/tip.test.ts
git commit -m "feat: add mempool.space tip-height fetch with retry"
```

---

## Task 10: CLI — `render.ts` + `cli.ts`

Pure text renderer (`render.ts`) plus the CLI entry point (`cli.ts`).

**Files:**
- Create: `src/cli/render.ts`
- Test: `src/cli/render.test.ts`
- Create: `scripts/cli.ts`

- [ ] **Step 1: Write the failing test**

`src/cli/render.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildReport } from "../core/report";
import { renderText } from "./render";

describe("renderText", () => {
  it("includes the prefix, series count and tip height", () => {
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("bhang");
    expect(out).toContain("7 series");
    expect(out).toContain("900,000");
  });

  it("shows per-block segments for Series 1", () => {
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("579,124");
    expect(out).toContain("579,125");
    expect(out).toContain("mined");
  });

  it("shows a future label for the final series", () => {
    const out = renderText(buildReport("bhang", 900_000));
    expect(out).toContain("future");
  });

  it("shows a collapsed summary line for a short prefix", () => {
    const out = renderText(buildReport("a", 900_000));
    expect(out).toMatch(/blocks .* collapsed|\d+ blocks/);
  });

  it("shows a no-series message for a prefix beyond supply", () => {
    const out = renderText(buildReport("zzzzzzzzzzz", 900_000));
    expect(out).toContain("No real series");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/cli/render.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/cli/render.ts`**

```ts
import { PrefixReport, ReportSeries } from "../core/report";
import { formatBigInt } from "../lib/format";

/** Render a PrefixReport as human-readable text for the terminal. */
export function renderText(report: PrefixReport): string {
  const lines: string[] = [];
  lines.push(
    `Prefix: ${report.prefix}  (${report.seriesCount} series, ` +
      `tip height ${formatBigInt(BigInt(report.tipHeight))})`,
  );
  if (report.seriesCount === 0) {
    lines.push("");
    lines.push("No real series exist for this prefix (all beyond sat supply).");
    return lines.join("\n");
  }
  for (const s of report.series) {
    lines.push("");
    lines.push(renderSeries(s));
  }
  return lines.join("\n");
}

function renderSeries(s: ReportSeries): string {
  const lines: string[] = [];
  lines.push(
    `Series ${s.id}  ·  ${s.nameLength}-letter names  ·  ` +
      `${s.firstName} … ${s.lastName}  [${s.overallStatus}]`,
  );
  lines.push(
    `  sats ${formatBigInt(s.satStart)} … ${formatBigInt(s.satEnd)}  ` +
      `(${formatBigInt(s.satCount)} sats)`,
  );
  if (s.blockSummary) {
    const b = s.blockSummary;
    lines.push(
      `  blocks ${formatBigInt(BigInt(b.startHeight))} … ` +
        `${formatBigInt(BigInt(b.endHeight))}  ` +
        `(${formatBigInt(BigInt(b.blockCount))} blocks, ${b.status}) ` +
        `— collapsed, use --no-collapse for detail`,
    );
  } else if (s.blockSegments) {
    for (const seg of s.blockSegments) {
      const when =
        seg.status === "mined"
          ? "✓ mined"
          : `⧗ future ~${seg.estimatedYear}`;
      lines.push(
        `  block ${formatBigInt(BigInt(seg.height))}  ` +
          `sats ${formatBigInt(seg.satRangeStart)} … ` +
          `${formatBigInt(seg.satRangeEnd)}  ` +
          `(${formatBigInt(seg.satCount)})  ${when}`,
      );
    }
  }
  return lines.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/cli/render.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Write `scripts/cli.ts`**

```ts
import { validatePrefix } from "../src/core/prefix";
import { buildReport } from "../src/core/report";
import { renderText } from "../src/cli/render";
import { fetchTipHeight } from "../src/lib/tip";

interface CliArgs {
  prefix?: string;
  tip?: number;
  json: boolean;
  collapse: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { json: false, collapse: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--no-collapse") args.collapse = false;
    else if (a === "--tip") args.tip = Number(argv[++i]);
    else if (!a.startsWith("--") && args.prefix === undefined) args.prefix = a;
  }
  return args;
}

/** JSON.stringify replacer that renders bigint as a string. */
function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.prefix === undefined) {
    console.error(
      "Usage: npm run prefix -- <prefix> [--tip N] [--json] [--no-collapse]",
    );
    process.exit(1);
  }

  const validated = validatePrefix(args.prefix);
  if (!validated.ok) {
    console.error(`Error: ${validated.error}`);
    process.exit(1);
  }

  let tip: number;
  if (args.tip !== undefined) {
    tip = args.tip;
  } else {
    try {
      tip = await fetchTipHeight();
    } catch (err) {
      console.error(`Error: ${String(err)}`);
      console.error("Pass --tip <height> to run offline.");
      process.exit(1);
    }
  }

  const report = buildReport(validated.prefix, tip, { collapse: args.collapse });

  if (args.json) {
    console.log(JSON.stringify(report, bigintReplacer, 2));
  } else {
    console.log(renderText(report));
  }
}

main();
```

- [ ] **Step 6: Verify the CLI runs end-to-end**

Run: `npx tsx scripts/cli.ts bhang --tip 900000`
Expected: prints `Prefix: bhang  (7 series, tip height 900,000)` followed by 7 series blocks; Series 1 shows blocks 579,124 and 579,125 as `✓ mined`.

Run: `npx tsx scripts/cli.ts BHANG --tip 900000`
Expected: prints `Error: Prefix must contain only lowercase letters a-z.` and exits 1.

Run: `npx tsx scripts/cli.ts bhang --tip 900000 --json`
Expected: prints valid JSON; sat values are quoted strings.

- [ ] **Step 7: Commit**

```bash
git add src/cli/render.ts src/cli/render.test.ts scripts/cli.ts
git commit -m "feat: add CLI with text and JSON output"
```

---

## Task 11: Web — Next.js shell + functional page

A statically-exportable page: prefix input, fetch tip, compute, render series.

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create `src/app/globals.css`**

```css
@import "tailwindcss";

body {
  background: #0d0d0f;
  color: #e8e8ea;
}
```

- [ ] **Step 2: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prefix Satnames Tracker",
  description: "Enumerate sat-name series for a prefix and their Bitcoin blocks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create `src/app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { validatePrefix } from "@/core/prefix";
import { buildReport, PrefixReport } from "@/core/report";
import { fetchTipHeight } from "@/lib/tip";
import { formatBigInt } from "@/lib/format";

export default function Home() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<PrefixReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);

    const validated = validatePrefix(input.trim());
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setLoading(true);
    try {
      const tip = await fetchTipHeight();
      setReport(buildReport(validated.prefix, tip));
    } catch {
      setError("Couldn't reach mempool.space. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
        Prefix Satnames Tracker
      </h1>
      <p style={{ opacity: 0.7, marginTop: 4 }}>
        Enter a prefix to see every sat-name series and the Bitcoin blocks it
        falls in.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 20, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. bhang"
          style={{
            flex: 1,
            padding: "0.6rem 0.8rem",
            background: "#1a1a1f",
            border: "1px solid #333",
            borderRadius: 6,
            color: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#f7931a",
            border: "none",
            borderRadius: 6,
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "…" : "Track"}
        </button>
      </form>

      {error && (
        <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>
      )}

      {report && report.seriesCount === 0 && (
        <p style={{ marginTop: 16, opacity: 0.7 }}>
          No real series exist for &quot;{report.prefix}&quot; — every series
          maps beyond Bitcoin&apos;s sat supply.
        </p>
      )}

      {report && report.seriesCount > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ opacity: 0.7, marginBottom: 12 }}>
            {report.seriesCount} series · tip height{" "}
            {formatBigInt(BigInt(report.tipHeight))}
          </p>
          {report.series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </main>
  );
}

function SeriesCard({
  series,
}: {
  series: PrefixReport["series"][number];
}) {
  return (
    <section
      style={{
        border: "1px solid #2a2a30",
        borderRadius: 8,
        padding: "1rem",
        marginBottom: 12,
        background: "#141418",
      }}
    >
      <div style={{ fontWeight: 600 }}>
        Series {series.id} · {series.nameLength}-letter names ·{" "}
        {series.firstName} … {series.lastName}
      </div>
      <div style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: 2 }}>
        sats {formatBigInt(series.satStart)} … {formatBigInt(series.satEnd)} (
        {formatBigInt(series.satCount)} sats) · {series.overallStatus}
      </div>

      {series.blockSummary && (
        <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
          blocks {formatBigInt(BigInt(series.blockSummary.startHeight))} …{" "}
          {formatBigInt(BigInt(series.blockSummary.endHeight))} (
          {formatBigInt(BigInt(series.blockSummary.blockCount))} blocks,{" "}
          {series.blockSummary.status})
        </div>
      )}

      {series.blockSegments && (
        <ul style={{ marginTop: 8, fontSize: "0.9rem", listStyle: "none" }}>
          {series.blockSegments.map((seg) => (
            <li key={seg.height} style={{ marginTop: 2 }}>
              block {formatBigInt(BigInt(seg.height))} · sats{" "}
              {formatBigInt(seg.satRangeStart)} … {formatBigInt(seg.satRangeEnd)}{" "}
              ({formatBigInt(seg.satCount)}) ·{" "}
              {seg.status === "mined"
                ? "✓ mined"
                : `⧗ future ~${seg.estimatedYear}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Verify the dev server renders**

Run: `npm run dev`
Then open `http://localhost:3000`, type `bhang`, click Track.
Expected: 7 series cards appear; Series 1 shows blocks 579,124 and 579,125 as `✓ mined`; later series show `⧗ future ~YYYY`. Type `BHANG` → inline error appears. Stop the dev server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat: add web UI for prefix series tracking"
```

---

## Task 12: Web — styling, collapse expander, manual-tip fallback, static build

Final polish: visually distinguish mined vs future segments, add a "show all
blocks" expander for series spanning many blocks, add a manual tip-height fallback
for when mempool.space is unreachable, and verify the static export builds.

This task replaces `src/app/page.tsx` entirely. The report is now built with
`collapse: false`, so every series carries `blockSegments`; each card decides
whether to collapse for display, which lets the expander reveal real data.

**Files:**
- Modify: `src/app/page.tsx` (full-file replacement)

- [ ] **Step 1: Replace `src/app/page.tsx` entirely**

```tsx
"use client";

import { useState } from "react";
import { validatePrefix } from "@/core/prefix";
import { buildReport, PrefixReport } from "@/core/report";
import { fetchTipHeight } from "@/lib/tip";
import { formatBigInt } from "@/lib/format";

const COLLAPSE_AT = 10;

function statusColor(status: string): string {
  if (status === "mined") return "#3ddc84";
  if (status === "future") return "#f7931a";
  return "#e8b84b"; // partial
}

export default function Home() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<PrefixReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualTip, setManualTip] = useState("");
  const [pendingPrefix, setPendingPrefix] = useState<string | null>(null);

  function compute(prefix: string, tip: number) {
    setReport(buildReport(prefix, tip, { collapse: false }));
    setError(null);
    setPendingPrefix(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);
    setPendingPrefix(null);

    const validated = validatePrefix(input.trim());
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setLoading(true);
    try {
      const tip = await fetchTipHeight();
      compute(validated.prefix, tip);
    } catch {
      setError(
        "Couldn't reach mempool.space. Enter the current block height manually below.",
      );
      setPendingPrefix(validated.prefix);
    } finally {
      setLoading(false);
    }
  }

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tip = Number(manualTip);
    if (!Number.isInteger(tip) || tip <= 0) {
      setError("Enter a valid positive block height.");
      return;
    }
    if (pendingPrefix) compute(pendingPrefix, tip);
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
        Prefix Satnames Tracker
      </h1>
      <p style={{ opacity: 0.7, marginTop: 4 }}>
        Enter a prefix to see every sat-name series and the Bitcoin blocks it
        falls in.
      </p>

      <form
        onSubmit={onSubmit}
        style={{ marginTop: 20, display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. bhang"
          style={{
            flex: 1,
            padding: "0.6rem 0.8rem",
            background: "#1a1a1f",
            border: "1px solid #333",
            borderRadius: 6,
            color: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#f7931a",
            border: "none",
            borderRadius: 6,
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "…" : "Track"}
        </button>
      </form>

      {error && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}

      {pendingPrefix && (
        <form
          onSubmit={onManualSubmit}
          style={{ marginTop: 8, display: "flex", gap: 8 }}
        >
          <input
            value={manualTip}
            onChange={(e) => setManualTip(e.target.value)}
            placeholder="current block height"
            inputMode="numeric"
            style={{
              flex: 1,
              padding: "0.5rem 0.8rem",
              background: "#1a1a1f",
              border: "1px solid #333",
              borderRadius: 6,
              color: "inherit",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "#333",
              border: "1px solid #555",
              borderRadius: 6,
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Use height
          </button>
        </form>
      )}

      {report && report.seriesCount === 0 && (
        <p style={{ marginTop: 16, opacity: 0.7 }}>
          No real series exist for &quot;{report.prefix}&quot; — every series
          maps beyond Bitcoin&apos;s sat supply.
        </p>
      )}

      {report && report.seriesCount > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ opacity: 0.7, marginBottom: 12 }}>
            {report.seriesCount} series · tip height{" "}
            {formatBigInt(BigInt(report.tipHeight))}
          </p>
          {report.series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </main>
  );
}

function SeriesCard({ series }: { series: PrefixReport["series"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const segments = series.blockSegments ?? [];
  const collapsed = segments.length > COLLAPSE_AT && !expanded;

  return (
    <section
      style={{
        border: "1px solid #2a2a30",
        borderRadius: 8,
        padding: "1rem",
        marginBottom: 12,
        background: "#141418",
      }}
    >
      <div style={{ fontWeight: 600 }}>
        Series {series.id} · {series.nameLength}-letter names ·{" "}
        {series.firstName} … {series.lastName}{" "}
        <span style={{ color: statusColor(series.overallStatus) }}>
          ● {series.overallStatus}
        </span>
      </div>
      <div style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: 2 }}>
        sats {formatBigInt(series.satStart)} … {formatBigInt(series.satEnd)} (
        {formatBigInt(series.satCount)} sats)
      </div>

      {collapsed ? (
        <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
          blocks {formatBigInt(BigInt(segments[0].height))} …{" "}
          {formatBigInt(BigInt(segments[segments.length - 1].height))} (
          {formatBigInt(BigInt(segments.length))} blocks){" "}
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: "none",
              border: "1px solid #444",
              borderRadius: 4,
              color: "inherit",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: "1px 6px",
            }}
          >
            show all blocks
          </button>
        </div>
      ) : (
        <ul style={{ marginTop: 8, fontSize: "0.9rem", listStyle: "none" }}>
          {segments.map((seg) => (
            <li key={seg.height} style={{ marginTop: 2 }}>
              <span style={{ color: statusColor(seg.status) }}>●</span> block{" "}
              {formatBigInt(BigInt(seg.height))} · sats{" "}
              {formatBigInt(seg.satRangeStart)} …{" "}
              {formatBigInt(seg.satRangeEnd)} ({formatBigInt(seg.satCount)}) ·{" "}
              {seg.status === "mined"
                ? "mined"
                : `future ~${seg.estimatedYear}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

> **Note on the expander:** clicking "show all blocks" renders every block as a
> list item. For normal prefixes (5–8 letters) series span 1–2 blocks and the
> expander never appears. For very short prefixes a series can span hundreds of
> thousands of blocks; expanding such a series intentionally renders them all and
> will be slow — this is the documented opt-in "full detail" behavior. Do not add
> a cap.

- [ ] **Step 2: Verify the dev server — styling and collapse**

Run: `npm run dev`
Open `http://localhost:3000`:
- Type `bhang`, click Track. Expected: 7 series cards; Series 1 shows two block
  rows (579,124 and 579,125) each with a green `●` and the word `mined`; later
  series show an orange `●` and `future ~YYYY`.
- Type `a`, click Track. Expected: Series 1 shows a collapsed line
  `blocks X … Y (N blocks)` with a `show all blocks` button. (You may click it on
  a small collapsed series; avoid clicking it for `a`, whose series is huge.)
- Type `BHANG`, click Track. Expected: red inline error, no cards.

Stop the dev server (Ctrl+C).

- [ ] **Step 3: Verify the manual tip-height fallback**

With the dev server running, simulate an offline mempool.space: open the browser
devtools Network tab, set it to "Offline", type `bhang`, click Track.
Expected: red message "Couldn't reach mempool.space. Enter the current block
height manually below." plus a second input row. Set Network back to "Online",
type `900000` into that input, click "Use height".
Expected: the 7 series cards render using tip height 900,000.

Stop the dev server.

- [ ] **Step 4: Verify the static build**

Run: `npm run build`
Expected: build succeeds with no type errors; an `out/` directory is produced
(static export).

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file from Tasks 2–10 is green.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add styling, collapse expander, and manual-tip fallback to web UI"
```

## Final verification

- [ ] Run `npm test` — all suites pass.
- [ ] Run `npm run build` — static export succeeds.
- [ ] Run `npx tsx scripts/cli.ts bhang --tip 900000` — 7 series, Series 1 mined in blocks 579,124/579,125.
- [ ] Run `npx tsx scripts/cli.ts a --tip 900000` — Series 1 shows a collapsed block summary.
- [ ] Confirm git log shows one commit per task.
