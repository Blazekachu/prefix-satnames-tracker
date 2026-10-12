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

  if (mode === "table") {
    return (
      <tr>
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

  return (
    <li className={`snapshot-item snapshot-item-${mode}`}>
      <a href={href} target="_blank" rel="noreferrer" className="snapshot-item-link">
        <span className="snapshot-item-name">{entry.satname}</span>
        {split ? <span className="snapshot-item-split">{split}</span> : null}
        {entry.inscriptionCount != null ? (
          <span className="snapshot-item-count">
            {entry.inscriptionCount} inscription
            {entry.inscriptionCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </a>
    </li>
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
        Snapshot {new Date(snapshot.meta.generatedAt).toISOString().slice(0, 10)} ·{" "}
        {sections.singles.length} single · {sections.series.length} series ·{" "}
        {sections.pairs.length} two-word · cursor at inscription #
        {cursor.lastInscriptionNumber.toLocaleString("en-US")}
      </div>

      <section className="snapshot-section" aria-labelledby="snapshot-singles">
        <h2 id="snapshot-singles">Single words</h2>
        <p className="snapshot-section-note">The whole name is one word.</p>
        {mode === "table" ? (
          <div className="registry-table-wrap">
            <table className="registry-table">
              <thead>
                <tr>
                  <th>Sat name</th>
                  <th>Split</th>
                  <th>Inscriptions</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {sections.singles.map((entry) => (
                  <SnapshotItem key={entry.satname} entry={entry} mode={mode} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className={`snapshot-list snapshot-list-${mode}`}>
            {sections.singles.map((entry) => (
              <SnapshotItem key={entry.satname} entry={entry} mode={mode} />
            ))}
          </ul>
        )}
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
            {mode === "table" ? (
              <div className="registry-table-wrap">
                <table className="registry-table">
                  <thead>
                    <tr>
                      <th>Sat name</th>
                      <th>Split</th>
                      <th>Inscriptions</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.members.map((entry) => (
                      <SnapshotItem
                        key={entry.satname}
                        entry={entry}
                        mode={mode}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className={`snapshot-list snapshot-list-${mode}`}>
                {group.members.map((entry) => (
                  <SnapshotItem
                    key={entry.satname}
                    entry={entry}
                    mode={mode}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="snapshot-section" aria-labelledby="snapshot-pairs">
        <h2 id="snapshot-pairs">Two-word names</h2>
        <p className="snapshot-section-note">
          Names that read as two dictionary words joined together.
        </p>
        {mode === "table" ? (
          <div className="registry-table-wrap">
            <table className="registry-table">
              <thead>
                <tr>
                  <th>Sat name</th>
                  <th>Split</th>
                  <th>Inscriptions</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {sections.pairs.map((entry) => (
                  <SnapshotItem key={entry.satname} entry={entry} mode={mode} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className={`snapshot-list snapshot-list-${mode}`}>
            {sections.pairs.map((entry) => (
              <SnapshotItem key={entry.satname} entry={entry} mode={mode} />
            ))}
          </ul>
        )}
      </section>

      <p className="snapshot-footnote">
        Includes curated extras: agooddoctor, cyclisation.{" "}
        <a href="../named-collection-series/">Named collection series</a>
      </p>
    </section>
  );
}
