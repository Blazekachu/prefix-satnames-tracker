# Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed top-right sun/moon toggle on every page that switches dark/light via `data-theme`, persists in `localStorage` (`pst-theme`), and avoids flash on load.

**Architecture:** Pure theme helpers (`src/app/theme.ts`) drive storage + document attribute. A client `ThemeToggle` mounts from root `layout.tsx`. An inline anti-flash script sets `data-theme` before paint. Light tokens live under `[data-theme="light"]` in `globals.css`; dark remains the `:root` default.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, static export, existing CSS variables.

**Spec:** `docs/superpowers/specs/2026-08-08-theme-toggle-design.md`

**Branch:** `feat/know-present-location-guide`

## Global Constraints

- Storage key: `pst-theme` only (`"dark"` | `"light"`)
- Missing/invalid → dark
- Icon only; no OS `prefers-color-scheme`
- Site-wide via layout (do not duplicate per page)
- Windows PowerShell: use `git commit -m "..."` (no bash heredoc)
- Do not push to `master` unless the user asks

---

## File Structure

- `src/app/theme.ts` — pure helpers: normalize, read/write storage, apply to document, toggle
- `src/app/theme.test.ts` — Vitest for normalize + storage round-trip (jsdom/localStorage)
- `src/app/theme-toggle.tsx` — client icon button
- `src/app/layout.tsx` — anti-flash script + mount toggle
- `src/app/globals.css` — light tokens, body gradient override, `.theme-toggle` styles

---

### Task 1: Theme Helpers + Tests

**Files:**
- Create: `src/app/theme.ts`
- Create: `src/app/theme.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/theme.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import {
  THEME_STORAGE_KEY,
  applyTheme,
  normalizeTheme,
  readStoredTheme,
  toggleTheme,
  writeStoredTheme,
  type Theme,
} from "./theme";

describe("normalizeTheme", () => {
  it("accepts dark and light", () => {
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
  });

  it("defaults invalid values to dark", () => {
    expect(normalizeTheme(null)).toBe("dark");
    expect(normalizeTheme("")).toBe("dark");
    expect(normalizeTheme("nope")).toBe("dark");
  });
});

describe("storage + toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("reads dark when storage empty", () => {
    expect(readStoredTheme()).toBe("dark");
  });

  it("writes and reads light", () => {
    writeStoredTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(readStoredTheme()).toBe("light");
  });

  it("applyTheme sets data-theme and storage", () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(readStoredTheme()).toBe("light");
  });

  it("toggleTheme flips dark <-> light", () => {
    applyTheme("dark");
    const next: Theme = toggleTheme();
    expect(next).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(toggleTheme()).toBe("dark");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/theme.test.ts`

Expected: FAIL (module `./theme` not found)

- [ ] **Step 3: Implement `src/app/theme.ts`**

```ts
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "pst-theme";

export function normalizeTheme(value: string | null | undefined): Theme {
  return value === "light" || value === "dark" ? value : "dark";
}

export function readStoredTheme(): Theme {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "dark";
  }
}

export function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  writeStoredTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = readStoredTheme() === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/theme.test.ts`

Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/theme.ts src/app/theme.test.ts
git commit -m "feat(theme): add pst-theme helpers with tests"
```

---

### Task 2: ThemeToggle Component + Layout Wiring

**Files:**
- Create: `src/app/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/app/theme-toggle.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

import {
  applyTheme,
  readStoredTheme,
  toggleTheme,
  type Theme,
} from "./theme";

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = readStoredTheme();
    applyTheme(current);
    setTheme(current);
  }, []);

  function onToggle() {
    setTheme(toggleTheme());
  }

  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
```

- [ ] **Step 2: Update `src/app/layout.tsx`**

Replace file contents with:

```tsx
import type { Metadata } from "next";

import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prefix Satnames Tracker",
  description: "Enumerate sat-name series for a prefix and their Bitcoin blocks.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("pst-theme");document.documentElement.setAttribute("data-theme",(t==="light"||t==="dark")?t:"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
