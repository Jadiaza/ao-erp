import { useState } from "react";
import { CalendarDays, Clock3, FileCheck2, Plus, ShieldAlert, Users } from "lucide-react";
import { ActivityTimeline, Calendar, DataTable, type DataTableColumn, DemoNotice, DetailDrawer, FieldGroup, FilterBar, FormDialog, InfoItem, ModuleLayout, SearchInput, StatCard, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sacramentalRequests, sacramentTypes, type SacramentalRequestDemo, type SacramentKind } from "@/data/community-demo";
import { parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

const celebrations = [
  { date: "05 nov. 2026", time: "10:00 a. m.", type: "Bautismo", place: parishDemoSites.chapel.name, responsible: parishDemoPeople.celebrantA.name },
  { date: "07 nov. 2026", time: "4:00 p. m.", type: "Primera comuni?n", place: parishDemoSites.temple.name, responsible: parishDemoPeople.celebrantB.name },
  { date: "14 nov. 2026", time: "11:30 a. m.", type: "Matrimonio", place: parishDemoSites.temple.name, responsible: parishDemoPeople.celebrantC.name },
];

export function SacramentalScreen() {
  const [tab, setTab] = useState("requests");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<SacramentalRequestDemo | null>(null);
  const [sacrament, setSacrament] = useState<SacramentKind | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 10, 5));
  const requests = sacramentalRequests.filter((item) => `${item.id} ${item.sacrament} ${item.person}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || item.status === filter));
  const columns: DataTableColumn<SacramentalRequestDemo>[] = [
    { id: "request", header: "Solicitud", cell: (item) => <div><p className="font-semibold">{item.id}</p><p className="text-xs text-muted-foreground">{item.submitted}</p></div> },
    { id: "sacrament", header: "Sacramento", cell: (item) => item.sacrament },
    { id: "person", header: "Persona / referencia", cell: (item) => item.person },
    { id: "prep", header: "Preparación", cell: (item) => item.preparation },
    { id: "responsible", header: "Responsable", cell: (item) => item.responsible },
    { id: "status", header: "Estado", cell: (item) => <StatusBadge status={item.status} /> },
  ];
  const selectedType = sacramentTypes.find((item) => item.kind === sacrament);

  return <ModuleLayout breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Comunidad y pastoral" }, { label: "Gestión sacramental" }]} title="Gestión sacramental" description="Acompañamiento, preparación y coordinación de celebraciones. Las solicitudes no se convierten automáticamente en partidas registrales." actions={<Button className="gap-2" onClick={() => { setSacrament(null); setFormOpen(true); }}><Plus className="size-4" />Nueva solicitud</Button>} stats={<><StatCard label="Solicitudes en seguimiento" value="24" icon={FileCheck2} caption="Ciclo demostrativo" /><StatCard label="Preparación activa" value="11" icon={Users} caption="Acompañamiento pastoral" /><StatCard label="Celebraciones próximas" value="8" icon={CalendarDays} caption="Agenda de muestra" /><StatCard label="Pendientes documentales" value="6" icon={Clock3} caption="Verificación por revisar" /></>}>
    <DemoNotice>Datos y calendarios ficticios. La preparación pastoral y la celebración son etapas distintas; solo un registro documental posterior podría generar una referencia de libro.</DemoNotice>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
      <div className="space-y-5">
        <section className="space-y-3"><div><h2 className="font-semibold">Acompañamiento por sacramento</h2><p className="text-sm text-muted-foreground">Cada proceso solicita información acorde con su naturaleza.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{sacramentTypes.map((item) => <Card key={item.kind} className="shadow-none"><CardHeader className="p-4 pb-2"><CardTitle className="text-sm">{item.kind}</CardTitle></CardHeader><CardContent className="p-4 pt-1"><p className="min-h-14 text-xs leading-relaxed text-muted-foreground">{item.description}</p><Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => { setSacrament(item.kind); setFormOpen(true); }}>Abrir proceso</Button></CardContent></Card>)}</div></section>
        <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="requests">Solicitudes</TabsTrigger><TabsTrigger value="preparation">Preparación</TabsTrigger><TabsTrigger value="celebrations">Celebraciones</TabsTrigger></TabsList>
          <TabsContent value="requests" className="space-y-4"><FilterBar><SearchInput value={query} onChange={setQuery} placeholder="Buscar solicitud, sacramento o persona" className="w-full sm:w-80" /><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="active">En preparación</SelectItem><SelectItem value="approved">Listo para coordinar</SelectItem></SelectContent></Select></FilterBar><DataTable rows={requests} columns={columns} getRowId={(item) => item.id} onRowClick={setSelected} emptyTitle="Sin solicitudes coincidentes" /></TabsContent>
          <TabsContent value="preparation" className="space-y-3">{sacramentalRequests.filter((item) => item.status === "active" || item.status === "pending").map((item) => <button key={item.id} onClick={() => setSelected(item)} className="flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/40 sm:flex-row sm:items-center"><div className="min-w-44"><p className="font-semibold">{item.sacrament}</p><p className="text-xs text-muted-foreground">{item.id}</p></div><div className="flex-1"><p className="text-sm">{item.preparation}</p><p className="mt-1 text-xs text-muted-foreground">Siguiente paso: {item.nextStep}</p></div><StatusBadge status={item.status} /></button>)}</TabsContent>
          <TabsContent value="celebrations" className="space-y-3">{celebrations.map((item) => <div key={`${item.date}-${item.type}`} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1.3fr_1fr]"><div className="flex items-center gap-3"><CalendarDays className="size-5 text-primary" /><div><p className="font-semibold">{item.date}</p><p className="text-sm text-muted-foreground">{item.time}</p></div></div><div><p className="font-medium">{item.type}</p><p className="text-sm text-muted-foreground">{item.place}</p></div><div className="text-sm text-muted-foreground">Responsable: {item.responsible}</div></div>)}</TabsContent>
        </Tabs>
      </div>
      <aside className="space-y-4"><Card className="shadow-none"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" />Agenda de celebraciones</CardTitle></CardHeader><CardContent className="space-y-4"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="mx-auto" /><p className="rounded-lg bg-secondary/70 p-3 text-xs text-muted-foreground">{selectedDate ? `Fecha seleccionada: ${selectedDate.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}` : "Selecciona una fecha para consultar la agenda."}</p></CardContent></Card><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex gap-3"><ShieldAlert className="size-5 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold">Información pastoral reservada</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">No se recopilan detalles de confesión ni información clínica. Las referencias sensibles se muestran minimizadas en este prototipo.</p></div></div></div></aside>
    </div>
    <FormDialog title={sacrament ? `Solicitud demostrativa · ${sacrament}` : "Selecciona el tipo de sacramento"} description="El formulario solo presenta una vista previa y no guarda datos." open={formOpen} onOpenChange={setFormOpen} trigger={<span className="hidden" />} submitLabel="Vista previa">
      <FieldGroup label="Tipo de sacramento"><Select value={sacrament ?? ""} onValueChange={(value) => setSacrament(value as SacramentKind)}><SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger><SelectContent>{sacramentTypes.map((item) => <SelectItem key={item.kind} value={item.kind}>{item.kind}</SelectItem>)}</SelectContent></Select></FieldGroup>
      {sacrament && selectedType && <><p className="text-sm text-muted-foreground">{selectedType.description}</p><div className="grid gap-4 sm:grid-cols-2">{selectedType.fields.map((field) => <FieldGroup key={field} label={field}><Input placeholder={`Dato demostrativo · ${field.toLowerCase()}`} /></FieldGroup>)}</div><div className="rounded-lg bg-secondary/60 p-3"><p className="text-xs font-semibold">Requisitos de referencia</p><ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">{selectedType.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></div></>}
    </FormDialog>
    <DetailDrawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)} title={selected?.sacrament ?? "Seguimiento sacramental"} description={selected?.id}>
      {selected && <div className="space-y-5"><div className="grid grid-cols-2 gap-4"><InfoItem label="Persona / referencia">{selected.person}</InfoItem><InfoItem label="Estado"><StatusBadge status={selected.status} /></InfoItem><InfoItem label="Responsable">{selected.responsible}</InfoItem><InfoItem label="Ingreso">{selected.submitted}</InfoItem></div><div className="rounded-lg border p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preparación</p><p className="mt-2 text-sm">{selected.preparation}</p><p className="mt-2 text-xs text-muted-foreground">Siguiente paso: {selected.nextStep}</p></div><div><p className="mb-3 text-sm font-semibold">Trazabilidad de seguimiento</p><ActivityTimeline entries={[{ id: "s1", title: "Solicitud recibida", description: "Apertura de expediente demostrativo.", date: selected.submitted, actor: "Recepción parroquial" }, { id: "s2", title: selected.preparation, description: selected.nextStep, date: "En seguimiento", actor: selected.responsible }]} /></div><DemoNotice>Este seguimiento no acredita la celebración ni crea una partida sacramental.</DemoNotice></div>}
    </DetailDrawer>
  </ModuleLayout>;
}
