import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, Download, Droplets, MapPin, Plus, UserCheck, Users, UsersRound } from "lucide-react";
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
import { FormModal, FormSection, SelectInputField, TextInputField, EmailInputField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parishioners, type MembershipStatus, type ParishionerDemo } from "@/data/community-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { isChristianProfile } from "@/lib/ao-cristiano-profile";

type ParishionerFormValues = {
  name: string;
  id: string;
  email: string;
  phone: string;
  sector: string;
  address: string;
  familyName: string;
  relationship: string;
  membershipStatus: MembershipStatus;
  memberSince: string;
  personType: "Miembro" | "Visitante";
  firstVisitDate: string;
  campusId: string;
};

const membershipOptions: MembershipStatus[] = ["Miembro activo", "En proceso", "Visitante", "Inactivo", "Trasladado"];

export function CommunityScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;
  const [tab, setTab] = useState("people");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [membership, setMembership] = useState("all");
  const [personType, setPersonType] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [selected, setSelected] = useState<ParishionerDemo | null>(null);
  const [familyId, setFamilyId] = useState("FAM-DEMO-01");
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm<ParishionerFormValues>({
    defaultValues: {
      name: "",
      id: "",
      email: "",
      phone: "",
      sector: "",
      address: "",
      familyName: "",
      relationship: "Integrante familiar",
      membershipStatus: "Miembro activo",
      memberSince: "",
      personType: "Miembro",
      firstVisitDate: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
    },
    mode: "onBlur",
  });
  const { records, create, update, remove } = useLocalCollection(
    "ao-erp:community:parishioners",
    parishioners,
  );
  const families = useMemo(() => {
    const map = new Map<string, { id: string; name: string; members: ParishionerDemo[] }>();
    for (const person of records) {
      const key = person.familyId || `FAM-${person.id}`;
      const existing = map.get(key);
      if (existing) {
        existing.members.push(person);
      } else {
        map.set(key, { id: key, name: person.familyName || "Familia sin nombre", members: [person] });
      }
    }
    return [...map.values()];
  }, [records]);
  const campuses = useMemo(
    () => [...new Set(records.map((p) => p.campusId).filter(Boolean))] as string[],
    [records],
  );
  const visiblePeople = useMemo(
    () =>
      records.filter((person) => {
        const haystack = `${person.name} ${person.id} ${person.familyName} ${person.sector} ${person.email} ${person.phone} ${person.membershipStatus ?? ""} ${person.personType ?? ""}`
          .toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
        if (status !== "all" && person.status !== status) return false;
        if (membership !== "all" && (person.membershipStatus ?? "Miembro activo") !== membership) return false;
        if (personType !== "all" && (person.personType ?? "Miembro") !== personType) return false;
        if (campusFilter !== "all" && (person.campusId ?? "") !== campusFilter) return false;
        return true;
      }),
    [records, query, status, membership, personType, campusFilter],
  );
  const familyMembers = records.filter((person) => person.familyId === familyId);

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
            {person.memberSince ? `Ingreso: ${person.memberSince}` : person.firstVisitDate ? `Primera visita: ${person.firstVisitDate}` : "Sin fecha registrada"}
          </p>
        </div>
      ),
    },
    { id: "sector", header: "Sector / sede", cell: (person) => person.campusId ? `${person.sector} · ${person.campusId}` : person.sector },
    { id: "status", header: "Estado", cell: (person) => <StatusBadge status={person.status} /> },
  ];

  const title = christian ? `${terms.membersLabel} y comunidad` : "Feligreses y familias";
  const description = christian
    ? "Registro de miembros, familias, visitantes y participación congregacional, asociado a organización y sede. Persistencia demostrativa local."
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
        <>
          <Button variant="outline" className="gap-2">
            <Download className="size-4" />
            Exportar vista
          </Button>
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            {christian ? `Nuevo ${terms.memberLabel.toLowerCase()}` : "Nuevo registro"}
          </Button>
        </>
      }
      stats={
        <>
          <StatCard label={christian ? terms.membersLabel : "Registros de muestra"} value={String(records.length)} icon={Users} caption={christian ? "Personas registradas (demo local)" : "Directorio comunitario"} />
          <StatCard label="Familias" value={String(families.length)} icon={UsersRound} caption="Grupos familiares / relaciones" />
          <StatCard label="Visitantes" value={String(records.filter((p) => (p.personType ?? "Miembro") === "Visitante").length)} icon={UserCheck} caption="Seguimiento de primeras visitas" />
          <StatCard label="Bautismos registrados" value={String(records.reduce((n, p) => n + (p.congregationalBaptisms?.length ?? 0), 0))} icon={Droplets} caption={christian ? "Según práctica congregacional" : "Referencias de muestra"} />
        </>
      }
    >
      <DemoNotice>
        {christian
          ? `Datos de ${terms.membersLabel.toLowerCase()}s y familias en almacenamiento local demostrativo, asociados a ${settings.organizationId} / ${settings.campusId}. Al desactivar el paquete A&O Cristiano la información se conserva y el acceso se bloquea por suscripción.`
          : "Personas e identificaciones ficticias. La consulta de datos personales y sacramentales debe limitarse a la finalidad pastoral autorizada."}
      </DemoNotice>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="people">Directorio</TabsTrigger>
          <TabsTrigger value="families">Familias y relaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="people" className="space-y-4">
          <FilterBar>
            <SearchInput value={query} onChange={setQuery} placeholder={christian ? "Buscar por nombre, ID, familia, contacto o membresía" : "Buscar por nombre, ID, familia o sector"} className="w-full sm:w-80" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
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
                  <SelectTrigger className="w-44"><SelectValue placeholder="Membresía" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toda membresía</SelectItem>
                    {membershipOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={personType} onValueChange={setPersonType}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Miembros y visitantes</SelectItem>
                    <SelectItem value="Miembro">Miembros</SelectItem>
                    <SelectItem value="Visitante">Visitantes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={campusFilter} onValueChange={setCampusFilter}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Sede" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las sedes</SelectItem>
                    {campuses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            )}
          </FilterBar>
          <DataTable rows={visiblePeople} columns={columns} getRowId={(person) => person.id} onRowClick={setSelected} emptyTitle="No hay coincidencias" emptyDescription="Ajusta la búsqueda o los filtros." />
          <p className="text-xs text-muted-foreground">Mostrando {visiblePeople.length} registros · Selecciona una fila para abrir la ficha individual.</p>
        </TabsContent>
        <TabsContent value="families" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {families.map((family) => (
              <button key={family.id} onClick={() => setFamilyId(family.id)} className={`rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 ${familyId === family.id ? "border-primary ring-1 ring-primary/15" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{family.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{family.id} · {family.members.length} integrante(s)</p>
                  </div>
                  <UsersRound className="size-5 text-primary" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{family.members[0]?.sector}{family.members[0]?.campusId ? ` · ${family.members[0].campusId}` : ""}</p>
              </button>
            ))}
          </div>
          <div className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">Integrantes y relaciones familiares</h2>
              <p className="mt-1 text-sm text-muted-foreground">Relaciones registradas para {families.find((f) => f.id === familyId)?.name ?? familyId}.</p>
            </div>
            <div className="divide-y">
              {familyMembers.map((person) => (
                <button key={person.id} onClick={() => setSelected(person)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/40">
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.relationship} · {person.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {christian && <span className="text-xs text-muted-foreground">{person.membershipStatus ?? "Miembro activo"}</span>}
                    <StatusBadge status={person.status} />
                  </div>
                </button>
              ))}
              {familyMembers.length === 0 && <p className="p-4 text-sm text-muted-foreground">No hay integrantes registrados para esta familia.</p>}
            </div>
            {familyMembers[0] && (
              <div className="border-t p-4 text-xs text-muted-foreground">
                <MapPin className="mr-1 inline size-3.5" />
                {familyMembers[0].address} · {familyMembers[0].sector}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FormModal
        title={christian ? `Registrar ${terms.memberLabel.toLowerCase()} o visitante` : "Agregar persona de muestra"}
        description={christian ? "Registro local demostrativo con datos de contacto, familia, membresía, ingreso y sede." : "El registro se incorpora al directorio local de la demostración."}
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) form.reset(); }}
        form={form}
        submitLabel="Crear registro"
        onSubmit={(values) => {
          const name = values.name.trim();
          if (name.length < 2) {
            form.setError("name", { message: "Ingresa el nombre de la persona." });
            throw new Error("Nombre inválido.");
          }
          const id = values.id.trim() || `${christian ? "MBR" : "FEL"}-DEMO-${Date.now()}`;
          const familyName = values.familyName.trim() || "Familia nueva · demo";
          const familyIdNew = `FAM-${familyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20)}-${Date.now().toString().slice(-4)}`;
          const newPerson: any = {
            id,
            name,
            age: 0,
            email: values.email.trim() || "persona@example.test",
            phone: values.phone.trim() || "Dato pendiente · demo",
            address: values.address.trim() || "Dirección pendiente · demo",
            sector: values.sector.trim() || "Centro",
            parish: parishioners[0]?.parish ?? "Comunidad demo",
            organizationId: settings.organizationId,
            campusId: values.campusId.trim() || settings.campusId,
            familyId: familyIdNew,
            familyName,
            relationship: values.relationship.trim() || "Integrante familiar",
            pastoral: [],
            status: "active",
            membershipStatus: values.membershipStatus,
            personType: values.personType,
            updatedAt: "Hoy · demo",
            sacraments: [],
            participationHistory: [],
            congregationalBaptisms: [],
          };
          if (values.personType === "Miembro") newPerson.memberSince = values.memberSince || "Hoy · demo";
          if (values.personType === "Visitante") newPerson.firstVisitDate = values.firstVisitDate || "Hoy · demo";
          create(newPerson);
        }}
      >
        <FormSection title="Datos personales y contacto" description="Información básica para la ficha individual.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField control={form.control} name="name" label="Nombre completo" required placeholder="Persona de muestra" />
            <TextInputField control={form.control} name="id" label="Identificador" placeholder={christian ? "MBR-DEMO-000" : "FEL-DEMO-000"} />
            <EmailInputField control={form.control} name="email" label="Correo" placeholder="persona@example.test" />
            <TextInputField control={form.control} name="phone" label="Teléfono" placeholder="+57 300 000 0000" />
            <TextInputField control={form.control} name="address" label="Dirección" placeholder="Dirección de contacto" />
            <TextInputField control={form.control} name="sector" label="Sector / barrio" placeholder="Sector" />
          </div>
        </FormSection>
        <FormSection title="Familia y relaciones" description="Vínculo familiar o relación registrada.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField control={form.control} name="familyName" label="Familia / núcleo" placeholder="Familia de muestra" />
            <TextInputField control={form.control} name="relationship" label="Relación" placeholder="Responsable familiar, cónyuge, hijo(a)... " />
          </div>
        </FormSection>
        <FormSection title={christian ? "Membresía, ingreso y sede" : "Información comunitaria"} description={christian ? "Estado de membresía, fecha de ingreso o primera visita y sede/congregación." : "Datos de referencia comunitaria."}>
          <div className="grid gap-4 sm:grid-cols-2">
            {christian && (
              <>
                <SelectInputField control={form.control} name="personType" label="Tipo de persona" options={[{ value: "Miembro", label: "Miembro" }, { value: "Visitante", label: "Visitante" }]} />
                <SelectInputField control={form.control} name="membershipStatus" label="Estado de membresía" options={membershipOptions.map((m) => ({ value: m, label: m }))} />
                <TextInputField control={form.control} name="memberSince" label="Fecha de ingreso" type="date" />
                <TextInputField control={form.control} name="firstVisitDate" label="Primera visita (si aplica)" type="date" />
                <TextInputField control={form.control} name="campusId" label={terms.campusLabel} placeholder={settings.campusId} />
              </>
            )}
          </div>
        </FormSection>
      </FormModal>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Ficha individual"}
        description={selected ? `${selected.id} · ${selected.personType ?? "Miembro"}${selected.campusId ? ` · ${selected.campusId}` : ""}` : undefined}
      >
        {selected && (
          <Tabs defaultValue="personal">
            <TabsList className="mb-4 flex h-auto flex-wrap">
              <TabsTrigger value="personal">Personal y contacto</TabsTrigger>
              <TabsTrigger value="family">Familia</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
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
                <InfoItem label={christian ? terms.campusLabel : "Comunidad"}>{selected.campusId || selected.parish}</InfoItem>
                <InfoItem label="Membresía">{selected.membershipStatus ?? "Miembro activo"}</InfoItem>
                <InfoItem label="Fecha de ingreso">{selected.memberSince ?? "No registrada"}</InfoItem>
                <InfoItem label="Primera visita">{selected.firstVisitDate ?? "No aplica"}</InfoItem>
                <InfoItem label="Estado"><StatusBadge status={selected.status} /></InfoItem>
                <InfoItem label="Organización">{selected.organizationId ?? settings.organizationId}</InfoItem>
              </div>
              <DemoNotice>{christian ? "Ficha asociada a organización/sede en almacenamiento local demostrativo. No es una base de datos productiva." : "Datos ficticios enmascarados. Esta ficha no otorga acceso a documentos originales."}</DemoNotice>
            </TabsContent>
            <TabsContent value="family" className="space-y-4">
              <InfoItem label="Familia">{selected.familyName} · {selected.familyId}</InfoItem>
              <InfoItem label="Relación registrada">{selected.relationship}</InfoItem>
              <div className="space-y-2">
                {records.filter((person) => person.familyId === selected.familyId).map((person) => (
                  <div key={person.id} className="flex justify-between rounded-lg border p-3 text-sm">
                    <span>{person.name}</span>
                    <span className="text-muted-foreground">{person.relationship}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => update(selected.id, { updatedAt: "Hoy · demo", status: selected.status === "pending" ? "active" : selected.status })}>Actualizar ficha</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => { remove(selected.id); setSelected(null); }}>Eliminar registro</Button>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <InfoItem label={christian ? "Participación / servicio" : "Grupos y servicio"}>{selected.pastoral.join(" · ") || "Sin registros"}</InfoItem>
              <InfoItem label="Última actualización"><span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{selected.updatedAt}</span></InfoItem>
              <ActivityTimeline
                entries={[
                  ...(selected.participationHistory ?? []).map((h) => ({ id: h.id, title: `${h.type}: ${h.detail}`, description: h.campusId ? `Sede: ${h.campusId}` : "Registro de participación", date: h.date, actor: "Coordinación · demo" })),
                  { id: "upd-base", title: "Ficha actualizada", description: "Actualización demostrativa de datos.", date: selected.updatedAt, actor: "Equipo de muestra" },
                ]}
              />
            </TabsContent>
            <TabsContent value="baptisms" className="space-y-3">
              {christian ? (
                <>
                  <p className="text-sm text-muted-foreground">Registro de bautismos según las prácticas de la congregación (demostrativo, sin partida sacramental católica).</p>
                  {(selected.congregationalBaptisms ?? []).length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No hay bautismos congregacionales registrados para esta persona.</p>
                  ) : (
                    (selected.congregationalBaptisms ?? []).map((b) => (
                      <div key={b.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2"><span className="font-medium">{b.practice}</span><span className="text-xs text-muted-foreground">{b.date}</span></div>
                        <p className="mt-1 text-xs text-muted-foreground">Lugar: {b.place} · Oficiante: {b.officiant}</p>
                        {b.notes && <p className="mt-1 text-xs">{b.notes}</p>}
                      </div>
                    ))
                  )}
                  <Button size="sm" variant="outline" onClick={() => update(selected.id, { congregationalBaptisms: [...(selected.congregationalBaptisms ?? []), { id: `BAP-${Date.now()}`, date: "Hoy · demo", practice: "Por inmersión", place: "Sede congregacional · demo", officiant: "Responsable · demo" }] })}>Registrar bautismo (demo)</Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Resumen de referencia con acceso restringido. No sustituye la consulta del libro sacramental.</p>
                  {selected.sacraments.map((name) => (
                    <div key={name} className="flex items-center justify-between rounded-lg border p-3 text-sm">
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