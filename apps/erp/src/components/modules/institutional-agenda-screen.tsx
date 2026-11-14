import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  Download,
  MapPin,
  Pencil,
  Plus,
  Repeat,
  Users,
} from "lucide-react";
import {
  Calendar,
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  FieldGroup,
  FilterBar,
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
import { christianMembers, parishioners, type ParishionerDemo } from "@/data/community-demo";
import { christianGroups, parishGroups, type ParishGroupDemo } from "@/data/pastoral-demo";
import {
  christianEvents,
  christianFacilities,
  detectScheduleConflict,
  facilities,
  institutionalEvents as seedEvents,
  type AttendanceRecord,
  type EventRecurrence,
  type Facility,
  type InstitutionalEvent,
} from "@/data/institutional-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

const baseAttendance: AttendanceRecord[] = [
  { id: "ATT-1", eventId: "EV-102", personId: "FEL-DEMO-001", personOrGroup: "Persona de muestra 01", scope: "Persona", present: true, organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", dateISO: "2026-11-06" },
  { id: "ATT-2", eventId: "EV-102", groupId: "GRP-DEMO-01", personOrGroup: "Coro de la Esperanza", scope: "Grupo", present: true, organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", dateISO: "2026-11-06" },
];

const christianBaseAttendance: AttendanceRecord[] = [
  { id: "ATT-CRI-1", eventId: "EV-CRI-103", personId: "MBR-DEMO-001", personOrGroup: "Miembro de muestra 01", scope: "Persona", present: true, organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", dateISO: "2026-11-08" },
  { id: "ATT-CRI-2", eventId: "EV-CRI-103", groupId: "GRP-CRI-01", personOrGroup: "Ministerio de Alabanza", scope: "Grupo", present: true, organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", dateISO: "2026-11-08" },
  { id: "ATT-CRI-3", eventId: "EV-CRI-104", groupId: "GRP-CRI-02", personOrGroup: "Célula Norte", scope: "Grupo", present: false, note: "Ausencia registrada", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", dateISO: "2026-11-12" },
];

const recurrences: EventRecurrence[] = ["Única", "Semanal", "Quincenal", "Mensual"];

function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y || 2026, (m || 1) - 1, (d || 1) + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InstitutionalAgendaScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;

  const [tab, setTab] = useState("agenda");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 10, 4));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [attOpen, setAttOpen] = useState(false);
  const [facilityOpen, setFacilityOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [campusFilter, setCampusFilter] = useState("all");
  const [reportEventFilter, setReportEventFilter] = useState("all");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);

  const eventsStore = useLocalCollection<InstitutionalEvent>(
    getProfileStorageKey("ao-erp:agenda:events", settings.profile),
    christian ? christianEvents : seedEvents,
  );
  const attendanceStore = useLocalCollection<AttendanceRecord>(
    getProfileStorageKey("ao-erp:agenda:attendance", settings.profile),
    christian ? christianBaseAttendance : baseAttendance,
  );
  const facilitiesStore = useLocalCollection<Facility>(
    getProfileStorageKey("ao-erp:agenda:facilities", settings.profile),
    christian ? christianFacilities : facilities,
  );
  const membersStore = useLocalCollection<ParishionerDemo>(
    getProfileStorageKey("ao-erp:community:parishioners", settings.profile),
    christian ? christianMembers : parishioners,
  );
  const groupsStore = useLocalCollection<ParishGroupDemo>(
    getProfileStorageKey("ao-erp:pastoral:groups", settings.profile),
    christian ? christianGroups : parishGroups,
  );

  const scopedMembers = useMemo(
    () =>
      membersStore.records.filter(
        (m) => !m.organizationId || m.organizationId === settings.organizationId,
      ),
    [membersStore.records, settings.organizationId],
  );
  const scopedGroups = useMemo(
    () =>
      groupsStore.records.filter(
        (g) => !g.organizationId || g.organizationId === settings.organizationId,
      ),
    [groupsStore.records, settings.organizationId],
  );
  const activeFacilities = useMemo(
    () =>
      facilitiesStore.records.filter(
        (f) =>
          (!f.organizationId || f.organizationId === settings.organizationId) &&
          (campusFilter === "all" || !f.campusId || f.campusId === campusFilter),
      ),
    [facilitiesStore.records, settings.organizationId, campusFilter],
  );

  const [eventForm, setEventForm] = useState({
    title: "",
    type: christian ? terms.celebrationLabel : "Reunión",
    iso: "2026-11-06",
    time: "10:00",
    endTime: "11:30",
    facilityId: activeFacilities[0]?.id ?? "",
    place: activeFacilities[0]?.name ?? "",
    responsiblePersonId: "__manual__",
    responsible: "",
    participants: "",
    recurrence: "Única" as EventRecurrence,
    occurrencesCount: "1",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const [attForm, setAttForm] = useState({
    eventId: "",
    scope: "Persona" as AttendanceRecord["scope"],
    personId: "",
    groupId: "",
    present: "true",
    note: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const [facilityForm, setFacilityForm] = useState({
    name: "",
    type: "Auditorio / salón",
    location: settings.campusId || "Sede Principal",
    capacity: "100 personas",
    responsible: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const events = useMemo(
    () =>
      eventsStore.records.filter(
        (e) =>
          (!e.organizationId || e.organizationId === settings.organizationId) &&
          (campusFilter === "all" || (e.campusId ?? settings.campusId) === campusFilter),
      ),
    [eventsStore.records, settings.organizationId, settings.campusId, campusFilter],
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const attendance = useMemo(
    () =>
      attendanceStore.records.filter((a) => {
        if (a.organizationId && a.organizationId !== settings.organizationId) return false;
        if (campusFilter !== "all" && (a.campusId ?? settings.campusId) !== campusFilter) return false;
        if (reportEventFilter !== "all" && a.eventId !== reportEventFilter) return false;
        const ev = events.find((e) => e.id === a.eventId);
        const iso = a.dateISO ?? ev?.iso ?? "";
        if (reportFrom && iso && iso < reportFrom) return false;
        if (reportTo && iso && iso > reportTo) return false;
        return true;
      }),
    [
      attendanceStore.records,
      settings.organizationId,
      settings.campusId,
      campusFilter,
      reportEventFilter,
      reportFrom,
      reportTo,
      events,
    ],
  );

  const campuses = useMemo(
    () =>
      [
        ...new Set([
          ...eventsStore.records.map((e) => e.campusId).filter(Boolean),
          ...facilitiesStore.records.map((f) => f.campusId).filter(Boolean),
        ]),
      ] as string[],
    [eventsStore.records, facilitiesStore.records],
  );

  const selectedISO = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";
  const scheduledDates = useMemo(
    () => events.map((event) => new Date(`${event.iso}T12:00:00`)),
    [events],
  );
  const dayEvents = events.filter((event) => event.iso === selectedISO);
  const filteredEvents = events.filter((e) =>
    `${e.title} ${e.type} ${e.responsible} ${e.place}`.toLowerCase().includes(query.toLowerCase()),
  );

  const attendanceForEvent = (eventId: string) =>
    attendanceStore.records.filter(
      (a) =>
        a.eventId === eventId &&
        (!a.organizationId || a.organizationId === settings.organizationId),
    );
  const presentCount = (eventId: string) =>
    attendanceForEvent(eventId).filter((a) => a.present).length;

  const eventColumns: DataTableColumn<InstitutionalEvent>[] = [
    {
      id: "when",
      header: "Fecha / hora",
      cell: (event) => (
        <div>
          <p className="font-semibold">{event.date}</p>
          <p className="text-xs text-muted-foreground">
            {event.time}
            {event.endTime ? `–${event.endTime}` : ""}
            {event.recurrence && event.recurrence !== "Única" ? ` · ${event.recurrence}` : ""}
          </p>
        </div>
      ),
    },
    {
      id: "event",
      header: christian ? "Culto / reunión / actividad" : "Actividad",
      cell: (event) => (
        <div>
          <p className="font-semibold">{event.title}</p>
          <p className="text-xs text-muted-foreground">{event.type}</p>
        </div>
      ),
    },
    { id: "place", header: "Espacio / lugar", cell: (event) => event.place },
    { id: "lead", header: "Responsable", cell: (event) => event.responsible },
    {
      id: "attendance",
      header: "Asistencia",
      cell: (event) => {
        const t = attendanceForEvent(event.id).length;
        const p = presentCount(event.id);
        return <span className="text-xs">{t ? `${p}/${t} presentes` : "Sin registro"}</span>;
      },
    },
  ];

  const attendanceColumns: DataTableColumn<AttendanceRecord>[] = [
    {
      id: "event",
      header: "Actividad / fecha",
      cell: (a) => {
        const ev = eventsStore.records.find((e) => e.id === a.eventId);
        return (
          <div>
            <p className="font-medium">{ev?.title ?? a.eventId}</p>
            <p className="text-xs text-muted-foreground">{a.dateISO || ev?.iso || "—"}</p>
          </div>
        );
      },
    },
    {
      id: "who",
      header: "Persona / grupo vinculado",
      cell: (a) => (
        <div>
          <p>{a.personOrGroup}</p>
          {(a.personId || a.groupId) && (
            <p className="text-xs text-muted-foreground">{a.personId ?? a.groupId}</p>
          )}
        </div>
      ),
    },
    { id: "scope", header: "Tipo", cell: (a) => a.scope },
    {
      id: "present",
      header: "Asistencia",
      cell: (a) => (
        <StatusBadge
          status={a.present ? "active" : "inactive"}
          label={a.present ? "Presente" : "Ausente"}
        />
      ),
    },
    { id: "campus", header: terms.campusLabel, cell: (a) => a.campusId || "—" },
  ];

  const totalAttendance = attendance.length;
  const totalPresent = attendance.filter((a) => a.present).length;
  const attendanceRate = totalAttendance ? Math.round((totalPresent / totalAttendance) * 100) : 0;

  const groupAttendanceSummary = useMemo(() => {
    return scopedGroups.map((g) => {
      const rows = attendance.filter((a) => a.groupId === g.id);
      const present = rows.filter((r) => r.present).length;
      return { group: g, total: rows.length, present };
    }).filter((item) => item.total > 0);
  }, [scopedGroups, attendance]);

  const openCreateEvent = () => {
    setEditingEventId(null);
    setConflictError(null);
    setEventForm({
      title: "",
      type: christian ? terms.celebrationLabel : "Reunión",
      iso: selectedISO || "2026-11-06",
      time: "10:00",
      endTime: "11:30",
      facilityId: activeFacilities[0]?.id ?? "",
      place: activeFacilities[0]?.name ?? "",
      responsiblePersonId: "__manual__",
      responsible: "",
      participants: "",
      recurrence: "Única",
      occurrencesCount: "1",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
    });
    setFormOpen(true);
  };

  const openEditEvent = (event: InstitutionalEvent) => {
    setEditingEventId(event.id);
    setConflictError(null);
    setEventForm({
      title: event.title,
      type: event.type,
      iso: event.iso,
      time: event.time,
      endTime: event.endTime ?? "",
      facilityId: event.facilityId ?? "",
      place: event.place,
      responsiblePersonId: event.responsiblePersonId ?? "__manual__",
      responsible: event.responsible,
      participants: event.participants,
      recurrence: event.recurrence ?? "Única",
      occurrencesCount: "1",
      campusId: event.campusId ?? settings.campusId,
    });
    setFormOpen(true);
  };

  const saveEvent = () => {
    setConflictError(null);
    if (!eventForm.title.trim()) return;
    const baseIso = eventForm.iso || "2026-11-06";
    const fac = activeFacilities.find((f) => f.id === eventForm.facilityId);
    const resolvedPlace = fac?.name || eventForm.place.trim() || "Por definir";
    const respPerson =
      eventForm.responsiblePersonId !== "__manual__"
        ? scopedMembers.find((m) => m.id === eventForm.responsiblePersonId)
        : undefined;
    const resolvedResponsible =
      respPerson?.name || eventForm.responsible.trim() || "Responsable · demo";

    if (editingEventId) {
      const candidate: InstitutionalEvent = {
        id: editingEventId,
        date: formatDateLabel(baseIso),
        iso: baseIso,
        time: eventForm.time || "10:00",
        endTime: eventForm.endTime || undefined,
        title: eventForm.title.trim(),
        type: eventForm.type,
        place: resolvedPlace,
        facilityId: fac?.id || eventForm.facilityId || undefined,
        responsible: resolvedResponsible,
        responsiblePersonId: respPerson?.id,
        participants: eventForm.participants.trim() || "Comunidad",
        reminder: "Recordatorio local",
        recurrence: eventForm.recurrence,
        organizationId: settings.organizationId,
        campusId: eventForm.campusId || settings.campusId,
      };
      const conflict = detectScheduleConflict(eventsStore.records, candidate);
      if (conflict) {
        setConflictError(
          `Conflicto de horario y espacio con "${conflict.title}" (${conflict.date} ${conflict.time} en ${conflict.place}).`,
        );
        return;
      }
      eventsStore.update(editingEventId, candidate);
      setFormOpen(false);
      return;
    }

    const stepDays =
      eventForm.recurrence === "Semanal"
        ? 7
        : eventForm.recurrence === "Quincenal"
          ? 14
          : eventForm.recurrence === "Mensual"
            ? 30
            : 0;
    const count =
      eventForm.recurrence === "Única"
        ? 1
        : Math.min(Math.max(Number(eventForm.occurrencesCount) || 2, 1), 8);

    const candidates: InstitutionalEvent[] = [];
    for (let i = 0; i < count; i++) {
      const iso = i === 0 ? baseIso : addDaysISO(baseIso, stepDays * i);
      const candidate: InstitutionalEvent = {
        id: `EV-${Date.now()}-${i}`,
        date: formatDateLabel(iso),
        iso,
        time: eventForm.time || "10:00",
        endTime: eventForm.endTime || undefined,
        title: eventForm.title.trim(),
        type: eventForm.type,
        place: resolvedPlace,
        facilityId: fac?.id || eventForm.facilityId || undefined,
        responsible: resolvedResponsible,
        responsiblePersonId: respPerson?.id,
        participants: eventForm.participants.trim() || "Comunidad",
        reminder: "Recordatorio local",
        recurrence: eventForm.recurrence,
        organizationId: settings.organizationId,
        campusId: eventForm.campusId || settings.campusId,
      };
      const conflict = detectScheduleConflict(
        [...eventsStore.records, ...candidates],
        candidate,
      );
      if (conflict) {
        setConflictError(
          `Conflicto detectado en ${candidate.date} (${candidate.time}): coincide con "${conflict.title}" en ${conflict.place}.`,
        );
        return;
      }
      candidates.push(candidate);
    }

    for (const item of candidates) {
      eventsStore.create(item);
    }
    setFormOpen(false);
  };

  const createAttendance = () => {
    if (!attForm.eventId) return;
    const ev = events.find((e) => e.id === attForm.eventId);
    let personOrGroup = "";
    let personId: string | undefined;
    let groupId: string | undefined;

    if (attForm.scope === "Persona") {
      const person = scopedMembers.find((m) => m.id === attForm.personId);
      if (!person) return;
      personId = person.id;
      personOrGroup = person.name;
      // Registrar en historial de participación de Área 1
      membersStore.update(person.id, {
        participationHistory: [
          {
            id: `PH-${Date.now()}`,
            date: ev?.iso ?? new Date().toISOString().slice(0, 10),
            type: ev?.type === "Culto" ? "Culto" : "Evento",
            detail: `${attForm.present === "true" ? "Asistencia" : "Ausencia"}: ${ev?.title ?? attForm.eventId}`,
            campusId: ev?.campusId ?? attForm.campusId,
          },
          ...(person.participationHistory ?? []),
        ],
      });
    } else if (attForm.scope === "Grupo") {
      const group = scopedGroups.find((g) => g.id === attForm.groupId);
      if (!group) return;
      groupId = group.id;
      personOrGroup = group.name;
    } else {
      personOrGroup = ev?.title ?? "Asistencia general";
    }

    const rec: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      eventId: attForm.eventId,
      personId,
      groupId,
      personOrGroup,
      scope: attForm.scope,
      present: attForm.present === "true",
      organizationId: settings.organizationId,
      campusId: ev?.campusId ?? attForm.campusId ?? settings.campusId,
      dateISO: ev?.iso,
    };
    if (attForm.note.trim()) rec.note = attForm.note.trim();
    attendanceStore.create(rec);
    setAttOpen(false);
    setAttForm({
      eventId: "",
      scope: "Persona",
      personId: "",
      groupId: "",
      present: "true",
      note: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
    });
  };

  const exportAttendanceReport = () => {
    if (typeof window === "undefined") return;
    const header = ["ID", "Evento", "Fecha", "Tipo", "Vinculado", "ID Vinculado", "Estado", "Sede"];
    const rows = attendance.map((a) => {
      const ev = eventsStore.records.find((e) => e.id === a.eventId);
      return [
        a.id,
        ev?.title ?? a.eventId,
        a.dateISO ?? ev?.iso ?? "",
        a.scope,
        a.personOrGroup,
        a.personId ?? a.groupId ?? "",
        a.present ? "Presente" : "Ausente",
        a.campusId ?? "",
      ];
    });
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asistencia-${settings.organizationId.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: christian ? "Comunidad cristiana" : "Gestión institucional" },
        { label: christian ? "Cultos, eventos y asistencia" : "Agenda e infraestructura" },
      ]}
      title={christian ? `${terms.celebrationsLabel}, agenda y asistencia` : "Agenda e infraestructura"}
      description={
        christian
          ? "Programación recurrente de cultos y reuniones, detección de conflictos de espacios, asistencia nominativa vinculada a miembros/grupos e informes."
          : "Organización de actividades institucionales y administración demostrativa de espacios comunitarios."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={exportAttendanceReport}>
            <Download className="size-4" />
            Exportar asistencia
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAttOpen(true)}>
            <ClipboardCheck className="size-4" />
            Registrar asistencia
          </Button>
          <Button className="gap-2" onClick={openCreateEvent}>
            <Plus className="size-4" />
            {christian ? "Programar actividad" : "Nueva actividad"}
          </Button>
        </div>
      }
      stats={
        <>
          <StatCard
            label={christian ? "Actividades programadas" : "Actividades del mes"}
            value={String(events.length)}
            icon={CalendarDays}
            caption="Agenda local por organización"
          />
          <StatCard
            label="Registros de asistencia"
            value={String(totalAttendance)}
            icon={Users}
            caption={`Tasa de presencia: ${attendanceRate}%`}
          />
          <StatCard
            label="Presentes (filtrado)"
            value={String(totalPresent)}
            icon={ClipboardCheck}
            caption="Vinculados a Área 1 y Área 2"
          />
          <StatCard
            label="Espacios"
            value={String(activeFacilities.length)}
            icon={MapPin}
            caption="Infraestructura de la sede"
          />
        </>
      }
    >
      <DemoNotice>
        {christian
          ? `Cultos, reuniones, espacios y asistencias asociados a ${settings.organizationId}/${settings.campusId}. Asistencia vinculada a IDs reales de Área 1 y Área 2 (demo local).`
          : "Eventos, reservas y espacios ficticios. Las acciones son de demostración local."}
      </DemoNotice>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={campusFilter} onValueChange={setCampusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar por sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {campuses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="agenda">Calendario y agenda</TabsTrigger>
          <TabsTrigger value="list">Listado</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia e informes</TabsTrigger>
          <TabsTrigger value="spaces">Espacios e infraestructura</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda" className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
          <Card className="h-fit shadow-none">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Calendario</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Calendar
                mode="single"
                defaultMonth={new Date(2026, 10, 1)}
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ scheduled: scheduledDates }}
                modifiersClassNames={{
                  scheduled: "font-bold text-primary underline decoration-accent decoration-2 underline-offset-4",
                }}
                className="mx-auto"
              />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <h2 className="font-semibold">Agenda del día</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDate?.toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {dayEvents.length ? (
              dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className="grid w-full gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/40 sm:grid-cols-[84px_minmax(0,1fr)_auto]"
                >
                  <span className="text-base font-bold text-primary">
                    {event.time}
                    {event.endTime && (
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        a {event.endTime}
                      </span>
                    )}
                  </span>
                  <span>
                    <span className="block font-semibold">{event.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {event.type} · {event.place}
                    </span>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      Responsable: {event.responsible} · Participantes: {event.participants}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <StatusBadge status="active" />
                    <span className="text-[11px] text-muted-foreground">
                      {presentCount(event.id)}/{attendanceForEvent(event.id).length} asist.
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <CalendarDays className="mb-3 size-7 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Sin actividades en la fecha seleccionada.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por título, tipo, responsable o lugar"
            className="w-full sm:w-96"
          />
          <DataTable
            rows={filteredEvents}
            columns={eventColumns}
            getRowId={(e) => e.id}
            onRowClick={(e) => setSelectedEventId(e.id)}
            emptyTitle="Sin actividades"
            emptyDescription="Programa cultos, reuniones o actividades."
          />
        </TabsContent>
        <TabsContent value="attendance" className="space-y-4">
          <FilterBar label="Filtros de informe">
            <Select value={reportEventFilter} onValueChange={setReportEventFilter}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las actividades</SelectItem>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title} · {e.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              aria-label="Asistencia desde"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              aria-label="Asistencia hasta"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              className="w-40"
            />
          </FilterBar>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Informe de asistencia por período, evento y grupo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Actividades con registro</p>
                  <p className="text-xl font-semibold">
                    {new Set(attendance.map((a) => a.eventId)).size}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Presentes / total</p>
                  <p className="text-xl font-semibold">
                    {totalPresent} / {totalAttendance}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Tasa de asistencia</p>
                  <p className="text-xl font-semibold">{attendanceRate}%</p>
                </div>
              </div>
              {groupAttendanceSummary.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {groupAttendanceSummary.map(({ group, total, present }) => (
                    <div key={group.id} className="flex justify-between rounded-lg border p-2.5 text-xs">
                      <span className="font-medium">{group.name}</span>
                      <span>
                        {present}/{total} presentes
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <DataTable
            rows={attendance}
            columns={attendanceColumns}
            getRowId={(a) => a.id}
            emptyTitle="Sin asistencia registrada"
            emptyDescription="Registra asistencia vinculada a personas o grupos."
          />
        </TabsContent>
        <TabsContent value="spaces" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setFacilityOpen(true)}>
              Registrar espacio
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeFacilities.map((facility) => (
              <button
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className="rounded-xl border bg-card p-5 text-left hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <MapPin className="size-5 text-primary" />
                  <StatusBadge
                    status={facility.condition === "Bueno" ? "active" : "pending"}
                    label={facility.condition}
                  />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {facility.type}
                </p>
                <h3 className="mt-1 font-semibold">{facility.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{facility.location}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Responsable: {facility.responsible} · Mant.: {facility.nextMaintenance}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <FormDialog
        title={
          editingEventId
            ? "Editar culto / reunión / actividad"
            : christian
              ? "Programar culto / reunión / actividad"
              : "Nueva actividad"
        }
        description="Valida conflictos de horario y espacio en la organización."
        open={formOpen}
        onOpenChange={setFormOpen}
        submitLabel={editingEventId ? "Guardar cambios" : "Guardar actividad"}
        onSubmit={saveEvent}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Tipo">
            <Input
              value={eventForm.type}
              onChange={(e) => setEventForm((f) => ({ ...f, type: e.target.value }))}
              placeholder={christian ? "Culto, reunión, vigilia, célula..." : "Reunión, evento..."}
            />
          </FieldGroup>
          <FieldGroup label="Título">
            <Input
              value={eventForm.title}
              onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Fecha">
            <Input
              type="date"
              value={eventForm.iso}
              onChange={(e) => setEventForm((f) => ({ ...f, iso: e.target.value }))}
            />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="Hora inicio">
              <Input
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
              />
            </FieldGroup>
            <FieldGroup label="Hora fin">
              <Input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Espacio / infraestructura">
            <Select
              value={eventForm.facilityId || "__custom__"}
              onValueChange={(v) => {
                const fac = activeFacilities.find((f) => f.id === v);
                setEventForm((f) => ({
                  ...f,
                  facilityId: v === "__custom__" ? "" : v,
                  place: fac ? fac.name : f.place,
                }));
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__custom__">Otro lugar externo</SelectItem>
                {activeFacilities.map((fac) => (
                  <SelectItem key={fac.id} value={fac.id}>
                    {fac.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Lugar / dirección">
            <Input
              value={eventForm.place}
              onChange={(e) => setEventForm((f) => ({ ...f, place: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Responsable (directorio)">
            <Select
              value={eventForm.responsiblePersonId}
              onValueChange={(v) => setEventForm((f) => ({ ...f, responsiblePersonId: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__manual__">Ingresar manualmente</SelectItem>
                {scopedMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Nombre responsable (si manual)">
            <Input
              value={eventForm.responsible}
              onChange={(e) => setEventForm((f) => ({ ...f, responsible: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Recurrencia">
            <Select
              value={eventForm.recurrence}
              onValueChange={(v) =>
                setEventForm((f) => ({
                  ...f,
                  recurrence: v as EventRecurrence,
                  occurrencesCount: v === "Única" ? "1" : f.occurrencesCount === "1" ? "3" : f.occurrencesCount,
                }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {recurrences.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          {!editingEventId && eventForm.recurrence !== "Única" && (
            <FieldGroup label="Sesiones a programar (1-8)">
              <Input
                type="number"
                min="1"
                max="8"
                value={eventForm.occurrencesCount}
                onChange={(e) => setEventForm((f) => ({ ...f, occurrencesCount: e.target.value }))}
              />
            </FieldGroup>
          )}
          <FieldGroup label="Participantes / grupo">
            <Input
              value={eventForm.participants}
              onChange={(e) => setEventForm((f) => ({ ...f, participants: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={terms.campusLabel}>
            <Input
              value={eventForm.campusId}
              onChange={(e) => setEventForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
        </div>
        {conflictError && (
          <p role="alert" className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            {conflictError}
          </p>
        )}
      </FormDialog>

      <FormDialog
        title="Registrar asistencia"
        description="Asistencia vinculada a miembros (Área 1) o grupos (Área 2)."
        open={attOpen}
        onOpenChange={setAttOpen}
        submitLabel="Guardar asistencia"
        onSubmit={createAttendance}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Actividad">
            <Select
              value={attForm.eventId}
              onValueChange={(v) => setAttForm((f) => ({ ...f, eventId: v }))}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona actividad" /></SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title} · {e.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Alcance">
            <Select
              value={attForm.scope}
              onValueChange={(v) =>
                setAttForm((f) => ({ ...f, scope: v as AttendanceRecord["scope"] }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Persona">Persona (directorio)</SelectItem>
                <SelectItem value="Grupo">Grupo / ministerio</SelectItem>
                <SelectItem value="Actividad">Resumen de actividad</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          {attForm.scope === "Persona" && (
            <FieldGroup label="Miembro o visitante">
              <Select
                value={attForm.personId}
                onValueChange={(v) => setAttForm((f) => ({ ...f, personId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecciona persona" /></SelectTrigger>
                <SelectContent>
                  {scopedMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
          )}
          {attForm.scope === "Grupo" && (
            <FieldGroup label="Ministerio / grupo">
              <Select
                value={attForm.groupId}
                onValueChange={(v) => setAttForm((f) => ({ ...f, groupId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecciona grupo" /></SelectTrigger>
                <SelectContent>
                  {scopedGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.kind})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
          )}
          <FieldGroup label="Presencia">
            <Select
              value={attForm.present}
              onValueChange={(v) => setAttForm((f) => ({ ...f, present: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Presente</SelectItem>
                <SelectItem value="false">Ausente</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Nota">
            <Input
              value={attForm.note}
              onChange={(e) => setAttForm((f) => ({ ...f, note: e.target.value }))}
            />
          </FieldGroup>
        </div>
      </FormDialog>

      <FormDialog
        title="Registrar espacio / infraestructura"
        description="Espacio disponible para programación de actividades sin conflictos."
        open={facilityOpen}
        onOpenChange={setFacilityOpen}
        submitLabel="Guardar espacio"
        onSubmit={() => {
          if (facilityForm.name.trim().length < 2) return;
          facilitiesStore.create({
            id: `ESP-${Date.now()}`,
            name: facilityForm.name.trim(),
            type: facilityForm.type.trim() || "Salón",
            location: facilityForm.location.trim() || settings.campusId,
            capacity: facilityForm.capacity.trim() || "Por definir",
            condition: "Bueno",
            responsible: facilityForm.responsible.trim() || "Administración · demo",
            nextMaintenance: "Por programar",
            note: "Espacio registrado localmente.",
            organizationId: settings.organizationId,
            campusId: facilityForm.campusId || settings.campusId,
          });
          setFacilityOpen(false);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Nombre del espacio">
            <Input
              value={facilityForm.name}
              onChange={(e) => setFacilityForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Tipo">
            <Input
              value={facilityForm.type}
              onChange={(e) => setFacilityForm((f) => ({ ...f, type: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Ubicación / sede">
            <Input
              value={facilityForm.location}
              onChange={(e) => setFacilityForm((f) => ({ ...f, location: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Capacidad">
            <Input
              value={facilityForm.capacity}
              onChange={(e) => setFacilityForm((f) => ({ ...f, capacity: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Responsable">
            <Input
              value={facilityForm.responsible}
              onChange={(e) => setFacilityForm((f) => ({ ...f, responsible: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={terms.campusLabel}>
            <Input
              value={facilityForm.campusId}
              onChange={(e) => setFacilityForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
        </div>
      </FormDialog>

      <DetailDrawer
        open={!!selectedEvent || !!selectedFacility}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEventId(null);
            setSelectedFacility(null);
          }
        }}
        title={selectedEvent?.title ?? selectedFacility?.name ?? "Detalle"}
        description={
          selectedEvent
            ? `${selectedEvent.date} · ${selectedEvent.time} · ${selectedEvent.id}`
            : selectedFacility
              ? `${selectedFacility.type} · ${selectedFacility.id}`
              : undefined
        }
      >
        {selectedEvent && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tipo">{selectedEvent.type}</InfoItem>
              <InfoItem label="Lugar">{selectedEvent.place}</InfoItem>
              <InfoItem label="Responsable">{selectedEvent.responsible}</InfoItem>
              <InfoItem label="Participantes">{selectedEvent.participants}</InfoItem>
              <InfoItem label="Recurrencia">
                <span className="inline-flex items-center gap-1">
                  <Repeat className="size-3.5 text-primary" />
                  {selectedEvent.recurrence ?? "Única"}
                </span>
              </InfoItem>
              <InfoItem label={terms.campusLabel}>
                {selectedEvent.campusId || settings.campusId}
              </InfoItem>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => openEditEvent(selectedEvent)}
              >
                <Pencil className="size-3.5" />
                Editar actividad
              </Button>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ClipboardCheck className="size-4" />
                Asistencia e historial
              </h3>
              {attendanceForEvent(selectedEvent.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin registros de asistencia para esta actividad.
                </p>
              ) : (
                <div className="space-y-2">
                  {attendanceForEvent(selectedEvent.id).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded border p-2 text-sm"
                    >
                      <span>
                        {a.personOrGroup}{" "}
                        <span className="text-xs text-muted-foreground">({a.scope})</span>
                      </span>
                      <StatusBadge
                        status={a.present ? "active" : "inactive"}
                        label={a.present ? "Presente" : "Ausente"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {selectedFacility && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Ubicación">{selectedFacility.location}</InfoItem>
              <InfoItem label="Capacidad / uso">{selectedFacility.capacity}</InfoItem>
              <InfoItem label="Estado">{selectedFacility.condition}</InfoItem>
              <InfoItem label="Responsable">{selectedFacility.responsible}</InfoItem>
              <InfoItem label="Próximo mantenimiento">{selectedFacility.nextMaintenance}</InfoItem>
            </div>
            <p className="text-sm text-muted-foreground">{selectedFacility.note}</p>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
