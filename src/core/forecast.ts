export type BlockStatus = "mined" | "future";

const BLOCK_MINUTES = 10;

/** A block is mined if its height is at or below the current tip. */
export function classifyBlock(height: bigint, tip: bigint): BlockStatus {
  return height <= tip ? "mined" : "future";
}

export interface FutureEstimate {
  isoDate: string; // YYYY-MM-DD
  year: string;
}

/** Estimate when a future block will be mined, at ~10 minutes per block. */
export function estimateDate(
  height: bigint,
  tip: bigint,
  now: Date = new Date(),
): FutureEstimate {
  const blocksAhead = Number(height - tip);
  const ms = now.getTime() + blocksAhead * BLOCK_MINUTES * 60_000;
  const d = new Date(ms);
  return {
    isoDate: d.toISOString().slice(0, 10),
    year: String(d.getUTCFullYear()),
  };
}
