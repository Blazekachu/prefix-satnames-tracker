# Every Sat Has a Story Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `Every sat has a story` the primary `h1` on home, inscriptions-on-satnames, and know-present-location, with each page’s existing title as a clearly smaller second hero.

**Architecture:** A shared presentational `BrandHero` exports the OP_RETURN constant and renders `h1.title` + `p.page-title`. New `.page-title` CSS sits under the existing `.title` clamp. Three pages replace their lone `h1.title` with `<BrandHero pageTitle="…" />`. No explorer links; metadata title unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest + `react-dom/server` `renderToStaticMarkup` (existing UI test pattern), CSS in `globals.css`.

**Spec:** `docs/superpowers/specs/2026-08-08-every-sat-has-a-story-hero-design.md`

**Branch:** `feat/know-present-location-guide`

## Global Constraints

- Exact string: `Every sat has a story` (sentence case; matches OP_RETURN)
- No mempool/explorer link in the hero
- One `h1` per page (story line); secondary is `p.page-title`
- Do not change `layout.tsx` metadata title
- Vitest includes only `src/**/*.test.ts` (not `.tsx`)
- Windows PowerShell: use `git commit -m "..."` (no bash heredoc)
- Do not push to `master` unless the user asks

---

## File Structure

- `src/app/brand-hero.tsx` — `STORY_HERO` constant + `BrandHero({ pageTitle })`
- `src/app/brand-hero.test.ts` — constant + static markup assertions
- `src/app/globals.css` — add `.page-title` after `.title`
- `src/app/page.tsx` — home wire-up
- `src/app/inscriptions-on-satnames/page.tsx` — registry wire-up
- `src/app/know-present-location/page.tsx` — guide wire-up

---

### Task 1: BrandHero + Tests (TDD)

**Files:**
- Create: `src/app/brand-hero.test.ts`
- Create: `src/app/brand-hero.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/app/brand-hero.test.ts`:

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BrandHero, STORY_HERO } from "./brand-hero";

describe("STORY_HERO", () => {
  it("matches the on-chain OP_RETURN message", () => {
    expect(STORY_HERO).toBe("Every sat has a story");
  });
});

