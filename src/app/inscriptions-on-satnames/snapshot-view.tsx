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

function SnapshotItem({
  entry,
  mode,
}: {
  entry: NamedSatEntry;
  mode: RegistryViewMode;
}) {
  const split = splitLabel(entry);
  const href = entryHref(entry);
  const preview = previewHref(entry);

  if (mode === "table") {
    return (
      <tr>
        <td>
          {preview ? (
            <span className="table-preview">
              <iframe
                src={preview}
                title={`${entry.satname} preview`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </span>
          ) : (
            <span className="snapshot-preview-missing">No preview</span>
          )}
        </td>
        <td>
          <a href={href} target="_blank" rel="noreferrer">
            {entry.satname}
          </a>
        </td>
        <td>{split ?? "—"}</td>
        <td>{entry.inscriptionCount ?? "—"}</td>
        <td>{entry.source}</td>
      </tr>
    );
  }

  if (mode === "compact") {
    return (
      <li className="snapshot-item snapshot-item-compact">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="snapshot-item-link snapshot-item-link-compact"
        >
          {preview ? (
            <span className="compact-tile-preview">
              <iframe
                src={preview}
                title={`${entry.satname} compact preview`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </span>
          ) : (
            <span className="snapshot-preview-missing compact-tile-preview">
              No preview yet
            </span>
          )}
          <span className="snapshot-item-name">{entry.satname}</span>
          {split ? <span className="snapshot-item-split">{split}</span> : null}
        </a>
      </li>
    );
  }

  return (
    <li className="snapshot-item snapshot-item-large">
      <article className="asset-card snapshot-asset-card">
        <div className="asset-preview">
          {preview ? (
            <iframe
              src={preview}
              title={`${entry.satname} inscription preview`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="snapshot-preview-missing snapshot-preview-missing-large">
              Preview unavailable until this sat is enriched with an inscription
              id.
            </div>
          )}
        </div>
        <h3 className="snapshot-item-name">{entry.satname}</h3>
        {split ? <p className="snapshot-item-split">{split}</p> : null}
        <p className="snapshot-item-count">
          {entry.inscriptionCount != null
            ? `${entry.inscriptionCount} inscription${entry.inscriptionCount === 1 ? "" : "s"}`
            : "Inscription count unknown"}
        </p>
        <div className="external-links">
          <a href={href} target="_blank" rel="noreferrer">
            {entry.primaryInscriptionId ? "View inscription" : "View sat"}
          </a>
          {preview ? (
            <a href={preview} target="_blank" rel="noreferrer">
              Open preview
            </a>
          ) : null}
        </div>
      </article>
    </li>
  );
}

function SectionBody({
  entries,
  mode,
}: {
  entries: NamedSatEntry[];
  mode: RegistryViewMode;
}) {
  if (mode === "table") {
    return (
      <div className="registry-table-wrap">
        <table className="registry-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Sat name</th>
              <th>Split</th>
              <th>Inscriptions</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <SnapshotItem key={entry.satname} entry={entry} mode={mode} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ul className={`snapshot-list snapshot-list-${mode}`}>
      {entries.map((entry) => (
        <SnapshotItem key={entry.satname} entry={entry} mode={mode} />
      ))}
    </ul>
  );
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
