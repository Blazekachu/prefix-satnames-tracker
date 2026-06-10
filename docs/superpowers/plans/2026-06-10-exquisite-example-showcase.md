# Exquisite Example Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the default Prefix Satnames Tracker page appearance and add a lower-page `exquisite` example showcase with the on-chain Exquisite inscription.

**Architecture:** Keep the pure math core untouched. Move page presentation to class-based CSS in `src/app/globals.css`, keep app behavior in `src/app/page.tsx`, and add static explanatory example data derived from the existing core math.

**Tech Stack:** Next.js 16 App Router, React 19 client component, Tailwind 4 import plus regular CSS, TypeScript, Vitest.

---

## File Structure

- Modify `src/app/page.tsx`: keep existing tracker state and report rendering, add reusable UI constants, a `runPrefix` helper, class names, and a lower `ExampleShowcase` component.
- Modify `src/app/globals.css`: add the page theme, responsive layout, form controls, report cards, status dots, and example showcase styling.
- Modify `vitest.config.ts`: encode the observed 30s timeout needed by existing large deterministic report tests so `npm test` works without an ad hoc CLI flag.
- Do not modify `src/core/*`, `src/lib/tip.ts`, or generated `out/`.

## Implementation Tasks

### Task 1: Add The Visual Theme CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the minimal global CSS with the page theme**

Set `src/app/globals.css` to:

```css
@import "tailwindcss";

:root {
  --bg: #0d0d0f;
  --surface: #141418;
  --surface-strong: #191923;
  --surface-warm: #1c1814;
  --line: #2c2d38;
  --line-strong: #4b5bab;
  --text: #f4efe7;
  --muted: #b9b1a5;
  --muted-strong: #d8c7aa;
  --blue: #4b5bab;
  --blue-soft: rgba(75, 91, 171, 0.2);
  --latte: #d8b989;
  --green: #68d391;
  --orange: #f7931a;
  --red: #ff6b6b;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--bg);
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 20% 0%, rgba(75, 91, 171, 0.22), transparent 34rem),
    linear-gradient(180deg, #0d0d0f 0%, #111015 44%, #17130f 100%);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

button,
input {
  font: inherit;
}

button:disabled {
  cursor: wait;
  opacity: 0.68;
}

.page-shell {
  width: min(1080px, calc(100% - 32px));
  margin: 0 auto;
  padding: 40px 0 56px;
}

.tracker-panel,
.example-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(20, 20, 24, 0.88);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}

.tracker-panel {
  padding: 28px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--latte);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.35rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.lede {
  max-width: 650px;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.65;
}

.privacy-pill {
  flex: 0 0 auto;
  border: 1px solid rgba(75, 91, 171, 0.8);
  border-radius: 999px;
  padding: 8px 12px;
  background: var(--blue-soft);
  color: #dfe3ff;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.search-form,
.manual-form {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-top: 24px;
}

.manual-form {
  margin-top: 12px;
}

.text-input {
  min-width: 0;
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #101015;
  color: var(--text);
  outline: none;
  padding: 13px 14px;
}

.text-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(75, 91, 171, 0.24);
}

.primary-button,
.secondary-button,
.ghost-button {
  border-radius: 6px;
  cursor: pointer;
  font-weight: 800;
}

.primary-button {
  border: 1px solid #f7a642;
  background: var(--orange);
  color: #17100a;
  padding: 13px 22px;
}

.secondary-button {
  border: 1px solid var(--line);
  background: var(--surface-strong);
  color: var(--text);
  padding: 11px 16px;
}

.ghost-button {
  border: 1px solid #444653;
  background: transparent;
  color: var(--text);
  padding: 4px 8px;
  font-size: 0.82rem;
}

.error-text {
  margin: 14px 0 0;
  color: var(--red);
}

.empty-text,
.report-meta {
  color: var(--muted);
}

.empty-text {
  margin-top: 18px;
}

.report {
  margin-top: 24px;
}

.report-meta {
  margin: 0 0 14px;
}

.banner {
  margin-bottom: 14px;
  border: 1px solid #6b521f;
  border-radius: 6px;
  background: #1f1a10;
  color: #f0d99a;
  padding: 10px 12px;
  font-size: 0.9rem;
}

.series-card {
  margin-bottom: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(14, 14, 18, 0.82);
  padding: 16px;
}

.series-title {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-weight: 800;
}

.series-range,
.block-list,
.collapsed-blocks {
  color: var(--muted);
  font-size: 0.9rem;
}

.series-range {
  margin-top: 6px;
}

.status-dot {
  color: var(--status-color);
}

.status-label {
  color: var(--status-color);
  font-weight: 800;
}

.collapsed-blocks {
  margin-top: 10px;
}

.block-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.block-list li + li {
  margin-top: 4px;
}

.example-panel {
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
  gap: 0;
  overflow: hidden;
}

.inscription-frame-wrap {
  min-height: 100%;
  background: var(--blue);
  padding: 18px;
}

.inscription-frame {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 6px;
  background: #4b5bab;
}

.example-content {
  padding: 28px;
  background: linear-gradient(135deg, rgba(28, 24, 20, 0.96), rgba(20, 20, 24, 0.96));
}

.example-content h2 {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.8rem);
  line-height: 1;
  letter-spacing: 0;
}

.example-copy {
  margin: 14px 0 0;
  color: var(--muted);
  line-height: 1.65;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.stat-card {
  border: 1px solid rgba(216, 185, 137, 0.26);
  border-radius: 8px;
  background: rgba(13, 13, 15, 0.55);
  padding: 12px;
}

.stat-value {
  display: block;
  color: var(--text);
  font-size: 1.35rem;
  font-weight: 900;
}

.stat-label {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.35;
}

.breakdown {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.breakdown li {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  padding: 11px 0;
  color: var(--muted);
  line-height: 1.45;
}

.breakdown strong {
  color: var(--text);
}

.example-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
}

.inscription-link {
  color: #dfe3ff;
  font-weight: 800;
  text-decoration: none;
}

.inscription-link:hover {
  text-decoration: underline;
}

@media (max-width: 760px) {
  .page-shell {
    width: min(100% - 24px, 1080px);
    padding-top: 24px;
  }

  .tracker-panel,
  .example-content {
    padding: 20px;
  }

  .header-row,
  .search-form,
  .manual-form {
    flex-direction: column;
  }

  .privacy-pill {
    white-space: normal;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .example-panel {
    grid-template-columns: 1fr;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Run TypeScript check after CSS-only change**

Run: `npx tsc --noEmit`

Expected: PASS with no TypeScript errors.

### Task 2: Refactor The Page Markup And Add The Example

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx` with the themed tracker and example section**

