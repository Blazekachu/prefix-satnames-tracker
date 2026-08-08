# AGENTS.md — prefix-satnames-tracker

Full context: `F:\Users\akhil\Main\AI_HANDOVER\projects\prefix-satnames-tracker\` and `AI_HANDOVER\AI_OPERATOR_MANUAL.md`.

## What this is
Public, **LIVE** tool (GitHub Pages `blazekachu.github.io/prefix-satnames-tracker`). Enumerates sat-name series for a prefix + their Bitcoin blocks. **Pure math — no `bitcoinjs-lib`.** The reference example of the house "pure core + thin I/O shell" pattern.

## Rules
- ⚠️ **Public + live** — pushing to `master` (rebuild `out/` first) deploys publicly. Push only when asked.
- Keep `src/core/*` **pure and deterministic** (no `Date.now()`/`Math.random()` in core). All I/O stays in `src/lib/tip.ts`.
- Every core module has a colocated `.test.ts` — keep that bar.

## Run / test
- CLI: `npm run prefix -- bhang` (`--tip <h>` for offline). Web: `npm run dev` · `npm run build` (static export → `out/`) · `npm test` (~52 tests).
- Commit as `Blazekachu <237100058+Blazekachu@users.noreply.github.com>`; one fix = one commit.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
