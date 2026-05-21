"use client";

import { useState } from "react";
import { validatePrefix } from "@/core/prefix";
import { buildReport, PrefixReport } from "@/core/report";
import { fetchTipHeight } from "@/lib/tip";
import { formatBigInt } from "@/lib/format";

export default function Home() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<PrefixReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);

    const validated = validatePrefix(input.trim());
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setLoading(true);
    try {
      const tip = await fetchTipHeight();
      setReport(buildReport(validated.prefix, tip));
    } catch {
      setError("Couldn't reach mempool.space. Try again in a moment.");
    } finally {
      setLoading(false);
    }
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

      <form onSubmit={onSubmit} style={{ marginTop: 20, display: "flex", gap: 8 }}>
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

      {error && (
        <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>
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
          {report.series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </main>
  );
}

function SeriesCard({
  series,
}: {
  series: PrefixReport["series"][number];
}) {
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
        {series.firstName} … {series.lastName}
      </div>
      <div style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: 2 }}>
        sats {formatBigInt(series.satStart)} … {formatBigInt(series.satEnd)} (
        {formatBigInt(series.satCount)} sats) · {series.overallStatus}
      </div>

      {series.blockSummary && (
        <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
          blocks {formatBigInt(BigInt(series.blockSummary.startHeight))} …{" "}
          {formatBigInt(BigInt(series.blockSummary.endHeight))} (
          {formatBigInt(BigInt(series.blockSummary.blockCount))} blocks,{" "}
          {series.blockSummary.status})
        </div>
      )}

      {series.blockSegments && (
        <ul style={{ marginTop: 8, fontSize: "0.9rem", listStyle: "none" }}>
          {series.blockSegments.map((seg) => (
            <li key={seg.height} style={{ marginTop: 2 }}>
              block {formatBigInt(BigInt(seg.height))} · sats{" "}
              {formatBigInt(seg.satRangeStart)} … {formatBigInt(seg.satRangeEnd)}{" "}
              ({formatBigInt(seg.satCount)}) ·{" "}
              {seg.status === "mined"
                ? "✓ mined"
                : `⧗ future ~${seg.estimatedYear}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
