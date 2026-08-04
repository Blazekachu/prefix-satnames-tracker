# Satname Discovery And View Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live satname discovery, a safe inline request form, and switchable table/compact/large registry views to `/inscriptions-on-satnames`.

**Architecture:** Keep satname math deterministic and local, then layer a thin client-side ordinals lookup on top for inscription discovery. Preserve the existing static registry as the editorial source for gallery content, and add a view-mode state machine that renders the same registry data through three presentation components. Use a browser-safe form relay integration for request submission without introducing backend code or exposing secrets.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, static export, existing global CSS.

## Global Constraints

- Keep the feature inside `src/app/inscriptions-on-satnames`.
- The page computes the sat locally from satname math.
- The page performs a live ordinals-source check to determine whether that sat currently carries an inscription.
- The discovery result must link to the inscription page, not the sat page.
- `Add Request` is only available after a confirmed live inscription match.
- Do not show `Add Request` for confirmed not-inscribed or live lookup unavailable states.
- The browser submits directly to the form provider.
- The site must not contain Gmail credentials, SMTP credentials, or private mail secrets.
- Keep the existing tab structure: `Named Sats by ORD FATHER` and `All named sats tracked yet`.
- Add a separate view-mode control as clickable icon buttons.
- The selected view mode applies to the currently visible tab content.
- Keep the current large preview card layout as the default mode.
- The manual registry remains the source of truth for what is displayed in the curated gallery.
- Live discovery data is temporary session data only.
- Only fetch from explicit allowlisted ordinals endpoints.
- Do not inject or render arbitrary remote HTML into the page.
- All external links open with `target="_blank"` and `rel="noreferrer"`.
- Do not add wallet connect, auth, file uploads, arbitrary embeds, public user-generated listing, or automatic registry writes.

---

## File Structure

- `src/core/satname.ts`
  - pure satname validation and satname-to-sat conversion helpers reused by discovery
- `src/core/satname.test.ts`
  - deterministic tests for satname parsing and sat lookup math
- `src/app/inscriptions-on-satnames/discovery.ts`
  - thin client-side ordinals lookup helpers, result normalization, allowlisted endpoints, timeout handling
- `src/app/inscriptions-on-satnames/discovery.test.ts`
  - tests for lookup result normalization and failure handling without live network dependence
- `src/app/inscriptions-on-satnames/request-form.tsx`
  - inline request form component and submit-state handling
- `src/app/inscriptions-on-satnames/view-modes.tsx`
  - table, compact, and large registry renderers over shared registry entry types
- `src/app/inscriptions-on-satnames/page.tsx`
  - page composition, discovery state, view-mode state, tab state wiring
- `src/app/inscriptions-on-satnames/registry.ts`
  - small type extensions for view-mode-friendly shared card metadata
- `src/app/inscriptions-on-satnames/registry.test.ts`
  - registry assertions for view-mode source data if needed
- `src/app/globals.css`
  - discovery bar, result card, request form, view-mode controls, compact and table layouts

### Task 1: Add Deterministic Satname Math Helpers

**Files:**
- Create: `src/core/satname.ts`
- Create: `src/core/satname.test.ts`

**Interfaces:**
- Consumes: existing sat numbering constants and math patterns already used in `src/core/sat-math.ts`
- Produces:
  - `type SatnameValidationResult = { ok: true; satname: string } | { ok: false; error: string }`
  - `function validateSatname(input: string): SatnameValidationResult`
  - `function satnameToSat(satname: string): bigint`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { satnameToSat, validateSatname } from "./satname";

describe("validateSatname", () => {
  it("normalizes lowercase satnames", () => {
    expect(validateSatname(" ExQuIsItE ")).toEqual({
      ok: true,
      satname: "exquisite",
    });
  });

  it("rejects invalid characters", () => {
    expect(validateSatname("exquisite-1")).toEqual({
      ok: false,
      error: "Satnames must contain only letters a-z.",
    });
  });
});

