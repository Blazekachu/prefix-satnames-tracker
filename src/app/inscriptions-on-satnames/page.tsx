type Fact = {
  label: string;
  value: string;
};

type SourceLink = {
  label: string;
  href: string;
};

type SatnameInscription = {
  satname: string;
  role: string;
  summary: string;
  sat: {
    number: string;
    block: string;
    timestamp: string;
    rarity: string;
  };
  inscription: {
    id: string;
    number: string;
    contentType: string;
    contentLength: string;
    timestamp: string;
    height: string;
    value: string;
    fee: string;
    teleburnAddress: string;
  };
  relationship: {
    label: string;
    facts: Fact[];
  };
  metadata: Fact[];
  externalLinks: SourceLink[];
};

const ORDINALS = "https://ordinals.com";

const entries: SatnameInscription[] = [
  {
    satname: "agooddoctor",
    role: "Collection parent on a named sat",
    summary:
      "The satname carries a video inscription with no parents and one direct child. That child is an image inscription with 420 visible children, so the named sat anchors the collection lineage above it.",
    sat: {
      number: "1917572203052608",
      block: "758115",
      timestamp: "2022-10-11 00:47:45 UTC",
      rarity: "common",
    },
    inscription: {
      id: "fcfdefb824c1a0efbaa59663f649cb36d9891d78a0f50ec3a1b5c2f1e034269di0",
      number: "70826886",
      contentType: "video/mp4",
      contentLength: "3967901 bytes",
      timestamp: "2024-05-16 22:12:33 UTC",
      height: "843764",
      value: "10000 sats",
      fee: "64985437 sats",
      teleburnAddress: "0xe4Dd0003D46A23f000cd58eC47232c78d12795e8",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parents", value: "none found by /r/parents" },
        { label: "Direct children", value: "1 child found by /r/children" },
        {
          label: "Child inscription",
          value:
            "2312dc77afc774cecac54ab83da4b799d1a14707f79ff51ee892069ded7b7126i0",
        },
        {
          label: "Child details",
          value:
            "Inscription 71411965, image/png, 9501 bytes, 420 visible children",
        },
        {
          label: "Child metadata",
          value:
            "Description says Experiment 9 spawned from A Good Doctor and rare satoshis",
        },
      ],
    },
    metadata: [
      { label: "Creator", value: "A Good Doctor Studios" },
      { label: "Socials", value: "https://x.com/AGoodDoctoor" },
      { label: "Inscribed By", value: "OrdinalsBot" },
    ],
    externalLinks: [],
  },
  {
    satname: "blobnwthems",
    role: "Blobs collection parent",
    summary:
      "The satname carries the Blobs collection parent inscription. It has one parent root inscription and 10000 visible children. Research notes in ART on Blockchain describe the collection as metadata-seeded 3D shader art built through a recursive on-chain engine stack.",
    sat: {
      number: "1749358685270167",
      block: "559486",
      timestamp: "2019-01-21 15:25:26 UTC",
      rarity: "common",
    },
    inscription: {
      id: "648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0",
      number: "63959577",
      contentType: "image/png",
      contentLength: "43423 bytes",
      timestamp: "2024-03-10 11:28:08 UTC",
      height: "834034",
      value: "10000 sats",
      fee: "169069 sats",
      teleburnAddress: "0x9F2964577b9468162e90cF280FDbeffa49148228",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        {
          label: "Parent",
          value:
            "3d0150aad3743d698616f2917dbe217b96a41a3b039dc8bccb22ec9d430450fci0",
        },
        {
          label: "Parent details",
          value:
            "Inscription 63948282, metadata Blob, image/webp, 2 visible children",
        },
        {
          label: "Direct children",
          value: "10000 visible children",
        },
        {
          label: "First visible child IDs",
          value:
            "b10b00bfb146fee3e86d6cbd8e8c954c485da41be480c0b21a6a63de7986892bi0 and b10b00bfb146fee3e86d6cbd8e8c954c485da41be480c0b21a6a63de7986892bi1",
        },
      ],
    },
    metadata: [
      { label: "Name", value: "Blobs" },
      {
        label: "Study note",
        value:
          "ART on Blockchain notes describe Blobs as 10000 interactive 3D GPU-shader inscriptions generated from each inscription's on-chain CBOR metadata.",
      },
      {
        label: "Stack note",
        value:
          "The notes trace a recursive stack: root, collection parent, per-Blob bootstrap, Book of Blob engine, shared on-chain libraries, shader module, and metadata reader.",
      },
      {
        label: "Satname pattern",
        value:
          "The documented Blob sat range uses blob-prefixed satnames such as blobnwthfme, blobnwthems, and blobnwthdng.",
      },
    ],
    externalLinks: [],
  },
  {
    satname: "excrescence",
    role: "Single asset in a parented collection",
    summary:
      "The satname carries one HTML inscription with one parent and no direct children. The parent inscription is titled Ephemera Kit / Collection and has 332 visible children.",
    sat: {
      number: "1263083605557421",
      block: "295233",
      timestamp: "2014-04-11 09:53:32 UTC",
      rarity: "common",
    },
    inscription: {
      id: "07d3229fb454ff55117c675d6a0571f2e61ec2ff1deebc769e5b19aebdf0377ei5",
      number: "91759015",
      contentType: "text/html;charset=utf-8",
      contentLength: "5143 bytes",
      timestamp: "2025-03-28 16:45:48 UTC",
      height: "889853",
      value: "546 sats",
      fee: "11467 sats",
      teleburnAddress: "0x1878b38D98c5C3497E1c12121a3C2705c135F87a",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        {
          label: "Parent",
          value:
            "d30a35910fdb73c1eb97b6b06fe70c8c0dd40b621e7fe6f1bbeab9ac4616356fi1",
        },
        {
          label: "Parent metadata",
          value: "Title: Ephemera Kit / Collection",
        },
        {
          label: "Parent children",
          value: "332 visible children",
        },
        { label: "Direct children", value: "none found by /r/children" },
      ],
    },
    metadata: [
      { label: "Call Sign", value: "CORALBENEFIT" },
      { label: "Serial Number", value: "IAEK-0277" },
      { label: "Housing", value: "IAEK-EK01-RRK-I" },
      { label: "Sundial", value: "IAEK-EK02" },
      { label: "Orbit Controller", value: "IAEK-OC07-K" },
      { label: "CAL Code", value: "2014-0411-0953" },
      { label: "Operating System", value: "0.0.6" },
    ],
    externalLinks: [],
  },
  {
    satname: "cyclisation",
    role: "Single asset in a parented collection",
    summary:
      "The satname carries one JPEG inscription with one parent and no direct children. The parent inscription has 82 visible children, and this entry is tracked as a Satgods collection asset.",
    sat: {
      number: "1540035249036520",
      block: "406014",
      timestamp: "2016-04-06 12:33:19 UTC",
      rarity: "common",
    },
    inscription: {
      id: "3c201fe5d5cf26ddee63dbb115c68f40f80b8dad837da0292da97950cadcb785i0",
      number: "56637533",
      contentType: "image/jpeg",
      contentLength: "33706 bytes",
      timestamp: "2024-01-21 03:47:39 UTC",
      height: "826626",
      value: "546 sats",
      fee: "459086 sats",
      teleburnAddress: "0xd25fd327e4598c07E811f915A2f8170Ef3D67586",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        {
          label: "Parent",
          value:
            "4a5e29c6546d2230022fd6fec1f41b4b9da4d42687927951d6275b65bb284181i0",
        },
        {
          label: "Parent details",
          value: "Inscription 50753967, image/jpeg, 10199 bytes",
        },
        {
          label: "Parent children",
          value: "82 visible children",
        },
        { label: "Direct children", value: "none found by /r/children" },
      ],
    },
    metadata: [
      { label: "Collection", value: "Satgods" },
      { label: "Collection source", value: "Owner-provided classification" },
      { label: "Parent charm", value: "9️⃣ nineball" },
      { label: "Parent satname", value: "nvsxsrccvbl" },
    ],
    externalLinks: [],
  },
];

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
          Known satnames that carry inscriptions. The first entries are manually
          verified from ordinals.com sat pages, inscription pages, and recursive
          parent-child endpoints.
        </p>
        <div className="registry-note">
          On-chain facts are kept separate from external links. New entries can
          be added by request, manual research, or a future satname trace engine.
        </div>
      </section>

      <section className="asset-gallery" aria-label="Known satname inscriptions">
        {entries.map((entry) => {
          const inscriptionUrl = ordinalsPath(
            `/inscription/${entry.inscription.id}`,
          );
          const satUrl = ordinalsPath(`/sat/${entry.satname}`);

          return (
            <details className="asset-card" key={entry.satname}>
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
                  <small>{entry.role}</small>
                </span>
              </summary>

              <div className="asset-detail">
                <div className="satname-card-heading">
                  <div>
                    <p className="eyebrow">{entry.role}</p>
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
    </main>
  );
}
