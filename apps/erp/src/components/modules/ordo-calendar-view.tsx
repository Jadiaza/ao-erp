import { useMemo, useState } from "react";
import { CalendarDays, ExternalLink, RefreshCw } from "lucide-react";
import {
  Calendar,
  DetailDrawer,
} from "@/components/modules";
import { OrdoHtmlContent } from "@/components/modules/ordo-html-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrdoEntryTitle, getOrdoPeriodDescription } from "@/lib/ordo/normalize";
import type {
  OrdoCalendarEntry,
  OrdoCalendarErrors,
  OrdoLiturgicalTime,
  OrdoPrincipalFeast,
} from "@/lib/ordo/types";

const ordoOfficialSite = "https://web-ordo-colombiano.cec.org.co/fiestas";

export function OrdoCalendarView({
  entries,
  feasts,
  times,
  loading,
  errors,
  loadedAt,
  onRetry,
}: {
  entries: OrdoCalendarEntry[];
  feasts: OrdoPrincipalFeast[];
  times: OrdoLiturgicalTime[];
  loading: Record<string, boolean>;
  errors: OrdoCalendarErrors;
  loadedAt: Date | null;
  onRetry: () => void;
}) {
  const [month, setMonth] = useState(() => new Date(2026, 10, 1));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date(2026, 10, 1));
  const [selectedEntry, setSelectedEntry] = useState<OrdoCalendarEntry | null>(null);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const selectedISO = selectedDate ? toISODate(selectedDate) : "";
  const monthEntries = useMemo(
    () => entries.filter((entry) => entry.fecha.startsWith(monthKey)),
    [entries, monthKey],
  );
  const selectedEntries = entries.filter((entry) => entry.fecha === selectedISO);
  const selectedFeasts = feasts.filter((feast) => feast.fecha === selectedISO);
  const monthFeasts = feasts.filter((feast) => feast.fecha.startsWith(monthKey));
  const entryDates = uniqueDates(entries.map((entry) => entry.fecha));
  const feastDates = uniqueDates(feasts.map((feast) => feast.fecha));
  const entryCountsByDate = entries.reduce<Map<string, number>>((counts, entry) => {
    counts.set(entry.fecha, (counts.get(entry.fecha) ?? 0) + 1);
    return counts;
  }, new Map());
  const multiDates = uniqueDates(
    Array.from(entryCountsByDate.entries())
      .filter(([, count]) => count > 1)
      .map(([date]) => date),
  );
  const selectedEntryPeriod = selectedEntries[0]?.tiempo_liturgico ?? null;
  const selectedTime = times.find(
    (item) => item.year === selectedDate?.getFullYear() || item.milestones.some((date) => date.date === selectedISO),
  );
  const periodDescription = selectedTime
    ? getOrdoPeriodDescription(selectedEntryPeriod, selectedTime.descriptions)
    : null;
  const dateMilestones = selectedTime?.milestones.filter((milestone) => milestone.date === selectedISO) ?? [];
  const coverage = entries.length > 0
    ? {
        first: entries.reduce((first, entry) => entry.fecha < first ? entry.fecha : first, entries[0]!.fecha),
        last: entries.reduce((last, entry) => entry.fecha > last ? entry.fecha : last, entries[0]!.fecha),
      }
    : null;
  const hasCalendarError = Boolean(errors.completeContent && errors.principalContent);
  const limitedCoverage = Boolean(errors.completeContent && entries.length > 0);

  const calendarModifiers = {
    ordoEntry: entryDates,
    ordoFeast: feastDates,
    ordoMultiple: multiDates,
  };

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]" aria-busy={Object.values(loading).some(Boolean)}>
      <section className="min-w-0 rounded-xl border bg-card p-3" aria-label="Calendario litúrgico ORDO">
        <div className="flex items-start justify-between gap-3 px-3 pt-2">
          <div>
            <h2 className="font-semibold">
              {month.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
            </h2>
            <p className="text-xs text-muted-foreground">Calendario litúrgico de ORDO Colombia.</p>
          </div>
          {Object.values(loading).some(Boolean) && (
            <span role="status" className="text-xs text-muted-foreground">
              Consultando…
            </span>
          )}
        </div>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={calendarModifiers}
          modifiersClassNames={{
            ordoEntry: "font-bold underline decoration-primary decoration-2 underline-offset-4",
            ordoFeast: "ring-1 ring-accent",
            ordoMultiple: "outline outline-1 outline-primary/50",
          }}
          className="mx-auto max-w-full"
        />
        <div className="space-y-2 px-3 pb-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Fecha con contenido litúrgico.</p>
          <p className="flex items-center gap-2"><span className="size-2 rounded-full bg-accent" /> Fiesta principal publicada.</p>
          <p>Los días con varias celebraciones conservan todos sus registros.</p>
        </div>
      </section>

      <div className="min-w-0 space-y-4">
        {hasCalendarError && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">No fue posible consultar el calendario ORDO.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {errors.completeContent ?? errors.principalContent}
              </p>
            </div>
            <Button type="button" variant="outline" className="gap-2" onClick={onRetry}>
              <RefreshCw className="size-4" /> Reintentar
            </Button>
          </div>
        )}
        {limitedCoverage && !hasCalendarError && (
          <div role="status" className="rounded-xl border border-accent/50 bg-secondary/60 p-4 text-sm">
            La consulta completa no está disponible. Se muestran únicamente los registros que ORDO devolvió en el contenido principal.
          </div>
        )}
        {errors.principalFeasts && (
          <p role="status" className="rounded-lg border p-3 text-sm text-muted-foreground">
            No se pudo consultar la lista complementaria de fiestas principales: {errors.principalFeasts}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-semibold">Registros del {selectedDate?.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</h2>
            <p className="text-sm text-muted-foreground">
              {monthEntries.length} registros litúrgicos en el mes · {monthFeasts.length} fiestas principales devueltas.
            </p>
            {coverage && (
              <p className="mt-1 text-xs text-muted-foreground">
                Intervalo de contenido recibido: {formatISODate(coverage.first)} – {formatISODate(coverage.last)}.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Las celebraciones parroquiales se consultan en Programación y equipos.</p>
        </div>

        {Object.values(loading).some(Boolean) && selectedEntries.length === 0 ? (
          <div role="status" className="flex min-h-36 items-center justify-center rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Consultando el contenido de la fecha seleccionada…
          </div>
        ) : selectedEntries.length > 0 ? (
          <div className="space-y-3">
            {selectedEntries.map((entry, index) => (
              <button
                key={entry.id === null ? `${entry.fecha}-${index}` : String(entry.id)}
                type="button"
                onClick={() => setSelectedEntry(entry)}
                className="grid w-full min-w-0 gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{getOrdoEntryTitle(entry)}</span>
                    {entry.celebracion && <Badge variant="secondary">{entry.celebracion}</Badge>}
                  </span>
                  {entry.encabezado && <span className="mt-1 block text-sm text-muted-foreground">{entry.encabezado}</span>}
                  {entry.tiempo_liturgico && <span className="mt-2 block text-xs text-muted-foreground">{entry.tiempo_liturgico}</span>}
                </span>
                <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {entry.colores_dia && <Badge variant="outline">Color: {entry.colores_dia}</Badge>}
                  <span className="text-sm font-medium text-primary">Ver contenido</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center">
            <CalendarDays className="mb-2 size-6 text-muted-foreground" />
            <h3 className="font-semibold">ORDO no devolvió registros de contenido para esta fecha</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              ORDO no devolvió contenido para esta fecha. La consulta completa cubre el intervalo indicado arriba; los hitos de tiempos litúrgicos se muestran por separado si están disponibles.
            </p>
          </div>
        )}

        {selectedFeasts.length > 0 && (
          <section className="space-y-3" aria-label="Fiestas principales de ORDO">
            <h3 className="text-sm font-semibold">Fiestas principales devueltas para esta fecha</h3>
            {selectedFeasts.map((feast, index) => (
              <article key={`${feast.fecha}-${index}`} className="rounded-xl border border-accent/50 bg-card p-4">
                <p className="font-semibold">{feast.nombre_celebracion ?? "Fiesta principal"}</p>
                <OrdoHtmlContent html={feast.DESCRIPCION} className="mt-2 text-sm text-muted-foreground" />
              </article>
            ))}
          </section>
        )}

        {dateMilestones.length > 0 && (
          <section className="rounded-xl border border-accent/50 bg-secondary/50 p-4" aria-label="Referencia de tiempo litúrgico">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Referencia de tiempo litúrgico ORDO</p>
            <p className="mt-1 font-medium">{dateMilestones.map((item) => item.label).join(" · ")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fecha indicada por el servicio de tiempos litúrgicos; no sustituye el contenido de una celebración.
            </p>
          </section>
        )}

        <section className="rounded-xl bg-secondary/50 p-4" aria-label="Tiempo litúrgico y ciclo">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tiempo litúrgico · fuente ORDO</p>
          {selectedEntryPeriod ? (
            <p className="mt-1 text-sm font-medium">{selectedEntryPeriod}</p>
          ) : (
            <p className="mt-1 text-sm">Sin periodo informado para la fecha seleccionada.</p>
          )}
          {selectedTime && (
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedTime.cycleName ?? "Ciclo sin nombre"} · Año {selectedTime.year ?? "no informado"}
            </p>
          )}
          {periodDescription && (
            <details className="mt-3 rounded-lg border bg-card p-3">
              <summary className="cursor-pointer text-sm font-medium">Consultar descripción del periodo</summary>
              <OrdoHtmlContent html={periodDescription} className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground" />
            </details>
          )}
          {selectedTime && selectedTime.milestones.some((item) => item.date) && (
            <details className="mt-3 rounded-lg border bg-card p-3">
              <summary className="cursor-pointer text-sm font-medium">Fechas relevantes informadas por ORDO</summary>
              <ul className="mt-3 space-y-2 text-sm">
                {selectedTime.milestones.filter((item) => item.date).map((item) => (
                  <li key={`${item.label}-${item.date}`} className="flex flex-wrap justify-between gap-2">
                    <span>{item.label}</span><span className="text-muted-foreground">{formatISODate(item.date!)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        {errors.liturgicalTimes && (
          <p role="status" className="rounded-lg border p-3 text-sm text-muted-foreground">
            No se pudo consultar la información de tiempos litúrgicos: {errors.liturgicalTimes}
          </p>
        )}
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          Fuente: <a href={ordoOfficialSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2">ORDO Colombia <ExternalLink className="size-3" /></a>
          {loadedAt && loadedAt.getTime() > 0 && <span>· Consultado {loadedAt.toLocaleString("es-CO")}</span>}
        </p>
      </div>

      <DetailDrawer
        open={selectedEntry !== null}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
        title={selectedEntry ? getOrdoEntryTitle(selectedEntry) : "Detalle de celebración"}
        description={selectedEntry ? [formatISODate(selectedEntry.fecha), selectedEntry.celebracion, selectedEntry.colores_dia].filter(Boolean).join(" · ") : undefined}
      >
        {selectedEntry && <OrdoEntryDetail entry={selectedEntry} />}
      </DetailDrawer>
    </div>
  );
}

function OrdoEntryDetail({ entry }: { entry: OrdoCalendarEntry }) {
  const fields: Array<[string, string | null]> = [
    ["Preludio", entry.preludio],
    ["Celebración del obispo", entry.celebracion_obispo],
    ["Celebración de la circunscripción", entry.celebracion_circunscripcion],
    ["Celebración de santo", entry.celebracion_santo],
    ["Misa", entry.misa],
    ["Oficio", entry.oficio],
    ["Notas", entry.notas],
    ["Primera lectura", entry.primera_lectura],
    ["Segunda lectura", entry.segunda_lectura],
    ["Salmo", entry.salmo],
    ["Aclamación", entry.aclamacion],
    ["Evangelio", entry.evangelio],
    ["Reflexión", entry.reflexion],
  ];
  const audioUrl = safeAudioUrl(entry.reflexion_audio);

  return (
    <div className="space-y-4 px-4 pb-6">
      <div className="rounded-xl border bg-muted/20 p-4">
        <p className="text-sm font-semibold">{entry.tiempo_liturgico ?? "Tiempo litúrgico no informado"}</p>
        {entry.encabezado && <p className="mt-1 text-sm text-muted-foreground">{entry.encabezado}</p>}
        {entry.id !== null && <p className="mt-2 text-xs text-muted-foreground">Referencia ORDO: {entry.id}</p>}
        {entry.colores_dia && <Badge className="mt-2" variant="outline">Color informado: {entry.colores_dia}</Badge>}
      </div>
      {fields.filter(([, value]) => value).map(([label, value]) => (
        <section key={label} className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">{label}</h3>
          <OrdoHtmlContent html={value} className="space-y-2 text-sm leading-relaxed" />
        </section>
      ))}
      {audioUrl && (
        <a href={audioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-primary hover:bg-secondary">
          Escuchar reflexión <ExternalLink className="size-4" />
        </a>
      )}
    </div>
  );
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function uniqueDates(values: string[]) {
  return [...new Set(values)].map((value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12);
  });
}

function safeAudioUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
