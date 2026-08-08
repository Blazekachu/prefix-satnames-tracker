"use client";

import { ThemeToggle } from "./theme-toggle";
import { TipHeightBadge } from "./tip-height-badge";

/** Fixed top-right chrome shared on every page. */
export function SiteControls() {
  return (
    <div className="site-controls">
      <ThemeToggle />
      <TipHeightBadge />
    </div>
  );
}
