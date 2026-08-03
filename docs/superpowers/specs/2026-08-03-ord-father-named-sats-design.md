# ORD FATHER Named Sats Design

Date: 2026-08-03
Project: Prefix Satnames Tracker

## Goal

Update `/inscriptions-on-satnames` so the first view foregrounds the named-sat lineage verified under inscription `0`, while keeping the broader manual registry on the same page.

## Approved UX

- Keep everything inside the current `/inscriptions-on-satnames` route.
- Add a two-tab interface near the top of the page.
- Make the first tab the default tab.
- Tab labels:
  - `Named Sats by ORD FATHER`
  - `All named sats tracked yet`

## Content Model

The page remains a manual registry backed by static typed data. No discovery engine, crawler, or ordinals API integration is added in this change.

Add a lineage-aware registry model:

- Existing generic entries stay valid for the broader tab.
- ORD FATHER entries carry extra lineage metadata so the UI can explain how each card connects back to inscription `0`.
- The lineage tab is curated around verified named-sat anchors, not every descendant inscription ever minted under a branch.

## Verified ORD FATHER Branch To Feature

Use inscription `0` on satname `ezcubunuovm` as the root.

Verified direct named-sat children to feature:

- `falsecolors`
- `daddyplease`
- `cargobroker`
- `acquisitive`
- `mixnetworks`

Verified named-sat descendants already confirmed from those branches:

- `falsecolors` branch: `badgertooth`, `zonefruits`, `abysscalled`, `cactusseeds`, `carpetyarns`, `necrowizard`, `ghostflight`, `breathelast`
- `cargobroker` branch: `hazasvignzf`
- `mixnetworks` branch: `highwaystar`

The page should present these descendant satnames as nested cards inside the relevant branch cards where the branch is fully mapped. The first implementation target is the `falsecolors` branch.

## Page Behavior

- First tab explains that it is a curated lineage view rooted at inscription `0`.
- Second tab keeps the broader registry semantics.
- Reuse the current expandable asset-card pattern.
- Add a lineage section to cards that belong to the ORD FATHER tab:
  - root/direct-child labels
  - depth to inscription `0`
  - lineage path
  - branch/family note where relevant
- Do not render inscription `0` itself as a tracked card. Treat it as root context above the branch cards.
- Do not duplicate ORD FATHER lineage cards in the second tab.

## Nested Child Cards

- `falsecolors` expands into a nested child-card gallery rendered inside the opened `falsecolors` parent card.
- Each nested child is a full expandable card, not a plain descendant list item.
- Each nested child card includes:
  - satname
  - preview iframe
  - sat facts
  - inscription facts, where verified
  - lineage facts such as `Grandchild of inscription 0` and `Child of falsecolors`
  - ordinals links
- The nested child-card gallery should visually read as a second row inside the parent branch card rather than as peer cards in the outer gallery.
- Keep the renderer intentionally two-level for now:
  - top-level ORD FATHER branch cards
  - nested child cards inside a fully mapped branch
- Do not build an unbounded recursive tree renderer in this change.

## Tab Semantics

- Tab 1, `Named Sats by ORD FATHER`, is the dedicated provenance view.
- Tab 2, `All named sats tracked yet`, excludes the ORD FATHER branch entries and their nested descendants because that lineage is already covered in Tab 1.
- The broader tab continues to show the manually tracked non-ORD-FATHER named-sat inscriptions.

## Data Boundaries

- Only include claims directly verified from ordinals.com pages and recursive child endpoints.
- If a branch is only partially mapped, say that explicitly instead of implying completeness.
- Avoid assigning unverified collection names to branches.
- For the nested child-card gallery, only render child cards for descendants whose sat placement and inscription linkage have already been verified.

## Files To Touch

- `src/app/inscriptions-on-satnames/page.tsx`
- `src/app/inscriptions-on-satnames/registry.ts`
- `src/app/inscriptions-on-satnames/registry.test.ts`
- `src/app/globals.css`

## Testing

- Add pure-TypeScript tests around:
  - ORD FATHER top-level card membership
  - exclusion from the broader tab
  - verified nested child-card data for `falsecolors`
- Run `npm test`.
- Run `npx tsc --noEmit`.
- Run `npm run build`.
