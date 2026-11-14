import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ScrollText,
  Users,
} from "lucide-react";
import {
  ActivityTimeline,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  institutionalContactsDemo,
  institutionalHistoryDemo,
  type InstitutionalContactDemo,
} from "@/data/governance-demo";
import { institutionDependenciesDemo } from "@/data/institution-profile-demo";
import {
  christianResponsibles,
  christianSites,
  seedAdminTasks,
  seedCorrespondence,
  seedMeetingMinutes,
  type AdminTask,
  type CorrespondenceItem,
  type MeetingMinute,
} from "@/data/institutional-structure-demo";
import { parishDemo } from "@/data/parish-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

type ContactRecord = InstitutionalContactDemo & { organizationId?: string; campusId?: string };

export function InstitutionalAdministrationScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;

  const [tab, setTab] = useState(christian ? "minutes" : "overview");
  const [query, setQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "overdue">("all");

  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [selectedMinuteId, setSelectedMinuteId] = useState<string | null>(null);
  const [selectedCorrespondenceId, setSelectedCorrespondenceId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [contactOpen, setContactOpen] = useState(false);
  const [minuteOpen, setMinuteOpen] = useState(false);
  const [editingMinuteId, setEditingMinuteId] = useState<string | null>(null);
  const [correspondenceOpen, setCorrespondenceOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const initialContacts: ContactRecord[] = useMemo(
    () =>
      christian
        ? christianResponsibles.map((r) => ({
            id: r.id,
            name: r.name,
            role: r.role,
            area: "Administración congregacional",
            email: r.email,
            phone: "+57 300 555 0100 · demo",
            status: "Activo" as const,
            organizationId: r.organizationId ?? "ORG-DEMO-001",
            campusId: r.campusId ?? "SEDE-PRINCIPAL",
          }))
        : institutionalContactsDemo.map((c) => ({ ...c, organizationId: "ORG-DEMO-001" })),
    [christian],
  );

  const contactsStore = useLocalCollection<ContactRecord>(
    getProfileStorageKey("ao-erp:admin:contacts", settings.profile),
    initialContacts,
  );
  const minutesStore = useLocalCollection<MeetingMinute>(
    getProfileStorageKey("ao-erp:admin:minutes", settings.profile),
    seedMeetingMinutes,
  );
  const correspondenceStore = useLocalCollection<CorrespondenceItem>(
    getProfileStorageKey("ao-erp:admin:correspondence", settings.profile),
    seedCorrespondence,
  );
  const tasksStore = useLocalCollection<AdminTask>(
    getProfileStorageKey("ao-erp:admin:tasks", settings.profile),
    seedAdminTasks,
  );

  const scopedContacts = useMemo(
    () =>
      contactsStore.records.filter(
        (c) => !c.organizationId || c.organizationId === settings.organizationId,
      ),
    [contactsStore.records, settings.organizationId],
  );
  const scopedMinutes = useMemo(
    () =>
      minutesStore.records.filter(
        (m) => m.organizationId === settings.organizationId,
      ),
    [minutesStore.records, settings.organizationId],
  );
  const scopedCorrespondence = useMemo(
    () =>
      correspondenceStore.records.filter(
        (c) => c.organizationId === settings.organizationId,
      ),
    [correspondenceStore.records, settings.organizationId],
  );
  const scopedTasks = useMemo(
    () =>
      tasksStore.records.filter(
        (t) => t.organizationId === settings.organizationId,
      ),
    [tasksStore.records, settings.organizationId],
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const visibleContacts = useMemo(
    () =>
      scopedContacts.filter((person) =>
        `${person.name} ${person.role} ${person.area} ${person.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [scopedContacts, query],
  );

  const visibleTasks = useMemo(
    () =>
      scopedTasks.filter((t) => {
        if (taskFilter === "pending") return t.status !== "Completada";
        if (taskFilter === "overdue") return t.status !== "Completada" && t.dueDate < todayISO;
        return true;
      }),
    [scopedTasks, taskFilter, todayISO],
  );

  const selectedMinute = scopedMinutes.find((m) => m.id === selectedMinuteId) ?? null;
  const selectedCorrespondence =
    scopedCorrespondence.find((c) => c.id === selectedCorrespondenceId) ?? null;
  const selectedTask = scopedTasks.find((t) => t.id === selectedTaskId) ?? null;

  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    area: "Administración",
    email: "",
    phone: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const [minuteForm, setMinuteForm] = useState({
    code: "",
    date: todayISO,
    meetingType: "Junta de liderazgo",
    title: "",
    attendeesText: "",
    responsible: scopedContacts[0]?.name ?? "Coordinación administrativa · demo",
    agreementsText: "",
    commitmentsText: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const [correspondenceForm, setCorrespondenceForm] = useState({
    radicado: "",
    direction: "Recibida" as CorrespondenceItem["direction"],
    date: todayISO,
    sender: "",
    recipient: "",
    subject: "",
    responsible: scopedContacts[0]?.name ?? "Coordinación administrativa · demo",
    notes: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    responsible: scopedContacts[0]?.name ?? "Coordinación administrativa · demo",
    dueDate: todayISO,
    priority: "Media" as AdminTask["priority"],
    relatedRef: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const contactColumns: DataTableColumn<ContactRecord>[] = [
    {
      id: "person",
      header: "Responsable",
      cell: (person) => (
        <div>
          <p className="font-semibold">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.id}</p>
        </div>
      ),
    },
    { id: "role", header: "Cargo / función", cell: (person) => person.role },
    { id: "area", header: "Dependencia", cell: (person) => person.area },
    { id: "email", header: "Correo institucional", cell: (person) => person.email },
    {
      id: "status",
      header: "Estado operativo",
      cell: (person) => (
        <StatusBadge
          status={person.status === "Activo" ? "active" : person.status === "Pendiente" ? "pending" : "inactive"}
          label={person.status}
        />
      ),
    },
  ];

  const minuteColumns: DataTableColumn<MeetingMinute>[] = [
    {
      id: "code",
      header: "Acta / fecha",
      cell: (m) => (
        <div>
          <p className="font-mono text-xs font-semibold">{m.code}</p>
          <p className="text-xs text-muted-foreground">{m.date}</p>
        </div>
      ),
    },
    {
      id: "title",
      header: "Reunión",
      cell: (m) => (
        <div>
          <p className="font-semibold">{m.title}</p>
          <p className="text-xs text-muted-foreground">{m.meetingType}</p>
        </div>
      ),
    },
    { id: "responsible", header: "Responsable", cell: (m) => m.responsible },
    { id: "campus", header: terms.campusLabel, cell: (m) => m.campusId },
    {
      id: "status",
      header: "Estado",
      cell: (m) => (
        <StatusBadge
          status={m.status === "Aprobada" ? "approved" : m.status === "Borrador" ? "pending" : "inactive"}
          label={m.status}
        />
      ),
    },
  ];

  const correspondenceColumns: DataTableColumn<CorrespondenceItem>[] = [
    {
      id: "radicado",
      header: "Radicado / fecha",
      cell: (c) => (
        <div>
          <p className="font-mono text-xs font-semibold">{c.radicado}</p>
          <p className="text-xs text-muted-foreground">
            {c.direction} · {c.date}
          </p>
        </div>
      ),
    },
    {
      id: "subject",
      header: "Asunto",
      cell: (c) => (
        <div>
          <p className="font-semibold">{c.subject}</p>
          <p className="text-xs text-muted-foreground">
            {c.sender} → {c.recipient}
          </p>
        </div>
      ),
    },
    { id: "responsible", header: "Responsable", cell: (c) => c.responsible },
    {
      id: "status",
      header: "Estado",
      cell: (c) => (
        <StatusBadge
          status={
            c.status === "Respondida" || c.status === "Archivada"
              ? "approved"
              : c.status === "En seguimiento"
                ? "pending"
                : "active"
          }
          label={c.status}
        />
      ),
    },
  ];

  const taskColumns: DataTableColumn<AdminTask>[] = [
    {
      id: "title",
      header: "Tarea",
      cell: (t) => (
        <div>
          <p className="font-semibold">{t.title}</p>
          {t.relatedRef && <p className="text-xs text-muted-foreground">Ref: {t.relatedRef}</p>}
        </div>
      ),
    },
    { id: "responsible", header: "Responsable", cell: (t) => t.responsible },
    {
      id: "dueDate",
      header: "Vencimiento",
      cell: (t) => (
        <span className={t.status !== "Completada" && t.dueDate < todayISO ? "font-semibold text-destructive" : ""}>
          {t.dueDate}
          {t.status !== "Completada" && t.dueDate < todayISO ? " (Vencida)" : ""}
        </span>
      ),
    },
    { id: "priority", header: "Prioridad", cell: (t) => t.priority },
    {
      id: "status",
      header: "Estado",
      cell: (t) => (
        <StatusBadge
          status={t.status === "Completada" ? "approved" : t.status === "En progreso" ? "active" : "pending"}
          label={t.status}
        />
      ),
    },
  ];

  const openNewMinute = () => {
    setEditingMinuteId(null);
    setMinuteForm({
      code: `ACT-${String(scopedMinutes.length + 1).padStart(3, "0")}-2026`,
      date: todayISO,
      meetingType: "Junta de liderazgo",
      title: "",
      attendeesText: "",
      responsible: scopedContacts[0]?.name ?? "Coordinación administrativa · demo",
      agreementsText: "",
      commitmentsText: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
    });
    setMinuteOpen(true);
  };

  const openEditMinute = (minute: MeetingMinute) => {
    setEditingMinuteId(minute.id);
    setMinuteForm({
      code: minute.code,
      date: minute.date,
      meetingType: minute.meetingType,
      title: minute.title,
      attendeesText: minute.attendees.join(", "),
      responsible: minute.responsible,
      agreementsText: minute.agreements.join("\n"),
      commitmentsText: minute.commitments.join("\n"),
      campusId: minute.campusId,
    });
    setMinuteOpen(true);
  };

  const saveMinute = () => {
    if (minuteForm.title.trim().length < 3) return;
    const attendees = minuteForm.attendeesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const agreements = minuteForm.agreementsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const commitments = minuteForm.commitmentsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingMinuteId) {
      minutesStore.update(editingMinuteId, {
        code: minuteForm.code.trim() || "ACT-DEMO",
        date: minuteForm.date || todayISO,
        meetingType: minuteForm.meetingType.trim() || "Reunión",
        title: minuteForm.title.trim(),
        attendees,
        responsible: minuteForm.responsible.trim() || "Administración · demo",
        agreements,
        commitments,
        campusId: minuteForm.campusId || settings.campusId,
      });
    } else {
      minutesStore.create({
        id: `ACT-${Date.now()}`,
        code: minuteForm.code.trim() || `ACT-${Date.now()}`,
        date: minuteForm.date || todayISO,
        meetingType: minuteForm.meetingType.trim() || "Reunión",
        title: minuteForm.title.trim(),
        attendees,
        responsible: minuteForm.responsible.trim() || "Administración · demo",
        agreements,
        commitments,
        status: "Borrador",
        organizationId: settings.organizationId,
        campusId: minuteForm.campusId || settings.campusId,
      });
    }
    setMinuteOpen(false);
  };

  const activeDeps = christian ? christianSites : institutionDependenciesDemo.map((d) => ({ id: d.name, name: d.name, address: `${d.kind} · ${d.location}`, lead: d.lead }));

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Gobierno e institución" },
        { label: "Administración institucional" },
      ]}
      title={christian ? "Administración congregacional" : "Administración institucional"}
      description={
        christian
          ? "Gestión operativa de responsables, sedes, actas, correspondencia y tareas administrativas por organización."
          : "Gestión operativa de contactos, dependencias, actas, correspondencia y tareas administrativas."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-1.5" onClick={openNewMinute}>
            <ScrollText className="size-4" />
            Nueva acta
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => setCorrespondenceOpen(true)}>
            <Mail className="size-4" />
            Correspondencia
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => setTaskOpen(true)}>
            <ClipboardList className="size-4" />
            Nueva tarea
          </Button>
          <Button className="gap-1.5" onClick={() => setContactOpen(true)}>
            <Plus className="size-4" />
            Agregar responsable
          </Button>
        </div>
      }
      stats={
        <>
          <StatCard
            label="Responsables"
            value={String(scopedContacts.length)}
            icon={Users}
            caption="Directorio operativo local"
          />
          <StatCard
            label="Actas registradas"
            value={String(scopedMinutes.length)}
            icon={ScrollText}
            caption={`${scopedMinutes.filter((m) => m.status === "Borrador").length} en borrador`}
          />
          <StatCard
            label="Correspondencia"
            value={String(scopedCorrespondence.length)}
            icon={Mail}
            caption={`${scopedCorrespondence.filter((c) => c.status === "En seguimiento").length} en seguimiento`}
          />
          <StatCard
            label="Tareas pendientes"
            value={String(scopedTasks.filter((t) => t.status !== "Completada").length)}
            icon={ClipboardList}
            caption={`${scopedTasks.filter((t) => t.status !== "Completada" && t.dueDate < todayISO).length} vencida(s)`}
          />
        </>
      }
    >
      <DemoNotice>
        Gestión operativa local para {settings.organizationId} ({settings.campusId}). Actas,
        correspondencia, tareas y responsables se almacenan en navegador (demo local).
      </DemoNotice>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-primary" />
              Ficha operativa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Nombre de atención">
              {christian ? `${terms.institutionLabel} · ${settings.organizationId}` : parishDemo.officialName}
            </InfoItem>
            <InfoItem label="Estado operativo">
              <StatusBadge status="active" label="En servicio · muestra" />
            </InfoItem>
            <InfoItem label="Sede activa">{settings.campusId}</InfoItem>
            <InfoItem label="Ubicación">{christian ? "Colombia · demo local" : parishDemo.region}</InfoItem>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-primary" />
              Canales de comunicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold">
                  {christian ? "administracion@congregacion.test" : parishDemo.contactEmail}
                </p>
                <p className="text-[10px] text-muted-foreground">Correo de atención (demo)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Phone className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold">{parishDemo.contactPhone}</p>
                <p className="text-[10px] text-muted-foreground">Número de atención (demo)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="minutes">Actas</TabsTrigger>
          <TabsTrigger value="correspondence">Correspondencia</TabsTrigger>
          <TabsTrigger value="tasks">Tareas administrativas</TabsTrigger>
          <TabsTrigger value="overview">Responsables y áreas</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencias y sedes</TabsTrigger>
          <TabsTrigger value="history">Historial de cambios</TabsTrigger>
        </TabsList>

        <TabsContent value="minutes" className="space-y-4">
          <DataTable
            rows={scopedMinutes}
            columns={minuteColumns}
            getRowId={(m) => m.id}
            onRowClick={(m) => setSelectedMinuteId(m.id)}
            emptyTitle="Sin actas registradas"
            emptyDescription="Crea un acta para registrar asistentes, acuerdos y compromisos."
          />
        </TabsContent>

        <TabsContent value="correspondence" className="space-y-4">
          <DataTable
            rows={scopedCorrespondence}
            columns={correspondenceColumns}
            getRowId={(c) => c.id}
            onRowClick={(c) => setSelectedCorrespondenceId(c.id)}
            emptyTitle="Sin correspondencia registrada"
            emptyDescription="Registra comunicaciones recibidas o enviadas para hacerles seguimiento."
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <FilterBar label="Tareas">
            <Select
              value={taskFilter}
              onValueChange={(v) => setTaskFilter(v as typeof taskFilter)}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tareas</SelectItem>
                <SelectItem value="pending">Pendientes y en progreso</SelectItem>
                <SelectItem value="overdue">Tareas vencidas</SelectItem>
              </SelectContent>
            </Select>
          </FilterBar>
          <DataTable
            rows={visibleTasks}
            columns={taskColumns}
            getRowId={(t) => t.id}
            onRowClick={(t) => setSelectedTaskId(t.id)}
            emptyTitle="Sin tareas para el filtro seleccionado"
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold">Directorio de responsables</h2>
              <p className="text-sm text-muted-foreground">
                Cargos y funciones operativas de la organización.
              </p>
            </div>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar responsable, cargo o área"
              className="w-full sm:w-72"
            />
          </div>
          <DataTable
            rows={visibleContacts}
            columns={contactColumns}
            getRowId={(person) => person.id}
            onRowClick={setSelectedContact}
          />
        </TabsContent>

        <TabsContent value="dependencies" className="grid gap-4 md:grid-cols-2">
          {activeDeps.map((item) => (
            <Card key={item.id} className="shadow-none">
              <CardContent className="flex gap-3 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <MapPin className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <StatusBadge status="active" label="Activa" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.address}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="size-4 text-primary" />
                Historial administrativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                entries={institutionalHistoryDemo.map((event, index) => ({
                  id: `admin-${index}`,
                  title: event.title,
                  description: event.detail,
                  date: event.date,
                  actor: event.actor,
                }))}
              />
            </CardContent>
          </Card>
          <Card className="border-primary/10 bg-primary/[0.03] shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Estado de operación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Estado de atención">En servicio · demostración</InfoItem>
              <InfoItem label="Organización">{settings.organizationId}</InfoItem>
              <InfoItem label="Sede">{settings.campusId}</InfoItem>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales de alta */}
      <FormDialog
        title="Agregar responsable administrativo"
        description="Registra un responsable operativo en el repositorio local."
        open={contactOpen}
        onOpenChange={setContactOpen}
        submitLabel="Guardar responsable"
        onSubmit={() => {
          if (contactForm.name.trim().length < 2) return;
          contactsStore.create({
            id: `RES-${Date.now()}`,
            name: contactForm.name.trim(),
            role: contactForm.role.trim() || "Responsable operativo",
            area: contactForm.area.trim() || "Administración",
            email: contactForm.email.trim() || "responsable@congregacion.test",
            phone: contactForm.phone.trim() || "+57 300 000 0000",
            status: "Activo",
            organizationId: settings.organizationId,
            campusId: contactForm.campusId || settings.campusId,
          });
          setContactOpen(false);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Nombre">
            <Input
              value={contactForm.name}
              onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Cargo o función">
            <Input
              value={contactForm.role}
              onChange={(e) => setContactForm((f) => ({ ...f, role: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Dependencia">
            <Input
              value={contactForm.area}
              onChange={(e) => setContactForm((f) => ({ ...f, area: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Correo">
            <Input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Teléfono">
            <Input
              value={contactForm.phone}
              onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={terms.campusLabel}>
            <Input
              value={contactForm.campusId}
              onChange={(e) => setContactForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
        </div>
      </FormDialog>

      <FormDialog
        title={editingMinuteId ? "Editar borrador de acta" : "Registrar acta"}
        description="Registra acuerdos, asistentes y compromisos vinculados a la organización."
        open={minuteOpen}
        onOpenChange={setMinuteOpen}
        submitLabel="Guardar acta"
        onSubmit={saveMinute}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Código">
            <Input
              value={minuteForm.code}
              onChange={(e) => setMinuteForm((f) => ({ ...f, code: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Fecha">
            <Input
              type="date"
              value={minuteForm.date}
              onChange={(e) => setMinuteForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Tipo de reunión">
            <Input
              value={minuteForm.meetingType}
              onChange={(e) => setMinuteForm((f) => ({ ...f, meetingType: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Responsable">
            <Input
              value={minuteForm.responsible}
              onChange={(e) => setMinuteForm((f) => ({ ...f, responsible: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Título del acta">
            <Input
              value={minuteForm.title}
              onChange={(e) => setMinuteForm((f) => ({ ...f, title: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={terms.campusLabel}>
            <Input
              value={minuteForm.campusId}
              onChange={(e) => setMinuteForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Asistentes (separados por coma)">
            <Input
              value={minuteForm.attendeesText}
              onChange={(e) => setMinuteForm((f) => ({ ...f, attendeesText: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Acuerdos (uno por línea)">
            <Input
              value={minuteForm.agreementsText}
              onChange={(e) => setMinuteForm((f) => ({ ...f, agreementsText: e.target.value }))}
            />
          </FieldGroup>
        </div>
      </FormDialog>

      <FormDialog
        title="Registrar correspondencia"
        description="Correspondencia recibida o enviada con seguimiento."
        open={correspondenceOpen}
        onOpenChange={setCorrespondenceOpen}
        submitLabel="Guardar correspondencia"
        onSubmit={() => {
          if (correspondenceForm.subject.trim().length < 3) return;
          correspondenceStore.create({
            id: `COR-${Date.now()}`,
            radicado:
              correspondenceForm.radicado.trim() ||
              `RAD-${correspondenceForm.direction === "Recibida" ? "E" : "S"}-${Date.now().toString().slice(-4)}`,
            direction: correspondenceForm.direction,
            date: correspondenceForm.date || todayISO,
            sender: correspondenceForm.sender.trim() || "Remitente · demo",
            recipient: correspondenceForm.recipient.trim() || "Destinatario · demo",
            subject: correspondenceForm.subject.trim(),
            responsible: correspondenceForm.responsible.trim() || "Administración · demo",
            status: "Registrada",
            notes: correspondenceForm.notes.trim() || undefined,
            organizationId: settings.organizationId,
            campusId: correspondenceForm.campusId || settings.campusId,
          });
          setCorrespondenceOpen(false);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Dirección">
            <Select
              value={correspondenceForm.direction}
              onValueChange={(v) =>
                setCorrespondenceForm((f) => ({
                  ...f,
                  direction: v as CorrespondenceItem["direction"],
                }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Recibida">Recibida</SelectItem>
                <SelectItem value="Enviada">Enviada</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Radicado">
            <Input
              value={correspondenceForm.radicado}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, radicado: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Remitente">
            <Input
              value={correspondenceForm.sender}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, sender: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Destinatario">
            <Input
              value={correspondenceForm.recipient}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, recipient: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Asunto">
            <Input
              value={correspondenceForm.subject}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, subject: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Responsable">
            <Input
              value={correspondenceForm.responsible}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, responsible: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Fecha">
            <Input
              type="date"
              value={correspondenceForm.date}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={terms.campusLabel}>
            <Input
              value={correspondenceForm.campusId}
              onChange={(e) => setCorrespondenceForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
        </div>
      </FormDialog>

      <FormDialog
        title="Nueva tarea administrativa"
        description="Asigna responsable, fecha límite y prioridad."
        open={taskOpen}
        onOpenChange={setTaskOpen}
        submitLabel="Crear tarea"
        onSubmit={() => {
          if (taskForm.title.trim().length < 3) return;
          tasksStore.create({
            id: `TSK-${Date.now()}`,
            title: taskForm.title.trim(),
            responsible: taskForm.responsible.trim() || "Administración · demo",
            dueDate: taskForm.dueDate || todayISO,
            priority: taskForm.priority,
            status: "Pendiente",
            relatedRef: taskForm.relatedRef.trim() || undefined,
            organizationId: settings.organizationId,
            campusId: taskForm.campusId || settings.campusId,
          });
          setTaskOpen(false);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Título de la tarea">
            <Input
              value={taskForm.title}
              onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Responsable">
            <Input
              value={taskForm.responsible}
              onChange={(e) => setTaskForm((f) => ({ ...f, responsible: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Fecha límite">
            <Input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Prioridad">
            <Select
              value={taskForm.priority}
              onValueChange={(v) =>
                setTaskForm((f) => ({ ...f, priority: v as AdminTask["priority"] }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Referencia (acta/radicado)">
            <Input
              value={taskForm.relatedRef}
              onChange={(e) => setTaskForm((f) => ({ ...f, relatedRef: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={terms.campusLabel}>
            <Input
              value={taskForm.campusId}
              onChange={(e) => setTaskForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
        </div>
      </FormDialog>

      {/* Drawers de consulta y transición */}
      <DetailDrawer
        open={!!selectedMinute}
        onOpenChange={(o) => !o && setSelectedMinuteId(null)}
        title={selectedMinute?.title ?? "Acta"}
        description={selectedMinute ? `${selectedMinute.code} · ${selectedMinute.date}` : undefined}
      >
        {selectedMinute && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tipo">{selectedMinute.meetingType}</InfoItem>
              <InfoItem label="Estado">{selectedMinute.status}</InfoItem>
              <InfoItem label="Responsable">{selectedMinute.responsible}</InfoItem>
              <InfoItem label={terms.campusLabel}>{selectedMinute.campusId}</InfoItem>
            </div>
            <InfoItem label="Asistentes">{selectedMinute.attendees.join(", ") || "—"}</InfoItem>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Acuerdos</p>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {selectedMinute.agreements.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMinute.status === "Borrador" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => openEditMinute(selectedMinute)}>
                    <Pencil className="mr-1.5 size-3.5" />
                    Editar borrador
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => minutesStore.update(selectedMinute.id, { status: "Aprobada" })}
                  >
                    Aprobar acta
                  </Button>
                </>
              )}
              {selectedMinute.status === "Aprobada" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => minutesStore.update(selectedMinute.id, { status: "Archivada" })}
                >
                  Archivar acta
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <DetailDrawer
        open={!!selectedCorrespondence}
        onOpenChange={(o) => !o && setSelectedCorrespondenceId(null)}
        title={selectedCorrespondence?.subject ?? "Correspondencia"}
        description={
          selectedCorrespondence
            ? `${selectedCorrespondence.radicado} · ${selectedCorrespondence.direction}`
            : undefined
        }
      >
        {selectedCorrespondence && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Remitente">{selectedCorrespondence.sender}</InfoItem>
              <InfoItem label="Destinatario">{selectedCorrespondence.recipient}</InfoItem>
              <InfoItem label="Responsable">{selectedCorrespondence.responsible}</InfoItem>
              <InfoItem label="Estado">{selectedCorrespondence.status}</InfoItem>
            </div>
            {selectedCorrespondence.notes && (
              <InfoItem label="Seguimiento">{selectedCorrespondence.notes}</InfoItem>
            )}
            <div className="flex flex-wrap gap-2">
              {selectedCorrespondence.status !== "En seguimiento" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    correspondenceStore.update(selectedCorrespondence.id, {
                      status: "En seguimiento",
                    })
                  }
                >
                  Marcar en seguimiento
                </Button>
              )}
              {selectedCorrespondence.status !== "Respondida" && (
                <Button
                  size="sm"
                  onClick={() =>
                    correspondenceStore.update(selectedCorrespondence.id, {
                      status: "Respondida",
                    })
                  }
                >
                  Marcar respondida
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <DetailDrawer
        open={!!selectedTask}
        onOpenChange={(o) => !o && setSelectedTaskId(null)}
        title={selectedTask?.title ?? "Tarea administrativa"}
        description={selectedTask ? `${selectedTask.id} · Límite ${selectedTask.dueDate}` : undefined}
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Responsable">{selectedTask.responsible}</InfoItem>
              <InfoItem label="Prioridad">{selectedTask.priority}</InfoItem>
              <InfoItem label="Estado">{selectedTask.status}</InfoItem>
              <InfoItem label={terms.campusLabel}>{selectedTask.campusId}</InfoItem>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTask.status !== "En progreso" && selectedTask.status !== "Completada" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => tasksStore.update(selectedTask.id, { status: "En progreso" })}
                >
                  Iniciar tarea
                </Button>
              )}
              {selectedTask.status !== "Completada" && (
                <Button
                  size="sm"
                  onClick={() => tasksStore.update(selectedTask.id, { status: "Completada" })}
                >
                  <CheckCircle2 className="mr-1.5 size-3.5" />
                  Completar tarea
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <DetailDrawer
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
        title={selectedContact?.name ?? "Ficha de responsable"}
        description={selectedContact ? `${selectedContact.role} · ${selectedContact.id}` : undefined}
      >
        {selectedContact && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Cargo">{selectedContact.role}</InfoItem>
              <InfoItem label="Dependencia">{selectedContact.area}</InfoItem>
              <InfoItem label="Estado">{selectedContact.status}</InfoItem>
              <InfoItem label="Contacto">{selectedContact.email}</InfoItem>
              <InfoItem label="Teléfono">{selectedContact.phone}</InfoItem>
            </div>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
