# Know Present Location Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On fully mined series cards, add a “Trace locations” control (hover: “Know Present Location of Sats from This Series”) that opens a static in-app walkthrough of how to run track-prefix locally.

**Architecture:** Keep everything inside `prefix-satnames-tracker` static export. Gate the CTA on `series.overallStatus === "mined"` in home `SeriesCard`. Add sibling route `src/app/know-present-location/page.tsx` with a generic full walkthrough (no query params). Reuse existing dark-theme CSS / back-link patterns from `inscriptions-on-satnames/`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, static export (`output: "export"`), existing `globals.css`, Vitest only if already used elsewhere for this change (spec: no new unit tests required).

**Spec:** `docs/superpowers/specs/2026-08-07-know-present-location-guide-design.md`

**Branch:** `feat/know-present-location-guide` (already created; do not push to `master` until human confirm + security audit)

## Global Constraints

- CTA only when `overallStatus === "mined"` (not `future`, not `partial`)
- Guide is **generic** — no prefix/series in the URL or page props
- Relative links only (`know-present-location/`, `../`) for `basePath` + trailingSlash
- External GitHub links: `target="_blank"` `rel="noreferrer"`
- Do not modify the `track-prefix` repository
- Do not auto-push or merge to `master`

---

## File Structure

- `src/app/page.tsx`
  - add mined-only CTA inside `SeriesCard` after `.series-range`
- `src/app/globals.css`
  - style `.series-card-actions` / `.series-trace-link` next to `.series-card` rules
- `src/app/know-present-location/page.tsx`
  - new static guide page with nine required sections + Back to tracker

---

### Task 1: Mined-Series CTA On Home Cards

**Files:**
- Modify: `src/app/page.tsx` (`SeriesCard`, after the `.series-range` block ~line 194–198)
- Modify: `src/app/globals.css` (after `.series-range` block ~line 312–314)

- [ ] **Step 1: Add CSS for the card action row**

In `src/app/globals.css`, immediately after the `.series-range { margin-top: 6px; }` rule, add:

