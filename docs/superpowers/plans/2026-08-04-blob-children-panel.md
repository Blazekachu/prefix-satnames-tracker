# Blob Children Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Blob-specific child-browser panel to the `blobnwthems` entry that shows verified child-range facts locally and hands the user off to ordinals.com for the full 10,000-child browse.

**Architecture:** Extend the manual registry with a Blob-only child-browser metadata block so the page can render the panel from typed editorial data instead of hardcoded strings. Keep the interaction local to the Blob parent card, use lightweight toggle state in the page component, and hand off the full child set to ordinals.com rather than fetching or rendering 10,000 entries in this site.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, static export, existing global CSS.

## Global Constraints

- This change applies only to the `blobnwthems` entry in the `All named sats tracked yet` tab.
- No other parent card gets this panel in this change.
- The panel should display the verified child ranges as:
- satname range: `blobnwthdng -> blobnwtcgsj`
- sat range: `1749358685270829 -> 1749358685356548`
- When the Blob parent card is opened, add a Blob-only secondary action inside the card: `Browse 10,000 children`
- The panel’s primary action is: `View all 10,000 children on ordinals.com`
- This should link to the ordinals child-browse surface for the Blob parent, not to the parent inscription page itself.
- The Blob child panel should use locally stored verified facts for the summary.
- Do not fetch or render all 10,000 children into this page.
- Do not build a virtualized local child explorer in this change.
- No arbitrary remote child-list rendering.
- No scraping of 10,000 entries into the browser.
- No unverified child range claims.
- All external handoff links use `target="_blank"` and `rel="noreferrer"`.
- Keep the interaction additive and local to the Blob card.

---

## File Structure

- `src/app/inscriptions-on-satnames/registry.ts`
  - extend the typed registry model with Blob child-browser metadata and store the verified Blob facts there
- `src/app/inscriptions-on-satnames/registry.test.ts`
  - verify the Blob entry exposes the expected child-browser metadata with the exact verified values
- `src/app/inscriptions-on-satnames/page.tsx`
  - render the Blob-only action and panel inside the existing card flow, with local toggle state
- `src/app/globals.css`
  - style the Blob panel as a lightweight research handoff block consistent with the rest of the registry page

### Task 1: Add Typed Blob Child-Browser Metadata To The Registry

**Files:**
- Modify: `src/app/inscriptions-on-satnames/registry.ts`
- Modify: `src/app/inscriptions-on-satnames/registry.test.ts`

**Interfaces:**
- Consumes: existing `type SatnameInscription`
- Produces:
  - `type ChildBrowserSummary = {`
    `count: string;`
    `satnameRangeStart: string;`
    `satnameRangeEnd: string;`
    `satRangeStart: string;`
    `satRangeEnd: string;`
    `browseUrl: string;`
    `browseLabel: string;`
    `note: string;`
    `}`
  - `blobnwthems.childBrowser?: ChildBrowserSummary`

- [ ] **Step 1: Write the failing test**

```ts
it("stores verified Blob child-browser metadata", () => {
  const blob = getEntriesForTab("all").find(
    (entry) => entry.satname === "blobnwthems",
  );

  expect(blob?.childBrowser).toEqual({
    count: "10,000",
    satnameRangeStart: "blobnwthdng",
    satnameRangeEnd: "blobnwtcgsj",
    satRangeStart: "1749358685270829",
    satRangeEnd: "1749358685356548",
    browseUrl:
      "https://ordinals.com/children/648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0",
    browseLabel: "View all 10,000 children on ordinals.com",
    note:
      "The full Blob child set is browsed on ordinals.com to keep this page fast while preserving verified range facts here.",
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: FAIL because `childBrowser` is not defined on `blobnwthems` yet

- [ ] **Step 3: Write the minimal type addition**

```ts
type ChildBrowserSummary = {
  count: string;
  satnameRangeStart: string;
  satnameRangeEnd: string;
  satRangeStart: string;
  satRangeEnd: string;
  browseUrl: string;
  browseLabel: string;
  note: string;
};

