# Know Present Location Guide Design

Date: 2026-08-07
Project: Prefix Satnames Tracker

## Goal

Connect a **fully mined** series card on the home page to a **generic** in-app guide that teaches the user how to run [track-prefix](https://github.com/Blazekachu/track-prefix) locally and find where sats from a mined series sit today.

The hover affordance on the mined-series control is:

> Know Present Location of Sats from This Series

Clicking opens a sibling guide page (not a modal, not a raw GitHub redirect).

## Why This Approach

`prefix-satnames-tracker` already answers “which series exist and which are mined.”  
`track-prefix` answers “where are those sats now?” via local FIFO tracing.

Keeping the guide **inside** this static site:

- preserves the inscriptions-page handoff pattern
- works with `output: "export"` / GitHub Pages
- lets someone complete a full walkthrough without needing the track-prefix README open first

Keeping the guide **generic** (no prefix/series in the URL):

- the user must enter the prefix again inside track-prefix anyway
- avoids fragile deep-link contracts between two repos

## Scope

**In scope (this branch: `feat/know-present-location-guide`):**

- Mined-only CTA on home `SeriesCard`
- New route `src/app/know-present-location/page.tsx` → `/know-present-location/`
- Guide copy covering a full walkthrough of track-prefix (enough to get a job running)
- Light CSS for the card action
- Design doc under `docs/superpowers/specs/`

**Out of scope:**

- Pre-filling prefix / series / job id into track-prefix
- Hosting or embedding the track-prefix app
- Showing the CTA on `future` or `partial` series
- Auto-push / merge to `master` (local confirm + security audit first)
- Changes inside the `track-prefix` repository

## Architecture

```
Home SeriesCard (overallStatus === "mined")
  → link "know-present-location/"
    → static guide page
      → external links to github.com/Blazekachu/track-prefix
```

No new APIs, query params, localStorage, or network calls beyond normal static assets and optional outbound GitHub links.

## UI — Mined Series CTA

**File:** `src/app/page.tsx` → `SeriesCard`

**Gate:** `series.overallStatus === "mined"` only.

**Placement:** After the series sat-range line, before the block list / collapse UI.

**Control:**

| Attribute | Value |
|-----------|--------|
| Visible label | `Trace locations` |
| `title` (hover) | `Know Present Location of Sats from This Series` |
| `href` | `know-present-location/` (relative; trailing slash for static export) |
| Style | Reuse secondary / compact link-button patterns; add a small action row in `globals.css` if needed |

No CTA for `future` or `partial`.

## UI — Guide Page

**File:** `src/app/know-present-location/page.tsx`

Mirror sibling patterns from `inscriptions-on-satnames/` (back link to tracker, dark theme, readable long-form sections).

### Content outline (required sections, in order)

1. **What this is** — local track-prefix; FIFO present-location for sats in a mined series  
2. **Prerequisites** — Node.js 20+; network **or** mainnet bitcoind (`txindex=1`) and optionally ord; disk for SQLite under `data/jobs/`  
3. **Install & start** — `git clone` → `npm install` → `npm start` → open preferred `http://127.0.0.1:42069`  
4. **Data modes** — Public API / Paid Esplora / BTC node / BTC+ORD (same meaning as track-prefix README table)  
5. **Wizard** — disclosure → mode → credentials → list mined series → expectations → start  
6. **Dashboard** — pause/stop/resume; conservation gap; “complete” means gap 0  
7. **Optional next steps** — inscription scan after complete; short CLI cheat-sheet (`status`, `trace:sats`, `refresh`, `scan:inscriptions`, `snapshot`)  
8. **Safety** — local-only DB; do not commit credentials; track-prefix only **reads** bitcoind/ord and writes under its own `data/jobs/`  
9. **Links** — GitHub repo + README as source of truth  

Guide text should stay aligned with track-prefix **v0.1** behavior. Prefer linking to the repo README for edge cases rather than inventing new product behavior.

Include a **Back to tracker** control (same relative style as the inscriptions page).

## Styling

- Reuse existing CSS variables and button classes from `globals.css`
- Do not introduce a new visual theme
- Keep the first viewport of the guide brand-consistent with the rest of the site (dark, existing type)

## Data Flow

None beyond navigation. The guide does not receive or require prefix/series context.

## Error Handling / Edge Cases

| Case | Behavior |
|------|----------|
| Series `future` / `partial` | No CTA |
| Broken GitHub link | Ordinary browser failure; content still usable offline for clone steps if already known |
| Static export / `basePath` | Relative `href`s only (same rule as existing header CTA) |

## Testing

Manual on branch, locally:

1. `npm run dev`
2. Track a prefix that has a fully mined series (e.g. `bhang` / `exquisite`)
3. Confirm CTA appears only on mined cards; hover title matches
4. Open guide; spot-check all nine sections against track-prefix README
5. Confirm Back to tracker works
6. `npm run build` succeeds (static export)

No new automated unit tests required for this change.

## Ship Process

1. Implement on `feat/know-present-location-guide`
2. Run and confirm locally
3. Security audit / review
4. Only then merge/push to `master` (explicit human gate — do not auto-push)

## Success Criteria

- User can discover the handoff from a mined series card without reading external docs first
- Guide is complete enough to clone, start, and create a track-prefix job
- Site remains a static export with no new backend surface
