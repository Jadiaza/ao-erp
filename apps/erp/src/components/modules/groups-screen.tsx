import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, ClipboardList, History, Plus, UserCog, Users, UsersRound } from "lucide-react";
import {
  ActivityTimeline,
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  FilterBar,
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
import { FormModal, FormSection, SelectInputField, TextInputField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parishGroups, type AssignmentRecord, type GroupMember, type ParishGroupDemo } from "@/data/pastoral-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { isChristianProfile } from "@/lib/ao-cristiano-profile";

type GroupFormValues = { name: string; kind: string; department: string; coordinator: string; campusId: string; purpose: string };

const kinds = ["Ministerio", "Departamento", "Célula", "Grupo pequeño", "Equipo de servicio", "Comunidad", "Movimiento"];

export function GroupsScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [campus, setCampus] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<ParishGroupDemo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState("directory");
  const form = useForm<GroupFormValues>({
    defaultValues: { name: "", kind: "Ministerio", department: "", coordinator: "", campusId: settings.campusId || "SEDE-PRINCIPAL", purpose: "" },
    mode: "onBlur",
  });
  const { records, create, update } = useLocalCollection("ao-erp:pastoral:groups", parishGroups);

  const scoped = useMemo(() => records.filter((g) => !g.organizationId || g.organizationId === settings.organizationId), [records, settings.organizationId]);
  const campuses = [...new Set(scoped.map((g) => g.campusId).filter(Boolean))] as string[];
  const visible = useMemo(
    () =>
      scoped.filter((group) => {
        const hay = `${group.name} ${group.kind} ${group.department ?? ""} ${group.coordinator} ${group.leader ?? ""} ${group.campusId ?? ""}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
        if (kind !== "all" && group.kind !== kind) return false;
        if (campus !== "all" && (group.campusId ?? "") !== campus) return false;
        if (status !== "all" && group.status !== status) return false;
        return true;
      }),
    [scoped, query, kind, campus, status],
  );

  const allMembers = scoped.reduce((n, g) => n + (g.memberList?.length ?? g.members ?? 0), 0);
  const serviceTeamsCount = scoped.reduce((n, g) => n + (g.serviceTeams?.length ?? 0), 0);
  const assignments = scoped.flatMap((g) => (g.assignments ?? []).map((a) => ({ ...a, group: g.name, groupId: g.id })));

  const columns: DataTableColumn<ParishGroupDemo>[] = [
    { id: "name", header: "Ministerio / grupo", cell: (g) => <div><p className="font-semibold">{g.name}</p><p className="text-xs text-muted-foreground">{g.id} · {g.kind}</p></div> },
    { id: "leader", header: christian ? settings.terminology.leaderLabel : "Líder / responsable", cell: (g) => g.leader || g.coordinator },
    { id: "dept", header: "Departamento / organización", cell: (g) => g.department || "—" },
    { id: "members", header: "Integrantes", cell: (g) => String(g.memberList?.length ?? g.members) },
    { id: "campus", header: settings.terminology.campusLabel, cell: (g) => g.campusId || "—" },
    { id: "status", header: "Estado", cell: (g) => <StatusBadge status={g.status} /> },
  ];

  const assignmentColumns: DataTableColumn<AssignmentRecord & { group: string; groupId: string }>[] = [
    { id: "date", header: "Fecha", cell: (a) => a.date },
    { id: "person", header: "Persona", cell: (a) => a.person },
    { id: "role", header: "Rol / asignación", cell: (a) => a.role },
    { id: "group", header: "Grupo / equipo", cell: (a) => a.group },
    { id: "scope", header: "Alcance", cell: (a) => a.scope },
    { id: "status", header: "Estado", cell: (a) => <StatusBadge status={a.status === "Activa" ? "active" : "approved"} label={a.status} /> },
  ];

  const addMember = (group: ParishGroupDemo) => {
    const member: GroupMember = { id: `GM-${Date.now()}`, name: `Integrante de muestra ${Date.now().toString().slice(-3)}`, role: "Integrante", joinedAt: new Date().toISOString().slice(0, 10), status: "Activo" };
    const list = [...(group.memberList ?? []), member];
    const history = [...(group.history ?? []), { id: `GH-${Date.now()}`, date: new Date().toISOString().slice(0, 10), action: `Integrante agregado: ${member.name}`, actor: "Coordinación · demo" }];
    update(group.id, { memberList: list, members: Math.max(group.members, list.length), history });
    setSelected({ ...group, memberList: list, members: Math.max(group.members, list.length), history });
  };

  return (
    <ModuleLayout
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: christian ? "Comunidad cristiana" : "Comunidad y pastoral" }, { label: christian ? "Ministerios, grupos y células" : "Grupos, movimientos y ministerios" }]}
      title={christian ? "Ministerios, grupos y células" : "Grupos, movimientos y ministerios"}
      description={christian ? "Ministerios, departamentos, células y grupos pequeños con líderes, integrantes, equipos de servicio, asignaciones, historial y organización por sede." : "Directorio comunitario de grupos, comunidades y equipos de servicio."}
      actions={<Button className="gap-2" onClick={() => setFormOpen(true)}><Plus className="size-4" />Registrar grupo</Button>}
      stats={
        <>
          <StatCard label="Grupos / ministerios" value={String(scoped.length)} icon={UsersRound} caption="Directorio local por organización" />
          <StatCard label="Integrantes registrados" value={String(allMembers)} icon={Users} caption="Miembros y participantes" />
          <StatCard label="Equipos de servicio" value={String(serviceTeamsCount)} icon={UserCog} caption="Equipos asignados" />
          <StatCard label="Asignaciones activas" value={String(assignments.filter((a) => a.status === "Activa").length)} icon={ClipboardList} caption="Servicios y responsabilidades" />
        </>
      }
    >
      <DemoNotice>{christian ? `Datos de ministerios y grupos asociados a ${settings.organizationId}. Gestión demostrativa local con búsqueda, filtros, fichas, historial y asignaciones.` : "Coordinadores e integrantes son referencias ficticias. Las cifras reflejan ejemplos locales."}</DemoNotice>

      <FilterBar label="Directorio">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, tipo, líder o departamento" className="w-full sm:w-80" />
        <Select value={kind} onValueChange={setKind}><SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los tipos</SelectItem>{kinds.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
        <Select value={campus} onValueChange={setCampus}><SelectTrigger className="w-44"><SelectValue placeholder="Sede" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las sedes</SelectItem>{campuses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="active">Activo</SelectItem><SelectItem value="pending">En revisión</SelectItem><SelectItem value="inactive">Inactivo</SelectItem></SelectContent></Select>
      </FilterBar>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="directory">Directorio y fichas</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones y equipos</TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="space-y-4">
          <DataTable rows={visible} columns={columns} getRowId={(g) => g.id} onRowClick={setSelected} emptyTitle="Sin resultados" emptyDescription="Ajusta los filtros de búsqueda." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((group) => (
              <button key={group.id} onClick={() => setSelected(group)} className="rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between"><div><span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">{group.kind}</span><h3 className="mt-2 font-semibold">{group.name}</h3></div><UsersRound className="size-5 text-primary" /></div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{group.purpose}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span><span className="text-muted-foreground">Líder:</span> {group.leader || group.coordinator}</span><span><span className="text-muted-foreground">Sede:</span> {group.campusId || "—"}</span></div>
                <div className="mt-3 flex items-center justify-between text-xs"><span>{group.memberList?.length ?? group.members} integrantes</span><StatusBadge status={group.status} /></div>
                <Progress value={group.participation} className="mt-2" />
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="assignments">
          <Card className="shadow-none"><CardHeader><CardTitle className="text-sm">Asignaciones, equipos de servicio e historial operativo</CardTitle></CardHeader><CardContent><DataTable rows={assignments} columns={assignmentColumns} getRowId={(a) => a.id} emptyTitle="Sin asignaciones" emptyDescription="Registra asignaciones en las fichas de grupo." /></CardContent></Card>
        </TabsContent>
      </Tabs>

      <FormModal title="Registrar ministerio / grupo" description="Crea un grupo local asociado a la organización y sede." open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) form.reset(); }} form={form} submitLabel="Registrar" onSubmit={(values) => {
        if (values.name.trim().length < 3) { form.setError("name", { message: "Ingresa al menos 3 caracteres." }); throw new Error("Nombre inválido"); }
        const dept = values.department.trim();
        const newGroup: any = {
          id: `GRP-DEMO-${Date.now()}`,
          name: values.name.trim(),
          kind: values.kind as ParishGroupDemo["kind"],
          coordinator: values.coordinator.trim() || "Responsable · demo",
          leader: values.coordinator.trim() || "Responsable · demo",
          members: 0,
          schedule: "Por definir",
          nextActivity: "Por programar",
          participation: 0,
          status: "active",
          purpose: values.purpose.trim() || "Grupo creado en modo demostración.",
          activities: [],
          organizationId: settings.organizationId,
          campusId: values.campusId || settings.campusId,
          memberList: [],
          serviceTeams: [],
          assignments: [],
          history: [{ id: `GH-${Date.now()}`, date: new Date().toISOString().slice(0, 10), action: "Grupo creado", actor: "Usuario · demo" }],
        };
        if (dept) newGroup.department = dept;
        create(newGroup);
      }}>
        <FormSection title="Datos del grupo" description="Ministerio, departamento, célula o equipo de servicio.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField control={form.control} name="name" label="Nombre" required placeholder="Nombre del grupo" />
            <SelectInputField control={form.control} name="kind" label="Tipo" options={kinds.map((k) => ({ value: k, label: k }))} />
            <TextInputField control={form.control} name="department" label="Ministerio / departamento" placeholder="Área organizacional" />
            <TextInputField control={form.control} name="coordinator" label={christian ? settings.terminology.leaderLabel : "Líder / responsable"} required placeholder="Responsable" />
            <TextInputField control={form.control} name="campusId" label={settings.terminology.campusLabel} placeholder={settings.campusId} />
            <TextInputField control={form.control} name="purpose" label="Propósito / función" placeholder="Descripción breve" />
          </div>
        </FormSection>
      </FormModal>

      <DetailDrawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.name ?? "Ficha de grupo"} description={selected ? `${selected.kind} · ${selected.id} · ${selected.campusId ?? settings.campusId}` : undefined}>
        {selected && (
          <Tabs defaultValue="info">
            <TabsList className="mb-4 flex h-auto flex-wrap"><TabsTrigger value="info">Información</TabsTrigger><TabsTrigger value="members">Integrantes</TabsTrigger><TabsTrigger value="teams">Equipos y asignaciones</TabsTrigger><TabsTrigger value="history">Historial</TabsTrigger></TabsList>
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Tipo">{selected.kind}</InfoItem>
                <InfoItem label="Estado"><StatusBadge status={selected.status} /></InfoItem>
                <InfoItem label="Departamento">{selected.department || "—"}</InfoItem>
                <InfoItem label="Líder">{selected.leader || selected.coordinator}</InfoItem>
                <InfoItem label={settings.terminology.campusLabel}>{selected.campusId || "—"}</InfoItem>
                <InfoItem label="Organización">{selected.organizationId || settings.organizationId}</InfoItem>
                <InfoItem label="Reunión habitual">{selected.schedule}</InfoItem>
                <InfoItem label="Próxima actividad">{selected.nextActivity}</InfoItem>
              </div>
              <InfoItem label="Propósito">{selected.purpose}</InfoItem>
              <div><div className="mb-1 flex justify-between text-sm"><span>Participación</span><span>{selected.participation}%</span></div><Progress value={selected.participation} /></div>
            </TabsContent>
            <TabsContent value="members" className="space-y-3">
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Integrantes ({selected.memberList?.length ?? selected.members})</h3><Button size="sm" variant="outline" onClick={() => addMember(selected)}>Agregar integrante (demo)</Button></div>
              {(selected.memberList ?? []).length === 0 ? <p className="rounded border border-dashed p-4 text-sm text-muted-foreground">No hay integrantes detallados registrados. Total referencial: {selected.members}.</p> : (selected.memberList ?? []).map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.role} · Desde {m.joinedAt}</p></div><span className="text-xs">{m.status}</span></div>
              ))}
            </TabsContent>
            <TabsContent value="teams" className="space-y-4">
              <div><h3 className="mb-2 text-sm font-semibold">Equipos de servicio</h3>{(selected.serviceTeams ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Sin equipos registrados.</p> : (selected.serviceTeams ?? []).map((t) => <div key={t.id} className="mb-2 rounded-lg border p-3 text-sm"><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">Líder: {t.leader} · {t.focus}</p><p className="mt-1 text-xs">Integrantes: {t.members.join(", ") || "—"}</p></div>)}</div>
              <div><h3 className="mb-2 text-sm font-semibold">Asignaciones</h3>{(selected.assignments ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Sin asignaciones registradas.</p> : (selected.assignments ?? []).map((a) => <div key={a.id} className="mb-2 rounded-lg border p-3 text-sm"><div className="flex justify-between"><span className="font-medium">{a.person}</span><StatusBadge status={a.status === "Activa" ? "active" : "approved"} label={a.status} /></div><p className="text-xs text-muted-foreground">{a.role} · {a.scope} · {a.date}</p></div>)}</div>
            </TabsContent>
            <TabsContent value="history" className="space-y-3">
              <ActivityTimeline entries={[...(selected.history ?? []).map((h) => ({ id: h.id, title: h.action, description: "Historial del grupo", date: h.date, actor: h.actor })), ...selected.activities.map((a, i) => ({ id: `act-${i}`, title: a, description: selected.nextActivity, date: "Actividad", actor: selected.coordinator }))]} />
              <Button size="sm" variant="outline" onClick={() => { const history = [...(selected.history ?? []), { id: `GH-${Date.now()}`, date: new Date().toISOString().slice(0, 10), action: "Estado/organización actualizado", actor: "Usuario · demo" }]; update(selected.id, { history }); setSelected({ ...selected, history }); }}>Registrar evento en historial (demo)</Button>
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}