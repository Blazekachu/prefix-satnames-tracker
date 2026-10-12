import { describe, expect, it } from "vitest";

import { blobsCollection, findCollectionSatname } from "./blobs";

describe("blobs collection", () => {
  it("stores verified Blob child-browser metadata", () => {
    expect(blobsCollection.childBrowser).toEqual({
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
    });
  });

  it("finds blobnwthems case-insensitively", () => {
    expect(findCollectionSatname("BlobNwThems")?.satname).toBe("blobnwthems");
    expect(findCollectionSatname("notablob")).toBeNull();
  });
});
