import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  ClipboardList,
  Pencil,
  Plus,
  Power,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
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
import { FormDrawer, FormModal, FormSection, SelectInputField, TextInputField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  christianMembers,
  parishioners,
  type ParishionerDemo,
} from "@/data/community-demo";
import {
  christianGroups,
  parishGroups,
  type AssignmentRecord,
  type GroupMember,
  type ParishGroupDemo,
} from "@/data/pastoral-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

type GroupFormValues = {
  name: string;
  kind: string;
  department: string;
  leaderPersonId: string;
  coordinator: string;
  campusId: string;
  schedule: string;
  purpose: string;
};

const kinds = [
  "Ministerio",
  "Departamento",
  "Célula",
  "Grupo pequeño",
  "Equipo de servicio",
  "Comunidad",
  "Movimiento",
];

export function GroupsScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [campus, setCampus] = useState("all");
  const [status, setStatus] = useState("all");
  const [personLookupId, setPersonLookupId] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [tab, setTab] = useState("directory");

  const [memberDraft, setMemberDraft] = useState({ personId: "", role: "Integrante" });
  const [memberError, setMemberError] = useState<string | null>(null);
  const [teamDraft, setTeamDraft] = useState({ name: "", leaderPersonId: "", focus: "" });
  const [assignmentDraft, setAssignmentDraft] = useState({
    personId: "",
    role: "",
    scope: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const form = useForm<GroupFormValues>({
    defaultValues: {
      name: "",
      kind: "Ministerio",
      department: "",
      leaderPersonId: "__manual__",
      coordinator: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
      schedule: "",
      purpose: "",
    },
    mode: "onBlur",
  });
  const editForm = useForm<GroupFormValues>({ mode: "onBlur" });

  const { records, create, update } = useLocalCollection(
    getProfileStorageKey("ao-erp:pastoral:groups", settings.profile),
    christian ? christianGroups : parishGroups,
  );
  const membersStore = useLocalCollection<ParishionerDemo>(
    getProfileStorageKey("ao-erp:community:parishioners", settings.profile),
    christian ? christianMembers : parishioners,
  );

  const scopedMembers = useMemo(
    () =>
      membersStore.records.filter(
        (m) => !m.organizationId || m.organizationId === settings.organizationId,
      ),
    [membersStore.records, settings.organizationId],
  );

  const scoped = useMemo(
    () =>
      records.filter((g) => !g.organizationId || g.organizationId === settings.organizationId),
    [records, settings.organizationId],
  );
  const campuses = useMemo(
    () => [...new Set(scoped.map((g) => g.campusId).filter(Boolean))] as string[],
    [scoped],
  );

  const selected = useMemo(
    () => scoped.find((g) => g.id === selectedId) ?? null,
    [scoped, selectedId],
  );

  const visible = useMemo(
    () =>
      scoped.filter((group) => {
        const hay = `${group.name} ${group.kind} ${group.department ?? ""} ${group.coordinator} ${group.leader ?? ""} ${group.campusId ?? ""}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
        if (kind !== "all" && group.kind !== kind) return false;
        if (campus !== "all" && (group.campusId ?? "") !== campus) return false;
        if (status !== "all" && group.status !== status) return false;
        if (
          personLookupId !== "all" &&
          !(group.memberList ?? []).some((m) => m.personId === personLookupId) &&
          group.leaderPersonId !== personLookupId
        ) {
          return false;
        }
        return true;
      }),
    [scoped, query, kind, campus, status, personLookupId],
  );

  const allMembers = scoped.reduce((n, g) => n + (g.memberList?.length ?? g.members ?? 0), 0);
  const serviceTeamsCount = scoped.reduce((n, g) => n + (g.serviceTeams?.length ?? 0), 0);
  const assignments = scoped.flatMap((g) =>
    (g.assignments ?? []).map((a) => ({ ...a, group: g.name, groupId: g.id })),
  );

  const personGroupsSummary = useMemo(() => {
    return scopedMembers.map((person) => {
      const belonging = scoped.filter(
        (g) =>
          g.leaderPersonId === person.id ||
          (g.memberList ?? []).some((m) => m.personId === person.id && m.status !== "Retirado"),
      );
      return { person, groups: belonging };
    });
  }, [scopedMembers, scoped]);

  const columns: DataTableColumn<ParishGroupDemo>[] = [
    {
      id: "name",
      header: "Ministerio / grupo",
      cell: (g) => (
        <div>
          <p className="font-semibold">{g.name}</p>
          <p className="text-xs text-muted-foreground">
            {g.id} · {g.kind}
          </p>
        </div>
      ),
    },
    {
      id: "leader",
      header: christian ? settings.terminology.leaderLabel : "Líder / responsable",
      cell: (g) => g.leader || g.coordinator,
    },
    { id: "dept", header: "Departamento / área", cell: (g) => g.department || "—" },
    {
      id: "members",
      header: "Integrantes",
      cell: (g) => String(g.memberList?.length ?? g.members),
    },
    { id: "campus", header: settings.terminology.campusLabel, cell: (g) => g.campusId || "—" },
    { id: "status", header: "Estado", cell: (g) => <StatusBadge status={g.status} /> },
  ];

  const assignmentColumns: DataTableColumn<AssignmentRecord & { group: string; groupId: string }>[] = [
    { id: "date", header: "Fecha", cell: (a) => a.date },
    { id: "person", header: "Persona", cell: (a) => a.person },
    { id: "role", header: "Rol / asignación", cell: (a) => a.role },
    { id: "group", header: "Grupo / equipo", cell: (a) => a.group },
    { id: "scope", header: "Alcance", cell: (a) => a.scope },
    {
      id: "status",
      header: "Estado",
      cell: (a) => (
        <StatusBadge status={a.status === "Activa" ? "active" : "approved"} label={a.status} />
      ),
    },
  ];

  const linkMemberToGroup = (group: ParishGroupDemo) => {
    setMemberError(null);
    if (!memberDraft.personId) {
      setMemberError("Selecciona una persona del directorio de miembros.");
      return;
    }
    const person = scopedMembers.find((p) => p.id === memberDraft.personId);
    if (!person) {
      setMemberError("La persona seleccionada no pertenece a la organización activa.");
      return;
    }
    const existingList = group.memberList ?? [];
    if (existingList.some((m) => m.personId === person.id && m.status !== "Retirado")) {
      setMemberError(`${person.name} ya está vinculado(a) como integrante activo de ${group.name}.`);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const member: GroupMember = {
      id: `GM-${Date.now()}`,
      personId: person.id,
      name: person.name,
      role: memberDraft.role.trim() || "Integrante",
      joinedAt: today,
      status: "Activo",
    };
    const nextList = [...existingList, member];
    const nextHistory = [
      {
        id: `GH-${Date.now()}`,
        date: today,
        action: `Integrante vinculado: ${person.name} (${member.role})`,
        actor: "Coordinación · demo",
      },
      ...(group.history ?? []),
    ];
    update(group.id, {
      memberList: nextList,
      members: nextList.length,
      history: nextHistory,
    });
    // Sincronizar participación en la ficha de la persona (Área 1)
    membersStore.update(person.id, {
      pastoral: person.pastoral.includes(group.name)
        ? person.pastoral
        : [...person.pastoral, group.name],
      participationHistory: [
        {
          id: `PH-${Date.now()}`,
          date: today,
          type: group.kind === "Ministerio" ? "Ministerio" : "Grupo",
          detail: `Vinculado(a) a ${group.name} (${member.role})`,
          campusId: group.campusId,
        },
        ...(person.participationHistory ?? []),
      ],
    });
    setMemberDraft({ personId: "", role: "Integrante" });
  };

  const addServiceTeam = (group: ParishGroupDemo) => {
    if (!teamDraft.name.trim()) return;
    const leaderPerson = scopedMembers.find((p) => p.id === teamDraft.leaderPersonId);
    const nextTeam = {
      id: `ST-${Date.now()}`,
      name: teamDraft.name.trim(),
      leaderPersonId: leaderPerson?.id,
      leader: leaderPerson?.name || group.leader || group.coordinator,
      members: [],
      memberIds: [],
      focus: teamDraft.focus.trim() || "Servicio congregacional",
    };
    update(group.id, {
      serviceTeams: [...(group.serviceTeams ?? []), nextTeam],
      history: [
        {
          id: `GH-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          action: `Equipo de servicio creado: ${nextTeam.name}`,
          actor: "Coordinación · demo",
        },
        ...(group.history ?? []),
      ],
    });
    setTeamDraft({ name: "", leaderPersonId: "", focus: "" });
  };

  const addAssignment = (group: ParishGroupDemo) => {
    const person = scopedMembers.find((p) => p.id === assignmentDraft.personId);
    if (!person || !assignmentDraft.role.trim()) return;
    const nextAssignment: AssignmentRecord = {
      id: `AS-${Date.now()}`,
      date: assignmentDraft.date || new Date().toISOString().slice(0, 10),
      personId: person.id,
      person: person.name,
      role: assignmentDraft.role.trim(),
      scope: assignmentDraft.scope.trim() || group.name,
      campusId: group.campusId,
      status: "Activa",
    };
    update(group.id, {
      assignments: [...(group.assignments ?? []), nextAssignment],
      history: [
        {
          id: `GH-${Date.now()}`,
          date: nextAssignment.date,
          action: `Asignación registrada: ${person.name} · ${nextAssignment.role}`,
          actor: "Coordinación · demo",
        },
        ...(group.history ?? []),
      ],
    });
    setAssignmentDraft({
      personId: "",
      role: "",
      scope: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const openEditGroup = (group: ParishGroupDemo) => {
    editForm.reset({
      name: group.name,
      kind: group.kind,
      department: group.department ?? "",
      leaderPersonId: group.leaderPersonId ?? "__manual__",
      coordinator: group.leader || group.coordinator,
      campusId: group.campusId ?? settings.campusId,
      schedule: group.schedule,
      purpose: group.purpose,
    });
    setEditDrawerOpen(true);
  };

  const toggleGroupStatus = (group: ParishGroupDemo) => {
    const nextStatus = group.status === "inactive" ? "active" : "inactive";
    update(group.id, {
      status: nextStatus,
      history: [
        {
          id: `GH-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          action: nextStatus === "inactive" ? "Grupo desactivado" : "Grupo reactivado",
          actor: "Coordinación · demo",
        },
        ...(group.history ?? []),
      ],
    });
  };

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: christian ? "Comunidad cristiana" : "Comunidad y pastoral" },
        { label: christian ? "Ministerios, grupos y células" : "Grupos, movimientos y ministerios" },
      ]}
      title={christian ? "Ministerios, grupos y células" : "Grupos, movimientos y ministerios"}
      description={
        christian
          ? "Ministerios, departamentos, células y grupos pequeños con integrantes vinculados al directorio real de miembros, líderes, equipos de servicio y asignaciones."
          : "Directorio comunitario de grupos, comunidades y equipos de servicio."
      }
      actions={
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Registrar grupo
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Grupos / ministerios"
            value={String(scoped.length)}
            icon={UsersRound}
            caption="Directorio local por organización"
          />
          <StatCard
            label="Integrantes vinculados"
            value={String(allMembers)}
            icon={Users}
            caption="Personas del directorio"
          />
          <StatCard
            label="Equipos de servicio"
            value={String(serviceTeamsCount)}
            icon={UserCog}
            caption="Equipos asignados"
          />
          <StatCard
            label="Asignaciones activas"
            value={String(assignments.filter((a) => a.status === "Activa").length)}
            icon={ClipboardList}
            caption="Servicios y responsabilidades"
          />
        </>
      }
    >
      <DemoNotice>
        {christian
          ? `Datos de ministerios y grupos asociados a ${settings.organizationId}. Los integrantes y asignaciones se vinculan mediante IDs reales del Área 1 (sin duplicar personas).`
          : "Coordinadores e integrantes son referencias ficticias. Las cifras reflejan ejemplos locales."}
      </DemoNotice>

      <FilterBar label="Directorio">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre, tipo, líder o departamento"
          className="w-full sm:w-80"
        />
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {kinds.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={campus} onValueChange={setCampus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sede" />
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
        <Select value={personLookupId} onValueChange={setPersonLookupId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Persona vinculada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las personas</SelectItem>
            {scopedMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="pending">En revisión</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="directory">Directorio y fichas</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones y equipos</TabsTrigger>
          <TabsTrigger value="byPerson">Consulta por persona</TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="space-y-4">
          <DataTable
            rows={visible}
            columns={columns}
            getRowId={(g) => g.id}
            onRowClick={(g) => {
              setMemberError(null);
              setSelectedId(g.id);
            }}
            emptyTitle="Sin resultados"
            emptyDescription="Ajusta los filtros de búsqueda."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setMemberError(null);
                  setSelectedId(group.id);
                }}
                className="rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {group.kind}
                    </span>
                    <h3 className="mt-2 font-semibold">{group.name}</h3>
                  </div>
                  <UsersRound className="size-5 text-primary" />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{group.purpose}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <span>
                    <span className="text-muted-foreground">Líder:</span>{" "}
                    {group.leader || group.coordinator}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Sede:</span> {group.campusId || "—"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span>{group.memberList?.length ?? group.members} integrantes</span>
                  <StatusBadge status={group.status} />
                </div>
                <Progress value={group.participation} className="mt-2" />
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="assignments">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">
                Asignaciones, equipos de servicio e historial operativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                rows={assignments}
                columns={assignmentColumns}
                getRowId={(a) => a.id}
                emptyTitle="Sin asignaciones"
                emptyDescription="Registra asignaciones dentro de cada ficha de grupo."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="byPerson" className="grid gap-3 md:grid-cols-2">
          {personGroupsSummary.map(({ person, groups }) => (
            <Card key={person.id} className="shadow-none">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {person.id} · {person.campusId ?? settings.campusId}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                    {groups.length} grupo(s)
                  </span>
                </div>
                {groups.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin ministerios o grupos asignados.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedId(g.id)}
                        className="rounded border px-2 py-1 text-xs hover:bg-muted"
                      >
                        {g.name} ({g.kind})
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <FormModal
        title="Registrar ministerio / grupo"
        description="Crea un grupo local asociado a la organización y sede."
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) form.reset();
        }}
        form={form}
        submitLabel="Registrar"
        onSubmit={(values) => {
          const normalizedName = values.name.trim();
          if (normalizedName.length < 3) {
            form.setError("name", { message: "Ingresa al menos 3 caracteres." });
            throw new Error("Nombre inválido");
          }
          if (
            scoped.some(
              (g) =>
                g.name.trim().toLowerCase() === normalizedName.toLowerCase() &&
                (g.campusId ?? settings.campusId) === (values.campusId || settings.campusId),
            )
          ) {
            form.setError("name", {
              message: "Ya existe un grupo o ministerio con ese nombre en la sede.",
            });
            throw new Error("Grupo duplicado");
          }
          const leaderPerson =
            values.leaderPersonId && values.leaderPersonId !== "__manual__"
              ? scopedMembers.find((m) => m.id === values.leaderPersonId)
              : undefined;
          const leaderName = leaderPerson?.name || values.coordinator.trim() || "Responsable · demo";
          const dept = values.department.trim();
          const newGroup: ParishGroupDemo = {
            id: `${christian ? "GRP-CRI" : "GRP-DEMO"}-${Date.now()}`,
            name: normalizedName,
            kind: values.kind as ParishGroupDemo["kind"],
            coordinator: leaderName,
            leader: leaderName,
            leaderPersonId: leaderPerson?.id,
            members: leaderPerson ? 1 : 0,
            schedule: values.schedule.trim() || "Por definir",
            nextActivity: "Por programar",
            participation: 0,
            status: "active",
            purpose: values.purpose.trim() || "Grupo creado en modo demostración.",
            activities: [],
            organizationId: settings.organizationId,
            campusId: values.campusId.trim() || settings.campusId,
            memberList: leaderPerson
              ? [
                  {
                    id: `GM-${Date.now()}`,
                    personId: leaderPerson.id,
                    name: leaderPerson.name,
                    role: "Líder / responsable",
                    joinedAt: new Date().toISOString().slice(0, 10),
                    status: "Activo",
                  },
                ]
              : [],
            serviceTeams: [],
            assignments: [],
            history: [
              {
                id: `GH-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                action: "Grupo creado",
                actor: "Usuario · demo",
              },
            ],
          };
          if (dept) newGroup.department = dept;
          create(newGroup);
        }}
      >
        <FormSection title="Datos del grupo" description="Ministerio, departamento, célula o equipo de servicio.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField control={form.control} name="name" label="Nombre" required placeholder="Nombre del grupo" />
            <SelectInputField
              control={form.control}
              name="kind"
              label="Tipo"
              options={kinds.map((k) => ({ value: k, label: k }))}
            />
            <TextInputField control={form.control} name="department" label="Ministerio / departamento" placeholder="Área organizacional" />
            <SelectInputField
              control={form.control}
              name="leaderPersonId"
              label="Líder desde directorio"
              options={[
                { value: "__manual__", label: "Ingresar manualmente" },
                ...scopedMembers.map((m) => ({ value: m.id, label: `${m.name} (${m.id})` })),
              ]}
            />
            <TextInputField control={form.control} name="coordinator" label={christian ? settings.terminology.leaderLabel : "Líder / responsable"} placeholder="Nombre si no está en directorio" />
            <TextInputField control={form.control} name="campusId" label={settings.terminology.campusLabel} placeholder={settings.campusId} />
            <TextInputField control={form.control} name="schedule" label="Horario habitual" placeholder="Ej. Jueves · 7:00 p. m." />
            <TextInputField control={form.control} name="purpose" label="Propósito / función" placeholder="Descripción breve" />
          </div>
        </FormSection>
      </FormModal>

      <FormDrawer
        form={editForm}
        open={editDrawerOpen && !!selected}
        onOpenChange={setEditDrawerOpen}
        title={selected ? `Editar · ${selected.name}` : "Editar grupo"}
        submitLabel="Guardar cambios"
        onSubmit={(values) => {
          if (!selected) return;
          const name = values.name.trim();
          if (name.length < 3) {
            editForm.setError("name", { message: "Ingresa al menos 3 caracteres." });
            throw new Error("Nombre inválido");
          }
          const leaderPerson =
            values.leaderPersonId && values.leaderPersonId !== "__manual__"
              ? scopedMembers.find((m) => m.id === values.leaderPersonId)
              : undefined;
          const leaderName = leaderPerson?.name || values.coordinator.trim() || selected.coordinator;
          update(selected.id, {
            name,
            kind: values.kind as ParishGroupDemo["kind"],
            department: values.department.trim() || undefined,
            leaderPersonId: leaderPerson?.id,
            leader: leaderName,
            coordinator: leaderName,
            campusId: values.campusId.trim() || selected.campusId,
            schedule: values.schedule.trim() || selected.schedule,
            purpose: values.purpose.trim() || selected.purpose,
            history: [
              {
                id: `GH-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                action: "Datos del grupo actualizados",
                actor: "Coordinación · demo",
              },
              ...(selected.history ?? []),
            ],
          });
        }}
      >
        <FormSection title="Configuración del grupo">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInputField control={editForm.control} name="name" label="Nombre" required />
            <SelectInputField
              control={editForm.control}
              name="kind"
              label="Tipo"
              options={kinds.map((k) => ({ value: k, label: k }))}
            />
            <TextInputField control={editForm.control} name="department" label="Departamento" />
            <SelectInputField
              control={editForm.control}
              name="leaderPersonId"
              label="Líder desde directorio"
              options={[
                { value: "__manual__", label: "Manual" },
                ...scopedMembers.map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
            <TextInputField control={editForm.control} name="coordinator" label="Nombre del líder" />
            <TextInputField control={editForm.control} name="campusId" label={settings.terminology.campusLabel} />
            <TextInputField control={editForm.control} name="schedule" label="Horario" />
            <TextInputField control={editForm.control} name="purpose" label="Propósito" />
          </div>
        </FormSection>
      </FormDrawer>

      <DetailDrawer
        open={!!selected && !editDrawerOpen}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.name ?? "Ficha de grupo"}
        description={
          selected
            ? `${selected.kind} · ${selected.id} · ${selected.campusId ?? settings.campusId}`
            : undefined
        }
      >
        {selected && (
          <Tabs defaultValue="info">
            <TabsList className="mb-4 flex h-auto flex-wrap">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="members">Integrantes</TabsTrigger>
              <TabsTrigger value="teams">Equipos y asignaciones</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Tipo">{selected.kind}</InfoItem>
                <InfoItem label="Estado">
                  <StatusBadge status={selected.status} />
                </InfoItem>
                <InfoItem label="Departamento">{selected.department || "—"}</InfoItem>
                <InfoItem label="Líder">{selected.leader || selected.coordinator}</InfoItem>
                <InfoItem label={settings.terminology.campusLabel}>
                  {selected.campusId || "—"}
                </InfoItem>
                <InfoItem label="Organización">
                  {selected.organizationId || settings.organizationId}
                </InfoItem>
                <InfoItem label="Reunión habitual">{selected.schedule}</InfoItem>
                <InfoItem label="Próxima actividad">{selected.nextActivity}</InfoItem>
              </div>
              <InfoItem label="Propósito">{selected.purpose}</InfoItem>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Participación</span>
                  <span>{selected.participation}%</span>
                </div>
                <Progress value={selected.participation} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEditGroup(selected)}>
                  <Pencil className="size-3.5" />
                  Editar grupo
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleGroupStatus(selected)}>
                  <Power className="size-3.5" />
                  {selected.status === "inactive" ? "Reactivar grupo" : "Desactivar grupo"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="members" className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold">Vincular integrante desde el directorio de miembros</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select
                    value={memberDraft.personId}
                    onValueChange={(v) => {
                      setMemberError(null);
                      setMemberDraft((d) => ({ ...d, personId: v }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona miembro/visitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopedMembers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Rol en el grupo (ej. Integrante, Músico)"
                    value={memberDraft.role}
                    onChange={(e) => setMemberDraft((d) => ({ ...d, role: e.target.value }))}
                  />
                </div>
                {memberError && (
                  <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    {memberError}
                  </p>
                )}
                <Button size="sm" variant="outline" onClick={() => linkMemberToGroup(selected)}>
                  Vincular integrante
                </Button>
              </div>

              <h3 className="text-sm font-semibold">
                Integrantes ({selected.memberList?.length ?? selected.members})
              </h3>
              {(selected.memberList ?? []).length === 0 ? (
                <p className="rounded border border-dashed p-4 text-sm text-muted-foreground">
                  No hay integrantes vinculados todavía.
                </p>
              ) : (
                (selected.memberList ?? []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.personId ? `${m.personId} · ` : ""}
                        {m.role} · Desde {m.joinedAt}
                      </p>
                    </div>
                    <span className="text-xs">{m.status}</span>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="teams" className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold">Crear equipo de servicio</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Nombre del equipo"
                    value={teamDraft.name}
                    onChange={(e) => setTeamDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                  <Select
                    value={teamDraft.leaderPersonId}
                    onValueChange={(v) => setTeamDraft((d) => ({ ...d, leaderPersonId: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Líder (opcional)" /></SelectTrigger>
                    <SelectContent>
                      {scopedMembers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enfoque"
                    value={teamDraft.focus}
                    onChange={(e) => setTeamDraft((d) => ({ ...d, focus: e.target.value }))}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => addServiceTeam(selected)}>
                  Agregar equipo
                </Button>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Equipos de servicio</h3>
                {(selected.serviceTeams ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin equipos registrados.</p>
                ) : (
                  (selected.serviceTeams ?? []).map((t) => (
                    <div key={t.id} className="mb-2 rounded-lg border p-3 text-sm">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Líder: {t.leader} · {t.focus}
                      </p>
                      <p className="mt-1 text-xs">
                        Integrantes: {t.members.join(", ") || "Por asignar"}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold">Registrar asignación de responsabilidad</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select
                    value={assignmentDraft.personId}
                    onValueChange={(v) => setAssignmentDraft((d) => ({ ...d, personId: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Persona del directorio" /></SelectTrigger>
                    <SelectContent>
                      {scopedMembers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Rol / responsabilidad"
                    value={assignmentDraft.role}
                    onChange={(e) => setAssignmentDraft((d) => ({ ...d, role: e.target.value }))}
                  />
                  <Input
                    placeholder="Alcance / culto / actividad"
                    value={assignmentDraft.scope}
                    onChange={(e) => setAssignmentDraft((d) => ({ ...d, scope: e.target.value }))}
                  />
                  <Input
                    type="date"
                    value={assignmentDraft.date}
                    onChange={(e) => setAssignmentDraft((d) => ({ ...d, date: e.target.value }))}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => addAssignment(selected)}>
                  Agregar asignación
                </Button>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Asignaciones</h3>
                {(selected.assignments ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin asignaciones registradas.</p>
                ) : (
                  (selected.assignments ?? []).map((a) => (
                    <div key={a.id} className="mb-2 rounded-lg border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{a.person}</span>
                        <StatusBadge
                          status={a.status === "Activa" ? "active" : "approved"}
                          label={a.status}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a.role} · {a.scope} · {a.date}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-3">
              <ActivityTimeline
                entries={[
                  ...(selected.history ?? []).map((h) => ({
                    id: h.id,
                    title: h.action,
                    description: "Historial del grupo",
                    date: h.date,
                    actor: h.actor,
                  })),
                  ...selected.activities.map((a, i) => ({
                    id: `act-${i}`,
                    title: a,
                    description: selected.nextActivity,
                    date: "Actividad",
                    actor: selected.coordinator,
                  })),
                ]}
              />
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
