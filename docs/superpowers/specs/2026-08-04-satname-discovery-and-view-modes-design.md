# Satname Discovery And View Modes Design

Date: 2026-08-04
Project: Prefix Satnames Tracker

## Goal

Upgrade `/inscriptions-on-satnames` from a purely curated gallery into a hybrid discovery page:

- a user can type a satname into a discovery bar
- the page computes the sat locally from satname math
- the page performs a live ordinals-source check to determine whether that sat currently carries an inscription
- if an inscription is confirmed, the page links directly to the ordinals inscription page and offers an inline `Add Request` form
- the curated registry remains on the same page, but the user can switch how it is viewed through `Table`, `Compact`, and `Large` modes

This change does not introduce a crawler, backend, wallet integration, or editable public submissions.

## Product Outcome

The page should serve two jobs at once:

1. discovery:
   a visitor can test any satname live and immediately jump to the inscription page if it exists
2. curation:
   the existing registry remains the editorial layer of what is actually showcased on the page

The discovery result and the curated gallery are related but separate:

- discovery answers `is this satname's sat inscribed right now?`
- curation answers `which satname inscriptions are already documented on this page?`

## Discovery Bar

Add a discovery bar near the top of `/inscriptions-on-satnames`, above the tabbed registry content.

### Input

- single text input for satname
- same validation discipline as the prefix tracker:
  - trim whitespace
  - lowercase before lookup
  - reject invalid satname characters or malformed input

### Local Computation

- compute the sat number from the satname client-side
- do not send satname to any service until after local validation and computation succeeds
- display the computed sat number in the result state so the user sees the exact sat being checked

### Live Lookup

- after local computation, perform a read-only live lookup against an allowlisted ordinals source
- the purpose of the lookup is only to determine:
  - whether the computed sat currently has at least one inscription
  - which inscription ID should be linked for the user
- the discovery result must link to the inscription page, not the sat page

### Result States

#### Confirmed inscribed

Show:

- satname
- computed sat number
- confirmed inscription ID
- `View inscription` button to the ordinals inscription page
- `Add Request` button

#### Confirmed not inscribed

Show:

- satname
- computed sat number
- `No inscription found`

Do not show `Add Request`.

#### Live lookup unavailable

Show:

- satname
- computed sat number
- `Live lookup unavailable`

Do not show `Add Request`.

## Add Request Flow

`Add Request` is only available after a confirmed live inscription match.

### Interaction

- clicking `Add Request` expands a small inline form under the discovery result
- the form is not a modal
- the form should feel lightweight and scoped to the one discovered inscription

### Prefilled Submission Data

Visible read-only fields:

- satname
- inscription ID

Submitted hidden fields:

- ordinals inscription URL
- computed sat number
- page source marker such as `inscriptions-on-satnames live discovery`
- submission timestamp captured client-side at submit time

### Optional User Input

Only one optional editable field:

- Twitter/X username

No user email field, no wallet address field, no file upload, no freeform long description unless explicitly added in a later change.

### Delivery

- form submission should send an email to the owner's connected Gmail inbox through a static-site-compatible form relay
- the user should not need to open their own mail client
- the browser submits directly to the form provider
- the site must not contain Gmail credentials, SMTP credentials, or private mail secrets

### UX States

The form should show:

- idle state
- submitting state
- success state: request received
- failure state: request could not be submitted right now

On success, keep the discovered inscription result visible so the user can still click through to ordinals.

## View Modes

Keep the existing tab structure:

- `Named Sats by ORD FATHER`
- `All named sats tracked yet`

Add a separate view-mode control as clickable icon buttons. The selected view mode applies to the currently visible tab content.

### Modes

#### Table

Purpose: scan many entries quickly.

Each row should include:

- small preview thumbnail
- satname
- short role or lineage label
- inscription number
- tab-specific context
- action link to the inscription page

The table should not try to show every metadata field inline.

#### Compact

Purpose: browse visually with higher density than the large cards.

Each item should show:

- small preview tile
- satname
- short label

Clicking an item should reveal or route into the same detailed facts pattern already used by the page, without inventing a separate data model.

#### Large

Purpose: preserve the existing card-first experience.

- keep the current large preview card layout as the default mode
- keep the existing expandable asset-card pattern
- keep the current nested child-card behavior for fully mapped branches such as `falsecolors`

## Information Architecture

The page becomes:

1. hero / intro
2. discovery bar
3. live discovery result area
4. tab controls
5. view-mode icon controls
6. tab content rendered in the chosen view mode

The discovery result is independent from the curated gallery below it. A discovered inscription is not automatically added to the curated registry.

## Data Boundaries

The manual registry remains the source of truth for what is displayed in the curated gallery.

Live discovery data is temporary session data only:

- it can power the top search result
- it can prefill the request form
- it does not mutate `registry.ts`
- it does not create persistent local storage

## Safety Constraints

### Secrets

- never expose Gmail credentials, SMTP credentials, or private mail API secrets in browser code
- any form relay used here must support safe browser-side submission for static sites

### Live Lookup Surface

- only fetch from explicit allowlisted ordinals endpoints
- do not fetch arbitrary user-provided URLs
- keep requests read-only
- keep timeout handling explicit

### Remote Content Handling

- do not inject or render arbitrary remote HTML into the page
- only extract the minimum data needed to determine inscription presence and destination inscription URL
- keep existing inscription previews sandboxed

### Link Safety

- all external links open with `target="_blank"` and `rel="noreferrer"`

### Spam Reduction

- `Add Request` appears only after confirmed inscription presence
- no form is shown for not-inscribed or lookup-failed states
- keep submitted fields minimal

### Scope Restrictions

Do not add:

- wallet connect
- auth
- file uploads
- arbitrary embeds
- public user-generated listing
- automatic registry writes

## Architectural Direction

Follow the existing project shape:

- pure satname math stays in deterministic code
- live lookup logic stays in a thin client-side I/O layer
- request form integration stays isolated from the core math and registry modules
- view modes reuse the same typed registry data instead of introducing separate content sources

## Implementation Areas

Expected touch points:

- `src/app/inscriptions-on-satnames/page.tsx`
- `src/app/inscriptions-on-satnames/registry.ts`
- new helper modules for live lookup and request submission wiring as needed
- `src/app/globals.css`
- tests for satname discovery behavior, view-mode data selection, and any parser/helper logic introduced

## Out Of Scope

- automated satname-inscription crawling
- background syncing
- backend-owned submission storage
- admin moderation UI
- automatic addition of discovered inscriptions into the page registry
- multi-inscription chooser for sats with multiple inscriptions unless the live source forces that complexity

## Testing

- add targeted tests for any pure parsing or lookup-normalization helpers
- keep existing registry tests green
- run `npm test`
- run `npx tsc --noEmit`
- run `npm run build`
- locally verify:
  - confirmed inscribed result
  - confirmed not-inscribed result
  - live lookup failure state
  - `Add Request` visibility rules
  - table / compact / large switching on both tabs

