const TIP_URL = "https://mempool.space/api/blocks/tip/height";

/** Fetch the current Bitcoin tip height. Retries once before throwing. */
export async function fetchTipHeight(): Promise<number> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(TIP_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = (await res.text()).trim();
      const height = Number(text);
      if (!Number.isInteger(height) || height <= 0) {
        throw new Error(`unexpected response: "${text}"`);
      }
      return height;
    } catch (err) {
      lastErr = err;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw new Error(
    `Could not fetch tip height from mempool.space: ${String(lastErr)}`,
  );
}
