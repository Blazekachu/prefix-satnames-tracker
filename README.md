# Prefix Satnames Tracker

Type a sat-name prefix, get **every series** for it — from the longest 11-letter
names down to the prefix itself as a single targeted satoshi — with each series'
sat ranges, the Bitcoin blocks they fall in, and whether each block is already
mined or a future unmined block.

**Live site:** https://blazekachu.github.io/prefix-satnames-tracker/

It is pure computation. Nothing is stored, there is no backend, and the prefix
you search never leaves your browser. The only network request is a single call
to mempool.space for the current block height.

## How sat names work

Ordinal theory gives every satoshi a name via `x = SUPPLY - sat`, encoded
base-26 (`a`=1 … `z`=26). Earlier sats get longer names; the very last sat ever
mined is named `"a"`. As the blockchain moves forward, sat numbers go up and name
length goes down (11 → 10 → … → 1).

For a prefix like `bhang`, a **series** is every name of one fixed length sharing
that prefix:

| Series | Name length | Example names | When |
|--------|-------------|---------------|------|
| 1 | 11 letters | `bhangaaaaaa` … `bhangzzzzzz` | earliest — block 579,124 (2019), mined |
| 2 | 10 letters | `bhangaaaaa` … `bhangzzzzz` | a future block |
| … | … | … | … |
| last | 5 letters | `bhang` itself | a far-future single sat |

Series count = `12 - prefixLength`. Series whose names map beyond Bitcoin's total
sat supply are not real series and are skipped.

## Use it locally

Requires Node.js 20+.

```bash
git clone https://github.com/Blazekachu/prefix-satnames-tracker.git
cd prefix-satnames-tracker
npm install
```

### CLI

```bash
npm run prefix -- bhang                 # trace a prefix
npm run prefix -- bhang --json          # machine-readable output
npm run prefix -- bhang --tip 900000    # offline: supply the tip height yourself
npm run prefix -- bhang --no-collapse   # full per-block detail for huge series
```

### Web app

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # static export to ./out
```

### Tests

```bash
npm test
```

## How it works

- `src/core/` — pure, fully-tested computation: name ↔ sat math, series
  enumeration, per-block segmentation, mined/future classification.
- `src/lib/tip.ts` — the only I/O: fetches the current tip height from
  mempool.space.
- `src/app/` — the Next.js web UI (a static export).
- `scripts/cli.ts` — the command-line interface.

Design notes are in `docs/superpowers/`.
