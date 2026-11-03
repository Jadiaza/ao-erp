import { ORDO_CACHE_TTL_MS, ORDO_ENDPOINTS } from "@/lib/ordo/config";
import {
  isRecord,
  normalizeOrdoCollection,
  normalizeOrdoEntry,
  normalizeOrdoFeast,
  normalizeOrdoTime,
  combineOrdoEntries,
} from "@/lib/ordo/normalize";
import type {
  OrdoCalendarEntry,
  OrdoLiturgicalTime,
  OrdoPrincipalFeast,
} from "@/lib/ordo/types";

type CachedCollection = { expiresAt: number; values: unknown[] };

const collectionCache = new Map<string, CachedCollection>();

export class OrdoServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OrdoServiceError";
  }
}

async function requestCollection(url: string, signal: AbortSignal): Promise<unknown[]> {
  const cached = collectionCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.values;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      cache: "default",
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new OrdoServiceError("No fue posible conectar con ORDO Colombia.");
  }

  if (!response.ok) {
    throw new OrdoServiceError(
      `ORDO Colombia respondió con HTTP ${response.status}.`,
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new OrdoServiceError("ORDO Colombia devolvió una respuesta que no es JSON válido.");
  }

  if (!isRecord(body) || body["success"] !== true || !Array.isArray(body["data"])) {
    const message = isRecord(body) && typeof body["message"] === "string" ? body["message"] : "Respuesta inválida";
    throw new OrdoServiceError(`ORDO Colombia: ${message}.`);
  }

  const values = body["data"] as unknown[];
  collectionCache.set(url, { values, expiresAt: Date.now() + ORDO_CACHE_TTL_MS });
  return values;
}

export function clearOrdoCache() {
  collectionCache.clear();
}

export async function getOrdoPrincipalFeasts(signal: AbortSignal): Promise<OrdoPrincipalFeast[]> {
  return normalizeOrdoCollection(await requestCollection(ORDO_ENDPOINTS.principalFeasts, signal), normalizeOrdoFeast);
}

export async function getOrdoLiturgicalTimes(signal: AbortSignal): Promise<OrdoLiturgicalTime[]> {
  return normalizeOrdoCollection(await requestCollection(ORDO_ENDPOINTS.liturgicalTimes, signal), normalizeOrdoTime);
}

export async function getOrdoPrincipalContent(signal: AbortSignal): Promise<OrdoCalendarEntry[]> {
  return normalizeOrdoCollection(await requestCollection(ORDO_ENDPOINTS.principalContent, signal), normalizeOrdoEntry);
}

export async function getOrdoCompleteContent(signal: AbortSignal): Promise<OrdoCalendarEntry[]> {
  return normalizeOrdoCollection(await requestCollection(ORDO_ENDPOINTS.completeContent, signal), normalizeOrdoEntry);
}

export function mergeOrdoCalendarContent(
  complete: OrdoCalendarEntry[],
  principal: OrdoCalendarEntry[],
): OrdoCalendarEntry[] {
  return combineOrdoEntries(complete, principal);
}