```css
.series-card-actions {
  margin-top: 12px;
}

.series-trace-link {
  display: inline-block;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-strong);
  color: var(--text);
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.series-trace-link:hover {
  border-color: var(--orange);
  color: #f7d7b0;
}

.series-trace-link:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Insert the mined-only CTA in `SeriesCard`**

In `src/app/page.tsx`, inside `SeriesCard`, after the closing `</div>` of `.series-range` and **before** the `{collapsed ? (` block, insert:

```tsx
      {series.overallStatus === "mined" ? (
        <div className="series-card-actions">
          <a
            href="know-present-location/"
            className="series-trace-link"
            title="Know Present Location of Sats from This Series"
          >
            Trace locations
          </a>
        </div>
      ) : null}
```

Do not pass prefix/series into the href.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat(ui): add mined-series trace locations CTA"
```

---

### Task 2: Know Present Location Guide Page

**Files:**
- Create: `src/app/know-present-location/page.tsx`

- [ ] **Step 1: Create the guide page**

Create `src/app/know-present-location/page.tsx` with this full contents (adjust only if TypeScript/lint requires trivial fixes — keep section order and meaning):

```tsx
const TRACK_PREFIX_REPO = "https://github.com/Blazekachu/track-prefix";
const TRACK_PREFIX_README = `${TRACK_PREFIX_REPO}#readme`;

export default function KnowPresentLocationPage() {
  return (
    <main className="page-shell guide-page">
      <a href="../" className="back-link">
        Back to tracker
      </a>
      <p className="eyebrow">Handoff to track-prefix</p>
      <h1 className="title">Know present location of sats</h1>
      <p className="lede">
        This site shows which sat-name prefix series exist and which are
        already mined. To learn where those sats sit today, run{" "}
        <strong>track-prefix</strong> locally — a FIFO sat-name prefix tracer
        that walks from coinbase to live UTXOs on your machine.
      </p>

      <section className="guide-section">
        <h2>1. What this is</h2>
        <p>
          track-prefix is a <strong>local-first</strong> tool (v0.1, MIT). You
          pick a mined sat-name prefix series, and a worker traces those sats
          with ordinal FIFO accounting into a local SQLite database and
          dashboard. It is not a hosted service: credentials and databases stay
          on your computer.
        </p>
      </section>

      <section className="guide-section">
        <h2>2. Prerequisites</h2>
        <ul>
          <li>
            <strong>Node.js 20+</strong>
          </li>
          <li>
            Network access <strong>or</strong> a local mainnet bitcoind with{" "}
            <code>txindex=1</code> (Core 24+ recommended), and optionally{" "}
            <strong>ord</strong>
          </li>
          <li>
            Disk space for SQLite under <code>data/jobs/</code> (one folder per
            tracked prefix series)
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>3. Install and start</h2>
        <pre className="guide-code">{`git clone https://github.com/Blazekachu/track-prefix.git
cd track-prefix
npm install
npm start`}</pre>
        <p>
          Open the printed URL. Preferred dashboard address:{" "}
          <code>http://127.0.0.1:42069</code>. Complete the browser wizard, or
          open an existing job.
        </p>
        <p>
          Source:{" "}
          <a
            href={TRACK_PREFIX_REPO}
            target="_blank"
            rel="noreferrer"
          >
            github.com/Blazekachu/track-prefix
          </a>
        </p>
      </section>

      <section className="guide-section">
        <h2>4. Pick a data mode</h2>
        <p>Nothing is hidden. Choose one mode in the wizard:</p>
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>You provide</th>
                <th>UTXO trace</th>
                <th>Inscriptions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Public API</td>
                <td>Nothing</td>
                <td>Public Esplora</td>
                <td>First-sat scan via public ordinals endpoints</td>
              </tr>
              <tr>
                <td>Paid / subscribed API</td>
                <td>Esplora base URL (+ optional key)</td>
                <td>Your endpoint</td>
                <td>Same style as public</td>
              </tr>
              <tr>
                <td>BTC node (RPC)</td>
                <td>RPC URL + user + password</td>
                <td>Your bitcoind</td>
                <td>Not available (no inscription index)</td>
              </tr>
              <tr>
                <td>BTC + ORD nodes</td>
                <td>RPC + ord HTTP URL</td>
                <td>bitcoind + local ord</td>
                <td>First-sat or every sat</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Public / paid: <strong>one tracer at a time</strong> across all jobs
            (pause/stop before starting another).
          </li>
          <li>
            Node modes: not limited that way (still one lock per job).
          </li>
          <li>
            Pre-filled URLs like <code>http://127.0.0.1:8332</code> are local
            defaults — change them if your node listens elsewhere.
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>5. Wizard</h2>
        <ol>
          <li>Disclosure → choose mode → credentials → list mined series → expectations → start.</li>
          <li>
            For <strong>BTC node</strong> / <strong>BTC + ORD</strong>: fill
            credentials (stored only in local <code>config.json</code>,
            gitignored). Optional Fill from Bitcoin cookie is click-only.
            Test connection must succeed before Next unlocks.
          </li>
          <li>
            Enter the same prefix you looked up on this site, then pick the
            mined series you care about.
          </li>
        </ol>
      </section>

      <section className="guide-section">
        <h2>6. Dashboard and tracing</h2>
        <ul>
          <li>
            Use <strong>Start / Pause / Stop / Resume / Refresh</strong> on the
            job.
          </li>
          <li>
            Watch conservation gap, queue, and live UTXOs. Closing the dashboard
            does not stop a detached tracer — use Pause/Stop.
          </li>
          <li>
            <strong>Complete</strong> means conservation accounting reaches{" "}
            <strong>gap 0</strong> for the chosen sat range — not “every
            inscription on Earth.”
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>7. Optional next steps</h2>
        <p>
          After UTXO track is complete, you can scan live UTXOs for inscriptions
          (mode-dependent). Default is first sat per UTXO; every-sat scan needs
          BTC + ORD. Useful CLI commands:
        </p>
        <pre className="guide-code">{`npm test
npm run status
npm run trace:sats
npm run refresh
npm run scan:inscriptions
npm run snapshot`}</pre>
      </section>

      <section className="guide-section">
        <h2>8. Safety</h2>
        <ul>
          <li>
            track-prefix only <strong>reads</strong> bitcoind / ord. It writes
            only under its own <code>data/jobs/</code>.
          </li>
          <li>
            Never commit <code>config.json</code>, RPC passwords, API keys, or
            job databases.
          </li>
          <li>
            Prefer removing jobs from the dashboard UI over deleting folders by
            hand.
          </li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>9. Links</h2>
        <ul>
          <li>
            <a href={TRACK_PREFIX_REPO} target="_blank" rel="noreferrer">
              track-prefix on GitHub
            </a>
          </li>
          <li>
            <a href={TRACK_PREFIX_README} target="_blank" rel="noreferrer">
              Full README (source of truth for edge cases)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Add guide-page CSS**

In `src/app/globals.css`, append (near other page-level sections is fine; keep variables consistent):

```css
.guide-page .guide-section {
  margin-top: 28px;
}

.guide-page .guide-section h2 {
  margin: 0 0 10px;
  font-size: 1.15rem;
}

.guide-page .guide-section p,
.guide-page .guide-section li {
  color: var(--muted);
  line-height: 1.55;
}

.guide-page .guide-section ul,
.guide-page .guide-section ol {
  margin: 0;
  padding-left: 1.25rem;
}

.guide-page .guide-code {
  margin: 12px 0;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  color: var(--text);
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.45;
  white-space: pre;
}

.guide-table-wrap {
  margin: 12px 0;
  overflow-x: auto;
}

.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.guide-table th,
.guide-table td {
  border: 1px solid var(--line);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
  color: var(--muted);
}

.guide-table th {
  color: var(--text);
  background: rgba(0, 0, 0, 0.25);
}

.guide-page a[href^="http"] {
  color: #f7d7b0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/know-present-location/page.tsx src/app/globals.css
git commit -m "feat(ui): add track-prefix know-present-location guide"
```

---

### Task 3: Local Verification

**Files:** none (manual + build)

- [ ] **Step 1: Start the app**

```bash
npm run dev
```

Expected: Next.js ready on local port (usually `http://localhost:3000`).

- [ ] **Step 2: Confirm mined CTA**

1. Open the home page.
2. Track a prefix with a fully mined series (e.g. `bhang` or `exquisite`).
3. On a card with `status: mined`, confirm **Trace locations** appears.
4. Hover: tooltip/title is **Know Present Location of Sats from This Series**.
5. On `future` / `partial` cards, confirm the control is absent.

- [ ] **Step 3: Confirm guide page**

1. Click **Trace locations**.
2. URL ends with `/know-present-location/` (with site `basePath` in prod build).
3. All nine sections render; Back to tracker returns home.
4. GitHub links open in a new tab.

- [ ] **Step 4: Static export build**

```bash
npm run build
```

Expected: build succeeds; `out/know-present-location/index.html` exists (or equivalent under export output).

- [ ] **Step 5: Stop here for human gate**

Do **not** push or merge to `master`. Report local results; wait for confirm + security audit before any remote update.

---

## Spec Coverage Checklist

| Spec requirement | Task |
|------------------|------|
| Mined-only CTA | Task 1 |
| Visible label `Trace locations` | Task 1 |
| Hover title exact string | Task 1 |
| Relative `know-present-location/` | Task 1 |
| Guide page nine sections | Task 2 |
| Back to tracker | Task 2 |
| Generic (no series context) | Tasks 1–2 |
| CSS reuse / light additions | Tasks 1–2 |
| Manual test + build | Task 3 |
| No push to master | Task 3 Step 5 |
| No track-prefix repo changes | Global Constraints |

## Placeholder / Consistency Review

- No TBD/TODO placeholders in steps.
- Class names consistent: `series-trace-link`, `guide-page`, `guide-section`.
- External repo URL consistent: `https://github.com/Blazekachu/track-prefix`.
