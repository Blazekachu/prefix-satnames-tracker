import type { SatnameInscription } from "../inscriptions-on-satnames/registry";

export const blobsCollection: SatnameInscription = {
  satname: "blobnwthems",
  tabs: [],
  role: "Blobs collection parent",
  childBrowser: {
    count: "10,000",
    satnameRangeStart: "blobnwthdng",
    satnameRangeEnd: "blobnwtcgsj",
    satRangeStart: "1749358685270829",
    satRangeEnd: "1749358685356548",
    browseUrl:
      "https://ordinals.com/children/648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0",
    browseLabel: "View all 10,000 children on ordinals.com",
    note:
      "The full Blob child set is browsed on ordinals.com to keep this page fast while preserving verified range facts here.",
  },
  summary:
    "The sat name carries the Blobs collection parent inscription. It has one parent root inscription and 10000 visible children. Research notes in ART on Blockchain describe the collection as metadata seeded 3D shader art built through a recursive on chain engine stack.",
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
    label: "Parent child trace",
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
        "ART on Blockchain notes describe Blobs as 10000 interactive 3D GPU shader inscriptions generated from each inscription's on chain CBOR metadata.",
    },
    {
      label: "Stack note",
      value:
        "The notes trace a recursive stack: root, collection parent, per Blob bootstrap, Book of Blob engine, shared on chain libraries, shader module, and metadata reader.",
    },
    {
      label: "Sat name pattern",
      value:
        "The documented Blob sat range uses blob prefixed sat names such as blobnwthfme, blobnwthems, and blobnwthdng.",
    },
  ],
  externalLinks: [],
};

export function findCollectionSatname(
  satname: string,
): SatnameInscription | null {
  const needle = satname.trim().toLowerCase();
  return blobsCollection.satname === needle ? blobsCollection : null;
}
