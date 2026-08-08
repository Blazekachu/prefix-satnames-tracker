"use client";

import { useEffect, useState } from "react";

import { formatBigInt } from "@/lib/format";
import { fetchTipHeight } from "@/lib/tip";

/**
 * Fixed-corner readout of the latest confirmed Bitcoin tip height.
 * Fetches once on mount via the shared Esplora provider cascade.
 */
export function TipHeightBadge() {
  const [height, setHeight] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTipHeight()
      .then((tip) => {
        if (!cancelled) setHeight(tip);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  const label =
    height === null
      ? "Loading latest block height"
      : `Latest confirmed mined block height ${formatBigInt(BigInt(height))}`;

  return (
    <div
      className="tip-height-badge"
      title="Latest confirmed mined block height"
      aria-live="polite"
      aria-label={label}
    >
      {height === null ? "…" : formatBigInt(BigInt(height))}
    </div>
  );
}
