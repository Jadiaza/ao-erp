import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, Download, MapPin, Plus, Users, UsersRound } from "lucide-react";
import {
  ActivityTimeline,
  DataTable,
  type DataTableColumn,
  DetailDrawer,
  FilterBar,
  InfoItem,
  ModuleLayout,
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DemoNotice,
} from "@/components/modules";
import { FormModal, FormSection, TextInputField, EmailInputField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parishioners, type ParishionerDemo } from "@/data/community-demo";
import { useLocalCollection } from "@/data/local-repository";

type ParishionerFormValues = { name: string; id: string; email: string; sector: string };

export function CommunityScreen() {
  const [tab, setTab] = useState("people");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<ParishionerDemo | null>(null);
  const [familyId, setFamilyId] = useState("FAM-DEMO-01");
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm<ParishionerFormValues>({
    defaultValues: { name: "", id: "", email: "", sector: "" },
    mode: "onBlur",
  });
  const { records, create, update, remove } = useLocalCollection(
    "ao-erp:community:parishioners",
    parishioners,
  );
  const families = useMemo(
    () => [...new Map(records.map((person) => [person.familyId, person.familyName])).entries()],
    [records],
  );
  const visiblePeople = records.filter(
    (person) =>
      `${person.name} ${person.id} ${person.familyName} ${person.sector}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" || person.status === status),
  );
  const familyMembers = records.filter((person) => person.familyId === familyId);
  const columns: DataTableColumn<ParishionerDemo>[] = [
    {
      id: "person",
      header: "Feligres",
      cell: (person) => (
        <div>
          <p className="font-semibold">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.id}</p>
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
    { id: "sector", header: "Sector", cell: (person) => person.sector },
    { id: "community", header: "Comunidad", cell: (person) => person.parish },
    { id: "status", header: "Estado", cell: (person) => <StatusBadge status={person.status} /> },
    { id: "updated", header: "Actualizado", cell: (person) => person.updatedAt },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Comunidad y pastoral" },
        { label: "Feligreses y familias" },
      ]}
      title="Feligreses y familias"
      description="Directorio comunitario y vínculos familiares de muestra. La información personal aparece en la ficha individual."
      actions={
        <>
          <Button variant="outline" className="gap-2">
            <Download className="size-4" />
            Exportar vista
          </Button>
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nuevo registro
          </Button>
        </>
      }
      stats={
        <>
          <StatCard
            label="Registros de muestra"
            value="1.254"
            icon={Users}
            caption="Directorio comunitario"
          />
          <StatCard label="Familias" value="482" icon={UsersRound} caption="Grupos familiares" />
          <StatCard label="En revisión" value="18" caption="Requieren actualización" />
          <StatCard label="Sectores" value="12" icon={MapPin} caption="Comunidades de referencia" />
        </>
      }
    >
      <DemoNotice>
        Personas e identificaciones ficticias. La consulta de datos personales y sacramentales debe
        limitarse a la finalidad pastoral autorizada.
      </DemoNotice>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="people">Directorio</TabsTrigger>
          <TabsTrigger value="families">Familias</TabsTrigger>
        </TabsList>
        <TabsContent value="people" className="space-y-4">
          <FilterBar>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por nombre, ID, familia o sector"
              className="w-full sm:w-80"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="pending">En revisión</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </FilterBar>
          <DataTable
            rows={visiblePeople}
            columns={columns}
            getRowId={(person) => person.id}
            onRowClick={setSelected}
            emptyTitle="No hay coincidencias"
            emptyDescription="Ajusta la búsqueda o los filtros."
          />
          <p className="text-xs text-muted-foreground">
            Mostrando {visiblePeople.length} registros ficticios · Selecciona una fila para abrir la
            ficha.
          </p>
        </TabsContent>
        <TabsContent
          value="families"
          className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {families.map(([id, name]) => {
              const members = records.filter((person) => person.familyId === id);
              return (
                <button
                  key={id}
                  onClick={() => setFamilyId(id)}
                  className={`rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 ${familyId === id ? "border-primary ring-1 ring-primary/15" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {id} · Sector {members[0]?.sector}
                      </p>
                    </div>
                    <UsersRound className="size-5 text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {members.length} integrantes · {members[0]?.parish}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">Integrantes y relaciones</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Relaciones registradas para {families.find(([id]) => id === familyId)?.[1]}.
              </p>
            </div>
            <div className="divide-y">
              {familyMembers.map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelected(person)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.relationship} · {person.id}
                    </p>
                  </div>
                  <StatusBadge status={person.status} />
                </button>
              ))}
            </div>
            <div className="border-t p-4 text-xs text-muted-foreground">
              <MapPin className="mr-1 inline size-3.5" />
              {familyMembers[0]?.address} · {familyMembers[0]?.sector}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <FormModal
        title="Agregar persona de muestra"
        description="El registro se incorpora al directorio local de la demostración."
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
          const id = values.id.trim() || `FEL-DEMO-${Date.now()}`;
          const email = values.email.trim() || "persona@example.test";
          const sector = values.sector.trim() || "Centro";
          create({
            id,
            name,
            age: 0,
            email,
            phone: "Dato pendiente · demo",
            address: "Dirección pendiente · demo",
            sector,
            parish: parishioners[0]?.parish ?? "Parroquia demo",
            familyId: "FAM-DEMO-NEW",
            familyName: "Familia nueva · demo",
            relationship: "Integrante · demo",
            pastoral: [],
            status: "pending",
            updatedAt: "Hoy · demo",
            sacraments: [],
          });
        }}
      >
        <FormSection
          title="Datos personales"
          description="Registro de demostración relacionado con familias y pastoral."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField
              control={form.control}
              name="name"
              label="Nombre ficticio"
              required
              placeholder="Persona de muestra"
            />
            <TextInputField
              control={form.control}
              name="id"
              label="Identificador"
              placeholder="FEL-DEMO-000"
            />
            <EmailInputField
              control={form.control}
              name="email"
              label="Correo de ejemplo"
              placeholder="persona@example.test"
            />
            <TextInputField
              control={form.control}
              name="sector"
              label="Sector"
              placeholder="Sector comunitario"
            />
          </div>
        </FormSection>
      </FormModal>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Ficha individual"}
        description={selected ? `${selected.id} · Datos ficticios protegidos` : undefined}
      >
        {selected && (
          <Tabs defaultValue="personal">
            <TabsList className="mb-4 flex h-auto flex-wrap">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="family">Familia</TabsTrigger>
              <TabsTrigger value="sacraments">Sacramentos</TabsTrigger>
              <TabsTrigger value="community">Participación</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Identificador">{selected.id}</InfoItem>
                <InfoItem label="Edad de referencia">{selected.age} años</InfoItem>
                <InfoItem label="Contacto">{selected.email}</InfoItem>
                <InfoItem label="Teléfono">{selected.phone}</InfoItem>
                <InfoItem label="Dirección">{selected.address}</InfoItem>
                <InfoItem label="Sector">{selected.sector}</InfoItem>
                <InfoItem label="Comunidad">{selected.parish}</InfoItem>
                <InfoItem label="Estado">
                  <StatusBadge status={selected.status} />
                </InfoItem>
              </div>
              <DemoNotice>
                Datos ficticios enmascarados. Esta ficha no otorga acceso a documentos originales.
              </DemoNotice>
            </TabsContent>
            <TabsContent value="family" className="space-y-4">
              <InfoItem label="Familia">
                {selected.familyName} · {selected.familyId}
              </InfoItem>
              <InfoItem label="Relación registrada">{selected.relationship}</InfoItem>
              <div className="space-y-2">
                {records
                  .filter((person) => person.familyId === selected.familyId)
                  .map((person) => (
                    <div
                      key={person.id}
                      className="flex justify-between rounded-lg border p-3 text-sm"
                    >
                      <span>{person.name}</span>
                      <span className="text-muted-foreground">{person.relationship}</span>
                    </div>
                  ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update(selected.id, { updatedAt: "Hoy · demo" })}
                >
                  Marcar revisada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    remove(selected.id);
                    setSelected(null);
                  }}
                >
                  Eliminar registro
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="sacraments" className="space-y-3">
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
            </TabsContent>
            <TabsContent value="community" className="space-y-4">
              <InfoItem label="Grupos y servicio">{selected.pastoral.join(" · ")}</InfoItem>
              <InfoItem label="Última actualización">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  {selected.updatedAt}
                </span>
              </InfoItem>
              <ActivityTimeline
                entries={[
                  {
                    id: "upd-1",
                    title: "Ficha revisada",
                    description: "Actualización demostrativa de datos de contacto.",
                    date: selected.updatedAt,
                    actor: "Equipo parroquial de muestra",
                  },
                  {
                    id: "upd-2",
                    title: "Vinculación comunitaria",
                    description: "Participación pastoral actualizada.",
                    date: "12 oct. 2026",
                    actor: "Coordinación de muestra",
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