export type SatnameInscription = {
  // existing fields...
  childBrowser?: ChildBrowserSummary;
};
```

- [ ] **Step 4: Populate the verified Blob metadata**

```ts
{
  satname: "blobnwthems",
  tabs: ["all"],
  // existing fields...
  childBrowser: {
    count: "10,000",
    satnameRangeStart: "blobnwthdng",
    satnameRangeEnd: "blobnwtcgsj",
    satRangeStart: "1749358685270829",
    satRangeEnd: "1749358685356548",
    browseUrl:
      "https://ordinals.com/children/648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0",
    browseLabel: "View all 10,000 children on ordinals.com",
    note:
      "The full Blob child set is browsed on ordinals.com to keep this page fast while preserving verified range facts here.",
  },
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/inscriptions-on-satnames/registry.ts src/app/inscriptions-on-satnames/registry.test.ts
git commit -m "feat(registry): add verified blob child-browser metadata"
```

### Task 2: Render The Blob-Only Child Panel In The Parent Card

**Files:**
- Modify: `src/app/inscriptions-on-satnames/page.tsx`

**Interfaces:**
- Consumes:
  - `entry.childBrowser?: ChildBrowserSummary`
- Produces:
  - `function BlobChildBrowserPanel(props: { entry: SatnameInscription }): JSX.Element`
  - local open/close state scoped to the Blob card

- [ ] **Step 1: Write the failing test**

```ts
it("renders the Blob child-browser action only for blobnwthems", () => {
  const blob = getEntriesForTab("all").find((entry) => entry.satname === "blobnwthems");
  const doctor = getEntriesForTab("all").find((entry) => entry.satname === "agooddoctor");

  expect(Boolean(blob?.childBrowser)).toBe(true);
  expect(Boolean(doctor?.childBrowser)).toBe(false);
});
```

- [ ] **Step 2: Run the registry test to confirm the Blob-only condition exists**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: PASS after Task 1

- [ ] **Step 3: Add the Blob panel component**

```tsx
function BlobChildBrowserPanel({
  entry,
}: {
  entry: SatnameInscription & { childBrowser: NonNullable<SatnameInscription["childBrowser"]> };
}) {
  return (
    <div className="blob-child-browser">
      <p className="eyebrow">Blob child browser</p>
      <h3>{entry.satname}</h3>
      <dl className="blob-child-browser-fields">
        <div>
          <dt>Parent inscription</dt>
          <dd>#{entry.inscription.number}</dd>
        </div>
        <div>
          <dt>Verified child count</dt>
          <dd>{entry.childBrowser.count}</dd>
        </div>
        <div>
          <dt>Child satname range</dt>
          <dd>{entry.childBrowser.satnameRangeStart} -&gt; {entry.childBrowser.satnameRangeEnd}</dd>
        </div>
        <div>
          <dt>Child sat range</dt>
          <dd>{entry.childBrowser.satRangeStart} -&gt; {entry.childBrowser.satRangeEnd}</dd>
        </div>
      </dl>
      <p className="blob-child-browser-note">{entry.childBrowser.note}</p>
      <a
        href={entry.childBrowser.browseUrl}
        target="_blank"
        rel="noreferrer"
        className="primary-button discovery-link-button"
      >
        {entry.childBrowser.browseLabel}
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Add Blob-only toggle state inside `InscriptionCard`**

```tsx
const [showChildBrowser, setShowChildBrowser] = useState(false);

{entry.childBrowser ? (
  <div className="blob-child-browser-actions">
    <button
      type="button"
      className="secondary-button"
      onClick={() => setShowChildBrowser((value) => !value)}
    >
      {showChildBrowser ? "Hide child browser" : "Browse 10,000 children"}
    </button>
  </div>
) : null}

{entry.childBrowser && showChildBrowser ? (
  <BlobChildBrowserPanel entry={entry as SatnameInscription & { childBrowser: NonNullable<SatnameInscription["childBrowser"]> }} />
) : null}
```

- [ ] **Step 5: Keep the action out of non-Blob cards**

```tsx
{entry.childBrowser ? (
  <button type="button">Browse 10,000 children</button>
) : null}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/inscriptions-on-satnames/page.tsx
git commit -m "feat(ui): add blob child-browser handoff panel"
```

### Task 3: Style The Blob Panel As A Lightweight Research Handoff

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes:
  - `blob-child-browser`
  - `blob-child-browser-fields`
  - `blob-child-browser-note`
- Produces:
  - Blob-specific panel styles consistent with the existing dark registry design

- [ ] **Step 1: Add the panel shell styles**

```css
.blob-child-browser {
  margin-top: 18px;
  border: 1px solid rgba(216, 185, 137, 0.24);
  border-radius: 8px;
  background: rgba(13, 13, 15, 0.6);
  padding: 18px;
}
```

- [ ] **Step 2: Add the field grid**

```css
.blob-child-browser-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0 0;
}

.blob-child-browser-fields dt {
  color: #9f968c;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.blob-child-browser-fields dd {
  margin: 4px 0 0;
  color: var(--text);
  overflow-wrap: anywhere;
}
```

- [ ] **Step 3: Add the note and action spacing**

```css
.blob-child-browser-note {
  margin: 16px 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.blob-child-browser-actions {
  margin-top: 18px;
}
```

- [ ] **Step 4: Add responsive rules**

```css
@media (max-width: 760px) {
  .blob-child-browser-fields {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(styles): add blob child-browser panel styles"
```

### Task 4: Verify Blob Panel Behavior End To End

**Files:**
- Test: `src/app/inscriptions-on-satnames/registry.test.ts`
- Test: existing `src/app/inscriptions-on-satnames/*.test.ts`

**Interfaces:**
- Verifies:
  - Blob metadata exactness
  - Blob-only action condition
  - build safety

- [ ] **Step 1: Run the targeted registry tests**

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

- [ ] **Step 5: Verify the page locally**

Run: `npm run dev`
Expected:
- `blobnwthems` shows `Browse 10,000 children`
- non-Blob cards do not show that action
- the panel opens and closes cleanly
- the satname range shows `blobnwthdng -> blobnwtcgsj`
- the sat range shows `1749358685270829 -> 1749358685356548`
- the ordinals handoff button opens the Blob children browse surface

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test: verify blob child-browser handoff panel"
```

