# Dark / Light Theme Toggle Design

Date: 2026-08-08
Project: Prefix Satnames Tracker
Branch: `feat/know-present-location-guide`

## Goal

Add a simple **top-right** control on **every page** that switches between dark and light mode. The choice **persists in `localStorage`** until the user toggles again.

## Decisions

| Decision | Choice |
|----------|--------|
| Approach | CSS variables + `data-theme` on `<html>` |
| Default | Dark (current look) when no stored preference |
| Persistence | `localStorage` key `pst-theme` (`"dark"` \| `"light"`) |
| Control | Icon only (sun / moon) with accessible label |
| Placement | Site-wide via root layout, fixed top-right |
| Branch | Continue on `feat/know-present-location-guide` |
| OS preference | Not used; only explicit user choice |

## Architecture

```
layout.tsx
  ├─ inline script (before paint): read pst-theme → set data-theme on <html>
  ├─ ThemeToggle (client): button top-right; toggles data-theme + localStorage
  └─ children (all pages)

globals.css
  ├─ :root / [data-theme="dark"]  → existing dark tokens
  └─ [data-theme="light"]         → light token overrides + body gradient
```

No backend. Works with static export / GitHub Pages.

## Theme application

- Attribute: `document.documentElement.dataset.theme` / `data-theme="dark|light"`.
- Missing or invalid `localStorage` value → treat as **dark**.
- Toggle always writes the new value to `localStorage` and updates `data-theme` immediately.

### Anti-flash script

A small synchronous inline script in `<head>` (or early in `<html>`) runs before React hydrate:

1. Read `localStorage.getItem("pst-theme")`
2. If `"light"` or `"dark"`, set `document.documentElement.setAttribute("data-theme", value)`
3. Otherwise set `"dark"`

Wrap in try/catch (private browsing / blocked storage still defaults to dark).

## UI — ThemeToggle

**File:** `src/app/theme-toggle.tsx` (client component)

| State | Icon shown | Click does | `aria-label` / `title` |
|-------|------------|------------|-------------------------|
| dark | Moon | Switch to light | `Switch to light mode` |
| light | Sun | Switch to dark | `Switch to dark mode` |

- Fixed top-right (`position: fixed`), high z-index so it sits above page content on home, inscriptions, and know-present-location.
- Compact icon button; reuse existing border/surface tokens so it fits both themes.
- Keyboard: focusable button; Enter/Space activate (native button).

Icons: simple inline SVG (no new icon library).

## CSS — Light theme

Under `[data-theme="light"]`, redefine at least:

- `--bg`, `--surface`, `--surface-strong`, `--line`, `--text`, `--muted`
- Keep `--green`, `--orange`, `--red`, `--blue`, `--latte` readable on light (tweak only if contrast fails)

Body background: light paper-style gradient (not flat pure white only), still using variables where practical.

Hard-coded dark colors in component CSS (if any) that ignore variables should be updated only when they break light mode readability; prefer variables.

## Scope

**In scope:**

- Root layout wiring + anti-flash script
- `ThemeToggle` component + styles
- Light token set in `globals.css`
- Manual check on all three routes

**Out of scope:**

- System `prefers-color-scheme` auto mode
- Per-page different themes
- Animated theme transitions (optional later)
- Changes to track-prefix repo

## Testing

Manual on branch with `npm run dev`:

1. Fresh visit (clear `pst-theme`) → dark, moon icon
2. Toggle → light, sun icon; refresh → stays light
3. Toggle again → dark; refresh → stays dark
4. Confirm on `/`, `/inscriptions-on-satnames/`, `/know-present-location/`
5. `npm run build` still succeeds

## Success criteria

- One control, every page, top-right
- Preference survives refresh until user switches
- No flash of wrong theme on load when preference is light
- Dark remains default for new visitors
