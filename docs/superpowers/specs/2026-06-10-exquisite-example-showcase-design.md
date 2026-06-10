# Exquisite Example Showcase Design

Date: 2026-06-10
Project: Prefix Satnames Tracker

## Goal

Improve the default page appearance and add a lower-page example section that shows what the tracker does through the `exquisite` prefix. The example should use the on-chain Exquisite inscription as the visual reference, while keeping the tracker itself as the first-screen product.

## Source Inscription

- Inscription ID: `db044cb57073abf71bbab6111415e3c0a38cce1428d364c8f275e9d8995252dbi201`
- Ordinals page metadata: `Exquisite #1042`
- Content type: `text/html;charset=utf-8`
- Content length: `935 bytes`
- Verified top-level artwork color: `#4B5BAB`
- Trait metadata observed on ordinals.com: `Monolith`, `Stripes Latte`, `Regular Green`, `Small Latte`, `Block`

The page may embed the public Ordinals preview/content URL for this inscription inside the example section only. The hero/top tool area must not use the inscription as a primary visual.

## Appearance Direction

Use a restrained palette derived from the inscription:

- Primary blue: `#4B5BAB`
- Warm latte neutrals for panels and text surfaces
- Green accents for mined/available status
- Bitcoin orange as a secondary action/accent, not the dominant theme

The page should still read as a utility: clear input, readable results, compact information density, and no decorative landing-page hero.

## Default Page Structure

1. Top utility section:
   - Keep `Prefix Satnames Tracker` and the prefix search form first.
   - Improve spacing, typography, input/button styling, and result card readability.
   - Preserve existing validation, automatic tip fetch, manual tip fallback, and report rendering behavior.

2. Lower example showcase:
   - Add a distinct section below the main tracker surface.
   - Title: `Example: exquisite`
   - Include the Exquisite inscription preview/content in a contained media panel.
   - Explain that the tracker finds every sat-name series for a prefix.
   - State that only `703` sats across all `exquisite*` satnames exist out of `2,100,000,000,000,000` total Bitcoin sats.
   - Show the percentage: `0.000000000033476%` of all Bitcoin sats.
   - Show the deterministic breakdown:
     - `676` sats in 11-letter names: `exquisiteaa` through `exquisitezz`
     - `26` sats in 10-letter names: `exquisitea` through `exquisitez`
     - `1` sat for the exact 9-letter name: `exquisite`
   - Include an action that lets the user try the `exquisite` prefix in the tracker.

## Data And Behavior

The example values are static explanatory copy derived from the existing core math. The implementation must not change `src/core/*`.

The `Try exquisite` action should set the input to `exquisite` and run the same existing submit path, or otherwise produce the same report behavior through existing app state. If the automatic tip fetch fails, the existing manual block-height fallback remains the source of truth.

## Error Handling

If the external Ordinals iframe/content fails to load, the example section should still communicate the prefix math through text. The section must include a normal link to the inscription so users can open it directly.

No new backend, storage, or API route is needed.

## Testing

- Run `npm test` to confirm core behavior remains intact.
- Run TypeScript checking with `npx tsc --noEmit`.
- Run/build the Next app and visually verify:
  - The tracker is still the first-screen focus.
  - The lower example section embeds or links the inscription cleanly.
  - The `703` count and `0.000000000033476%` percentage are visible.
  - The layout works on desktop and mobile widths without text overlap.

## Out Of Scope

- No changes to sat-name math, forecast logic, or core tests.
- No generated image asset is needed.
- No deployment or push unless explicitly requested.
