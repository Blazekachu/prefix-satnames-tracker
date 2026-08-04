"use client";

import { useState } from "react";

import { satnameToSat, validateSatname } from "../../core/satname";
import {
  lookupSatnameInscription,
  type DiscoveryResult,
} from "./discovery";
import {
  type Fact,
  ORDINALS,
  REGISTRY_TABS,
  type RegistryTabId,
  type SatnameInscription,
  getEntriesForTab,
} from "./registry";
import { RequestForm } from "./request-form";
import {
  RegistryView,
  type RegistryViewMode,
  ViewModePicker,
} from "./view-modes";

const REQUEST_ENDPOINT = process.env.NEXT_PUBLIC_ADD_REQUEST_ENDPOINT ?? "";

function ordinalsPath(path: string) {
  return `${ORDINALS}${path}`;
}

function cardSummaryLabel(entry: SatnameInscription): string {
  if (!entry.lineage) return entry.role;
  return entry.lineage.badge === entry.role
    ? entry.role
    : `${entry.role} | ${entry.lineage.badge}`;
}

function displaySatname(entry: SatnameInscription): string {
  return entry.namedSatBranch ? `${entry.satname}*` : entry.satname;
}

function BlobChildBrowserPanel({
  entry,
}: {
  entry: SatnameInscription & {
    childBrowser: NonNullable<SatnameInscription["childBrowser"]>;
  };
}) {
  return (
    <div className="blob-child-browser">
      <p className="eyebrow">Blob child browser</p>
      <h3>{entry.satname}</h3>
      <dl className="blob-child-browser-fields">
        <div>
          <dt>Parent inscription</dt>
          <dd>#{entry.inscription.number}</dd>
        </div>
        <div>
          <dt>Verified child count</dt>
          <dd>{entry.childBrowser.count}</dd>
        </div>
        <div>
          <dt>Child satname range</dt>
          <dd>
            {entry.childBrowser.satnameRangeStart} -&gt;{" "}
            {entry.childBrowser.satnameRangeEnd}
          </dd>
        </div>
        <div>
          <dt>Child sat range</dt>
          <dd>
            {entry.childBrowser.satRangeStart} -&gt;{" "}
            {entry.childBrowser.satRangeEnd}
          </dd>
        </div>
      </dl>
      <p className="blob-child-browser-note">{entry.childBrowser.note}</p>
      <a
        href={entry.childBrowser.browseUrl}
        target="_blank"
        rel="noreferrer"
        className="primary-button discovery-link-button"
      >
        {entry.childBrowser.browseLabel}
      </a>
    </div>
  );
}

function FieldList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="satname-fields">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DescendantList({
  label,
  satnames,
}: {
  label: string;
  satnames: string[];
}) {
  return (
    <section>
      <h3>{label}</h3>
      <ul className="descendant-list">
        {satnames.map((satname) => (
          <li key={satname}>{satname}</li>
        ))}
      </ul>
    </section>
  );
}

