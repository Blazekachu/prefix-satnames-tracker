import { BrandHero } from "@/app/brand-hero";

export default function NamedCollectionSeriesIndexPage() {
  return (
    <main className="page-shell">
      <section className="registry-hero">
        <a href="../" className="back-link">
          Back to tracker
        </a>
        <p className="eyebrow">Named collection series</p>
        <BrandHero pageTitle="Named collection series" />
        <p className="lede">
          Editorial collection pages for sat-name series that are not dictionary
          snapshot entries — starting with Blobs.
        </p>
      </section>

      <ul className="collection-series-list">
        <li>
          <a className="collection-series-card" href="blobs/">
            <h2>Blobs</h2>
            <p>
              Collection parent on sat name <code>blobnwthems</code> with 10,000
              recursive children.
            </p>
          </a>
        </li>
      </ul>

      <p className="registry-note">
        <a href="../inscriptions-on-satnames/">Inscriptions on sat names</a>
      </p>
    </main>
  );
}
