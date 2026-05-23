import { PrefixReport } from "../core/report";

/**
 * Returns the Series 1 supply-boundary banner text for this report, or null
 * if the 11-letter series is whole (no banner needed). Same text is used in
 * the CLI and the web UI so wording stays in sync.
 */
export function series1Banner(report: PrefixReport): string | null {
  if (report.series1Status === "present") return null;
  const suffixLen = 11 - report.prefixLength;
  const zName = report.prefix + "z".repeat(suffixLen);
  const aName = report.prefix + "a".repeat(suffixLen);
  if (report.series1Status === "missing") {
    return (
      `Note: No 11-letter series exists for \`${report.prefix}\`. Its 11-letter ` +
      `range (\`${zName}\` … \`${aName}\`) falls beyond Bitcoin's 21M-BTC supply, ` +
      `so Series 2 (10-letter) is the earliest real series.`
    );
  }
  return (
    `Note: Series 1 (11-letter names) is partial for \`${report.prefix}\` — ` +
    `the low end of its range (toward \`${zName}\`) falls past Bitcoin's ` +
    `21M-BTC supply, so only the in-supply portion is shown below.`
  );
}
