import type { OrdoCalendarEntry, OrdoLiturgicalTime, OrdoPrincipalFeast } from "./types";

type UnknownRecord = Record<string, unknown>;

const contentTextFields = [
  "tiempo_liturgico",
  "titulo",
  "encabezado",
  "preludio",
  "celebracion",
  "nombre_celebracion",
  "colores_dia",
  "color_1",
  "color_2",
  "color_3",
  "color_css",
  "color_css_secundario",
  "color_css_fuente",
  "misa",
  "oficio",
  "notas",
  "celebracion_obispo",
  "celebracion_circunscripcion",
  "celebracion_santo",
  "primera_lectura",
  "segunda_lectura",
  "salmo",
  "aclamacion",
  "evangelio",
  "reflexion",
  "reflexion_audio",
] as const;

const milestoneFields = [
  ["Cristo Rey (referencia anterior)", "FECHA_CRISTO_REY_I"],
  ["Navidad", "FECHA_NAVIDAD"],
  ["Bautismo del Señor", "FECHA_BAUTISMO"],
  ["Inicio de Cuaresma", "FECHA_CUARESMA"],
  ["Pascua", "FECHA_PASCUA"],
  ["Pentecostés", "FECHA_PENTECOSTES"],
  ["Cristo Rey", "FECHA_CRISTO_REY_II"],
] as const;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeOrdoText(value: unknown): string | null {
  if (typeof value !== "string") return value === null || value === undefined ? null : String(value);

  const text = value.trim();
  if (!text) return null;
  const visible = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es-CO");

  if (["null", "undefined", "-"].includes(visible)) return null;
  return text;
}

function normalizeId(value: unknown): number | string | null {
  if (typeof value === "number" || typeof value === "string") return value;
  return null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

export function normalizeOrdoFeast(value: unknown): OrdoPrincipalFeast | null {
  if (!isRecord(value)) return null;
  const fecha = normalizeDate(value["fecha"]);
  if (!fecha) return null;
  return {
    fecha,
    nombre_celebracion: normalizeOrdoText(value["nombre_celebracion"]),
    DESCRIPCION: normalizeOrdoText(value["DESCRIPCION"]),
  };
}

export function normalizeOrdoEntry(value: unknown): OrdoCalendarEntry | null {
  if (!isRecord(value)) return null;
  const fecha = normalizeDate(value["fecha"]);
  if (!fecha) return null;

  const entry = {
    id: normalizeId(value["id"]),
    fecha,
    aplica_colombia:
      typeof value["aplica_colombia"] === "number" || typeof value["aplica_colombia"] === "string"
        ? value["aplica_colombia"]
        : null,
  } as OrdoCalendarEntry;

  for (const field of contentTextFields) entry[field] = normalizeOrdoText(value[field]);
  return entry;
}

function normalizeYear(value: unknown): number | null {
  const year = typeof value === "number" ? value : Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= 9999 ? year : null;
}

export function normalizeOrdoTime(value: unknown): OrdoLiturgicalTime | null {
  if (!isRecord(value)) return null;
  const year = normalizeYear(value["ANO_ANO"]);
  const milestones = milestoneFields.map(([label, field]) => ({
    label,
    date: normalizeDate(value[field]),
  }));
  const descriptions: Record<string, string | null> = {};
  for (const [period, field] of [
    ["advent", "TEXTO_ADVIENTO"],
    ["christmas", "TEXTO_NAVIDAD"],
    ["ordinaryFirst", "TEXTO_I_ORDINARIO"],
    ["lent", "TEXTO_CUARESMA"],
    ["triduum", "TEXTO_TRIDUO_PASCUAL"],
    ["easter", "TEXTO_PASCUA"],
    ["ordinarySecond", "TEXTO_II_ORDINARIO"],
  ] as const) {
    descriptions[period] = normalizeOrdoText(value[field]);
  }

  return {
    id: normalizeId(value["ID"]),
    cycleId: normalizeId(value["CICLO_id"]),
    cycleName: normalizeOrdoText(value["NOMBRE"]),
    year,
    introduction: normalizeOrdoText(value["TEXTO_INTRODUCTORIO"]),
    milestones,
    descriptions,
  };
}

function mergeEntries(
  complete: OrdoCalendarEntry[],
  principal: OrdoCalendarEntry[],
): OrdoCalendarEntry[] {
  const principalById = new Map<string, OrdoCalendarEntry>();
  for (const entry of principal) {
    if (entry.id !== null) principalById.set(String(entry.id), entry);
  }

  const seenIds = new Set<string>();
  const merged = complete.map((entry) => {
    if (entry.id === null) return entry;
    const key = String(entry.id);
    seenIds.add(key);
    const extra = principalById.get(key);
    if (!extra) return entry;
    const mergedEntry = { ...entry };
    for (const field of Object.keys(extra) as Array<keyof OrdoCalendarEntry>) {
      if (extra[field] !== null && extra[field] !== undefined && extra[field] !== "") {
        (mergedEntry[field] as OrdoCalendarEntry[typeof field]) = extra[field] as OrdoCalendarEntry[typeof field];
      }
    }
    return mergedEntry;
  });

  for (const entry of principal) {
    if (entry.id === null || !seenIds.has(String(entry.id))) merged.push(entry);
  }

  return merged.map((entry, order) => ({ entry, order }))
    .sort((left, right) => left.entry.fecha.localeCompare(right.entry.fecha) || left.order - right.order)
    .map(({ entry }) => entry);
}

export function normalizeOrdoCollection<T>(
  values: unknown,
  normalize: (value: unknown) => T | null,
): T[] {
  if (!Array.isArray(values)) return [];
  return values.map(normalize).filter((value): value is T => value !== null);
}

export function combineOrdoEntries(
  complete: OrdoCalendarEntry[],
  principal: OrdoCalendarEntry[],
): OrdoCalendarEntry[] {
  return mergeEntries(complete, principal);
}

export function getOrdoPeriodDescription(
  period: string | null,
  descriptions: Record<string, string | null>,
): string | null {
  const normalized = (period ?? "").toLocaleUpperCase("es-CO").replace(/Á/g, "A");
  if (normalized.includes("ADVIENTO")) return descriptions["advent"] ?? null;
  if (normalized.includes("NAVIDAD")) return descriptions["christmas"] ?? null;
  if (normalized.includes("CUARESMA")) return descriptions["lent"] ?? null;
  if (normalized.includes("TRIDUO")) return descriptions["triduum"] ?? null;
  if (normalized.includes("PASCUA")) return descriptions["easter"] ?? null;
  if (normalized.includes("II TIEMPO ORDINARIO")) return descriptions["ordinarySecond"] ?? null;
  if (normalized.includes("I TIEMPO ORDINARIO")) return descriptions["ordinaryFirst"] ?? null;
  return null;
}

export function getOrdoEntryTitle(entry: OrdoCalendarEntry): string {
  const candidates = [entry.titulo, entry.nombre_celebracion, entry.preludio, entry.celebracion];
  for (const candidate of candidates) {
    const plain = candidate?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (plain) return plain;
  }
  return entry.encabezado ?? "Celebración del calendario";
}

