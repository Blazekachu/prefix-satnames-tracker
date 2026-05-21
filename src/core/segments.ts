import { blockFirstSat, blockSubsidy, satToBlock } from "./sat-math";

export interface RawSegment {
  height: bigint;
  satRangeStart: bigint;
  satRangeEnd: bigint;
  satCount: bigint;
}

/**
 * Split an inclusive sat range [satStart, satEnd] into one segment per block it
 * touches, intersecting the range with each block's subsidy span.
 */
export function splitIntoBlocks(satStart: bigint, satEnd: bigint): RawSegment[] {
  const segments: RawSegment[] = [];
  const startBlock = satToBlock(satStart);
  const endBlock = satToBlock(satEnd);

  for (let h = startBlock; h <= endBlock; h++) {
    const blockStart = blockFirstSat(h);
    const blockEnd = blockStart + blockSubsidy(h) - 1n;
    const segStart = satStart > blockStart ? satStart : blockStart;
    const segEnd = satEnd < blockEnd ? satEnd : blockEnd;
    if (segStart > segEnd) continue;
    segments.push({
      height: h,
      satRangeStart: segStart,
      satRangeEnd: segEnd,
      satCount: segEnd - segStart + 1n,
    });
  }
  return segments;
}
