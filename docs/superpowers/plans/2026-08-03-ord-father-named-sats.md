# ORD FATHER Named Sats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a default-first lineage tab for inscription `0` inside the existing satname inscriptions page while preserving the broader tracked registry.

**Architecture:** Extract the registry into a typed module that knows which entries belong in which tab and how ORD FATHER lineage is described. Keep the UI on the same route and use lightweight tab controls plus the existing expandable card pattern.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, static export, existing global CSS.

## Global Constraints

- Keep the feature inside `src/app/inscriptions-on-satnames`.
- Default the page to the `Named Sats by ORD FATHER` tab.
- Use only verified ordinals facts already collected for inscription `0` lineage entries.
- Do not add a networked discovery engine.
- Preserve the current card-first visual language rather than introducing a separate page layout.

---

### Task 1: Extract Registry Data And Tab Logic

**Files:**
- Create: `src/app/inscriptions-on-satnames/registry.ts`
- Create: `src/app/inscriptions-on-satnames/registry.test.ts`

**Interfaces:**
- Produces: `RegistryTabId`, `SatnameInscription`, `REGISTRY_TABS`, `registryEntries`, `getEntriesForTab(tabId: RegistryTabId): SatnameInscription[]`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { getEntriesForTab } from "./registry";

describe("getEntriesForTab", () => {
  it("returns the inscription 0 lineage entries in featured order", () => {
    expect(getEntriesForTab("ord-father").map((entry) => entry.satname)).toEqual([
      "ezcubunuovm",
      "falsecolors",
      "daddyplease",
      "cargobroker",
      "acquisitive",
      "mixnetworks",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: FAIL because `./registry` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export type RegistryTabId = "ord-father" | "all";

export function getEntriesForTab(tabId: RegistryTabId) {
  return tabId === "ord-father" ? [] : [];
}
```

- [ ] **Step 4: Expand the registry module to pass the test**

```ts
export const registryEntries = [
  { satname: "ezcubunuovm", tabs: ["ord-father", "all"] },
  { satname: "falsecolors", tabs: ["ord-father", "all"] },
  { satname: "daddyplease", tabs: ["ord-father", "all"] },
  { satname: "cargobroker", tabs: ["ord-father", "all"] },
  { satname: "acquisitive", tabs: ["ord-father", "all"] },
  { satname: "mixnetworks", tabs: ["ord-father", "all"] },
] as const;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: PASS

### Task 2: Add The Tabbed Page

**Files:**
- Modify: `src/app/inscriptions-on-satnames/page.tsx`

**Interfaces:**
- Consumes: `REGISTRY_TABS`, `getEntriesForTab`
- Produces: two tab panels rendered on the existing route

- [ ] **Step 1: Add tab controls**

```tsx
<input defaultChecked id="registry-tab-ord-father" name="registry-tab" type="radio" />
<input id="registry-tab-all" name="registry-tab" type="radio" />
```

- [ ] **Step 2: Render tab labels**

```tsx
<label htmlFor="registry-tab-ord-father">Named Sats by ORD FATHER</label>
<label htmlFor="registry-tab-all">All named sats tracked yet</label>
```

- [ ] **Step 3: Render the first panel from `getEntriesForTab("ord-father")`**

```tsx
{getEntriesForTab("ord-father").map((entry) => (
  <details key={entry.satname}>{/* existing asset-card body */}</details>
))}
```

- [ ] **Step 4: Render the second panel from `getEntriesForTab("all")`**

```tsx
{getEntriesForTab("all").map((entry) => (
  <details key={entry.satname}>{/* existing asset-card body */}</details>
))}
```

- [ ] **Step 5: Add lineage facts to ORD FATHER cards**

```tsx
{entry.lineage ? (
  <section>
    <h3>Lineage to inscription 0</h3>
    <FieldList facts={entry.lineage.facts} />
  </section>
) : null}
```

### Task 3: Style The Tabs And Lineage Note

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing `asset-card`, `asset-gallery`, `registry-hero`
- Produces: `registry-tabs`, `registry-tab-list`, `registry-tab-label`, `registry-panel`, `lineage-banner`

- [ ] **Step 1: Add hidden radio control styles**

```css
.registry-tab-toggle {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
```

- [ ] **Step 2: Add the visible tab row styles**

```css
.registry-tab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
```

- [ ] **Step 3: Add checked-state styling**

```css
#registry-tab-ord-father:checked ~ .registry-tab-list label[for="registry-tab-ord-father"] {
  border-color: #f7a642;
}
```

- [ ] **Step 4: Add panel show/hide rules**

```css
.registry-panel {
  display: none;
}
```

- [ ] **Step 5: Add lineage banner styling**

```css
.lineage-banner {
  border: 1px solid rgba(247, 147, 26, 0.32);
}
```

### Task 4: Verify The Change

**Files:**
- Test: `src/app/inscriptions-on-satnames/registry.test.ts`

**Interfaces:**
- Verifies: tab ordering, TypeScript compile, existing app build

- [ ] **Step 1: Run the targeted registry test**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run TypeScript validation**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: PASS