Set `src/app/page.tsx` to:

```tsx
"use client";

import { useState } from "react";
import { validatePrefix } from "@/core/prefix";
import { buildReport, PrefixReport } from "@/core/report";
import { fetchTipHeight } from "@/lib/tip";
import { formatBigInt } from "@/lib/format";
import { series1Banner } from "@/lib/banner";

const COLLAPSE_AT = 10;
const EXQUISITE_PREFIX = "exquisite";
const EXQUISITE_INSCRIPTION_ID =
  "db044cb57073abf71bbab6111415e3c0a38cce1428d364c8f275e9d8995252dbi201";
const EXQUISITE_INSCRIPTION_URL = `https://ordinals.com/inscription/${EXQUISITE_INSCRIPTION_ID}`;
const EXQUISITE_PREVIEW_URL = `https://ordinals.com/preview/${EXQUISITE_INSCRIPTION_ID}`;

function statusColor(status: string): string {
  if (status === "mined") return "#68d391";
  if (status === "future") return "#f7931a";
  return "#d8b989";
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

  async function runPrefix(prefix: string) {
    setError(null);
    setReport(null);
    setPendingPrefix(null);

    const validated = validatePrefix(prefix.trim().toLowerCase());
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setInput(validated.prefix);
    setLoading(true);
    try {
      const tip = await fetchTipHeight();
      compute(validated.prefix, tip);
    } catch {
      setError(
        "Couldn't reach any block-height source. Enter the current block height manually below.",
      );
      setPendingPrefix(validated.prefix);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runPrefix(input);
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
    <main className="page-shell">
      <section className="tracker-panel">
        <div className="header-row">
          <div>
            <p className="eyebrow">Ordinal sat-name range finder</p>
            <h1 className="title">Prefix Satnames Tracker</h1>
            <p className="lede">
              Enter a prefix to see every sat-name series, the exact sat ranges,
              and the Bitcoin blocks where those names land.
            </p>
          </div>
          <div className="privacy-pill">Client-side math</div>
        </div>

        <form onSubmit={onSubmit} className="search-form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. bhang"
            className="text-input"
            aria-label="Sat-name prefix"
          />
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Tracing..." : "Track"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {pendingPrefix && (
          <form onSubmit={onManualSubmit} className="manual-form">
            <input
              value={manualTip}
              onChange={(e) => setManualTip(e.target.value)}
              placeholder="current block height"
              inputMode="numeric"
              className="text-input"
              aria-label="Current block height"
            />
            <button type="submit" className="secondary-button">
              Use height
            </button>
          </form>
        )}

        {report && report.seriesCount === 0 && (
          <p className="empty-text">
            No real series exist for &quot;{report.prefix}&quot; because every
            series maps beyond Bitcoin&apos;s sat supply.
          </p>
        )}

        {report && report.seriesCount > 0 && (
          <div className="report">
            <p className="report-meta">
              {report.seriesCount} series | tip height{" "}
              {formatBigInt(BigInt(report.tipHeight))}
            </p>
            {series1Banner(report) && (
              <div className="banner">{series1Banner(report)}</div>
            )}
            {report.series.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </section>

      <ExampleShowcase onTry={() => void runPrefix(EXQUISITE_PREFIX)} />
    </main>
  );
}

function SeriesCard({ series }: { series: PrefixReport["series"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const segments = series.blockSegments ?? [];
  const collapsed = segments.length > COLLAPSE_AT && !expanded;
  const seriesStatusColor = statusColor(series.overallStatus);

  return (
    <section className="series-card">
      <div className="series-title">
        <span>
          Series {series.id} | {series.nameLength}-letter names |{" "}
          {series.satStartName} ... {series.satEndName}
        </span>
        <span
          className="status-label"
          style={{ "--status-color": seriesStatusColor } as React.CSSProperties}
        >
          status: {series.overallStatus}
        </span>
      </div>
      <div className="series-range">
        sats {formatBigInt(series.satStart)} ... {formatBigInt(series.satEnd)} (
        {formatBigInt(series.satCount)} sats)
      </div>

      {collapsed ? (
        <div className="collapsed-blocks">
          blocks {formatBigInt(BigInt(segments[0].height))} ...{" "}
          {formatBigInt(BigInt(segments[segments.length - 1].height))} (
          {formatBigInt(BigInt(segments.length))} blocks){" "}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ghost-button"
          >
            show all blocks
          </button>
        </div>
      ) : (
        <ul className="block-list">
          {segments.map((seg) => (
            <li key={seg.height}>
              <span
                className="status-dot"
                style={
                  { "--status-color": statusColor(seg.status) } as React.CSSProperties
                }
              >
                status:
              </span>{" "}
              block {formatBigInt(BigInt(seg.height))} | sats{" "}
              {formatBigInt(seg.satRangeStart)} ...{" "}
              {formatBigInt(seg.satRangeEnd)} ({formatBigInt(seg.satCount)}) |{" "}
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

function ExampleShowcase({ onTry }: { onTry: () => void }) {
  return (
    <section className="example-panel" aria-labelledby="example-title">
      <div className="inscription-frame-wrap">
        <iframe
          className="inscription-frame"
          title="Exquisite #1042 ordinal inscription preview"
          src={EXQUISITE_PREVIEW_URL}
          sandbox="allow-scripts"
          loading="lazy"
        />
      </div>
      <div className="example-content">
        <p className="eyebrow">On-chain example</p>
        <h2 id="example-title">Example: exquisite</h2>
        <p className="example-copy">
          The tracker follows every sat-name that starts with a prefix. For{" "}
          <strong>exquisite*</strong>, only <strong>703 sats</strong> exist out
          of <strong>2,100,000,000,000,000</strong> total Bitcoin sats:
          <strong> 0.000000000033476%</strong> of the full supply.
        </p>

        <div className="stat-grid" aria-label="Exquisite sat-name rarity stats">
          <div className="stat-card">
            <span className="stat-value">703</span>
            <span className="stat-label">matching sats total</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">3</span>
            <span className="stat-label">sat-name series</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0.000000000033476%</span>
            <span className="stat-label">of all Bitcoin sats</span>
          </div>
        </div>

        <ul className="breakdown">
          <li>
            <strong>676</strong>
            <span>
              sats in 11-letter names, from <strong>exquisiteaa</strong> through{" "}
              <strong>exquisitezz</strong>
            </span>
          </li>
          <li>
            <strong>26</strong>
            <span>
              sats in 10-letter names, from <strong>exquisitea</strong> through{" "}
              <strong>exquisitez</strong>
            </span>
          </li>
          <li>
            <strong>1</strong>
            <span>
              sat for the exact 9-letter name <strong>exquisite</strong>
            </span>
          </li>
        </ul>

        <div className="example-actions">
          <button type="button" onClick={onTry} className="secondary-button">
            Try exquisite
          </button>
          <a
            href={EXQUISITE_INSCRIPTION_URL}
            target="_blank"
            rel="noreferrer"
            className="inscription-link"
          >
            View inscription
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Run core tests**

Run: `npm test`

Expected: PASS, with existing Vitest tests unchanged.

### Task 3: Build And Visual Verify

**Files:**
- Modify: `vitest.config.ts`
- Verify: `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Preserve the documented test command**

Set `vitest.config.ts` to:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30_000,
  },
});
```

- [ ] **Step 2: Run the documented test command**

Run: `npm test`

Expected: PASS, with existing Vitest tests unchanged.

- [ ] **Step 3: Build the static app**

Run: `npm run build`

Expected: PASS and static output written to `out/`.

- [ ] **Step 4: Start the dev server for visual QA**

Run: `npm run dev`

Expected: Next dev server starts from the real `F:\Users\akhil\Main\prefix-satnames-tracker` path.

- [ ] **Step 5: Browser-check desktop and mobile**

Open the local app and confirm:

- The tracker remains the first-screen focus.
- The page palette uses the Exquisite blue, latte neutrals, and restrained green/orange accents.
- The lower section embeds the Exquisite inscription only inside the example showcase.
- The copy includes `703`, `2,100,000,000,000,000`, and `0.000000000033476%`.
- `Try exquisite` fills/runs the tracker for `exquisite`.
- The mobile layout stacks without text overlap.

## Self-Review

- Spec coverage: the plan covers the top utility refresh, lower example section, inscription-only-in-example constraint, `703` count, percentage copy, breakdown rows, try action, iframe fallback via normal inscription link, and verification commands.
- Placeholder scan: no `TBD`, `TODO`, or vague implementation steps remain.
- Type consistency: `PrefixReport`, `runPrefix`, `ExampleShowcase`, and CSS class names are defined in the task where used.
