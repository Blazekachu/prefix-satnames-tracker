# Inscriptions On Satnames Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-review page that lists known satnames with inscriptions using only verified on-chain/ordinals facts.

**Architecture:** Add a static App Router route with a local typed registry. Reuse the existing global CSS file for layout and keep all data static until a future discovery engine exists.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, static export, existing CSS.

---

## Files

- Create: `src/app/inscriptions-on-satnames/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

## Tasks

### Task 1: Add Static Registry Page

- [ ] Create `src/app/inscriptions-on-satnames/page.tsx`.
- [ ] Define typed entries for `agooddoctor` and `excrescence`.
- [ ] Render preview and satname in the default gallery view.
- [ ] Hide sat facts, inscription facts, relationship facts, metadata highlights, and ordinals links behind click-to-open details.
- [ ] Keep external/social links visually separated and label them as pending/provided externally.

### Task 2: Add Navigation From Home

- [ ] Add a secondary link from the tracker header to `/inscriptions-on-satnames`.
- [ ] Ensure the link works in local dev and under the production `basePath`.

### Task 3: Add Styling

- [ ] Add page-specific CSS classes to `src/app/globals.css`.
- [ ] Ensure desktop cards are readable and mobile stacks without overflow.

### Task 4: Verify Locally

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Open the dev server route locally and confirm content renders before pushing.

## Notes

- Do not push until the dev-server page is reviewed and confirmed.
- Do not claim social/community context unless the link is on-chain metadata or provided separately by the owner.
