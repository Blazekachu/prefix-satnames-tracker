import {
  type Fact,
  ORDINALS,
  REGISTRY_TABS,
  getEntriesForTab,
} from "./registry";

function ordinalsPath(path: string) {
  return `${ORDINALS}${path}`;
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

function RegistryPanel({ tabId }: { tabId: "ord-father" | "all" }) {
  const entries = getEntriesForTab(tabId);
  const tab = REGISTRY_TABS.find((item) => item.id === tabId);

  return (
    <section className={`registry-panel registry-panel-${tabId}`}>
      <div className="registry-note lineage-banner">{tab?.note}</div>

      <section
        className="asset-gallery"
        aria-label={`${tabId} satname inscriptions`}
      >
        {entries.map((entry) => {
          const inscriptionUrl = ordinalsPath(
            `/inscription/${entry.inscription.id}`,
          );
          const satUrl = ordinalsPath(`/sat/${entry.satname}`);

          return (
            <details className="asset-card" key={`${tabId}-${entry.satname}`}>
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
                  <span>{entry.satname}</span>
                  <small>
                    {entry.role}
                    {entry.lineage ? ` | ${entry.lineage.badge}` : ""}
                  </small>
                </span>
              </summary>

              <div className="asset-detail">
                <div className="satname-card-heading">
                  <div>
                    <p className="eyebrow">
                      {entry.lineage?.badge ?? entry.role}
                    </p>
                    <h2>{entry.satname}</h2>
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
                        { label: "Satname", value: entry.satname },
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
                        {
                          label: "Content type",
                          value: entry.inscription.contentType,
                        },
                        {
                          label: "Content length",
                          value: entry.inscription.contentLength,
                        },
                        { label: "Height", value: entry.inscription.height },
                        {
                          label: "Timestamp",
                          value: entry.inscription.timestamp,
                        },
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
        })}
      </section>
    </section>
  );
}

export default function InscriptionsOnSatnamesPage() {
  return (
    <main className="page-shell">
      <section className="registry-hero">
        <a href="../" className="back-link">
          Back to tracker
        </a>
        <p className="eyebrow">Curated registry</p>
        <h1 className="title">Inscriptions on satnames</h1>
        <p className="lede">
          Known satnames that carry inscriptions. The featured tab foregrounds
          the verified inscription 0 lineage on named sats, while the second
          tab keeps the broader tracked registry on the same page.
        </p>
      </section>

      <section
        className="registry-tabs"
        aria-label="Inscriptions on satnames tabs"
      >
        <input
          className="registry-tab-toggle"
          defaultChecked
          id="registry-tab-ord-father"
          name="registry-tab"
          type="radio"
        />
        <input
          className="registry-tab-toggle"
          id="registry-tab-all"
          name="registry-tab"
          type="radio"
        />

        <div
          className="registry-tab-list"
          role="tablist"
          aria-label="Registry tabs"
        >
          <label
            className="registry-tab-label"
            htmlFor="registry-tab-ord-father"
            role="tab"
          >
            Named Sats by ORD FATHER
          </label>
          <label
            className="registry-tab-label"
            htmlFor="registry-tab-all"
            role="tab"
          >
            All named sats tracked yet
          </label>
        </div>

        <RegistryPanel tabId="ord-father" />
        <RegistryPanel tabId="all" />
      </section>
    </main>
  );
}
