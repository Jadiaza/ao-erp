import { useMemo, useState } from "react";
import { CalendarDays, ClipboardCheck, Clock3, MapPin, Plus, Users, Wrench } from "lucide-react";
import {
  Calendar,
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  FieldGroup,
  FormDialog,
  InfoItem,
  ModuleLayout,
  SearchInput,
  StatCard,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { facilities, institutionalEvents as seedEvents, type Facility, type InstitutionalEvent } from "@/data/institutional-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { isChristianProfile } from "@/lib/ao-cristiano-profile";

type AttendanceRecord = { id: string; eventId: string; personOrGroup: string; scope: "Persona" | "Grupo" | "Actividad"; present: boolean; note?: string; campusId?: string };
type AgendaEvent = InstitutionalEvent & { organizationId?: string; campusId?: string; attendees?: number };

const baseAttendance: AttendanceRecord[] = [
  { id: "ATT-1", eventId: "EV-102", personOrGroup: "Persona de muestra 01", scope: "Persona", present: true, campusId: "SEDE-PRINCIPAL" },
  { id: "ATT-2", eventId: "EV-102", personOrGroup: "Ministerio de Alabanza", scope: "Grupo", present: true, campusId: "SEDE-PRINCIPAL" },
  { id: "ATT-3", eventId: "EV-105", personOrGroup: "Célula Norte", scope: "Grupo", present: false, note: "Ausencia registrada", campusId: "SEDE-PRINCIPAL" },
];

export function InstitutionalAgendaScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;
  const [tab, setTab] = useState("agenda");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 10, 4));
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [attOpen, setAttOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [eventForm, setEventForm] = useState({ title: "", type: christian ? terms.celebrationLabel : "Reunión", iso: "2026-11-06", time: "10:00", place: "", responsible: "", participants: "", campusId: settings.campusId || "SEDE-PRINCIPAL" });
  const [attForm, setAttForm] = useState({ eventId: "", personOrGroup: "", scope: "Persona" as AttendanceRecord["scope"], present: "true", note: "" });

  const eventsStore = useLocalCollection("ao-erp:agenda:events", seedEvents as AgendaEvent[]);
  const attendanceStore = useLocalCollection("ao-erp:agenda:attendance", baseAttendance);

  const events = useMemo(() => eventsStore.records.filter((e) => !e.organizationId || e.organizationId === settings.organizationId), [eventsStore.records, settings.organizationId]);
  const attendance = useMemo(() => attendanceStore.records, [attendanceStore.records]);

  const selectedISO = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}` : "";
  const scheduledDates = useMemo(() => events.map((event) => new Date(`${event.iso}T12:00:00`)), [events]);
  const dayEvents = events.filter((event) => event.iso === selectedISO);
  const filteredEvents = events.filter((e) => `${e.title} ${e.type} ${e.responsible} ${e.place}`.toLowerCase().includes(query.toLowerCase()));

  const attendanceForEvent = (eventId: string) => attendance.filter((a) => a.eventId === eventId);
  const presentCount = (eventId: string) => attendanceForEvent(eventId).filter((a) => a.present).length;

  const eventColumns: DataTableColumn<AgendaEvent>[] = [
    { id: "when", header: "Fecha / hora", cell: (event) => <div><p className="font-semibold">{event.date}</p><p className="text-xs text-muted-foreground">{event.time}</p></div> },
    { id: "event", header: christian ? "Culto / reunión / actividad" : "Actividad", cell: (event) => <div><p className="font-semibold">{event.title}</p><p className="text-xs text-muted-foreground">{event.type}</p></div> },
    { id: "place", header: "Lugar", cell: (event) => event.place },
    { id: "lead", header: "Responsable", cell: (event) => event.responsible },
    { id: "attendance", header: "Asistencia", cell: (event) => { const t = attendanceForEvent(event.id).length; const p = presentCount(event.id); return <span className="text-xs">{t ? `${p}/${t} presentes` : "Sin registro"}</span>; } },
  ];

  const attendanceColumns: DataTableColumn<AttendanceRecord>[] = [
    { id: "event", header: "Actividad", cell: (a) => events.find((e) => e.id === a.eventId)?.title ?? a.eventId },
    { id: "who", header: "Persona / grupo", cell: (a) => a.personOrGroup },
    { id: "scope", header: "Tipo", cell: (a) => a.scope },
    { id: "present", header: "Asistencia", cell: (a) => <StatusBadge status={a.present ? "active" : "inactive"} label={a.present ? "Presente" : "Ausente"} /> },
    { id: "campus", header: terms.campusLabel, cell: (a) => a.campusId || "—" },
  ];

  const totalAttendance = attendance.length;
  const totalPresent = attendance.filter((a) => a.present).length;
  const attendanceRate = totalAttendance ? Math.round((totalPresent / totalAttendance) * 100) : 0;

  const createEvent = () => {
    if (!eventForm.title.trim()) return;
    const iso = eventForm.iso || "2026-11-06";
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y || 2026, (m || 1) - 1, d || 1).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
    eventsStore.create({
      id: `EV-${Date.now()}`,
      date,
      iso,
      time: eventForm.time || "10:00",
      title: eventForm.title.trim(),
      type: eventForm.type,
      place: eventForm.place.trim() || "Por definir",
      responsible: eventForm.responsible.trim() || "Responsable · demo",
      participants: eventForm.participants.trim() || "Comunidad",
      reminder: "Recordatorio local",
      organizationId: settings.organizationId,
      campusId: eventForm.campusId || settings.campusId,
    } as AgendaEvent);
    setFormOpen(false);
  };

  const createAttendance = () => {
    if (!attForm.eventId || !attForm.personOrGroup.trim()) return;
    const rec: any = { id: `ATT-${Date.now()}`, eventId: attForm.eventId, personOrGroup: attForm.personOrGroup.trim(), scope: attForm.scope, present: attForm.present === "true", campusId: settings.campusId };
    if (attForm.note.trim()) rec.note = attForm.note.trim();
    attendanceStore.create(rec);
    setAttOpen(false);
    setAttForm({ eventId: "", personOrGroup: "", scope: "Persona", present: "true", note: "" });
  };

  return (
    <ModuleLayout
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: christian ? "Comunidad cristiana" : "Gestión institucional" }, { label: christian ? "Cultos, eventos y asistencia" : "Agenda e infraestructura" }]}
      title={christian ? `${terms.celebrationsLabel}, agenda y asistencia` : "Agenda e infraestructura"}
      description={christian ? "Programación de cultos, reuniones y actividades con responsables, calendario, asistencia por persona/grupo/actividad, historial e informes básicos." : "Organización de actividades institucionales y administración demostrativa de espacios comunitarios."}
      actions={<div className="flex gap-2"><Button variant="outline" className="gap-2" onClick={() => setAttOpen(true)}><ClipboardCheck className="size-4" />Registrar asistencia</Button><Button className="gap-2" onClick={() => setFormOpen(true)}><Plus className="size-4" />{christian ? "Programar actividad" : "Nueva actividad"}</Button></div>}
      stats={<><StatCard label={christian ? "Actividades programadas" : "Actividades del mes"} value={String(events.length)} icon={CalendarDays} caption="Agenda local por organización" /><StatCard label="Registros de asistencia" value={String(totalAttendance)} icon={Users} caption={`Tasa de presencia: ${attendanceRate}%`} /><StatCard label="Presentes (histórico)" value={String(totalPresent)} icon={ClipboardCheck} caption="Personas/grupos/actividades" /><StatCard label="Espacios" value={String(facilities.length)} icon={MapPin} caption="Infraestructura de referencia" /></>}
    >
      <DemoNotice>{christian ? `Cultos, reuniones y actividades asociadas a ${settings.organizationId}/${settings.campusId}. Asistencia e historial en almacenamiento local demostrativo.` : "Eventos, reservas y espacios ficticios. Las acciones son de demostración local."}</DemoNotice>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="agenda">Calendario y agenda</TabsTrigger>
          <TabsTrigger value="list">Listado</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia e informes</TabsTrigger>
          <TabsTrigger value="spaces">Espacios e infraestructura</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda" className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
          <Card className="h-fit shadow-none"><CardHeader className="pb-1"><CardTitle className="text-sm">Calendario</CardTitle></CardHeader><CardContent className="p-2"><Calendar mode="single" month={new Date(2026, 10, 1)} selected={selectedDate} onSelect={setSelectedDate} modifiers={{ scheduled: scheduledDates }} modifiersClassNames={{ scheduled: "font-bold text-primary underline decoration-accent decoration-2 underline-offset-4" }} className="mx-auto" /></CardContent></Card>
          <div className="space-y-4">
            <h2 className="font-semibold">Agenda del día</h2>
            <p className="text-sm text-muted-foreground">{selectedDate?.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>
            {dayEvents.length ? dayEvents.map((event) => (
              <button key={event.id} onClick={() => setSelectedEvent(event)} className="grid w-full gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/40 sm:grid-cols-[70px_minmax(0,1fr)_auto]">
                <span className="text-lg font-bold text-primary">{event.time}</span>
                <span><span className="block font-semibold">{event.title}</span><span className="mt-1 block text-sm text-muted-foreground">{event.type} · {event.place}</span><span className="mt-2 block text-xs text-muted-foreground">Responsable: {event.responsible} · Participantes: {event.participants}</span></span>
                <span className="flex flex-col items-end gap-1"><StatusBadge status="active" /><span className="text-[11px] text-muted-foreground">{presentCount(event.id)}/{attendanceForEvent(event.id).length} asist.</span></span>
              </button>
            )) : <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center"><CalendarDays className="mb-3 size-7 text-muted-foreground" /><p className="text-sm text-muted-foreground">Sin actividades en la fecha seleccionada.</p></div>}
          </div>
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por título, tipo, responsable o lugar" className="w-full sm:w-96" />
          <DataTable rows={filteredEvents} columns={eventColumns} getRowId={(e) => e.id} onRowClick={setSelectedEvent} emptyTitle="Sin actividades" emptyDescription="Programa cultos, reuniones o actividades." />
        </TabsContent>
        <TabsContent value="attendance" className="space-y-4">
          <Card className="shadow-none"><CardHeader><CardTitle className="text-sm">Informe básico de asistencia</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3 text-sm"><div className="rounded-lg border p-3"><p className="text-muted-foreground">Actividades con registro</p><p className="text-xl font-semibold">{new Set(attendance.map((a) => a.eventId)).size}</p></div><div className="rounded-lg border p-3"><p className="text-muted-foreground">Presentes / total</p><p className="text-xl font-semibold">{totalPresent} / {totalAttendance}</p></div><div className="rounded-lg border p-3"><p className="text-muted-foreground">Tasa de asistencia</p><p className="text-xl font-semibold">{attendanceRate}%</p></div></CardContent></Card>
          <DataTable rows={attendance} columns={attendanceColumns} getRowId={(a) => a.id} emptyTitle="Sin asistencia registrada" emptyDescription="Registra asistencia por persona, grupo o actividad." />
        </TabsContent>
        <TabsContent value="spaces" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {facilities.map((facility) => (
            <button key={facility.id} onClick={() => setSelectedFacility(facility)} className="rounded-xl border bg-card p-5 text-left hover:border-primary/40">
              <div className="flex items-start justify-between gap-3"><MapPin className="size-5 text-primary" /><StatusBadge status={facility.condition === "Bueno" ? "active" : "pending"} label={facility.condition} /></div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{facility.type}</p>
              <h3 className="mt-1 font-semibold">{facility.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{facility.location}</p>
              <div className="mt-3 text-xs text-muted-foreground">Responsable: {facility.responsible} · Mant.: {facility.nextMaintenance}</div>
            </button>
          ))}
        </TabsContent>
      </Tabs>

      <FormDialog title={christian ? "Programar culto / reunión / actividad" : "Nueva actividad"} description="Registro local demostrativo en agenda transversal." open={formOpen} onOpenChange={setFormOpen} submitLabel="Guardar actividad" onSubmit={createEvent}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Tipo"><Input value={eventForm.type} onChange={(e) => setEventForm((f) => ({ ...f, type: e.target.value }))} placeholder={christian ? "Culto, reunión, vigilia, actividad..." : "Reunión, evento..."} /></FieldGroup>
          <FieldGroup label="Título"><Input value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Fecha"><Input type="date" value={eventForm.iso} onChange={(e) => setEventForm((f) => ({ ...f, iso: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Hora"><Input type="time" value={eventForm.time} onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Lugar"><Input value={eventForm.place} onChange={(e) => setEventForm((f) => ({ ...f, place: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Responsable"><Input value={eventForm.responsible} onChange={(e) => setEventForm((f) => ({ ...f, responsible: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Participantes / grupo"><Input value={eventForm.participants} onChange={(e) => setEventForm((f) => ({ ...f, participants: e.target.value }))} /></FieldGroup>
          <FieldGroup label={terms.campusLabel}><Input value={eventForm.campusId} onChange={(e) => setEventForm((f) => ({ ...f, campusId: e.target.value }))} /></FieldGroup>
        </div>
      </FormDialog>

      <FormDialog title="Registrar asistencia" description="Asistencia por persona, grupo o actividad (demo local)." open={attOpen} onOpenChange={setAttOpen} submitLabel="Guardar asistencia" onSubmit={createAttendance}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Actividad"><Select value={attForm.eventId} onValueChange={(v) => setAttForm((f) => ({ ...f, eventId: v }))}><SelectTrigger><SelectValue placeholder="Selecciona actividad" /></SelectTrigger><SelectContent>{events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title} · {e.date}</SelectItem>)}</SelectContent></Select></FieldGroup>
          <FieldGroup label="Persona / grupo / actividad"><Input value={attForm.personOrGroup} onChange={(e) => setAttForm((f) => ({ ...f, personOrGroup: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Alcance"><Select value={attForm.scope} onValueChange={(v) => setAttForm((f) => ({ ...f, scope: v as AttendanceRecord["scope"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Persona">Persona</SelectItem><SelectItem value="Grupo">Grupo</SelectItem><SelectItem value="Actividad">Actividad</SelectItem></SelectContent></Select></FieldGroup>
          <FieldGroup label="Presencia"><Select value={attForm.present} onValueChange={(v) => setAttForm((f) => ({ ...f, present: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Presente</SelectItem><SelectItem value="false">Ausente</SelectItem></SelectContent></Select></FieldGroup>
          <FieldGroup label="Nota"><Input value={attForm.note} onChange={(e) => setAttForm((f) => ({ ...f, note: e.target.value }))} /></FieldGroup>
        </div>
      </FormDialog>

      <DetailDrawer open={!!selectedEvent || !!selectedFacility} onOpenChange={(open) => { if (!open) { setSelectedEvent(null); setSelectedFacility(null); } }} title={selectedEvent?.title ?? selectedFacility?.name ?? "Detalle"} description={selectedEvent ? `${selectedEvent.date} · ${selectedEvent.time} · ${selectedEvent.id}` : selectedFacility ? `${selectedFacility.type} · ${selectedFacility.id}` : undefined}>
        {selectedEvent && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tipo">{selectedEvent.type}</InfoItem>
              <InfoItem label="Lugar">{selectedEvent.place}</InfoItem>
              <InfoItem label="Responsable">{selectedEvent.responsible}</InfoItem>
              <InfoItem label="Participantes">{selectedEvent.participants}</InfoItem>
              <InfoItem label={terms.campusLabel}>{selectedEvent.campusId || settings.campusId}</InfoItem>
              <InfoItem label="Organización">{selectedEvent.organizationId || settings.organizationId}</InfoItem>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="size-4" />Asistencia e historial</h3>
              {attendanceForEvent(selectedEvent.id).length === 0 ? <p className="text-sm text-muted-foreground">Sin registros de asistencia para esta actividad.</p> : (
                <div className="space-y-2">{attendanceForEvent(selectedEvent.id).map((a) => <div key={a.id} className="flex items-center justify-between rounded border p-2 text-sm"><span>{a.personOrGroup} <span className="text-xs text-muted-foreground">({a.scope})</span></span><StatusBadge status={a.present ? "active" : "inactive"} label={a.present ? "Presente" : "Ausente"} /></div>)}</div>
              )}
            </div>
          </div>
        )}
        {selectedFacility && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><InfoItem label="Ubicación">{selectedFacility.location}</InfoItem><InfoItem label="Capacidad / uso">{selectedFacility.capacity}</InfoItem><InfoItem label="Estado">{selectedFacility.condition}</InfoItem><InfoItem label="Responsable">{selectedFacility.responsible}</InfoItem><InfoItem label="Próximo mantenimiento">{selectedFacility.nextMaintenance}</InfoItem></div>
            <p className="text-sm text-muted-foreground">{selectedFacility.note}</p>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}