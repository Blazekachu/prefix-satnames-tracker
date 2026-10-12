"use client";

import { BrandHero } from "@/app/brand-hero";
import { ORDINALS } from "../../inscriptions-on-satnames/registry";
import { blobsCollection } from "../blobs";

export default function BlobsCollectionPage() {
  const entry = blobsCollection;
  const previewUrl = `${ORDINALS}/preview/${entry.inscription.id}`;
  const inscriptionUrl = `${ORDINALS}/inscription/${entry.inscription.id}`;
  const satUrl = `${ORDINALS}/sat/${entry.sat.number}`;

  return (
    <main className="page-shell">
      <section className="registry-hero">
        <a href="../" className="back-link">
          Back to named collection series
        </a>
        <p className="eyebrow">Named collection series</p>
        <BrandHero pageTitle="Blobs" />
        <p className="lede">{entry.summary}</p>
      </section>

      <section className="asset-gallery" aria-label="Blobs collection parent">
        <article className="asset-card asset-card-open">
          <div className="asset-preview-frame">
            <iframe
              title={`${entry.satname} preview`}
              src={previewUrl}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <h2>{entry.satname}</h2>
          <p className="role-label">{entry.role}</p>

          <dl className="satname-fields">
            <div>
              <dt>Sat</dt>
              <dd>{entry.sat.number}</dd>
            </div>
            <div>
              <dt>Inscription</dt>
              <dd>#{entry.inscription.number}</dd>
            </div>
            <div>
              <dt>Content type</dt>
              <dd>{entry.inscription.contentType}</dd>
            </div>
          </dl>

          {entry.childBrowser ? (
            <div className="blob-child-browser">
              <p className="eyebrow">Blob child browser</p>
              <dl className="blob-child-browser-fields">
                <div>
                  <dt>Verified child count</dt>
                  <dd>{entry.childBrowser.count}</dd>
                </div>
                <div>
                  <dt>Child sat name range</dt>
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
          ) : null}

          <div className="external-links">
            <a href={inscriptionUrl} target="_blank" rel="noreferrer">
              View inscription
            </a>
            <a href={satUrl} target="_blank" rel="noreferrer">
              View sat
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
