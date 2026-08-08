# Every sat has a story — Site Hero Design

Date: 2026-08-08
Project: Prefix Satnames Tracker
Branch: `feat/know-present-location-guide`

## Goal

Make the on-chain OP_RETURN message **Every sat has a story** the primary hero on the three main pages. Keep each page’s existing functional title as a clear **second hero**, still large enough to show what the page does.

Source transaction (reference only — not linked in UI):  
https://mempool.space/tx/420a3e99e9252b45f6185c1cee22294dc1671725da3fc54ce3e77480e9372a69

## Decisions

| Decision | Choice |
|----------|--------|
| Pages | Home, inscriptions-on-satnames, know-present-location |
| Primary hero text | `Every sat has a story` (exact OP_RETURN casing) |
| Tx / explorer link in hero | None |
| Hierarchy | Story = largest `h1`; page name = smaller secondary title |
| Implementation | Shared brand-hero component + CSS |
| Browser / metadata title | Unchanged (`Prefix Satnames Tracker`) |
| Product / route renames | Out of scope |

## Content stack (per page)

Order, top to bottom:

1. Existing chrome (logo + lockup on home; back-link on other pages)
2. Existing eyebrow (unchanged)
3. **`h1.title`** — `Every sat has a story`
4. **Secondary title** — page-specific string (see below)
5. Existing lede (unchanged)

| Page | Secondary title |
|------|-----------------|
| Home (`/`) | Prefix Satnames Tracker |
| Inscriptions registry | Inscriptions on satnames |
| Know present location | Know present location of sats |

## Architecture

```
src/app/brand-hero.tsx
  ├─ export const STORY_HERO = "Every sat has a story"
  └─ BrandHero({ pageTitle }): h1.title + p.page-title

src/app/globals.css
  ├─ .title        → existing clamp size (story line)
  └─ .page-title   → ~45–55% of .title, bold, tight line-height

Pages wire BrandHero in place of the old single h1.title
```

No change to `layout.tsx` chrome. No mempool/explorer URL in the component.

## Accessibility

- Exactly one `h1` per page: the story line.
- Secondary title is a `p.page-title` (not a second `h1`), so know-present-location guide `h2`s stay a clean outline.
- Logo `alt` remains product-name based.

## Testing

- Assert `STORY_HERO === "Every sat has a story"`.
- Assert BrandHero renders an `h1` with that text and the `pageTitle` in `.page-title`.

## Scope

**In**

- Shared component, constant, CSS, three-page wire-up, unit test.

**Out**

- Linking the hero to the transaction.
- Changing document/`metadata` title.
- Renaming routes, nav CTAs, README, or product name elsewhere.
- Visual companion / new design system beyond `.page-title`.