function InscriptionCard({
  entry,
  cardKey,
  nested = false,
  forceOpen = false,
}: {
  entry: SatnameInscription;
  cardKey: string;
  nested?: boolean;
  forceOpen?: boolean;
}) {
  const inscriptionUrl = ordinalsPath(`/inscription/${entry.inscription.id}`);
  const satUrl = ordinalsPath(`/sat/${entry.satname}`);
  const satnameLabel = displaySatname(entry);
  const summaryLabel = cardSummaryLabel(entry);
  const [showChildBrowser, setShowChildBrowser] = useState(false);

  return (
    <details
      className={`${nested ? "asset-card nested-asset-card" : "asset-card"}${
        entry.namedSatBranch ? " featured-named-sat-card" : ""
      }`}
      key={cardKey}
      open={forceOpen}
    >
      <summary>
        <span className="asset-preview">
          <iframe
            src={ordinalsPath(`/preview/${entry.inscription.id}`)}
            title={`${entry.satname} inscription preview`}
            sandbox="allow-scripts"
            loading="lazy"
          />
        </span>
        <span className="asset-caption">
          <span>{satnameLabel}</span>
          <small>{summaryLabel}</small>
        </span>
      </summary>

      <div className="asset-detail">
        <div className="satname-card-heading">
          <div>
            <p className="eyebrow">{entry.lineage?.badge ?? entry.role}</p>
            <h2>{satnameLabel}</h2>
          </div>
          <a href={inscriptionUrl} target="_blank" rel="noreferrer">
            Inscription {entry.inscription.number}
          </a>
        </div>

        <p className="satname-summary">{entry.summary}</p>

        <div className="satname-sections">
          <section>
            <h3>Sat facts</h3>
            <FieldList
              facts={[
                { label: "Sat", value: entry.sat.number },
                { label: "Satname", value: satnameLabel },
                { label: "Block", value: entry.sat.block },
                { label: "Timestamp", value: entry.sat.timestamp },
                { label: "Rarity", value: entry.sat.rarity },
              ]}
            />
          </section>

          <section>
            <h3>Inscription facts</h3>
            <FieldList
              facts={[
                { label: "ID", value: entry.inscription.id },
                { label: "Content type", value: entry.inscription.contentType },
                {
                  label: "Content length",
                  value: entry.inscription.contentLength,
                },
                { label: "Height", value: entry.inscription.height },
                { label: "Timestamp", value: entry.inscription.timestamp },
                { label: "Value", value: entry.inscription.value },
                { label: "Fee", value: entry.inscription.fee },
                {
                  label: "Teleburn",
                  value: entry.inscription.teleburnAddress,
                },
              ]}
            />
          </section>
        </div>

        <div className="satname-sections">
          {entry.lineage ? (
            <section>
              <h3>Lineage to inscription 0</h3>
              <FieldList facts={entry.lineage.facts} />
            </section>
          ) : null}

          <section>
            <h3>{entry.relationship.label}</h3>
            <FieldList facts={entry.relationship.facts} />
          </section>

          <section>
            <h3>Metadata highlights</h3>
            <FieldList facts={entry.metadata} />
          </section>
        </div>

        {entry.children?.length ? (
          <div className="nested-asset-wrap">
            <h3 className="nested-asset-heading">
              Verified named-sat child cards
            </h3>
            <div className="nested-asset-gallery">
              {entry.children.map((child) => (
                <InscriptionCard
                  cardKey={`${entry.satname}-${child.satname}`}
                  entry={child}
                  key={`${entry.satname}-${child.satname}`}
                  nested
                />
              ))}
            </div>
          </div>
        ) : null}

        {entry.descendants && !entry.children?.length ? (
          <div className="satname-sections">
            <DescendantList
              label={
                entry.namedSatBranch
                  ? `${entry.descendants.label} *`
                  : entry.descendants.label
              }
              satnames={entry.descendants.satnames}
            />
          </div>
        ) : null}

        {entry.childBrowser ? (
          <div className="blob-child-browser-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowChildBrowser((value) => !value)}
            >
              {showChildBrowser
                ? "Hide child browser"
                : "Browse 10,000 children"}
            </button>
          </div>
        ) : null}

        {entry.childBrowser && showChildBrowser ? (
          <BlobChildBrowserPanel
            entry={
              entry as SatnameInscription & {
                childBrowser: NonNullable<SatnameInscription["childBrowser"]>;
              }
            }
          />
        ) : null}

        <div
          className="source-links"
          aria-label={`${entry.satname} source links`}
        >
          <a href={satUrl} target="_blank" rel="noreferrer">
            Sat page
          </a>
          <a href={inscriptionUrl} target="_blank" rel="noreferrer">
            Inscription page
          </a>
          <a
            href={ordinalsPath(`/content/${entry.inscription.id}`)}
            target="_blank"
            rel="noreferrer"
          >
            Content
          </a>
          <a
            href={ordinalsPath(`/preview/${entry.inscription.id}`)}
            target="_blank"
            rel="noreferrer"
          >
            Preview
          </a>
        </div>

        <div className="external-links">
          <strong>External links</strong>
          {entry.externalLinks.length > 0 ? (
            entry.externalLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))
          ) : (
            <span>Pending owner-provided collection links.</span>
          )}
        </div>
      </div>
    </details>
  );
}

