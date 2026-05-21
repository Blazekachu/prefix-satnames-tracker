import { buildSeriesRanges, SeriesRange } from "./series";
import { splitIntoBlocks } from "./segments";
import { classifyBlock, estimateDate } from "./forecast";

const COLLAPSE_THRESHOLD = 10;

export type SeriesStatus = "mined" | "future" | "partial";

export interface BlockSegment {
  height: number;
  satRangeStart: bigint;
  satRangeEnd: bigint;
  satCount: bigint;
  status: "mined" | "future";
  estimatedDate?: string;
  estimatedYear?: string;
}

export interface BlockSummary {
  startHeight: number;
  endHeight: number;
  blockCount: number;
  status: SeriesStatus;
}

export interface ReportSeries {
  id: number;
  nameLength: number;
  firstName: string;
  lastName: string;
  satStart: bigint;
  satEnd: bigint;
  satCount: bigint;
  overallStatus: SeriesStatus;
  /** Present when the series spans <= 10 blocks. */
  blockSegments?: BlockSegment[];
  /** Present when the series spans > 10 blocks (unless collapse is disabled). */
  blockSummary?: BlockSummary;
}

export interface PrefixReport {
  prefix: string;
  prefixLength: number;
  seriesCount: number;
  tipHeight: number;
  series: ReportSeries[];
}

export interface ReportOptions {
  /** Reference time for future-date estimates. Defaults to now. */
  now?: Date;
  /** Collapse series spanning > 10 blocks into a summary. Defaults to true. */
  collapse?: boolean;
}

/** Build the full report for a (already-validated) prefix. */
export function buildReport(
  prefix: string,
  tipHeight: number,
  opts: ReportOptions = {},
): PrefixReport {
  const now = opts.now ?? new Date();
  const collapse = opts.collapse ?? true;
  const tip = BigInt(tipHeight);
  const series = buildSeriesRanges(prefix).map((r) =>
    toReportSeries(r, tip, now, collapse),
  );
  return {
    prefix,
    prefixLength: prefix.length,
    seriesCount: series.length,
    tipHeight,
    series,
  };
}

function toReportSeries(
  r: SeriesRange,
  tip: bigint,
  now: Date,
  collapse: boolean,
): ReportSeries {
  const segments: BlockSegment[] = splitIntoBlocks(r.satStart, r.satEnd).map(
    (s) => {
      const status = classifyBlock(s.height, tip);
      const seg: BlockSegment = {
        height: Number(s.height),
        satRangeStart: s.satRangeStart,
        satRangeEnd: s.satRangeEnd,
        satCount: s.satCount,
        status,
      };
      if (status === "future") {
        const est = estimateDate(s.height, tip, now);
        seg.estimatedDate = est.isoDate;
        seg.estimatedYear = est.year;
      }
      return seg;
    },
  );

  const minedCount = segments.filter((s) => s.status === "mined").length;
  const overallStatus: SeriesStatus =
    minedCount === segments.length
      ? "mined"
      : minedCount === 0
        ? "future"
        : "partial";

  const base: ReportSeries = {
    id: r.id,
    nameLength: r.nameLength,
    firstName: r.firstName,
    lastName: r.lastName,
    satStart: r.satStart,
    satEnd: r.satEnd,
    satCount: r.satCount,
    overallStatus,
  };

  if (collapse && segments.length > COLLAPSE_THRESHOLD) {
    base.blockSummary = {
      startHeight: segments[0].height,
      endHeight: segments[segments.length - 1].height,
      blockCount: segments.length,
      status: overallStatus,
    };
  } else {
    base.blockSegments = segments;
  }
  return base;
}
