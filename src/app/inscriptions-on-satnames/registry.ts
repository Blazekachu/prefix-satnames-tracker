export type Fact = {
  label: string;
  value: string;
};

export type SourceLink = {
  label: string;
  href: string;
};

export type RegistryTabId = "ord-father" | "all";

type Lineage = {
  badge: string;
  depth: number;
  branch: string;
  facts: Fact[];
};

type Descendants = {
  label: string;
  satnames: string[];
};

export type ChildBrowserSummary = {
  count: string;
  satnameRangeStart: string;
  satnameRangeEnd: string;
  satRangeStart: string;
  satRangeEnd: string;
  browseUrl: string;
  browseLabel: string;
  note: string;
};

export type SatnameInscription = {
  satname: string;
  tabs: RegistryTabId[];
  role: string;
  summary: string;
  namedSatBranch?: boolean;
  childBrowser?: ChildBrowserSummary;
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
  lineage?: Lineage;
  children?: SatnameInscription[];
  descendants?: Descendants;
  metadata: Fact[];
  externalLinks: SourceLink[];
};

export const ORDINALS = "https://ordinals.com";

export const REGISTRY_TABS: Array<{ id: RegistryTabId; label: string; note: string }> = [
  {
    id: "ord-father",
    label: "Named Sats by ORD FATHER",
    note:
      "Curated named-sat lineage verified under inscription 0. This tab starts from the named-sat branches under inscription 0 and shows their verified descendants directly inside each branch card.",
  },
  {
    id: "all",
    label: "All named sats tracked yet",
    note:
      "Broader manual registry of named sats carrying inscriptions outside the dedicated ORD FATHER lineage tab.",
  },
];

function createFalsecolorsChild({
  satname,
  sat,
  value,
  inscriptionId,
  inscriptionNumber,
  contentLength,
  teleburnAddress,
  output,
  location,
}: {
  satname: string;
  sat: string;
  value: string;
  inscriptionId: string;
  inscriptionNumber: string;
  contentLength: string;
  teleburnAddress: string;
  output: string;
  location: string;
}): SatnameInscription {
  return {
    satname,
    tabs: [],
    role: "Grandchild via falsecolors",
    summary:
      "This named sat sits one branch below falsecolors, making it a verified grandchild of inscription 0 inside the smallest fully mapped ORD FATHER subtree on the page.",
    sat: {
      number: sat,
      block: "834616",
      timestamp: "2024-03-14 04:49:37 UTC",
      rarity: "common",
    },
    inscription: {
      id: inscriptionId,
      number: inscriptionNumber,
      contentType: "image/png",
      contentLength,
      timestamp: "2024-03-14 04:49:37 UTC",
      height: "834616",
      value,
      fee: "9080 sats",
      teleburnAddress,
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parent", value: "falsecolors" },
        {
          label: "Root lineage",
          value: "inscription 0 -> falsecolors -> " + satname,
        },
        {
          label: "Direct children",
          value: "none visible on inscription page",
        },
      ],
    },
    lineage: {
      badge: "Grandchild via falsecolors",
      depth: 2,
      branch: "falsecolors branch",
      facts: [
        { label: "Depth", value: "2 hops from inscription 0" },
        {
          label: "Path",
          value: "ezcubunuovm -> falsecolors -> " + satname,
        },
        { label: "Branch", value: "falsecolors subtree" },
      ],
    },
    metadata: [
      { label: "Address", value: "verified on ordinals.com sat page" },
      { label: "Output", value: output },
      { label: "Location", value: location },
    ],
    externalLinks: [],
  };
}

