"use client";

import { useState } from "react";
import { validatePrefix } from "@/core/prefix";
import { buildReport, PrefixReport } from "@/core/report";
import { fetchTipHeight } from "@/lib/tip";
import { formatBigInt } from "@/lib/format";
import { series1Banner } from "@/lib/banner";

const COLLAPSE_AT = 10;
const EXQUISITE_PREFIX = "exquisite";
const EXQUISITE_INSCRIPTION_ID =
  "db044cb57073abf71bbab6111415e3c0a38cce1428d364c8f275e9d8995252dbi201";
const EXQUISITE_INSCRIPTION_URL = `https://ordinals.com/inscription/${EXQUISITE_INSCRIPTION_ID}`;
const EXQUISITE_PREVIEW_URL = `https://ordinals.com/preview/${EXQUISITE_INSCRIPTION_ID}`;

function statusColor(status: string): string {
  if (status === "mined") return "#68d391";
  if (status === "future") return "#f7931a";
  return "#d8b989";
}

export default function Home() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<PrefixReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualTip, setManualTip] = useState("");
  const [pendingPrefix, setPendingPrefix] = useState<string | null>(null);

  function compute(prefix: string, tip: number) {
    setReport(buildReport(prefix, tip, { collapse: false }));
    setError(null);
    setPendingPrefix(null);
  }

  async function runPrefix(prefix: string) {
    setError(null);
    setReport(null);
    setPendingPrefix(null);

    const validated = validatePrefix(prefix.trim().toLowerCase());
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setInput(validated.prefix);
    setLoading(true);
    try {
      const tip = await fetchTipHeight();
      compute(validated.prefix, tip);
    } catch {
      setError(
        "Couldn't reach any block-height source. Enter the current block height manually below.",
      );
      setPendingPrefix(validated.prefix);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runPrefix(input);
  }

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tip = Number(manualTip);
    if (!Number.isInteger(tip) || tip <= 0) {
      setError("Enter a valid positive block height.");
      return;
    }
    if (pendingPrefix) compute(pendingPrefix, tip);
  }

  return (
    <main className="page-shell">
      <section className="tracker-panel">
        <div className="header-row">
          <div>
            <p className="eyebrow">Ordinal sat-name range finder</p>
            <h1 className="title">Prefix Satnames Tracker</h1>
            <p className="lede">
              Enter a prefix to see every sat-name series, the exact sat ranges,
              and the Bitcoin blocks where those names land.
            </p>
          </div>
          <div className="privacy-pill">Client-side math</div>
        </div>

        <form onSubmit={onSubmit} className="search-form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. bhang"
            className="text-input"
            aria-label="Sat-name prefix"
          />
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Tracing..." : "Track"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {pendingPrefix && (
          <form onSubmit={onManualSubmit} className="manual-form">
            <input
              value={manualTip}
              onChange={(e) => setManualTip(e.target.value)}
              placeholder="current block height"
              inputMode="numeric"
              className="text-input"
              aria-label="Current block height"
            />
            <button type="submit" className="secondary-button">
              Use height
            </button>
          </form>
        )}

        {report && report.seriesCount === 0 && (
          <p className="empty-text">
            No real series exist for &quot;{report.prefix}&quot; because every
            series maps beyond Bitcoin&apos;s sat supply.
          </p>
        )}

        {report && report.seriesCount > 0 && (
          <div className="report">
            <p className="report-meta">
              {report.seriesCount} series | tip height{" "}
              {formatBigInt(BigInt(report.tipHeight))}
            </p>
            {series1Banner(report) && (
              <div className="banner">{series1Banner(report)}</div>
            )}
            {report.series.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </section>

      <ExampleShowcase onTry={() => void runPrefix(EXQUISITE_PREFIX)} />
    </main>
  );
}

function SeriesCard({ series }: { series: PrefixReport["series"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const segments = series.blockSegments ?? [];
  const collapsed = segments.length > COLLAPSE_AT && !expanded;
  const seriesStatusColor = statusColor(series.overallStatus);

  return (
    <section className="series-card">
      <div className="series-title">
        <span>
          Series {series.id} | {series.nameLength}-letter names |{" "}
          {series.satStartName} ... {series.satEndName}
        </span>
        <span
          className="status-label"
          style={{ "--status-color": seriesStatusColor } as React.CSSProperties}
        >
          status: {series.overallStatus}
        </span>
      </div>
      <div className="series-range">
        sats {formatBigInt(series.satStart)} ... {formatBigInt(series.satEnd)} (
        {formatBigInt(series.satCount)} sats)
      </div>

      {collapsed ? (
        <div className="collapsed-blocks">
          blocks {formatBigInt(BigInt(segments[0].height))} ...{" "}
          {formatBigInt(BigInt(segments[segments.length - 1].height))} (
          {formatBigInt(BigInt(segments.length))} blocks){" "}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ghost-button"
          >
            show all blocks
          </button>
        </div>
      ) : (
        <ul className="block-list">
          {segments.map((seg) => (
            <li key={seg.height}>
              <span
                className="status-dot"
                style={
                  {
                    "--status-color": statusColor(seg.status),
                  } as React.CSSProperties
                }
              >
                status:
              </span>{" "}
              block {formatBigInt(BigInt(seg.height))} | sats{" "}
              {formatBigInt(seg.satRangeStart)} ...{" "}
              {formatBigInt(seg.satRangeEnd)} ({formatBigInt(seg.satCount)}) |{" "}
              {seg.status === "mined"
                ? "mined"
                : `future ~${seg.estimatedYear}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExampleShowcase({ onTry }: { onTry: () => void }) {
  return (
    <section className="example-panel" aria-labelledby="example-title">
      <div className="inscription-frame-wrap">
        <iframe
          className="inscription-frame"
          title="Exquisite #1042 ordinal inscription preview"
          src={EXQUISITE_PREVIEW_URL}
          sandbox="allow-scripts"
          loading="lazy"
        />
      </div>
      <div className="example-content">
        <p className="eyebrow">On-chain example</p>
        <h2 id="example-title">Example: exquisite</h2>
        <p className="example-copy">
          The tracker follows every sat-name that starts with a prefix. For{" "}
          <strong>exquisite*</strong>, only <strong>703 sats</strong> exist out
          of <strong>2,100,000,000,000,000</strong> total Bitcoin sats:{" "}
          <strong>0.000000000033476%</strong> of the full supply.
        </p>

        <div className="stat-grid" aria-label="Exquisite sat-name rarity stats">
          <div className="stat-card">
            <span className="stat-value">703</span>
            <span className="stat-label">matching sats total</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">3</span>
            <span className="stat-label">sat-name series</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0.000000000033476%</span>
            <span className="stat-label">of all Bitcoin sats</span>
          </div>
        </div>

        <ul className="breakdown">
          <li>
            <strong>676</strong>
            <span>
              sats in 11-letter names, from <strong>exquisiteaa</strong>{" "}
              through <strong>exquisitezz</strong>
            </span>
          </li>
          <li>
            <strong>26</strong>
            <span>
              sats in 10-letter names, from <strong>exquisitea</strong> through{" "}
              <strong>exquisitez</strong>
            </span>
          </li>
          <li>
            <strong>1</strong>
            <span>
              sat for the exact 9-letter name <strong>exquisite</strong>
            </span>
          </li>
        </ul>

        <div className="example-actions">
          <button type="button" onClick={onTry} className="secondary-button">
            Try exquisite
          </button>
          <a
            href={EXQUISITE_INSCRIPTION_URL}
            target="_blank"
            rel="noreferrer"
            className="inscription-link"
          >
            View inscription
          </a>
        </div>
      </div>
    </section>
  );
}
