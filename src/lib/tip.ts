/**
 * Public Esplora providers, tried in order. All expose the same Esplora REST
 * shape. memepool.space is a separate ordinals-focused explorer (NOT a typo for
 * mempool.space) kept as a last-resort fallback. To go self-sovereign, prepend
 * your own node's Esplora URL (e.g. "http://localhost:3000/api") — it becomes
 * the first-priority source and the public ones stay as fallback.
 */
export const ESPLORA_PROVIDERS = [
  "https://mempool.space/api",
  "https://blockstream.info/api",
  "https://memepool.space/api",
];

/** Per-provider timeout. A slow/unreachable provider fails fast and we move on. */
const TIMEOUT_MS = 4000;

/**
 * Fetch the current Bitcoin tip height, trying each Esplora provider in order.
 * Each request has a short timeout so a hung provider can't stall the UI — it
 * fails fast and we fall through to the next. Throws only if every provider fails.
 */
export async function fetchTipHeight(
  providers: string[] = ESPLORA_PROVIDERS,
): Promise<number> {
  let lastErr: unknown;
  for (const base of providers) {
    try {
      const res = await fetch(`${base}/blocks/tip/height`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = (await res.text()).trim();
      const height = Number(text);
      if (!Number.isInteger(height) || height <= 0) {
        throw new Error(`unexpected response: "${text}"`);
      }
      return height;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Could not fetch tip height from any Esplora provider (${providers.join(
      ", ",
    )}): ${String(lastErr)}`,
  );
}
