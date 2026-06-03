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