```

Notes:
- `suppressHydrationWarning` on `<html>` avoids React warnings when the script sets `data-theme` before hydrate.
- Do not change page-level headers; the toggle is layout-owned.

- [ ] **Step 3: Commit**

```bash
git add src/app/theme-toggle.tsx src/app/layout.tsx
git commit -m "feat(ui): add site-wide theme toggle in layout"
```

---

### Task 3: Light Theme CSS + Toggle Styles

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: After the existing `:root { ... }` block, add light tokens and body override**

Insert immediately after the closing `}` of `:root`:

```css
[data-theme="light"] {
  --bg: #f4f1ea;
  --surface: #fffcf7;
  --surface-strong: #ffffff;
  --line: #d7d0c4;
  --text: #1c1915;
  --muted: #5c564c;
  --blue: #3d4a90;
  --blue-soft: rgba(61, 74, 144, 0.14);
  --latte: #8a6a3a;
  --green: #2f7a4a;
  --orange: #c56a0a;
  --red: #c23b3b;
}

[data-theme="light"] body {
  background:
    radial-gradient(circle at 20% 0%, rgba(61, 74, 144, 0.12), transparent 34rem),
    linear-gradient(180deg, #f7f4ee 0%, #f0ebe3 44%, #e8e1d6 100%);
}
```

Also change the existing `body` rule so the dark gradient uses variables where easy (optional minimal change): keep the current dark body rule as the default; light override above is enough.

- [ ] **Step 2: Add `.theme-toggle` styles**

Append near other controls (after `.ghost-button` block is fine):

```css
.theme-toggle {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--text);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

.theme-toggle:hover {
  border-color: var(--orange);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

[data-theme="light"] .theme-toggle {
  box-shadow: 0 8px 20px rgba(28, 25, 21, 0.12);
}

[data-theme="light"] .tracker-panel,
[data-theme="light"] .example-panel {
  background: rgba(255, 252, 247, 0.92);
  box-shadow: 0 18px 48px rgba(28, 25, 21, 0.08);
}

[data-theme="light"] .header-link,
[data-theme="light"] .back-link {
  color: var(--blue);
}

[data-theme="light"] .privacy-pill {
  color: #24305a;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(ui): add light theme tokens and theme toggle styles"
```

---

### Task 4: Verify Locally

**Files:** none (manual + build)

- [ ] **Step 1: Run unit tests**

Run: `npm test`

Expected: all pass (including new theme tests)

- [ ] **Step 2: Dev server**

Run: `npm run dev`

Open http://localhost:3000/

- [ ] **Step 3: Manual checklist**

1. Clear `localStorage` key `pst-theme` (or Application → Local Storage) → reload → dark + moon
2. Click toggle → light + sun; reload → still light
3. Click again → dark; reload → still dark
4. Visit `/inscriptions-on-satnames/` and `/know-present-location/` → same preference + toggle visible top-right
5. Confirm no obvious unreadable text on light (headers, series cards, guide)

- [ ] **Step 4: Production build**

Run: `npm run build`

Expected: success; routes still include `/`, inscriptions, know-present-location

- [ ] **Step 5: Stop for human review**

Do not push/merge unless asked. Report results.

---

## Spec Coverage Checklist

| Spec requirement | Task |
|------------------|------|
| `data-theme` + CSS variables | Tasks 1–3 |
| `pst-theme` persistence | Task 1 + toggle |
| Default dark | Task 1 normalize + script |
| Anti-flash script | Task 2 layout |
| Icon-only sun/moon | Task 2 |
| Fixed top-right every page | Tasks 2–3 |
| Light tokens | Task 3 |
| Manual + build verify | Task 4 |

## Placeholder / Consistency Review

- Key name consistent: `pst-theme` / `THEME_STORAGE_KEY`
- Theme union: `"dark" | "light"` only
- No TBD/TODO in steps
