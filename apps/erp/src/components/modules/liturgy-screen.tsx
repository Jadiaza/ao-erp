import { useState } from "react";
import { Church, Clock3, Music2, Plus, Users } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  FieldGroup,
  FormDialog,
  InfoItem,
  ModuleLayout,
  StatCard,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { liturgicalCelebrations, type LiturgicalCelebration } from "@/data/pastoral-demo";
import { MassIntentionsVisualPilot } from "@/components/modules/mass-intentions-visual-pilot";
import { OrdoCalendarView } from "@/components/modules/ordo-calendar-view";
import { useOrdoCalendar } from "@/hooks/use-ordo-calendar";

export function LiturgyScreen() {
  const [tab, setTab] = useState("calendar");
  const [selected, setSelected] = useState<LiturgicalCelebration | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { data: ordoData, loading: ordoLoading, errors: ordoErrors, retry: retryOrdo } = useOrdoCalendar();
  const columns: DataTableColumn<LiturgicalCelebration>[] = [
    {
      id: "date",
      header: "Fecha y hora",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.date}</p>
          <p className="text-xs text-muted-foreground">{item.time}</p>
        </div>
      ),
    },
    {
      id: "celebration",
      header: "Celebración",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.kind}</p>
        </div>
      ),
    },
    { id: "place", header: "Lugar", cell: (item) => item.place },
    { id: "priest", header: "Preside", cell: (item) => item.priest },
    { id: "prep", header: "Preparación", cell: (item) => item.preparation },
    { id: "status", header: "Estado", cell: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Comunidad y pastoral" },
        { label: "Liturgia y celebraciones" },
      ]}
      title="Liturgia y celebraciones"
      description="Consulta el calendario litúrgico ORDO Colombia y, en un espacio separado, la programación parroquial demostrativa."
      actions={
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Programar celebración
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Programación parroquial"
            value="18"
            icon={Church}
            caption="Dato demostrativo independiente de ORDO"
          />
          <StatCard
            label="Equipos de servicio"
            value="12"
            icon={Users}
            caption="Roles litúrgicos"
          />
          <StatCard
            label="Preparación completa"
            value="9"
            icon={Music2}
            caption="Guiones y equipos"
          />
          <StatCard
            label="Próxima actividad de muestra"
            value="5 nov."
            icon={Clock3}
            caption={liturgicalCelebrations[0]?.place ?? "Sede de muestra"}
          />
        </>
      }
    >
      <DemoNotice>
        El calendario litúrgico se consulta desde ORDO Colombia. La programación parroquial y los
        equipos de su pestaña son demostrativos e independientes; Intenciones de Misa continúa como
        prototipo visual y no procesa solicitudes.
      </DemoNotice>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendario litúrgico</TabsTrigger>
          <TabsTrigger value="schedule">Programación y equipos</TabsTrigger>
          <TabsTrigger value="intentions">Intenciones de Misa</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="min-w-0">
          <OrdoCalendarView
            entries={ordoData.entries}
            feasts={ordoData.principalFeasts}
            times={ordoData.liturgicalTimes}
            loading={ordoLoading}
            errors={ordoErrors}
            loadedAt={ordoData.loadedAt.getTime() > 0 ? ordoData.loadedAt : null}
            onRetry={retryOrdo}
          />
        </TabsContent>        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Eucaristías", value: "12" },
              { label: "Celebraciones de la Palabra", value: "4" },
              { label: "Oración comunitaria", value: "2" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
          <DataTable
            rows={liturgicalCelebrations}
            columns={columns}
            getRowId={(item) => item.id}
            onRowClick={setSelected}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {["Lectores y salmistas", "Acólitos y ministros", "Música y acogida"].map((role) => (
              <div key={role} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">{role}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Turnos, responsables y preparación de equipos para próximas celebraciones.
                </p>
                <p className="mt-3 text-xs font-medium text-primary">Ver equipo de muestra →</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="intentions" className="pt-4">
          <MassIntentionsVisualPilot />
        </TabsContent>
      </Tabs>
      <FormDialog
        title="Programación litúrgica"
        description="Distribuye la celebración y el equipo de servicio. No genera una solicitud sacramental."
        open={formOpen}
        onOpenChange={setFormOpen}
        trigger={<span className="hidden" />}
        submitLabel="Vista previa"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Tipo de celebración">
            <Input placeholder="Eucaristía, celebración de la Palabra…" />
          </FieldGroup>
          <FieldGroup label="Fecha y hora">
            <Input type="datetime-local" />
          </FieldGroup>
          <FieldGroup label="Lugar">
            <Input placeholder="Templo o capilla" />
          </FieldGroup>
          <FieldGroup label="Sacerdote celebrante / ministro">
            <Input placeholder="Celebrante de muestra" />
          </FieldGroup>
          <FieldGroup label="Lectores y salmista">
            <Input placeholder="Equipo asignado" />
          </FieldGroup>
          <FieldGroup label="Acólitos, ministros y música">
            <Input placeholder="Equipos de servicio" />
          </FieldGroup>
          <FieldGroup label="Intención comunitaria">
            <Input placeholder="Intención general, sin datos sensibles" />
          </FieldGroup>
          <FieldGroup label="Preparación">
            <Input placeholder="Lecturas, guion, repertorio" />
          </FieldGroup>
        </div>
      </FormDialog>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "Detalle de celebración"}
        description={
          selected ? selected.date + " · " + selected.time + " · " + selected.id : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tipo">{selected.kind}</InfoItem>
              <InfoItem label="Lugar">{selected.place}</InfoItem>
              <InfoItem label="Celebrante">{selected.priest}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge status={selected.status} />
              </InfoItem>
              <InfoItem label="Intención">{selected.intention}</InfoItem>
              <InfoItem label="Preparación">{selected.preparation}</InfoItem>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Roles y equipos de servicio</h3>
              <div className="space-y-2">
                {selected.services.map((service) => (
                  <div key={service.role} className="rounded-lg border p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {service.role}
                    </p>
                    <p className="mt-1 text-sm">{service.people.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
