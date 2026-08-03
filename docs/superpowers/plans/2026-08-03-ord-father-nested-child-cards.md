# ORD FATHER Nested Child Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the verified `falsecolors` descendants as full nested cards inside the first-tab ORD FATHER branch view while keeping the second tab free of ORD FATHER lineage entries.

**Architecture:** Extend the existing static registry with nested child-card data for fully mapped branches, starting with `falsecolors`. Keep the page on the existing route and render a two-level tree only: top-level branch cards and nested child-card galleries inside opened parent cards.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, static export, existing global CSS.

## Global Constraints

- Keep the feature inside `src/app/inscriptions-on-satnames`.
- Do not render inscription `0` itself as a tracked card.
- Keep ORD FATHER lineage entries out of the second tab.
- Render `falsecolors` descendants as full nested cards, not plain text list items.
- Use only already verified descendant data.
- Keep the renderer intentionally two-level; do not build a generic recursive tree renderer in this change.

---

### Task 1: Extend Registry Types For Nested Child Cards

**Files:**
- Modify: `src/app/inscriptions-on-satnames/registry.ts`
- Modify: `src/app/inscriptions-on-satnames/registry.test.ts`

**Interfaces:**
- Consumes: existing `SatnameInscription`
- Produces: `children?: SatnameInscription[]` for top-level branch entries, with `falsecolors.children` populated and `getEntriesForTab("ord-father")` still returning only top-level branch cards

- [ ] **Step 1: Write the failing test**

```ts
it("stores the falsecolors descendants as nested child cards", () => {
  const falsecolors = getEntriesForTab("ord-father").find(
    (entry) => entry.satname === "falsecolors",
  );

  expect(falsecolors?.children?.map((child) => child.satname)).toEqual([
    "badgertooth",
    "zonefruits",
    "abysscalled",
    "cactusseeds",
    "carpetyarns",
    "necrowizard",
    "ghostflight",
    "breathelast",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: FAIL because `children` does not exist on the registry entries yet.

- [ ] **Step 3: Add the minimal type and data shape**

```ts
export type SatnameInscription = {
  // existing fields...
  children?: SatnameInscription[];
};
```

- [ ] **Step 4: Populate `falsecolors.children` with verified child entries**

```ts
children: [
  {
    satname: "badgertooth",
    role: "Grandchild via falsecolors",
    tabs: [],
    // sat facts, inscription facts, lineage facts, links
  },
]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: PASS

### Task 2: Render Nested Child Cards Inside The Falsecolors Branch

**Files:**
- Modify: `src/app/inscriptions-on-satnames/page.tsx`

**Interfaces:**
- Consumes: `SatnameInscription.children`
- Produces: nested expandable child-card gallery inside opened parent branch cards

- [ ] **Step 1: Add a reusable card renderer**

```tsx
function InscriptionCard({
  entry,
  cardKey,
  nested = false,
}: {
  entry: SatnameInscription;
  cardKey: string;
  nested?: boolean;
}) {
  return <details className={nested ? "asset-card nested-asset-card" : "asset-card"} />;
}
```

- [ ] **Step 2: Replace the top-level inline card markup with `InscriptionCard`**

```tsx
{entries.map((entry) => (
  <InscriptionCard cardKey={`${tabId}-${entry.satname}`} entry={entry} />
))}
```

- [ ] **Step 3: Render a nested gallery when `entry.children` exists**

```tsx
{entry.children?.length ? (
  <div className="nested-asset-gallery">
    {entry.children.map((child) => (
      <InscriptionCard
        key={`${entry.satname}-${child.satname}`}
        cardKey={`${entry.satname}-${child.satname}`}
        entry={child}
        nested
      />
    ))}
  </div>
) : null}
```

- [ ] **Step 4: Show lineage facts for each nested child card**

```tsx
<section>
  <h3>Lineage to inscription 0</h3>
  <FieldList facts={entry.lineage?.facts ?? []} />
</section>
```

- [ ] **Step 5: Keep the all-tab rendering unchanged at top level**

```tsx
<RegistryPanel tabId="all" />
```

### Task 3: Style Nested Child Cards As A Second-Row Gallery

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `asset-card`, `asset-gallery`
- Produces: `nested-asset-gallery`, `nested-asset-card`, any nested spacing and responsive rules needed

- [ ] **Step 1: Add a nested gallery container**

```css
.nested-asset-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}
```

- [ ] **Step 2: Add nested card styling**

```css
.nested-asset-card {
  background: rgba(13, 13, 15, 0.62);
  box-shadow: none;
}
```

- [ ] **Step 3: Keep nested cards from breaking the outer layout**

```css
.nested-asset-gallery .asset-card[open] {
  grid-column: auto;
}
```

- [ ] **Step 4: Ensure nested cards stack on mobile**

```css
@media (max-width: 760px) {
  .nested-asset-gallery {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Add a small section heading for the child-card gallery**

```css
.nested-asset-heading {
  margin: 18px 0 10px;
}
```

### Task 4: Verify The Nested Child-Card Experience

**Files:**
- Test: `src/app/inscriptions-on-satnames/registry.test.ts`

**Interfaces:**
- Verifies: child-card data, compile, build, existing tests

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

Run: `npm.cmd run build`
Expected: PASS
