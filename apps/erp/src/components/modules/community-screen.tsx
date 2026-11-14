import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  Download,
  Droplets,
  MapPin,
  Pencil,
  Plus,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import {
  ActivityTimeline,
  DataTable,
  type DataTableColumn,
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
  DemoNotice,
} from "@/components/modules";
import {
  FormDrawer,
  FormModal,
  FormSection,
  SelectInputField,
  TextInputField,
  EmailInputField,
} from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  catholicFamilies,
  christianFamilies,
  christianMembers,
  parishioners,
  type CongregationalBaptism,
  type FamilyEntity,
  type MembershipStatus,
  type ParishionerDemo,
  type ParticipationRecord,
} from "@/data/community-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

type ParishionerFormValues = {
  name: string;
  id: string;
  email: string;
  phone: string;
  address: string;
  sector: string;
  familyId: string;
  familyName: string;
  relationship: string;
  membershipStatus: MembershipStatus;
  memberSince: string;
  personType: "Miembro" | "Visitante";
  firstVisitDate: string;
  campusId: string;
  notes: string;
};

type FamilyFormValues = {
  name: string;
  address: string;
  sector: string;
  campusId: string;
  notes: string;
};

const membershipOptions: MembershipStatus[] = [
  "Miembro activo",
  "En proceso",
  "Visitante",
  "Inactivo",
  "Trasladado",
];

const baptismPractices: CongregationalBaptism["practice"][] = [
  "Por inmersión",
  "Por aspersión",
  "Afirmación de fe",
  "Otra práctica",
];

const participationTypes: ParticipationRecord["type"][] = [
  "Culto",
  "Ministerio",
  "Grupo",
  "Evento",
  "Visita",
  "Formación",
];