export const registryEntries: SatnameInscription[] = [
  {
    satname: "ezcubunuovm",
    tabs: [],
    role: "Inscription 0 root on a named sat",
    summary:
      "Inscription 0 sits on the named sat ezcubunuovm. This featured tab tracks the verified named-sat branch rooted there, starting with five direct named-sat children and a smaller descendant tree already confirmed from recursive child endpoints.",
    sat: {
      number: "1252201400444387",
      block: "293810",
      timestamp: "2014-04-01 15:33:47 UTC",
      rarity: "common",
    },
    inscription: {
      id: "6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0",
      number: "0",
      contentType: "image/png",
      contentLength: "793 bytes",
      timestamp: "2022-12-14 20:32:00 UTC",
      height: "767430",
      value: "606 sats",
      fee: "322 sats",
      teleburnAddress: "0xe43A06530BdF8A4e067581f48Fae3b535559dA9e",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parents", value: "none" },
        { label: "Direct children", value: "5 visible children" },
        {
          label: "Direct named-sat children",
          value:
            "falsecolors, daddyplease, cargobroker, acquisitive, mixnetworks",
        },
        {
          label: "Verified deeper named sats",
          value:
            "falsecolors branch adds 8 named-sat descendants; cargobroker and mixnetworks each add 1 named-sat descendant.",
        },
      ],
    },
    lineage: {
      badge: "Root",
      depth: 0,
      branch: "Inscription 0",
      facts: [
        { label: "Depth", value: "0 hops from inscription 0" },
        { label: "Path", value: "ezcubunuovm" },
        { label: "Branch", value: "Inscription 0 root" },
      ],
    },
    metadata: [
      { label: "Address", value: "bc1pd96xzyue7yvjf24cmu07xasezg3jpm5tyfem4txad5ke2jas4m7qkhe7dy" },
      { label: "Offset", value: "0" },
      { label: "Historical note", value: "This is inscription 0, the root reference for the featured lineage tab." },
    ],
    externalLinks: [
      {
        label: "Ordinals handbook example",
        href: "https://docs.ordinals.com/inscriptions/examples.html",
      },
    ],
  },
  {
    satname: "falsecolors",
    tabs: ["ord-father"],
    role: "Direct child branch of inscription 0",
    namedSatBranch: true,
    summary:
      "This direct child of inscription 0 sits on a named sat and carries the clearest small named-sat subtree currently verified under the root. The branch has 8 direct children and each confirmed child lands on its own named sat.",
    sat: {
      number: "1244907803623325",
      block: "292262",
      timestamp: "2014-03-23 11:35:25 UTC",
      rarity: "common",
    },
    inscription: {
      id: "681b5373c03e3f819231afd9227f54101395299c9e58356bda278e2f32bef2cdi0",
      number: "64228106",
      contentType: "image/gif",
      contentLength: "10719 bytes",
      timestamp: "2024-03-13 04:11:50 UTC",
      height: "834450",
      value: "8740 sats",
      fee: "117560 sats",
      teleburnAddress: "0x28b702Ce4C76C096854facfF36374fecfd4d0e9E",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parent", value: "inscription 0" },
        { label: "Direct children", value: "8 visible children" },
        {
          label: "Verified named-sat descendants",
          value:
            "badgertooth, zonefruits, abysscalled, cactusseeds, carpetyarns, necrowizard, ghostflight, breathelast",
        },
        { label: "Charms", value: "vindicated, burned" },
      ],
    },
    lineage: {
      badge: "Direct child of inscription 0",
      depth: 1,
      branch: "falsecolors branch",
      facts: [
        { label: "Depth", value: "1 hop from inscription 0" },
        { label: "Path", value: "ezcubunuovm -> falsecolors" },
        { label: "Branch", value: "8 verified named-sat descendants" },
      ],
    },
    descendants: {
      label: "Verified falsecolors children on named sats",
      satnames: [
        "badgertooth",
        "zonefruits",
        "abysscalled",
        "cactusseeds",
        "carpetyarns",
        "necrowizard",
        "ghostflight",
        "breathelast",
      ],
    },
    children: [
      createFalsecolorsChild({
        satname: "badgertooth",
        sat: "1811343003917260",
        value: "546 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei0",
        inscriptionNumber: "64332810",
        contentLength: "1317 bytes",
        teleburnAddress: "0x5B737BAD5b800d5992DB234d419FfbE1f38B07Af",
        output:
          "78ccdf1ee2bf14f36e83653a99586329b2931a17f786ffa8e6e0b79650d2bc40:0",
        location:
          "78ccdf1ee2bf14f36e83653a99586329b2931a17f786ffa8e6e0b79650d2bc40:0:0",
      }),
      createFalsecolorsChild({
        satname: "zonefruits",
        sat: "1955586426257097",
        value: "547 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei1",
        inscriptionNumber: "64332811",
        contentLength: "1168 bytes",
        teleburnAddress: "0x7eb107037ECD33C9FE9E38D3FC9EeDeF90EbcEfb",
        output:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:2",
        location:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:2:0",
      }),
      createFalsecolorsChild({
        satname: "abysscalled",
        sat: "1942594707950922",
        value: "546 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei2",
        inscriptionNumber: "64332812",
        contentLength: "1230 bytes",
        teleburnAddress: "0x733d9d79ADf245e6b234e717C68fE5ACeD91a81d",
        output:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:3",
        location:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:3:0",
      }),
      createFalsecolorsChild({
        satname: "cactusseeds",
        sat: "1670275367902281",
        value: "10000 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei3",
        inscriptionNumber: "64332813",
        contentLength: "1365 bytes",
        teleburnAddress: "0x03fa02ab60cb74316BB8CeeF7712b471DFFB2056",
        output:
          "5ad0e2ab71c31231f3a894305aeed44419fd3778d39607e429719ccc31283203:0",
        location:
          "5ad0e2ab71c31231f3a894305aeed44419fd3778d39607e429719ccc31283203:0:0",
      }),
      createFalsecolorsChild({
        satname: "carpetyarns",
        sat: "1667180017264785",
        value: "546 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei4",
        inscriptionNumber: "64332814",
        contentLength: "1182 bytes",
        teleburnAddress: "0x021097869bc7eB5A61f331a5eB8Aab555DC4Dc52",
        output:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:5",
        location:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:5:0",
      }),
      createFalsecolorsChild({
        satname: "necrowizard",
        sat: "95737174791764",
        value: "546 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei5",
        inscriptionNumber: "64332815",
        contentLength: "1419 bytes",
        teleburnAddress: "0x4F77E3Fd42331eb52a605149694fc9eAB2D2A70E",
        output:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:6",
        location:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:6:0",
      }),
      createFalsecolorsChild({
        satname: "ghostflight",
        sat: "1065103033071944",
        value: "546 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei6",
        inscriptionNumber: "64332816",
        contentLength: "1395 bytes",
        teleburnAddress: "0x310745119e9eb6097506698b8d23961046fe7e6B",
        output:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:7",
        location:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:7:0",
      }),
      createFalsecolorsChild({
        satname: "breathelast",
        sat: "1718876297165114",
        value: "546 sats",
        inscriptionId:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29ei7",
        inscriptionNumber: "64332817",
        contentLength: "942 bytes",
        teleburnAddress: "0x4B5366459a7278586Fa89e8B7b216A3c3b89b968",
        output:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:8",
        location:
          "a4676e57277b70171d69dc6ad2781485b491fe0ff5870f6f6b01999e7180b29e:8:0",
      }),
    ],
    metadata: [
      { label: "Burn metadata", value: "skull" },
      { label: "Address", value: "burned inscription on named sat falsecolors" },
      { label: "Curation note", value: "This is the smallest fully mapped named-sat subtree verified so far under inscription 0." },
    ],
    externalLinks: [],
  },
  {
    satname: "daddyplease",
    tabs: ["ord-father"],
    role: "Direct child branch of inscription 0",
    summary:
      "This direct child of inscription 0 sits on daddyplease and opens into a much larger branch. The card anchors the branch in the featured tab, but the named-sat descendants under its 1000-child set are not fully curated yet.",
    sat: {
      number: "1529026757329329",
      block: "397096",
      timestamp: "2016-02-03 05:53:03 UTC",
      rarity: "common",
    },
    inscription: {
      id: "b1ef66c2d1a047cbaa6260b74daac43813924378fe08ef8545da4cb79e8fcf00i0",
      number: "69483963",
      contentType: "text/plain;charset=utf-8",
      contentLength: "5 bytes",
      timestamp: "2024-04-16 03:13:07 UTC",
      height: "839418",
      value: "1 sat",
      fee: "21240 sats",
      teleburnAddress: "0x0926b34F5CfB6e59C774006Da46c33890081fec0",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parent", value: "inscription 0" },
        { label: "Direct children", value: "1000 visible children" },
        {
          label: "Status",
          value: "Large branch anchored on a named sat; named-sat descendants not fully mapped in this page yet.",
        },
        { label: "Charms", value: "vindicated, burned" },
      ],
    },
    lineage: {
      badge: "Direct child of inscription 0",
      depth: 1,
      branch: "daddyplease branch",
      facts: [
        { label: "Depth", value: "1 hop from inscription 0" },
        { label: "Path", value: "ezcubunuovm -> daddyplease" },
        { label: "Branch", value: "1000-child branch, partial named-sat mapping" },
      ],
    },
    metadata: [
      { label: "Photographer", value: "PARKER DAY" },
      { label: "Models", value: "100" },
      { label: "Photos", value: "1000" },
      { label: "Patron", value: "CASEY RODARMOR" },
      { label: "License", value: "CC0" },
    ],
    externalLinks: [],
  },
  {
    satname: "cargobroker",
    tabs: ["ord-father"],
    role: "Direct child branch of inscription 0",
    summary:
      "This direct child of inscription 0 sits on cargobroker and currently exposes one verified named-sat descendant. It works well as a compact example of a small branch that still retains explicit ancestry back to inscription 0.",
    sat: {
      number: "1667249431221112",
      block: "480740",
      timestamp: "2017-09-05 20:34:31 UTC",
      rarity: "common",
    },
    inscription: {
      id: "47c7260764af2ee17aa584d9c035f2e5429aefd96b8016cfe0e3f0bcf04869a3i0",
      number: "70194575",
      contentType: "text/plain;charset=utf-8",
      contentLength: "4 bytes",
      timestamp: "2024-04-19 04:08:19 UTC",
      height: "839876",
      value: "10000 sats",
      fee: "9920 sats",
      teleburnAddress: "0xdcEdEc545861615b146Db6D00c3385E9027785Ea",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parent", value: "inscription 0" },
        { label: "Direct children", value: "1 visible child" },
        { label: "Verified named-sat descendant", value: "hazasvignzf" },
      ],
    },
    lineage: {
      badge: "Direct child of inscription 0",
      depth: 1,
      branch: "cargobroker branch",
      facts: [
        { label: "Depth", value: "1 hop from inscription 0" },
        { label: "Path", value: "ezcubunuovm -> cargobroker" },
        { label: "Branch", value: "1 verified named-sat descendant" },
      ],
    },
    descendants: {
      label: "Verified cargobroker child on a named sat",
      satnames: ["hazasvignzf"],
    },
    metadata: [
      { label: "Child inscription number", value: "70281661" },
      { label: "Child branch note", value: "The only verified child branch currently lands on named sat hazasvignzf." },
    ],
    externalLinks: [],
  },
  {
    satname: "acquisitive",
    tabs: ["ord-father"],
    role: "Direct child branch of inscription 0",
    summary:
      "This direct child of inscription 0 sits on acquisitive. It currently shows no visible children on its inscription page, but it still belongs in the featured tab because it is one of the verified named-sat anchors directly under inscription 0.",
    sat: {
      number: "1938822652429115",
      block: "776905",
      timestamp: "2022-12-15 19:01:16 UTC",
      rarity: "common",
    },
    inscription: {
      id: "1b07f02356aed6ddca37db8226c6292f2953d55ea741d7f58d44427976e7d4eei0",
      number: "76629250",
      contentType: "image/png",
      contentLength: "2279 bytes",
      timestamp: "2024-10-22 06:16:34 UTC",
      height: "866807",
      value: "10000 sats",
      fee: "1548800 sats",
      teleburnAddress: "0xA00402F63b9F9A2Bf65AE2a38A9f496AD589Ee5B",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parent", value: "inscription 0" },
        { label: "Direct children", value: "none visible on inscription page" },
        { label: "Rune", value: "MEMENTO•MORI" },
      ],
    },
    lineage: {
      badge: "Direct child of inscription 0",
      depth: 1,
      branch: "acquisitive branch",
      facts: [
        { label: "Depth", value: "1 hop from inscription 0" },
        { label: "Path", value: "ezcubunuovm -> acquisitive" },
        { label: "Branch", value: "Anchor branch with no visible child expansion yet" },
      ],
    },
    metadata: [
      { label: "Address", value: "bc1p5kjec5vl67yydqqljy4t97hdxq05s62qyqmmgzxhmqcd628ecuqs8c9w97" },
      { label: "Rune linkage", value: "Inscription page shows the rune MEMENTO•MORI." },
    ],
    externalLinks: [],
  },
  {
    satname: "mixnetworks",
    tabs: ["ord-father"],
    role: "Direct child branch of inscription 0",
    summary:
      "This direct child of inscription 0 sits on mixnetworks and exposes one verified named-sat descendant. It rounds out the currently confirmed named-sat anchors directly under the root inscription.",
    sat: {
      number: "210836133200079",
      block: "50094",
      timestamp: "2010-12-16 13:08:41 UTC",
      rarity: "common",
    },
    inscription: {
      id: "717d25914a1191c30f4c1d709e3ec0e1fab79cc7bf92cd12a93bed68db63416ai0",
      number: "83901911",
      contentType: "image/png",
      contentLength: "35342 bytes",
      timestamp: "2025-01-29 09:37:04 UTC",
      height: "881332",
      value: "1000 sats",
      fee: "91770 sats",
      teleburnAddress: "0xbf0d1C5eA130Bc5fc416eA42d758cf05197331D3",
    },
    relationship: {
      label: "Parent-child trace",
      facts: [
        { label: "Parent", value: "inscription 0" },
        { label: "Direct children", value: "1 visible child" },
        { label: "Verified named-sat descendant", value: "highwaystar" },
      ],
    },
    lineage: {
      badge: "Direct child of inscription 0",
      depth: 1,
      branch: "mixnetworks branch",
      facts: [
        { label: "Depth", value: "1 hop from inscription 0" },
        { label: "Path", value: "ezcubunuovm -> mixnetworks" },
        { label: "Branch", value: "1 verified named-sat descendant" },
      ],
    },
    descendants: {
      label: "Verified mixnetworks child on a named sat",
      satnames: ["highwaystar"],
    },
    metadata: [
      { label: "Child inscription number", value: "85720883" },
      { label: "Child branch note", value: "The only verified child branch currently lands on named sat highwaystar." },
    ],
    externalLinks: [],
  },
  {
    satname: "agooddoctor",
    tabs: ["all"],
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
    tabs: ["all"],
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
    tabs: ["all"],
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
    tabs: ["all"],
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
      { label: "Parent charm", value: "9 nineball" },
      { label: "Parent satname", value: "nvsxsrccvbl" },
    ],
    externalLinks: [],
  },
];

export function getEntriesForTab(tabId: RegistryTabId): SatnameInscription[] {
  return registryEntries.filter((entry) => entry.tabs.includes(tabId));
}

function walkRegistryEntries(
  entries: SatnameInscription[],
  visit: (entry: SatnameInscription) => boolean,
): SatnameInscription | null {
  for (const entry of entries) {
    if (visit(entry)) {
      return entry;
    }

    if (entry.children?.length) {
      const nested = walkRegistryEntries(entry.children, visit);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

/** Find a curated registry entry by satname, including nested child cards. */
export function findRegistryEntryBySatname(
  satname: string,
): SatnameInscription | null {
  const normalized = satname.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return walkRegistryEntries(
    registryEntries,
    (entry) => entry.satname === normalized,
  );
}

export function isSatnameInRegistry(satname: string): boolean {
  return findRegistryEntryBySatname(satname) !== null;
}
