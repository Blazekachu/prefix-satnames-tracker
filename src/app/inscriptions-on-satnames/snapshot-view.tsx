import type { NamedSatEntry } from "../../core/named-sats-snapshot";
import { ORDINALS } from "./registry";
import {
  getNamedSatsCursor,
  getNamedSatsSnapshot,
  getSnapshotSections,
} from "./snapshot";
import type { RegistryViewMode } from "./view-modes";

function entryHref(entry: NamedSatEntry): string {
  if (entry.primaryInscriptionId) {
    return `${ORDINALS}/inscription/${entry.primaryInscriptionId}`;
  }
  return `${ORDINALS}/sat/${entry.sat}`;
}

function previewHref(entry: NamedSatEntry): string | null {
  if (!entry.primaryInscriptionId) return null;
  return `${ORDINALS}/preview/${entry.primaryInscriptionId}`;
}

function splitLabel(entry: NamedSatEntry): string | null {
  if (!entry.parts) return null;
  return `${entry.parts[0]} · ${entry.parts[1]}`;
}

function CompactGallery({ entries }: { entries: NamedSatEntry[] }) {
  return (
    <div className="compact-gallery">
      {entries.map((entry) => {
        const preview = previewHref(entry);
        const href = entryHref(entry);
        const split = splitLabel(entry);
        return (
          <a
            key={entry.satname}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="compact-tile"
          >
            <span className="compact-tile-preview">
              {preview ? (
                <iframe
                  src={preview}
                  title={`${entry.satname} compact preview`}
                  loading="lazy"
                  sandbox="allow-scripts"
                />
              ) : (
                <span className="snapshot-preview-missing">No preview</span>
              )}
            </span>
            <span className="compact-tile-copy">
              <strong>{entry.satname}</strong>
              <small>
                {split ??
                  (entry.inscriptionCount != null
                    ? `${entry.inscriptionCount} inscription${entry.inscriptionCount === 1 ? "" : "s"}`
                    : "named sat")}
              </small>
            </span>
          </a>
        );
      })}
    </div>
  );
}

function LargeGallery({ entries }: { entries: NamedSatEntry[] }) {
  return (
    <section className="asset-gallery" aria-label="Named sat inscriptions">
      {entries.map((entry) => {
        const preview = previewHref(entry);
        const href = entryHref(entry);
        const split = splitLabel(entry);
        return (
          <article key={entry.satname} className="asset-card">
            <div className="asset-preview">
              {preview ? (
                <iframe
                  src={preview}
                  title={`${entry.satname} inscription preview`}
                  loading="lazy"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="snapshot-preview-missing snapshot-preview-missing-large">
                  Preview unavailable
                </div>
              )}
            </div>
            <div className="asset-caption">
              <span>{entry.satname}</span>
              <small>
                {split ??
                  (entry.inscriptionCount != null
                    ? `${entry.inscriptionCount} inscription${entry.inscriptionCount === 1 ? "" : "s"}`
                    : "named sat")}
              </small>
              <div className="external-links">
                <a href={href} target="_blank" rel="noreferrer">
                  {entry.primaryInscriptionId ? "View inscription" : "View sat"}
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function SectionBody({
  entries,
  mode,
}: {
  entries: NamedSatEntry[];
  mode: RegistryViewMode;
}) {
  if (mode === "compact") return <CompactGallery entries={entries} />;
  return <LargeGallery entries={entries} />;
}

export function SnapshotView({ mode }: { mode: RegistryViewMode }) {
  const snapshot = getNamedSatsSnapshot();
  const cursor = getNamedSatsCursor();
  const sections = getSnapshotSections();
  const tabNote =
    "Osura-style snapshot of dictionary-matching inscribed sat names: single words, series, and two-word names. Updated from a bootstrap list plus monthly new-inscription deltas.";

  return (
    <section className="registry-panel registry-panel-active registry-panel-all">
      <div className="registry-note lineage-banner">{tabNote}</div>
      <div className="registry-note snapshot-intro">
        Snapshot {new Date(snapshot.meta.generatedAt).toISOString().slice(0, 10)}{" "}
        · {sections.singles.length} single · {sections.series.length} series ·{" "}
        {sections.pairs.length} two-word · cursor at inscription #
        {cursor.lastInscriptionNumber.toLocaleString("en-US")}
      </div>

      <section className="snapshot-section" aria-labelledby="snapshot-singles">
        <h2 id="snapshot-singles">Single words</h2>
        <p className="snapshot-section-note">The whole name is one word.</p>
        <SectionBody entries={sections.singles} mode={mode} />
      </section>

      <section className="snapshot-section" aria-labelledby="snapshot-series">
        <h2 id="snapshot-series">Series</h2>
        <p className="snapshot-section-note">
          Runs of names that begin with the same word.
        </p>
        {sections.series.map((group) => (
          <div key={group.key} className="snapshot-series-group">
            <h3>
              {group.key}… {group.members.length} names
            </h3>
            <SectionBody entries={group.members} mode={mode} />
          </div>
        ))}
      </section>

      <section className="snapshot-section" aria-labelledby="snapshot-pairs">
        <h2 id="snapshot-pairs">Two-word names</h2>
        <p className="snapshot-section-note">
          Names that read as two dictionary words joined together.
        </p>
        <SectionBody entries={sections.pairs} mode={mode} />
      </section>

      <p className="snapshot-footnote">
        Includes curated extras: agooddoctor, cyclisation.
      </p>
    </section>
  );
}