describe("satnameToSat", () => {
  it("maps exquisite back to its known sat number", () => {
    expect(satnameToSat("exquisite")).toBe(2098757593392471n);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/core/satname.test.ts`
Expected: FAIL because `src/core/satname.ts` does not exist yet

- [ ] **Step 3: Write minimal implementation**

```ts
const SAT_SUPPLY = 2_100_000_000_000_000n;

export type SatnameValidationResult =
  | { ok: true; satname: string }
  | { ok: false; error: string };

export function validateSatname(input: string): SatnameValidationResult {
  const satname = input.trim().toLowerCase();
  if (!satname) return { ok: false, error: "Enter a satname." };
  if (!/^[a-z]+$/.test(satname)) {
    return { ok: false, error: "Satnames must contain only letters a-z." };
  }
  return { ok: true, satname };
}

export function satnameToSat(satname: string): bigint {
  let offset = 0n;
  for (const char of satname) {
    offset = offset * 26n + BigInt(char.charCodeAt(0) - 96);
  }
  return SAT_SUPPLY - offset;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/core/satname.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/satname.ts src/core/satname.test.ts
git commit -m "feat(core): add satname discovery math helpers"
```

### Task 2: Add Live Ordinals Lookup Normalization

**Files:**
- Create: `src/app/inscriptions-on-satnames/discovery.ts`
- Create: `src/app/inscriptions-on-satnames/discovery.test.ts`

**Interfaces:**
- Consumes: `satnameToSat(satname: string): bigint`
- Produces:
  - `type DiscoveryResult =`
    `| { status: "inscribed"; sat: bigint; inscriptionId: string; inscriptionUrl: string }`
    `| { status: "not-inscribed"; sat: bigint }`
    `| { status: "lookup-unavailable"; sat: bigint; message: string }`
  - `function extractInscriptionIdFromHtml(html: string): string | null`
  - `async function lookupSatnameInscription(satname: string, signal?: AbortSignal): Promise<DiscoveryResult>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { extractInscriptionIdFromHtml } from "./discovery";

describe("extractInscriptionIdFromHtml", () => {
  it("returns the first inscription id from ordinals sat html", () => {
    const html = `
      <html>
        <body>
          <a href="/inscription/abc123i0">first</a>
          <a href="/inscription/def456i0">second</a>
        </body>
      </html>
    `;

    expect(extractInscriptionIdFromHtml(html)).toBe("abc123i0");
  });

  it("returns null when no inscription link exists", () => {
    expect(extractInscriptionIdFromHtml("<html><body>none</body></html>")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/inscriptions-on-satnames/discovery.test.ts`
Expected: FAIL because `discovery.ts` does not exist yet

- [ ] **Step 3: Write minimal implementation**

```ts
const ORDINALS_BASE = "https://ordinals.com";
const INSCRIPTION_LINK_RE = /\/inscription\/([0-9a-f]+i\d+)/i;

export type DiscoveryResult =
  | { status: "inscribed"; sat: bigint; inscriptionId: string; inscriptionUrl: string }
  | { status: "not-inscribed"; sat: bigint }
  | { status: "lookup-unavailable"; sat: bigint; message: string };

export function extractInscriptionIdFromHtml(html: string): string | null {
  const match = html.match(INSCRIPTION_LINK_RE);
  return match ? match[1] : null;
}

export async function lookupSatnameInscription(
  satname: string,
  signal?: AbortSignal,
): Promise<DiscoveryResult> {
  const sat = satnameToSat(satname);
  const response = await fetch(`${ORDINALS_BASE}/sat/${sat.toString()}`, { signal });
  if (!response.ok) {
    return { status: "lookup-unavailable", sat, message: "Live lookup unavailable" };
  }
  const html = await response.text();
  const inscriptionId = extractInscriptionIdFromHtml(html);
  if (!inscriptionId) return { status: "not-inscribed", sat };
  return {
    status: "inscribed",
    sat,
    inscriptionId,
    inscriptionUrl: `${ORDINALS_BASE}/inscription/${inscriptionId}`,
  };
}
```

- [ ] **Step 4: Expand implementation for timeout-safe lookup-unavailable behavior**

```ts
export async function lookupSatnameInscription(
  satname: string,
  signal?: AbortSignal,
): Promise<DiscoveryResult> {
  const sat = satnameToSat(satname);
  try {
    const response = await fetch(`${ORDINALS_BASE}/sat/${sat.toString()}`, {
      signal,
      headers: { Accept: "text/html" },
      cache: "no-store",
    });
    if (!response.ok) {
      return { status: "lookup-unavailable", sat, message: "Live lookup unavailable" };
    }
    const html = await response.text();
    const inscriptionId = extractInscriptionIdFromHtml(html);
    if (!inscriptionId) return { status: "not-inscribed", sat };
    return {
      status: "inscribed",
      sat,
      inscriptionId,
      inscriptionUrl: `${ORDINALS_BASE}/inscription/${inscriptionId}`,
    };
  } catch {
    return { status: "lookup-unavailable", sat, message: "Live lookup unavailable" };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/inscriptions-on-satnames/discovery.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/inscriptions-on-satnames/discovery.ts src/app/inscriptions-on-satnames/discovery.test.ts
git commit -m "feat(discovery): add live ordinals lookup helpers"
```

### Task 3: Add Inline Request Form Component

**Files:**
- Create: `src/app/inscriptions-on-satnames/request-form.tsx`

**Interfaces:**
- Consumes:
  - `type DiscoveryResult = { status: "inscribed"; sat: bigint; inscriptionId: string; inscriptionUrl: string }`
- Produces:
  - `type RequestFormProps = { satname: string; sat: bigint; inscriptionId: string; inscriptionUrl: string; endpoint: string }`
  - `function RequestForm(props: RequestFormProps): JSX.Element`

- [ ] **Step 1: Write the failing test**

```ts
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RequestForm } from "./request-form";

describe("RequestForm", () => {
  it("renders prefilled readonly satname and inscription id fields", () => {
    render(
      <RequestForm
        satname="exquisite"
        sat={2098757593392471n}
        inscriptionId="db044...i201"
        inscriptionUrl="https://ordinals.com/inscription/db044...i201"
        endpoint="https://formspree.io/f/test"
      />,
    );

    expect(screen.getByDisplayValue("exquisite")).toHaveAttribute("readonly");
    expect(screen.getByDisplayValue("db044...i201")).toHaveAttribute("readonly");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/inscriptions-on-satnames/request-form.test.tsx`
Expected: FAIL because `request-form.tsx` and test setup do not exist yet

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

type RequestFormProps = {
  satname: string;
  sat: bigint;
  inscriptionId: string;
  inscriptionUrl: string;
  endpoint: string;
};

export function RequestForm({
  satname,
  sat,
  inscriptionId,
  inscriptionUrl,
  endpoint,
}: RequestFormProps) {
  return (
    <form action={endpoint} method="POST" className="request-form">
      <input name="satname" readOnly value={satname} />
      <input name="inscription_id" readOnly value={inscriptionId} />
      <input type="hidden" name="sat_number" value={sat.toString()} />
      <input type="hidden" name="inscription_url" value={inscriptionUrl} />
      <input type="hidden" name="source" value="inscriptions-on-satnames live discovery" />
      <input name="twitter_username" placeholder="@username (optional)" />
      <button type="submit">Submit request</button>
    </form>
  );
}
```

- [ ] **Step 4: Upgrade implementation to client submit states**

```tsx
const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setStatus("submitting");

  const formData = new FormData(event.currentTarget);
  formData.set("submitted_at", new Date().toISOString());

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  setStatus(response.ok ? "success" : "error");
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/inscriptions-on-satnames/request-form.tsx
git commit -m "feat(request): add inline satname request form"
```

### Task 4: Add View-Mode Renderers

**Files:**
- Create: `src/app/inscriptions-on-satnames/view-modes.tsx`
- Modify: `src/app/inscriptions-on-satnames/registry.ts`

**Interfaces:**
- Consumes:
  - `type SatnameInscription`
  - existing `InscriptionCard`-compatible entry data
- Produces:
  - `type RegistryViewMode = "table" | "compact" | "large"`
  - `function ViewModePicker(props: { value: RegistryViewMode; onChange(value: RegistryViewMode): void }): JSX.Element`
  - `function RegistryView(props: { entries: SatnameInscription[]; mode: RegistryViewMode }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { getEntriesForTab } from "./registry";

describe("registry view data", () => {
  it("provides inscription numbers for table mode rows", () => {
    const entry = getEntriesForTab("ord-father")[0];
    expect(entry.inscription.number).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails or exposes missing shared fields**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: FAIL only if shared view-mode fields are missing; otherwise proceed directly to implementation

- [ ] **Step 3: Write minimal implementation**

```tsx
export type RegistryViewMode = "table" | "compact" | "large";

export function ViewModePicker({
  value,
  onChange,
}: {
  value: RegistryViewMode;
  onChange(value: RegistryViewMode): void;
}) {
  return (
    <div className="view-mode-picker" aria-label="Registry view mode">
      <button type="button" aria-pressed={value === "table"} onClick={() => onChange("table")}>
        Table
      </button>
      <button type="button" aria-pressed={value === "compact"} onClick={() => onChange("compact")}>
        Compact
      </button>
      <button type="button" aria-pressed={value === "large"} onClick={() => onChange("large")}>
        Large
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Add the three registry renderers**

```tsx
export function RegistryView({
  entries,
  mode,
  renderLargeCard,
}: {
  entries: SatnameInscription[];
  mode: RegistryViewMode;
  renderLargeCard(entry: SatnameInscription): React.ReactNode;
}) {
  if (mode === "table") {
    return (
      <table className="registry-table">
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.satname}>
              <td>{entry.satname}</td>
              <td>{entry.role}</td>
              <td>{entry.inscription.number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (mode === "compact") {
    return (
      <div className="compact-gallery">
        {entries.map((entry) => (
          <button key={entry.satname} type="button" className="compact-tile">
            <span>{entry.satname}</span>
            <small>{entry.role}</small>
          </button>
        ))}
      </div>
    );
  }

  return <section className="asset-gallery">{entries.map(renderLargeCard)}</section>;
}
```

- [ ] **Step 5: Run the relevant tests**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/inscriptions-on-satnames/view-modes.tsx src/app/inscriptions-on-satnames/registry.ts src/app/inscriptions-on-satnames/registry.test.ts
git commit -m "feat(ui): add satname registry view modes"
```

### Task 5: Compose Discovery, Request Form, Tabs, And View Modes On The Page

**Files:**
- Modify: `src/app/inscriptions-on-satnames/page.tsx`

**Interfaces:**
- Consumes:
  - `validateSatname(input: string): SatnameValidationResult`
  - `lookupSatnameInscription(satname: string, signal?: AbortSignal): Promise<DiscoveryResult>`
  - `RequestForm`
  - `ViewModePicker`
  - `RegistryView`
- Produces:
  - integrated page behavior for discovery result states
  - `Add Request` button gating
  - view-mode selection shared by both tabs

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { validateSatname } from "@/core/satname";

describe("satname discovery page contracts", () => {
  it("allows discovery only for valid satnames", () => {
    expect(validateSatname("bad name")).toEqual({
      ok: false,
      error: "Satnames must contain only letters a-z.",
    });
  });
});
```

- [ ] **Step 2: Run the page-related tests to verify current coverage before edits**

Run: `npm test -- src/app/inscriptions-on-satnames/registry.test.ts src/core/satname.test.ts src/app/inscriptions-on-satnames/discovery.test.ts`
Expected: PASS before page wiring changes begin

- [ ] **Step 3: Add discovery state and submit flow**

```tsx
const [query, setQuery] = useState("");
const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
const [lookupState, setLookupState] = useState<"idle" | "loading">("idle");

async function onDiscoverySubmit(event: React.FormEvent) {
  event.preventDefault();
  const validated = validateSatname(query);
  if (!validated.ok) {
    setError(validated.error);
    return;
  }

  setLookupState("loading");
  setDiscovery(await lookupSatnameInscription(validated.satname));
  setLookupState("idle");
}
```

- [ ] **Step 4: Render the three discovery result states with correct button gating**

```tsx
{discovery?.status === "inscribed" ? (
  <>
    <a href={discovery.inscriptionUrl} target="_blank" rel="noreferrer">
      View inscription
    </a>
    <button type="button" onClick={() => setShowRequestForm((value) => !value)}>
      Add Request
    </button>
    {showRequestForm ? (
      <RequestForm
        satname={validatedSatname}
        sat={discovery.sat}
        inscriptionId={discovery.inscriptionId}
        inscriptionUrl={discovery.inscriptionUrl}
        endpoint={requestEndpoint}
      />
    ) : null}
  </>
) : null}
```

- [ ] **Step 5: Wire tab content through `RegistryView` and preserve the large-card renderer**

```tsx
const [viewMode, setViewMode] = useState<RegistryViewMode>("large");

<ViewModePicker value={viewMode} onChange={setViewMode} />

<RegistryView
  entries={entries}
  mode={viewMode}
  renderLargeCard={(entry) => (
    <InscriptionCard
      cardKey={`${tabId}-${entry.satname}`}
      entry={entry}
      key={`${tabId}-${entry.satname}`}
    />
  )}
/>
```

- [ ] **Step 6: Commit**

```bash
git add src/app/inscriptions-on-satnames/page.tsx
git commit -m "feat(page): add satname discovery and request flow"
```

### Task 6: Add Styling For Discovery, Request Form, And View Modes

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes:
  - `request-form`
  - `view-mode-picker`
  - `registry-table`
  - `compact-gallery`
  - existing `asset-card` classes
- Produces:
  - safe, readable layouts for discovery result area and three view modes

- [ ] **Step 1: Add discovery bar and result styles**

```css
.discovery-shell {
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(13, 13, 15, 0.52);
  padding: 18px;
}

.discovery-result {
  margin-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 14px;
}
```

- [ ] **Step 2: Add request form styles**

```css
.request-form {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.request-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
```

- [ ] **Step 3: Add view-mode icon button styles**

```css
.view-mode-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.view-mode-button[aria-pressed="true"] {
  border-color: rgba(247, 147, 26, 0.72);
  background: rgba(247, 147, 26, 0.12);
}
```

- [ ] **Step 4: Add table and compact layouts**

```css
.registry-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.compact-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}
```

- [ ] **Step 5: Add responsive rules**

```css
@media (max-width: 760px) {
  .request-form-grid,
  .compact-gallery {
    grid-template-columns: 1fr;
  }

  .registry-table {
    display: block;
    overflow-x: auto;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(styles): add discovery and view mode layouts"
```

### Task 7: Verify End To End

**Files:**
- Test: `src/core/satname.test.ts`
- Test: `src/app/inscriptions-on-satnames/discovery.test.ts`
- Test: `src/app/inscriptions-on-satnames/registry.test.ts`
- Test: existing suite in `src/`

**Interfaces:**
- Verifies:
  - deterministic satname math
  - live lookup normalization
  - registry data compatibility with new views
  - build safety

- [ ] **Step 1: Run the targeted tests**

Run: `npm test -- src/core/satname.test.ts src/app/inscriptions-on-satnames/discovery.test.ts src/app/inscriptions-on-satnames/registry.test.ts`
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

- [ ] **Step 5: Verify the page locally**

Run: `npm run dev`
Expected:
- `/inscriptions-on-satnames` loads
- confirmed inscribed result shows `View inscription` and `Add Request`
- confirmed not-inscribed result hides `Add Request`
- lookup-unavailable result hides `Add Request`
- table / compact / large switch correctly on both tabs

- [ ] **Step 6: Commit verification-ready work**

```bash
git add .
git commit -m "test: verify satname discovery and registry views"
```

