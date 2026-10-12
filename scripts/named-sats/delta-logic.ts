import { classifySatname } from "../../src/core/named-sat-classify";
import {
  entryFromClassification,
  type NamedSatEntry,
} from "../../src/core/named-sats-snapshot";
import { satToName } from "../../src/core/sat-math";

export function candidateFromInscription(args: {
  sat: bigint;
  inscriptionNumber: number;
  inscriptionId?: string;
  words: Set<string>;
  allowlist: Set<string>;
  existingNames: Set<string>;
}): NamedSatEntry | null {
  const satname = satToName(args.sat);
  if (!/^[a-z]+$/.test(satname)) return null;
  if (args.existingNames.has(satname)) return null;

  const classified = classifySatname(satname, args.words);
  const onAllowlist = args.allowlist.has(satname);

  if (classified.kind === "none" && !onAllowlist) return null;

  const source = onAllowlist ? "allowlist" : "delta";
  const base =
    entryFromClassification(satname, args.sat.toString(), source, classified) ??
    ({
      satname,
      sat: args.sat.toString(),
      kind: "single" as const,
      source,
    } satisfies NamedSatEntry);

  return {
    ...base,
    firstSeenInscriptionNumber: args.inscriptionNumber,
    primaryInscriptionId: args.inscriptionId,
    inscriptionCount: args.inscriptionId ? 1 : undefined,
  };
}
