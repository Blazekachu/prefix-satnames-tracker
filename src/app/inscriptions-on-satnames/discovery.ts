import { satnameToSat } from "../../core/satname";

const ORDINALS_BASE = "https://ordinals.com";

export type DiscoveryResult =
  | {
      status: "inscribed";
      sat: bigint;
      inscriptionId: string;
      inscriptionUrl: string;
    }
  | { status: "not-inscribed"; sat: bigint }
  | { status: "lookup-unavailable"; sat: bigint; message: string };

type SatResponse = {
  ids: string[];
};

function isSatResponse(value: unknown): value is SatResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "ids" in value &&
    Array.isArray((value as { ids: unknown }).ids) &&
    (value as { ids: unknown[] }).ids.every((id) => typeof id === "string")
  );
}

export function extractInscriptionIdFromSatResponse(
  payload: unknown,
): string | null {
  if (!isSatResponse(payload) || payload.ids.length === 0) {
    return null;
  }

  return payload.ids[0];
}

export async function lookupSatnameInscription(
  satname: string,
  signal?: AbortSignal,
): Promise<DiscoveryResult> {
  const sat = satnameToSat(satname);

  try {
    const response = await fetch(
      `${ORDINALS_BASE}/r/sat/${sat.toString()}`,
      {
        signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        status: "lookup-unavailable",
        sat,
        message: "Live lookup unavailable",
      };
    }

    const payload: unknown = await response.json();
    const inscriptionId = extractInscriptionIdFromSatResponse(payload);

    if (!inscriptionId) {
      return { status: "not-inscribed", sat };
    }

    return {
      status: "inscribed",
      sat,
      inscriptionId,
      inscriptionUrl: `${ORDINALS_BASE}/inscription/${inscriptionId}`,
    };
  } catch {
    return {
      status: "lookup-unavailable",
      sat,
      message: "Live lookup unavailable",
    };
  }
}
