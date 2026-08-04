"use client";

import { useState } from "react";

import { ORDINALS, type RegistryTabId, type SatnameInscription } from "./registry";

export type RegistryViewMode = "table" | "compact" | "large";

type ViewModePickerProps = {
  value: RegistryViewMode;
  onChange: (value: RegistryViewMode) => void;
};

type RegistryViewProps = {
  entries: SatnameInscription[];
  mode: RegistryViewMode;
  tabId: RegistryTabId;
  renderLargeCard: (entry: SatnameInscription, cardKey: string) => React.ReactNode;
};

function ordinalsPath(path: string) {
  return `${ORDINALS}${path}`;
}

export function nextFocusedSatname(
  current: string | null,
  target: string,
): string | null {
  return current === target ? null : target;
}

function displaySatname(entry: SatnameInscription): string {
  return entry.namedSatBranch ? `${entry.satname}*` : entry.satname;
}

export function ViewModePicker({ value, onChange }: ViewModePickerProps) {
  return (
    <div className="view-mode-picker" aria-label="Registry view mode">
      <button
        type="button"
        className="view-mode-button"
        aria-pressed={value === "table"}
        onClick={() => onChange("table")}
      >
        <span className="view-mode-icon view-mode-icon-table" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>Table</span>
      </button>
      <button
        type="button"
        className="view-mode-button"
        aria-pressed={value === "compact"}
        onClick={() => onChange("compact")}
      >
        <span className="view-mode-icon view-mode-icon-compact" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>Compact</span>
      </button>
      <button
        type="button"
        className="view-mode-button"
        aria-pressed={value === "large"}
        onClick={() => onChange("large")}
      >
        <span className="view-mode-icon view-mode-icon-large" aria-hidden="true">
          <span />
        </span>
        <span>Large</span>
      </button>
    </div>
  );
}

export function RegistryView({
  entries,
  mode,
  tabId,
  renderLargeCard,
}: RegistryViewProps) {
  const [focusedSatname, setFocusedSatname] = useState<string | null>(null);
  const focusedEntry =
    entries.find((entry) => entry.satname === focusedSatname) ?? null;

  if (mode === "large") {
    return (
      <section className="asset-gallery" aria-label={`${tabId} satname inscriptions`}>
        {entries.map((entry) =>
          renderLargeCard(entry, `${tabId}-${entry.satname}`),
        )}
      </section>
    );
  }

  return (
    <section className="registry-view-shell" aria-label={`${tabId} satname inscriptions`}>
      {mode === "table" ? (
        <div className="registry-table-wrap">
          <table className="registry-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Satname</th>
                <th>Role</th>
                <th>Inscription</th>
                <th>Context</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.satname}>
                  <td>
                    <span className="table-preview">
                      <iframe
                        src={ordinalsPath(`/preview/${entry.inscription.id}`)}
                        title={`${entry.satname} preview`}
                        sandbox="allow-scripts"
                        loading="lazy"
                      />
                    </span>
                  </td>
                  <td>
                    <strong
                      className={entry.namedSatBranch ? "featured-named-sat-text" : undefined}
                    >
                      {displaySatname(entry)}
                    </strong>
                  </td>
                  <td>{entry.role}</td>
                  <td>#{entry.inscription.number}</td>
                  <td>{entry.lineage?.badge ?? entry.relationship.label}</td>
                  <td>
                    <div className="registry-table-actions">
                      <a
                        href={ordinalsPath(`/inscription/${entry.inscription.id}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inscription-link"
                      >
                        View inscription
                      </a>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          setFocusedSatname((current) =>
                            nextFocusedSatname(current, entry.satname),
                          )
                        }
                      >
                        {focusedSatname === entry.satname
                          ? "Hide details"
                          : "View details"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="compact-gallery">
          {entries.map((entry) => (
            <button
              key={entry.satname}
              type="button"
              className="compact-tile"
              data-active={entry.satname === focusedEntry?.satname}
              data-featured={entry.namedSatBranch ? "true" : "false"}
              onClick={() =>
                setFocusedSatname((current) =>
                  nextFocusedSatname(current, entry.satname),
                )
              }
            >
              <span className="compact-tile-preview">
                <iframe
                  src={ordinalsPath(`/preview/${entry.inscription.id}`)}
                  title={`${entry.satname} compact preview`}
                  sandbox="allow-scripts"
                  loading="lazy"
                />
              </span>
              <span className="compact-tile-copy">
                <strong>{displaySatname(entry)}</strong>
                <small>{entry.lineage?.badge ?? entry.role}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {focusedEntry ? (
        <div className="registry-focused-detail">
          {renderLargeCard(
            focusedEntry,
            `${tabId}-${focusedEntry.satname}-focused-open`,
          )}
        </div>
      ) : null}
    </section>
  );
}
