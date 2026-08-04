# Blob Children Panel Design

Date: 2026-08-04
Project: Prefix Satnames Tracker

## Goal

Add a Blob-specific child-browser handoff inside the existing `All named sats tracked yet` registry tab.

The `blobnwthems` entry should gain a fast in-page panel that explains the Blob child set and shows verified child-range facts, while handing the user off to ordinals.com for the full 10,000-child browse experience.

This change is intentionally not a local 10,000-item renderer.

## Why This Approach

The Blob parent has a very large child set. Pulling and rendering all children inside this page would add avoidable latency, memory cost, and UI complexity for a flow ordinals.com already serves well.

The page should therefore:

- stay fast on first click
- show verified Bitcoin-native facts locally
- hand off the full child browsing to ordinals.com

## Scope

This change applies only to the `blobnwthems` entry in the `All named sats tracked yet` tab.

No other parent card gets this panel in this change.

## Verified Live Facts To Use

These values were verified live from ordinals.com on 2026-08-04 and should be treated as the source of truth for this feature:

- Blob parent satname: `blobnwthems`
- Blob parent inscription ID: `648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0`
- Blob parent inscription number: `63959577`
- Child count: `10,000`
- Children pagination shape: `100` pages of `100` children each from the ordinals children endpoint
- First verified child inscription ID: `b10b00bfb146fee3e86d6cbd8e8c954c485da41be480c0b21a6a63de7986892bi0`
- First verified child sat: `1749358685270829`
- First verified child satname: `blobnwthdng`
- Last verified child inscription ID: `b10b6d7b50884a407f5071db984af6887d0c1881cc06d879c38cbddaa653b8d0i249`
- Last verified child sat: `1749358685356548`
- Last verified child satname: `blobnwtcgsj`

The panel should display the verified child ranges as:

- satname range: `blobnwthdng -> blobnwtcgsj`
- sat range: `1749358685270829 -> 1749358685356548`

## UI Behavior

### Parent Card

Keep `blobnwthems` as a standard registry card inside `All named sats tracked yet`.

When the Blob parent card is opened, add a Blob-only secondary action inside the card:

- `Browse 10,000 children`

This action should not appear on non-Blob entries.

### Blob Panel

Clicking `Browse 10,000 children` opens a lightweight in-page panel attached to the Blob card.

The panel is a contextual information panel, not a modal and not a separate route.

The panel should show:

- parent satname
- parent inscription number
- verified child count
- verified child satname range
- verified child sat range
- short explanation that the full child set is intentionally browsed on ordinals.com to keep this page fast

### Primary Action

The panel’s primary action is:

- `View all 10,000 children on ordinals.com`

This should link to the ordinals child-browse surface for the Blob parent, not to the parent inscription page itself.

### Dismissal

The panel should be closable within the card.

Acceptable behaviors:

- clicking the same `Browse 10,000 children` action again toggles the panel closed
- or a dedicated `Close` / `Hide panel` control inside the panel

The interaction should stay lightweight and reversible.

## Data Strategy

The Blob child panel should use locally stored verified facts for the summary:

- child count
- satname range
- sat range
- child-browse URL

Do not fetch or render all 10,000 children into this page.

Do not build a virtualized local child explorer in this change.

## Registry Model Changes

The manual registry should grow a Blob-specific child-browser metadata block so the UI can render this panel without special-casing hardcoded strings in the component tree.

That metadata should include:

- child count
- child satname range start/end
- child sat range start/end
- ordinals browse URL

The Blob-specific panel is still editorial data, not user-generated or auto-synced state.

## Safety Constraints

- no arbitrary remote child-list rendering
- no scraping of 10,000 entries into the browser
- no unverified child range claims
- all external handoff links use `target="_blank"` and `rel="noreferrer"`
- keep the interaction additive and local to the Blob card

## Visual Direction

The Blob panel should visually feel like a research handoff:

- same dark registry language as the rest of the page
- concise verified facts
- clear emphasis on the two ranges
- one obvious ordinals handoff button

It should feel lighter than a full asset card, because it is a contextual explainer rather than a second collection renderer.

## Files To Touch

- `src/app/inscriptions-on-satnames/registry.ts`
- `src/app/inscriptions-on-satnames/page.tsx`
- `src/app/globals.css`
- tests covering registry data shape and any Blob-panel conditional rendering helpers

## Out Of Scope

- rendering the full 10,000 children locally
- lazy-loading child pages into this site
- search/filter inside the Blob child set
- applying this panel pattern to every collection parent
- automatic live re-verification of Blob bounds on every page load

## Testing

- add a registry test for the Blob child-browser metadata
- keep existing registry/page tests green
- run `npm test`
- run `npx tsc --noEmit`
- run `npm run build`
- verify locally that:
  - the Blob action appears only on `blobnwthems`
  - the Blob panel opens and closes cleanly
  - the verified ranges render exactly as specified
  - the ordinals handoff link opens the correct child-browse surface

