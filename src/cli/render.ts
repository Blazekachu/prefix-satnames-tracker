import { PrefixReport, ReportSeries } from "../core/report";
import { formatBigInt } from "../lib/format";

/** Render a PrefixReport as human-readable text for the terminal. */
export function renderText(report: PrefixReport): string {
  const lines: string[] = [];
  lines.push(
    `Prefix: ${report.prefix}  (${report.seriesCount} series, ` +
      `tip height ${formatBigInt(BigInt(report.tipHeight))})`,
  );
  if (report.seriesCount === 0) {
    lines.push("");
    lines.push("No real series exist for this prefix (all beyond sat supply).");
    return lines.join("\n");
  }
  for (const s of report.series) {
    lines.push("");
    lines.push(renderSeries(s));
  }
  return lines.join("\n");
}

function renderSeries(s: ReportSeries): string {
  const lines: string[] = [];
  lines.push(
    `Series ${s.id}  ·  ${s.nameLength}-letter names  ·  ` +
      `${s.satStartName} … ${s.satEndName}  [${s.overallStatus}]`,
  );
  lines.push(
    `  sats ${formatBigInt(s.satStart)} … ${formatBigInt(s.satEnd)}  ` +
      `(${formatBigInt(s.satCount)} sats)`,
  );
  if (s.blockSummary) {
    const b = s.blockSummary;
    lines.push(
      `  blocks ${formatBigInt(BigInt(b.startHeight))} … ` +
        `${formatBigInt(BigInt(b.endHeight))}  ` +
        `(${formatBigInt(BigInt(b.blockCount))} blocks, ${b.status}) ` +
        `— collapsed, use --no-collapse for detail`,
    );
  } else if (s.blockSegments) {
    for (const seg of s.blockSegments) {
      const when =
        seg.status === "mined"
          ? "✓ mined"
          : `⧗ future ~${seg.estimatedYear}`;
      lines.push(
        `  block ${formatBigInt(BigInt(seg.height))}  ` +
          `sats ${formatBigInt(seg.satRangeStart)} … ` +
          `${formatBigInt(seg.satRangeEnd)}  ` +
          `(${formatBigInt(seg.satCount)})  ${when}`,
      );
    }
  }
  return lines.join("\n");
}
