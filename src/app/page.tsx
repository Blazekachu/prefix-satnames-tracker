"use client";

import { useState } from "react";
import { validatePrefix } from "@/core/prefix";
import { buildReport, PrefixReport } from "@/core/report";
import { fetchTipHeight } from "@/lib/tip";
import { formatBigInt } from "@/lib/format";
import { series1Banner } from "@/lib/banner";

const COLLAPSE_AT = 10;

function statusColor(status: string): string {
  if (status === "mined") return "#3ddc84";
  if (status === "future") return "#f7931a";
  return "#e8b84b"; // partial
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);
    setPendingPrefix(null);

    const validated = validatePrefix(input.trim());
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

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
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
        Prefix Satnames Tracker
      </h1>
      <p style={{ opacity: 0.7, marginTop: 4 }}>
        Enter a prefix to see every sat-name series and the Bitcoin blocks it
        falls in.
      </p>

      <form
        onSubmit={onSubmit}
        style={{ marginTop: 20, display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. bhang"
          style={{
            flex: 1,
            padding: "0.6rem 0.8rem",
            background: "#1a1a1f",
            border: "1px solid #333",
            borderRadius: 6,
            color: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#f7931a",
            border: "none",
            borderRadius: 6,
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "…" : "Track"}
        </button>
      </form>

      {error && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}

      {pendingPrefix && (
        <form
          onSubmit={onManualSubmit}
          style={{ marginTop: 8, display: "flex", gap: 8 }}
        >
          <input
            value={manualTip}
            onChange={(e) => setManualTip(e.target.value)}
            placeholder="current block height"
            inputMode="numeric"
            style={{
              flex: 1,
              padding: "0.5rem 0.8rem",
              background: "#1a1a1f",
              border: "1px solid #333",
              borderRadius: 6,
              color: "inherit",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "#333",
              border: "1px solid #555",
              borderRadius: 6,
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Use height
          </button>
        </form>
      )}

      {report && report.seriesCount === 0 && (
        <p style={{ marginTop: 16, opacity: 0.7 }}>
          No real series exist for &quot;{report.prefix}&quot; — every series
          maps beyond Bitcoin&apos;s sat supply.
        </p>
      )}

      {report && report.seriesCount > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ opacity: 0.7, marginBottom: 12 }}>
            {report.seriesCount} series · tip height{" "}
            {formatBigInt(BigInt(report.tipHeight))}
          </p>
          {series1Banner(report) && (
            <div
              style={{
                background: "#1f1a10",
                border: "1px solid #6b521f",
                borderRadius: 6,
                padding: "0.6rem 0.8rem",
                marginBottom: 12,
                fontSize: "0.9rem",
                color: "#f0d99a",
              }}
            >
              {series1Banner(report)}
            </div>
          )}
          {report.series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </main>
  );
}

function SeriesCard({ series }: { series: PrefixReport["series"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const segments = series.blockSegments ?? [];
  const collapsed = segments.length > COLLAPSE_AT && !expanded;

  return (
    <section
      style={{
        border: "1px solid #2a2a30",
        borderRadius: 8,
        padding: "1rem",
        marginBottom: 12,
        background: "#141418",
      }}
    >
      <div style={{ fontWeight: 600 }}>
        Series {series.id} · {series.nameLength}-letter names ·{" "}
        {series.satStartName} … {series.satEndName}{" "}
        <span style={{ color: statusColor(series.overallStatus) }}>
          ● {series.overallStatus}
        </span>
      </div>
      <div style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: 2 }}>
        sats {formatBigInt(series.satStart)} … {formatBigInt(series.satEnd)} (
        {formatBigInt(series.satCount)} sats)
      </div>

      {collapsed ? (
        <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
          blocks {formatBigInt(BigInt(segments[0].height))} …{" "}
          {formatBigInt(BigInt(segments[segments.length - 1].height))} (
          {formatBigInt(BigInt(segments.length))} blocks){" "}
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: "none",
              border: "1px solid #444",
              borderRadius: 4,
              color: "inherit",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: "1px 6px",
            }}
          >
            show all blocks
          </button>
        </div>
      ) : (
        <ul style={{ marginTop: 8, fontSize: "0.9rem", listStyle: "none" }}>
          {segments.map((seg) => (
            <li key={seg.height} style={{ marginTop: 2 }}>
              <span style={{ color: statusColor(seg.status) }}>●</span> block{" "}
              {formatBigInt(BigInt(seg.height))} · sats{" "}
              {formatBigInt(seg.satRangeStart)} …{" "}
              {formatBigInt(seg.satRangeEnd)} ({formatBigInt(seg.satCount)}) ·{" "}
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