describe("BrandHero", () => {
  it("renders story as h1.title and pageTitle as p.page-title", () => {
    const html = renderToStaticMarkup(
      createElement(BrandHero, { pageTitle: "Prefix Satnames Tracker" }),
    );

    expect(html).toContain("<h1 class=\"title\">Every sat has a story</h1>");
    expect(html).toContain(
      "<p class=\"page-title\">Prefix Satnames Tracker</p>",
    );
    expect(html).not.toContain("mempool.space");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/brand-hero.test.ts`

Expected: FAIL (cannot find module `./brand-hero` or `BrandHero` / `STORY_HERO` undefined)

- [ ] **Step 3: Write minimal implementation**

Create `src/app/brand-hero.tsx`:

```tsx
export const STORY_HERO = "Every sat has a story";

type BrandHeroProps = {
  pageTitle: string;
};

export function BrandHero({ pageTitle }: BrandHeroProps) {
  return (
    <>
      <h1 className="title">{STORY_HERO}</h1>
      <p className="page-title">{pageTitle}</p>
    </>
  );
}
```

No `"use client"`. No links.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/brand-hero.test.ts`

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```powershell
git add src/app/brand-hero.tsx src/app/brand-hero.test.ts
git commit -m "feat(ui): add BrandHero with Every sat has a story"
```

---

### Task 2: `.page-title` CSS

**Files:**
- Modify: `src/app/globals.css` (immediately after the `.title` rule block)

- [ ] **Step 1: Add `.page-title` styles**

Existing `.title` (do not change):

```css
.title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.35rem);
  line-height: 0.95;
  letter-spacing: 0;
}
```

Insert immediately after that block:

```css
.page-title {
  margin: 10px 0 0;
  font-size: clamp(1.05rem, 2.5vw, 2.15rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: 0;
  color: var(--text);
}
```

Sizing is ~50% of `.title` so the story line stays the clear primary hero.

- [ ] **Step 2: Commit**

```powershell
git add src/app/globals.css
git commit -m "feat(ui): style secondary page-title under story hero"
```

---

### Task 3: Wire home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import BrandHero**

At the top of `src/app/page.tsx`, with the other imports, add:

```ts
import { BrandHero } from "@/app/brand-hero";
```

- [ ] **Step 2: Replace the home `h1`**

In the brand lockup, replace:

```tsx
<p className="eyebrow">Ordinal sat-name range finder</p>
<h1 className="title">Prefix Satnames Tracker</h1>
<p className="lede">
```

with:

```tsx
<p className="eyebrow">Ordinal sat-name range finder</p>
<BrandHero pageTitle="Prefix Satnames Tracker" />
<p className="lede">
```

Leave logo, CTA, form, and lede text unchanged. Do not add a tx link.

- [ ] **Step 3: Commit**

```powershell
git add src/app/page.tsx
git commit -m "feat(ui): use BrandHero on home page"
```

---

### Task 4: Wire inscriptions registry page

**Files:**
- Modify: `src/app/inscriptions-on-satnames/page.tsx`

- [ ] **Step 1: Import BrandHero**

Near the other imports at the top of the file, add:

```ts
import { BrandHero } from "@/app/brand-hero";
```

- [ ] **Step 2: Replace the registry `h1`**

Inside `.registry-hero`, replace:

```tsx
<p className="eyebrow">Curated registry</p>
<h1 className="title">Inscriptions on satnames</h1>
<p className="lede">
```

with:

```tsx
<p className="eyebrow">Curated registry</p>
<BrandHero pageTitle="Inscriptions on satnames" />
<p className="lede">
```

Keep back-link, discovery form, and lede unchanged.

- [ ] **Step 3: Commit**

```powershell
git add src/app/inscriptions-on-satnames/page.tsx
git commit -m "feat(ui): use BrandHero on inscriptions registry"
```

---

### Task 5: Wire know-present-location page

**Files:**
- Modify: `src/app/know-present-location/page.tsx`

- [ ] **Step 1: Import BrandHero**

At the top of the file (after constants or with imports), add:

```ts
import { BrandHero } from "@/app/brand-hero";
```

- [ ] **Step 2: Replace the guide `h1`**

Replace:

```tsx
<p className="eyebrow">Handoff to track-prefix</p>
<h1 className="title">Know present location of sats</h1>
<p className="lede">
```

with:

```tsx
<p className="eyebrow">Handoff to track-prefix</p>
<BrandHero pageTitle="Know present location of sats" />
<p className="lede">
```

Keep back-link, lede, and all guide sections/`h2`s unchanged.

- [ ] **Step 3: Run full unit suite**

Run: `npm test`

Expected: all tests PASS (including `brand-hero.test.ts`)

- [ ] **Step 4: Manual check in the running dev server**

Open:

- http://localhost:3000/
- http://localhost:3000/inscriptions-on-satnames/
- http://localhost:3000/know-present-location/

Confirm on each page:

1. Largest heading is `Every sat has a story`
2. Former page title sits under it, still bold but clearly smaller
3. Eyebrow / back-link / lede still present
4. No explorer link on the story line
5. Browser tab title still `Prefix Satnames Tracker` (or site default)

If the dev server is not running: `npm run dev` from the repo root.

- [ ] **Step 5: Commit**

```powershell
git add src/app/know-present-location/page.tsx
git commit -m "feat(ui): use BrandHero on know-present-location"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Story as primary hero on 3 pages | Tasks 3–5 |
| Exact OP_RETURN casing | Task 1 (`STORY_HERO`) |
| No tx link | Tasks 1, 3–5 |
| Secondary page titles | Tasks 1, 3–5 |
| Shared component | Task 1 |
| `.page-title` sizing | Task 2 |
| One `h1` / `p.page-title` a11y | Task 1 |
| Metadata title unchanged | No layout edits |
| Unit tests | Task 1 + Task 5 suite |