function DiscoveryResultCard({
  discovery,
  satname,
}: {
  discovery: DiscoveryResult;
  satname: string;
}) {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <div className="discovery-result">
      <div className="discovery-result-copy">
        <p className="eyebrow">Live discovery result</p>
        <h2>{satname}</h2>
        <p className="discovery-result-meta">
          Sat {discovery.sat.toString()}
        </p>
      </div>

      {discovery.status === "inscribed" ? (
        <>
          <p className="discovery-result-status discovery-result-status-success">
            Confirmed inscription {discovery.inscriptionId}
          </p>
          <div className="discovery-result-actions">
            <a
              href={discovery.inscriptionUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-button discovery-link-button"
            >
              View inscription
            </a>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowRequestForm((value) => !value)}
            >
              {showRequestForm ? "Hide request" : "Add Request"}
            </button>
          </div>
          {showRequestForm ? (
            <RequestForm
              satname={satname}
              sat={discovery.sat}
              inscriptionId={discovery.inscriptionId}
              inscriptionUrl={discovery.inscriptionUrl}
              endpoint={REQUEST_ENDPOINT}
            />
          ) : null}
        </>
      ) : null}

      {discovery.status === "not-inscribed" ? (
        <p className="discovery-result-status">No inscription found.</p>
      ) : null}

      {discovery.status === "lookup-unavailable" ? (
        <p className="discovery-result-status discovery-result-status-error">
          {discovery.message}
        </p>
      ) : null}
    </div>
  );
}

function RegistryPanel({
  tabId,
  viewMode,
}: {
  tabId: RegistryTabId;
  viewMode: RegistryViewMode;
}) {
  const entries = getEntriesForTab(tabId);
  const tab = REGISTRY_TABS.find((item) => item.id === tabId);

  return (
    <section className={`registry-panel registry-panel-active registry-panel-${tabId}`}>
      <div className="registry-note lineage-banner">{tab?.note}</div>
      {tabId === "ord-father" ? (
        <div className="registry-note">
          Root context: inscription 0 is on satname <strong>ezcubunuovm</strong>.
          This tab focuses on the verified named-sat branches under that root,
          rather than repeating the root itself as a tracked card.
        </div>
      ) : null}

      <RegistryView
        entries={entries}
        mode={viewMode}
        tabId={tabId}
        renderLargeCard={(entry, cardKey) => (
          <InscriptionCard
            cardKey={cardKey}
            entry={entry}
            key={cardKey}
            forceOpen={cardKey.endsWith("-focused-open")}
          />
        )}
      />
    </section>
  );
}

export default function InscriptionsOnSatnamesPage() {
  const [activeTab, setActiveTab] = useState<RegistryTabId>("ord-father");
  const [viewMode, setViewMode] = useState<RegistryViewMode>("large");
  const [query, setQuery] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupState, setLookupState] = useState<"idle" | "loading">("idle");
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [discoveredSatname, setDiscoveredSatname] = useState<string | null>(null);

  async function onDiscoverySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupError(null);
    setDiscovery(null);
    setDiscoveredSatname(null);

    const validated = validateSatname(query);
    if (!validated.ok) {
      setLookupError(validated.error);
      return;
    }

    setQuery(validated.satname);
    setLookupState("loading");
    setDiscoveredSatname(validated.satname);

    const computedSat = satnameToSat(validated.satname);

    try {
      const result = await lookupSatnameInscription(validated.satname);
      setDiscovery(result);
      if (result.sat !== computedSat) {
        setDiscovery({
          status: "lookup-unavailable",
          sat: computedSat,
          message: "Live lookup unavailable",
        });
      }
    } finally {
      setLookupState("idle");
    }
  }

  return (
    <main className="page-shell">
      <section className="registry-hero">
        <a href="../" className="back-link">
          Back to tracker
        </a>
        <p className="eyebrow">Curated registry</p>
        <h1 className="title">Inscriptions on satnames</h1>
        <p className="lede">
          Search any satname live, jump to its inscription if it exists, then
          browse the curated registry in table, compact, or large-card view.
        </p>

        <section className="discovery-shell" aria-label="Satname discovery">
          <form className="search-form discovery-form" onSubmit={onDiscoverySubmit}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a satname"
              className="text-input"
              aria-label="Satname"
            />
            <button
              type="submit"
              className="primary-button"
              disabled={lookupState === "loading"}
            >
              {lookupState === "loading" ? "Checking..." : "Check live"}
            </button>
          </form>

          {lookupError ? <p className="error-text">{lookupError}</p> : null}

          {discovery && discoveredSatname ? (
            <DiscoveryResultCard
              discovery={discovery}
              satname={discoveredSatname}
            />
          ) : null}
        </section>
      </section>

      <section
        className="registry-tabs"
        aria-label="Inscriptions on satnames tabs"
      >
        <div className="registry-toolbar">
          <div
            className="registry-tab-list"
            role="tablist"
            aria-label="Registry tabs"
          >
            {REGISTRY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="registry-tab-label"
                data-active={tab.id === activeTab}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ViewModePicker value={viewMode} onChange={setViewMode} />
        </div>

        <RegistryPanel tabId={activeTab} viewMode={viewMode} />
      </section>
    </main>
  );
}
