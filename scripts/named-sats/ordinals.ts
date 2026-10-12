const ORDINALS_BASE = "https://ordinals.com";

export type SatInscriptionsResponse = {
  ids: string[];
  more?: boolean;
  page?: number;
};

export type InscriptionInfo = {
  id: string;
  number: number;
  sat: bigint | null;
};

function isSatInscriptionsResponse(
  value: unknown,
): value is SatInscriptionsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "ids" in value &&
    Array.isArray((value as { ids: unknown }).ids) &&
    (value as { ids: unknown[] }).ids.every((id) => typeof id === "string")
  );
}

export function extractInscriptionIdsFromSatResponse(
  payload: unknown,
): string[] {
  if (!isSatInscriptionsResponse(payload)) return [];
  return payload.ids;
}

export function extractInscriptionIdFromSatResponse(
  payload: unknown,
): string | null {
  const ids = extractInscriptionIdsFromSatResponse(payload);
  return ids[0] ?? null;
}

function readNumberField(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(value);
  }
  return null;
}

function readSatField(obj: Record<string, unknown>): bigint | null {
  const value = obj.sat;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  if (typeof value === "bigint") return value;
  return null;
}

export function parseInscriptionInfo(
  payload: unknown,
  fallbackId?: string,
): InscriptionInfo | null {
  if (typeof payload !== "object" || payload === null) return null;
  const obj = payload as Record<string, unknown>;
  const id =
    (typeof obj.id === "string" && obj.id) ||
    (typeof obj.inscription_id === "string" && obj.inscription_id) ||
    fallbackId;
  const number = readNumberField(obj, [
    "number",
    "inscription_number",
    "inscriptionNumber",
  ]);
  if (!id || number == null) return null;
  return { id, number, sat: readSatField(obj) };
}

async function fetchJson(
  url: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 429 || response.status === 503) {
    const err = new Error(`Rate limited: ${response.status} for ${url}`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

export async function withBackoff<T>(
  fn: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let delayMs = 500;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number }).status;
      const retryable = status === 429 || status === 503;
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }
  throw new Error("withBackoff exhausted");
}

export async function fetchSatInscriptions(
  sat: bigint,
  signal?: AbortSignal,
): Promise<SatInscriptionsResponse> {
  const payload = await withBackoff(() =>
    fetchJson(`${ORDINALS_BASE}/r/sat/${sat.toString()}`, signal),
  );
  if (!isSatInscriptionsResponse(payload)) {
    return { ids: [] };
  }
  return payload;
}

export async function fetchInscriptionInfo(
  id: string,
  signal?: AbortSignal,
): Promise<InscriptionInfo | null> {
  try {
    const payload = await withBackoff(() =>
      fetchJson(`${ORDINALS_BASE}/r/inscription/${id}`, signal),
    );
    return parseInscriptionInfo(payload, id);
  } catch {
    return null;
  }
}

/** Newest-first inscription id pages. Page 0 is the tip. */
export async function fetchInscriptionIdsPage(
  page = 0,
  signal?: AbortSignal,
): Promise<string[]> {
  const payload = await withBackoff(() =>
    fetchJson(`${ORDINALS_BASE}/inscriptions/${page}`, signal),
  );
  if (
    typeof payload === "object" &&
    payload !== null &&
    "ids" in payload &&
    Array.isArray((payload as { ids: unknown }).ids)
  ) {
    return (payload as { ids: string[] }).ids.filter(
      (id) => typeof id === "string",
    );
  }
  return [];
}

export async function fetchLatestInscriptionIds(
  signal?: AbortSignal,
): Promise<string[]> {
  return fetchInscriptionIdsPage(0, signal);
}

export { ORDINALS_BASE };