export function CommunityScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;

  const [tab, setTab] = useState("people");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [membership, setMembership] = useState("all");
  const [personType, setPersonType] = useState("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState(christian ? "FAM-CRI-01" : "FAM-DEMO-01");
  const [formOpen, setFormOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [familyModalOpen, setFamilyModalOpen] = useState(false);

  const [baptismForm, setBaptismForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    practice: "Por inmersión" as CongregationalBaptism["practice"],
    place: `Auditorio · ${settings.campusId}`,
    officiant: "",
    notes: "",
  });

  const [participationForm, setParticipationForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "Culto" as ParticipationRecord["type"],
    detail: "",
  });

  const form = useForm<ParishionerFormValues>({
    defaultValues: {
      name: "",
      id: "",
      email: "",
      phone: "",
      address: "",
      sector: "",
      familyId: "__new__",
      familyName: "",
      relationship: "Integrante familiar",
      membershipStatus: "Miembro activo",
      memberSince: "",
      personType: "Miembro",
      firstVisitDate: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
      notes: "",
    },
    mode: "onBlur",
  });

  const editForm = useForm<ParishionerFormValues>({ mode: "onBlur" });
  const familyForm = useForm<FamilyFormValues>({
    defaultValues: {
      name: "",
      address: "",
      sector: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
      notes: "",
    },
    mode: "onBlur",
  });

  const { records, create, update, remove } = useLocalCollection(
    getProfileStorageKey("ao-erp:community:parishioners", settings.profile),
    christian ? christianMembers : parishioners,
  );
  const familyStore = useLocalCollection<FamilyEntity>(
    getProfileStorageKey("ao-erp:community:families", settings.profile),
    christian ? christianFamilies : catholicFamilies,
  );

  const scopedRecords = useMemo(
    () => records.filter((p) => !p.organizationId || p.organizationId === settings.organizationId),
    [records, settings.organizationId],
  );
  const scopedFamilies = useMemo(
    () =>
      familyStore.records.filter(
        (f) => !f.organizationId || f.organizationId === settings.organizationId,
      ),
    [familyStore.records, settings.organizationId],
  );

  const selected = useMemo(
    () => scopedRecords.find((p) => p.id === selectedId) ?? null,
    [scopedRecords, selectedId],
  );

  const families = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        address?: string | undefined;
        sector?: string | undefined;
        campusId?: string | undefined;
        members: ParishionerDemo[];
      }
    >();
    for (const fam of scopedFamilies) {
      map.set(fam.id, {
        id: fam.id,
        name: fam.name,
        address: fam.address,
        sector: fam.sector,
        campusId: fam.campusId,
        members: [],
      });
    }
    for (const person of scopedRecords) {
      const key = person.familyId || `FAM-${person.id}`;
      const existing = map.get(key);
      if (existing) {
        existing.members.push(person);
      } else {
        map.set(key, {
          id: key,
          name: person.familyName || "Familia sin nombre",
          address: person.address,
          sector: person.sector,
          campusId: person.campusId,
          members: [person],
        });
      }
    }
    return [...map.values()];
  }, [scopedFamilies, scopedRecords]);

  const campuses = useMemo(
    () => [...new Set(scopedRecords.map((p) => p.campusId).filter(Boolean))] as string[],
    [scopedRecords],
  );

  const visiblePeople = useMemo(
    () =>
      scopedRecords.filter((person) => {
        const haystack = `${person.name} ${person.id} ${person.familyName} ${person.sector} ${person.email} ${person.phone} ${person.membershipStatus ?? ""} ${person.personType ?? ""}`
          .toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
        if (status !== "all" && person.status !== status) return false;
        if (membership !== "all" && (person.membershipStatus ?? "Miembro activo") !== membership)
          return false;
        if (personType !== "all" && (person.personType ?? "Miembro") !== personType) return false;
        if (familyFilter !== "all" && person.familyId !== familyFilter) return false;
        if (campusFilter !== "all" && (person.campusId ?? "") !== campusFilter) return false;
        return true;
      }),
    [scopedRecords, query, status, membership, personType, familyFilter, campusFilter],
  );

  const activeFamily = families.find((f) => f.id === familyId) ?? families[0];
  const familyMembers = activeFamily
    ? scopedRecords.filter((person) => person.familyId === activeFamily.id)
    : [];

  const exportCsv = () => {
    if (typeof window === "undefined") return;
    const header = ["ID", "Nombre", "Tipo", "Membresía", "Correo", "Teléfono", "Familia", "Relación", "Sede"];
    const rows = visiblePeople.map((p) => [
      p.id,
      p.name,
      p.personType ?? "Miembro",
      p.membershipStatus ?? "",
      p.email,
      p.phone,
      p.familyName,
      p.relationship,
      p.campusId ?? "",
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comunidad-${settings.organizationId.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openEditPerson = (person: ParishionerDemo) => {
    editForm.reset({
      name: person.name,
      id: person.id,
      email: person.email,
      phone: person.phone,
      address: person.address,
      sector: person.sector,
      familyId: scopedFamilies.some((f) => f.id === person.familyId) ? person.familyId : "__new__",
      familyName: person.familyName,
      relationship: person.relationship,
      membershipStatus: person.membershipStatus ?? "Miembro activo",
      memberSince: person.memberSince ?? "",
      personType: person.personType ?? "Miembro",
      firstVisitDate: person.firstVisitDate ?? "",
      campusId: person.campusId ?? settings.campusId,
      notes: person.notes ?? "",
    });
    setEditDrawerOpen(true);
  };

  const advanceIntegration = (person: ParishionerDemo) => {
    const today = new Date().toISOString().slice(0, 10);
    const nextMembership: MembershipStatus =
      person.membershipStatus === "Visitante" ? "En proceso" : "Miembro activo";
    const nextType: "Miembro" | "Visitante" =
      nextMembership === "Miembro activo" ? "Miembro" : person.personType;
    const nextStatus = nextMembership === "Miembro activo" ? "active" : person.status;
    const historyEntry: ParticipationRecord = {
      id: `PH-${Date.now()}`,
      date: today,
      type: "Visita",
      detail:
        nextMembership === "En proceso"
          ? "Visitante iniciado en proceso de integración"
          : "Integración completada como miembro activo",
      campusId: person.campusId,
    };
    update(person.id, {
      membershipStatus: nextMembership,
      personType: nextType,
      status: nextStatus,
      memberSince:
        nextMembership === "Miembro activo" ? person.memberSince || today : person.memberSince,
      updatedAt: today,
      participationHistory: [historyEntry, ...(person.participationHistory ?? [])],
    });
  };

  const columns: DataTableColumn<ParishionerDemo>[] = [
    {
      id: "person",
      header: christian ? terms.memberLabel : "Feligres",
      cell: (person) => (
        <div>
          <p className="font-semibold">{person.name}</p>
          <p className="text-xs text-muted-foreground">
            {person.id} · {person.personType ?? "Miembro"}
          </p>
        </div>
      ),
    },
    {
      id: "family",
      header: "Familia / relación",
      cell: (person) => (
        <div>
          {person.familyName}
          <p className="text-xs text-muted-foreground">{person.relationship}</p>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contacto",
      cell: (person) => (
        <div className="text-xs">
          <p>{person.email}</p>
          <p className="text-muted-foreground">{person.phone}</p>
        </div>
      ),
    },
    {
      id: "membership",
      header: "Membresía / ingreso",
      cell: (person) => (
        <div>
          <p className="text-xs font-medium">{person.membershipStatus ?? "Miembro activo"}</p>
          <p className="text-xs text-muted-foreground">
            {person.memberSince
              ? `Ingreso: ${person.memberSince}`
              : person.firstVisitDate
                ? `Primera visita: ${person.firstVisitDate}`
                : "Sin fecha registrada"}
          </p>
        </div>
      ),
    },
    {
      id: "sector",
      header: "Sector / sede",
      cell: (person) => (person.campusId ? `${person.sector} · ${person.campusId}` : person.sector),
    },
    { id: "status", header: "Estado", cell: (person) => <StatusBadge status={person.status} /> },
  ];

  const title = christian ? `${terms.membersLabel} y comunidad` : "Feligreses y familias";
  const description = christian
    ? "Registro completo de miembros, visitantes en integración, familias, participación y bautismos congregacionales por organización y sede (demo local)."
    : "Directorio comunitario y vínculos familiares de muestra. La información personal aparece en la ficha individual.";

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: christian ? "Comunidad cristiana" : "Comunidad y pastoral" },
        { label: title },
      ]}
      title={title}
      description={description}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="size-4" />
            Exportar vista
          </Button>
          {christian && (
            <Button variant="outline" className="gap-2" onClick={() => setFamilyModalOpen(true)}>
              <UsersRound className="size-4" />
              Nueva familia
            </Button>
          )}
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            {christian ? `Nuevo ${terms.memberLabel.toLowerCase()}` : "Nuevo registro"}
          </Button>
        </div>
      }
      stats={
        <>
          <StatCard
            label={christian ? terms.membersLabel : "Registros de muestra"}
            value={String(scopedRecords.length)}
            icon={Users}
            caption={christian ? "Personas en la organización" : "Directorio comunitario"}
          />
          <StatCard
            label="Familias"
            value={String(families.length)}
            icon={UsersRound}
            caption="Grupos familiares y relaciones"
          />
          <StatCard
            label="Visitantes / integración"
            value={String(
              scopedRecords.filter(
                (p) =>
                  (p.personType ?? "Miembro") === "Visitante" ||
                  p.membershipStatus === "En proceso",
              ).length,
            )}
            icon={UserCheck}
            caption="Seguimiento de integración"
          />
          <StatCard
            label="Bautismos registrados"
            value={String(
              scopedRecords.reduce((n, p) => n + (p.congregationalBaptisms?.length ?? 0), 0),
            )}
            icon={Droplets}
            caption={christian ? "Según práctica congregacional" : "Referencias de muestra"}
          />
        </>
      }
    >
      <DemoNotice>
        {christian
          ? `Datos de ${terms.membersLabel.toLowerCase()}s y familias en almacenamiento local demostrativo (${settings.organizationId} / ${settings.campusId}). Al desactivar el paquete A&O Cristiano la información se conserva y el acceso se bloquea por suscripción.`
          : "Personas e identificaciones ficticias. La consulta de datos personales y sacramentales debe limitarse a la finalidad pastoral autorizada."}
      </DemoNotice>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="people">Directorio</TabsTrigger>
          <TabsTrigger value="families">Familias y relaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="people" className="space-y-4">
          <FilterBar>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={
                christian
                  ? "Buscar por nombre, ID, familia, contacto o membresía"
                  : "Buscar por nombre, ID, familia o sector"
              }
              className="w-full sm:w-80"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="pending">En revisión</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            {christian && (
              <>
                <Select value={membership} onValueChange={setMembership}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Membresía" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toda membresía</SelectItem>
                    {membershipOptions.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={personType} onValueChange={setPersonType}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Miembros y visitantes</SelectItem>
                    <SelectItem value="Miembro">Miembros</SelectItem>
                    <SelectItem value="Visitante">Visitantes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={familyFilter} onValueChange={setFamilyFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Familia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las familias</SelectItem>
                    {families.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={campusFilter} onValueChange={setCampusFilter}>
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
              </>
            )}
          </FilterBar>
          <DataTable
            rows={visiblePeople}
            columns={columns}
            getRowId={(person) => person.id}
            onRowClick={(person) => setSelectedId(person.id)}
            emptyTitle="No hay coincidencias"
            emptyDescription="Ajusta la búsqueda o los filtros."
          />
          <p className="text-xs text-muted-foreground">
            Mostrando {visiblePeople.length} registros · Selecciona una fila para abrir la ficha
            individual.
          </p>
        </TabsContent>
        <TabsContent
          value="families"
          className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {families.map((family) => (
              <button
                key={family.id}
                onClick={() => setFamilyId(family.id)}
                className={`rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 ${activeFamily?.id === family.id ? "border-primary ring-1 ring-primary/15" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{family.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {family.id} · {family.members.length} integrante(s)
                    </p>
                  </div>
                  <UsersRound className="size-5 text-primary" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {family.sector || family.members[0]?.sector || "Sector no definido"}
                  {(family.campusId || family.members[0]?.campusId)
                    ? ` · ${family.campusId || family.members[0]?.campusId}`
                    : ""}
                </p>
              </button>
            ))}
          </div>
          <div className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">Integrantes y relaciones familiares</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Relaciones registradas para {activeFamily?.name ?? familyId}.
              </p>
            </div>
            <div className="divide-y">
              {familyMembers.map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelectedId(person.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.relationship} · {person.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {christian && (
                      <span className="text-xs text-muted-foreground">
                        {person.membershipStatus ?? "Miembro activo"}
                      </span>
                    )}
                    <StatusBadge status={person.status} />
                  </div>
                </button>
              ))}
              {familyMembers.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  No hay integrantes registrados para esta familia.
                </p>
              )}
            </div>
            {(activeFamily?.address || familyMembers[0]) && (
              <div className="border-t p-4 text-xs text-muted-foreground">
                <MapPin className="mr-1 inline size-3.5" />
                {activeFamily?.address || familyMembers[0]?.address} ·{" "}
                {activeFamily?.sector || familyMembers[0]?.sector}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FormModal
        title={christian ? `Registrar ${terms.memberLabel.toLowerCase()} o visitante` : "Agregar persona de muestra"}
        description={
          christian
            ? "Registro local demostrativo con datos de contacto, familia, membresía, ingreso y sede."
            : "El registro se incorpora al directorio local de la demostración."
        }
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) form.reset();
        }}
        form={form}
        submitLabel="Crear registro"
        onSubmit={(values) => {
          const name = values.name.trim();
          if (name.length < 2) {
            form.setError("name", { message: "Ingresa el nombre de la persona." });
            throw new Error("Nombre inválido.");
          }
          const id = values.id.trim() || `${christian ? "MBR" : "FEL"}-DEMO-${Date.now()}`;
          if (records.some((p) => p.id === id)) {
            form.setError("id", { message: "Ya existe un registro con ese identificador." });
            throw new Error("Identificador duplicado.");
          }
          const selectedFam =
            values.familyId && values.familyId !== "__new__"
              ? scopedFamilies.find((f) => f.id === values.familyId)
              : undefined;
          const resolvedFamilyName =
            selectedFam?.name || values.familyName.trim() || "Familia nueva · demo";
          const resolvedFamilyId =
            selectedFam?.id ||
            `FAM-${resolvedFamilyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}-${Date.now().toString().slice(-4)}`;

          if (!selectedFam && values.familyName.trim()) {
            familyStore.create({
              id: resolvedFamilyId,
              name: resolvedFamilyName,
              address: values.address.trim() || "Dirección pendiente",
              sector: values.sector.trim() || "Centro",
              organizationId: settings.organizationId,
              campusId: values.campusId.trim() || settings.campusId,
            });
          }

          const newPerson: ParishionerDemo = {
            id,
            name,
            age: 0,
            email: values.email.trim() || "persona@example.test",
            phone: values.phone.trim() || "Dato pendiente · demo",
            address: values.address.trim() || selectedFam?.address || "Dirección pendiente · demo",
            sector: values.sector.trim() || selectedFam?.sector || "Centro",
            parish: christian ? `${terms.institutionLabel} · ${settings.organizationId}` : parishioners[0]?.parish ?? "Comunidad demo",
            organizationId: settings.organizationId,
            campusId: values.campusId.trim() || settings.campusId,
            familyId: resolvedFamilyId,
            familyName: resolvedFamilyName,
            relationship: values.relationship.trim() || "Integrante familiar",
            pastoral: [],
            status: values.personType === "Visitante" ? "pending" : "active",
            membershipStatus: values.personType === "Visitante" ? "Visitante" : values.membershipStatus,
            personType: values.personType,
            updatedAt: new Date().toISOString().slice(0, 10),
            sacraments: [],
            participationHistory: [],
            congregationalBaptisms: [],
            notes: values.notes.trim() || undefined,
          };
          if (values.personType === "Miembro") {
            newPerson.memberSince = values.memberSince || new Date().toISOString().slice(0, 10);
          }
          if (values.personType === "Visitante") {
            newPerson.firstVisitDate = values.firstVisitDate || new Date().toISOString().slice(0, 10);
          }
          create(newPerson);
        }}
      >
        <FormSection
          title="Datos personales y contacto"
          description="Información básica para la ficha individual."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField control={form.control} name="name" label="Nombre completo" required placeholder="Persona de muestra" />
            <TextInputField control={form.control} name="id" label="Identificador" placeholder={christian ? "MBR-DEMO-000" : "FEL-DEMO-000"} />
            <EmailInputField control={form.control} name="email" label="Correo" placeholder="persona@example.test" />
            <TextInputField control={form.control} name="phone" label="Teléfono" placeholder="+57 300 000 0000" />
            <TextInputField control={form.control} name="address" label="Dirección" placeholder="Dirección de contacto" />
            <TextInputField control={form.control} name="sector" label="Sector / barrio" placeholder="Sector" />
          </div>
        </FormSection>
        <FormSection title="Familia y relaciones" description="Vincula a una familia existente o crea un núcleo nuevo.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInputField
              control={form.control}
              name="familyId"
              label="Familia existente"
              options={[
                { value: "__new__", label: "Crear nueva familia" },
                ...scopedFamilies.map((f) => ({ value: f.id, label: `${f.name} (${f.id})` })),
              ]}
            />
            <TextInputField control={form.control} name="familyName" label="Nombre familia (si es nueva)" placeholder="Familia de muestra" />
            <TextInputField control={form.control} name="relationship" label="Relación" placeholder="Responsable familiar, cónyuge, hijo(a)..." />
          </div>
        </FormSection>
        <FormSection
          title={christian ? "Membresía, ingreso y sede" : "Información comunitaria"}
          description={
            christian
              ? "Estado de membresía, fecha de ingreso o primera visita y sede/congregación."
              : "Datos de referencia comunitaria."
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {christian && (
              <>
                <SelectInputField
                  control={form.control}
                  name="personType"
                  label="Tipo de persona"
                  options={[
                    { value: "Miembro", label: "Miembro" },
                    { value: "Visitante", label: "Visitante" },
                  ]}
                />
                <SelectInputField
                  control={form.control}
                  name="membershipStatus"
                  label="Estado de membresía"
                  options={membershipOptions.map((m) => ({ value: m, label: m }))}
                />
                <TextInputField control={form.control} name="memberSince" label="Fecha de ingreso" type="date" />
                <TextInputField control={form.control} name="firstVisitDate" label="Primera visita (si aplica)" type="date" />
                <TextInputField control={form.control} name="campusId" label={terms.campusLabel} placeholder={settings.campusId} />
              </>
            )}
          </div>
        </FormSection>
      </FormModal>

      <FormModal
        title="Registrar familia"
        description="Crea un núcleo familiar asociado a la organización y sede actual."
        open={familyModalOpen}
        onOpenChange={(open) => {
          setFamilyModalOpen(open);
          if (!open) familyForm.reset();
        }}
        form={familyForm}
        submitLabel="Guardar familia"
        onSubmit={(values) => {
          const name = values.name.trim();
          if (name.length < 2) {
            familyForm.setError("name", { message: "Ingresa el nombre de la familia." });
            throw new Error("Nombre de familia inválido.");
          }
          const id = `FAM-${Date.now()}`;
          familyStore.create({
            id,
            name,
            address: values.address.trim() || "Dirección por definir",
            sector: values.sector.trim() || "Centro",
            organizationId: settings.organizationId,
            campusId: values.campusId.trim() || settings.campusId,
            notes: values.notes.trim() || undefined,
          });
          setFamilyId(id);
        }}
      >
        <FormSection title="Datos del núcleo familiar">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField control={familyForm.control} name="name" label="Nombre de la familia" required placeholder="Familia Pérez Gómez" />
            <TextInputField control={familyForm.control} name="sector" label="Sector / barrio" placeholder="Centro" />
            <TextInputField control={familyForm.control} name="address" label="Dirección" placeholder="Dirección familiar" />
            <TextInputField control={familyForm.control} name="campusId" label={terms.campusLabel} placeholder={settings.campusId} />
          </div>
        </FormSection>
      </FormModal>

      <FormDrawer
        form={editForm}
        open={editDrawerOpen && !!selected}
        onOpenChange={setEditDrawerOpen}
        title={selected ? `Editar · ${selected.name}` : "Editar registro"}
        description={selected ? `${selected.id} · ${settings.organizationId}` : ""}
        submitLabel="Guardar cambios"
        onSubmit={(values) => {
          if (!selected) return;
          const name = values.name.trim();
          if (name.length < 2) {
            editForm.setError("name", { message: "Ingresa al menos 2 caracteres." });
            throw new Error("Nombre inválido.");
          }
          const linkedFam =
            values.familyId && values.familyId !== "__new__"
              ? scopedFamilies.find((f) => f.id === values.familyId)
              : undefined;
          update(selected.id, {
            name,
            email: values.email.trim() || selected.email,
            phone: values.phone.trim() || selected.phone,
            address: values.address.trim() || selected.address,
            sector: values.sector.trim() || selected.sector,
            familyId: linkedFam?.id || selected.familyId,
            familyName: linkedFam?.name || values.familyName.trim() || selected.familyName,
            relationship: values.relationship.trim() || selected.relationship,
            membershipStatus: values.membershipStatus,
            memberSince: values.memberSince || selected.memberSince,
            firstVisitDate: values.firstVisitDate || selected.firstVisitDate,
            personType: values.personType,
            campusId: values.campusId.trim() || selected.campusId,
            notes: values.notes.trim() || undefined,
            status:
              values.membershipStatus === "Inactivo" || values.membershipStatus === "Trasladado"
                ? "inactive"
                : values.membershipStatus === "En proceso" || values.membershipStatus === "Visitante"
                  ? "pending"
                  : "active",
            updatedAt: new Date().toISOString().slice(0, 10),
          });
        }}
      >
        <FormSection title="Identidad y contacto">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInputField control={editForm.control} name="name" label="Nombre completo" required />
            <EmailInputField control={editForm.control} name="email" label="Correo" />
            <TextInputField control={editForm.control} name="phone" label="Teléfono" />
            <TextInputField control={editForm.control} name="address" label="Dirección" />
            <TextInputField control={editForm.control} name="sector" label="Sector" />
            <TextInputField control={editForm.control} name="campusId" label={terms.campusLabel} />
          </div>
        </FormSection>
        <FormSection title="Familia y membresía">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectInputField
              control={editForm.control}
              name="familyId"
              label="Familia vinculada"
              options={[
                { value: "__new__", label: "Mantener actual" },
                ...scopedFamilies.map((f) => ({ value: f.id, label: `${f.name} (${f.id})` })),
              ]}
            />
            <TextInputField control={editForm.control} name="relationship" label="Relación familiar" />
            {christian && (
              <>
                <SelectInputField
                  control={editForm.control}
                  name="personType"
                  label="Tipo"
                  options={[
                    { value: "Miembro", label: "Miembro" },
                    { value: "Visitante", label: "Visitante" },
                  ]}
                />
                <SelectInputField
                  control={editForm.control}
                  name="membershipStatus"
                  label="Estado de membresía"
                  options={membershipOptions.map((m) => ({ value: m, label: m }))}
                />
                <TextInputField control={editForm.control} name="memberSince" label="Fecha de ingreso" />
                <TextInputField control={editForm.control} name="firstVisitDate" label="Primera visita" />
              </>
            )}
          </div>
        </FormSection>
      </FormDrawer>

      <DetailDrawer
        open={!!selected && !editDrawerOpen}
        onOpenChange={(open) => !open && setSelectedId(null)}
        title={selected?.name ?? "Ficha individual"}
        description={
          selected
            ? `${selected.id} · ${selected.personType ?? "Miembro"}${selected.campusId ? ` · ${selected.campusId}` : ""}`
            : undefined
        }
      >
        {selected && (
          <Tabs defaultValue="personal">
            <TabsList className="mb-4 flex h-auto flex-wrap">
              <TabsTrigger value="personal">Personal y contacto</TabsTrigger>
              <TabsTrigger value="family">Familia</TabsTrigger>
              <TabsTrigger value="history">Participación</TabsTrigger>
              <TabsTrigger value="baptisms">{christian ? "Bautismos" : "Sacramentos"}</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Identificador">{selected.id}</InfoItem>
                <InfoItem label="Tipo">{selected.personType ?? "Miembro"}</InfoItem>
                <InfoItem label="Correo">{selected.email}</InfoItem>
                <InfoItem label="Teléfono">{selected.phone}</InfoItem>
                <InfoItem label="Dirección">{selected.address}</InfoItem>
                <InfoItem label="Sector">{selected.sector}</InfoItem>
                <InfoItem label={christian ? terms.campusLabel : "Comunidad"}>
                  {selected.campusId || selected.parish}
                </InfoItem>
                <InfoItem label="Membresía">{selected.membershipStatus ?? "Miembro activo"}</InfoItem>
                <InfoItem label="Fecha de ingreso">{selected.memberSince ?? "No registrada"}</InfoItem>
                <InfoItem label="Primera visita">{selected.firstVisitDate ?? "No aplica"}</InfoItem>
                <InfoItem label="Estado">
                  <StatusBadge status={selected.status} />
                </InfoItem>
                <InfoItem label="Organización">{selected.organizationId ?? settings.organizationId}</InfoItem>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEditPerson(selected)}>
                  <Pencil className="size-3.5" />
                  Editar ficha
                </Button>
                {christian && selected.membershipStatus !== "Miembro activo" && (
                  <Button size="sm" variant="outline" onClick={() => advanceIntegration(selected)}>
                    {selected.membershipStatus === "Visitante"
                      ? "Iniciar integración"
                      : "Confirmar membresía activa"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    remove(selected.id);
                    setSelectedId(null);
                  }}
                >
                  Eliminar registro
                </Button>
              </div>
              <DemoNotice>
                {christian
                  ? "Ficha asociada a organización/sede en almacenamiento local demostrativo. No es una base de datos productiva."
                  : "Datos ficticios enmascarados. Esta ficha no otorga acceso a documentos originales."}
              </DemoNotice>
            </TabsContent>
            <TabsContent value="family" className="space-y-4">
              <InfoItem label="Familia">
                {selected.familyName} · {selected.familyId}
              </InfoItem>
              <InfoItem label="Relación registrada">{selected.relationship}</InfoItem>
              <div className="space-y-2">
                {scopedRecords
                  .filter((person) => person.familyId === selected.familyId)
                  .map((person) => (
                    <div key={person.id} className="flex justify-between rounded-lg border p-3 text-sm">
                      <span>{person.name}</span>
                      <span className="text-muted-foreground">{person.relationship}</span>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <InfoItem label={christian ? "Participación / servicio" : "Grupos y servicio"}>
                {selected.pastoral.join(" · ") || "Sin registros"}
              </InfoItem>
              <InfoItem label="Última actualización">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  {selected.updatedAt}
                </span>
              </InfoItem>
              {christian && (
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs font-semibold">Registrar participación</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Select
                      value={participationForm.type}
                      onValueChange={(v) =>
                        setParticipationForm((f) => ({ ...f, type: v as ParticipationRecord["type"] }))
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {participationTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={participationForm.date}
                      onChange={(e) => setParticipationForm((f) => ({ ...f, date: e.target.value }))}
                    />
                    <Input
                      placeholder="Detalle"
                      value={participationForm.detail}
                      onChange={(e) => setParticipationForm((f) => ({ ...f, detail: e.target.value }))}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!participationForm.detail.trim()) return;
                      update(selected.id, {
                        updatedAt: participationForm.date,
                        participationHistory: [
                          {
                            id: `PH-${Date.now()}`,
                            date: participationForm.date,
                            type: participationForm.type,
                            detail: participationForm.detail.trim(),
                            campusId: selected.campusId,
                          },
                          ...(selected.participationHistory ?? []),
                        ],
                      });
                      setParticipationForm((f) => ({ ...f, detail: "" }));
                    }}
                  >
                    Agregar al historial
                  </Button>
                </div>
              )}
              <ActivityTimeline
                entries={[
                  ...(selected.participationHistory ?? []).map((h) => ({
                    id: h.id,
                    title: `${h.type}: ${h.detail}`,
                    description: h.campusId ? `Sede: ${h.campusId}` : "Registro de participación",
                    date: h.date,
                    actor: "Coordinación · demo",
                  })),
                  {
                    id: "upd-base",
                    title: "Ficha actualizada",
                    description: "Actualización demostrativa de datos.",
                    date: selected.updatedAt,
                    actor: "Equipo de muestra",
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value="baptisms" className="space-y-3">
              {christian ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Registro de bautismos según las prácticas de la congregación (demostrativo, sin
                    partida sacramental católica).
                  </p>
                  {(selected.congregationalBaptisms ?? []).length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      No hay bautismos congregacionales registrados para esta persona.
                    </p>
                  ) : (
                    (selected.congregationalBaptisms ?? []).map((b) => (
                      <div key={b.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{b.practice}</span>
                          <span className="text-xs text-muted-foreground">{b.date}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Lugar: {b.place} · Oficiante: {b.officiant}
                        </p>
                        {b.notes && <p className="mt-1 text-xs">{b.notes}</p>}
                      </div>
                    ))
                  )}
                  <div className="space-y-2 rounded-lg border p-3">
                    <p className="text-xs font-semibold">Registrar bautismo congregacional</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select
                        value={baptismForm.practice}
                        onValueChange={(v) =>
                          setBaptismForm((f) => ({
                            ...f,
                            practice: v as CongregationalBaptism["practice"],
                          }))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {baptismPractices.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={baptismForm.date}
                        onChange={(e) => setBaptismForm((f) => ({ ...f, date: e.target.value }))}
                      />
                      <Input
                        placeholder="Lugar"
                        value={baptismForm.place}
                        onChange={(e) => setBaptismForm((f) => ({ ...f, place: e.target.value }))}
                      />
                      <Input
                        placeholder="Oficiante / pastor"
                        value={baptismForm.officiant}
                        onChange={(e) => setBaptismForm((f) => ({ ...f, officiant: e.target.value }))}
                      />
                    </div>
                    <Input
                      placeholder="Observaciones (opcional)"
                      value={baptismForm.notes}
                      onChange={(e) => setBaptismForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!baptismForm.place.trim()) return;
                        update(selected.id, {
                          congregationalBaptisms: [
                            ...(selected.congregationalBaptisms ?? []),
                            {
                              id: `BAP-${Date.now()}`,
                              date: baptismForm.date,
                              practice: baptismForm.practice,
                              place: baptismForm.place.trim(),
                              officiant: baptismForm.officiant.trim() || "Pastor responsable · demo",
                              notes: baptismForm.notes.trim() || undefined,
                            },
                          ],
                        });
                        setBaptismForm((f) => ({ ...f, officiant: "", notes: "" }));
                      }}
                    >
                      Guardar bautismo
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Resumen de referencia con acceso restringido. No sustituye la consulta del libro
                    sacramental.
                  </p>
                  {selected.sacraments.map((name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <span>{name}</span>
                      <span className="text-xs text-muted-foreground">Referencia disponible</span>
                    </div>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
