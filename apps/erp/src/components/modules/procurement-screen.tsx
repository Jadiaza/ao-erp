import { useMemo, useState } from "react";
import { BadgeCheck, Boxes, ClipboardList, FileText, Plus, ReceiptText, Truck } from "lucide-react";
import {
  ActivityTimeline,
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { procurement, type ProcurementDemo } from "@/data/economy-demo";
import { useLocalCollection } from "@/data/local-repository";

const stages: ProcurementDemo["stage"][] = [
  "Solicitud",
  "Cotizaciones",
  "Orden",
  "Recepción",
  "Cuenta por pagar",
];
const price = (value: number) =>
  value
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(value)
    : "Por definir";

export function ProcurementScreen() {
  const [tab, setTab] = useState("workflow");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProcurementDemo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { records: storedRecords, create } = useLocalCollection("ao-erp:procurement", procurement);
  const records = useMemo(
    () =>
      storedRecords.filter((item) =>
        `${item.id} ${item.title} ${item.vendor} ${item.requestedBy}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [storedRecords, query],
  );
  const columns: DataTableColumn<ProcurementDemo>[] = [
    {
      id: "reference",
      header: "Solicitud / orden",
      cell: (item) => (
        <div>
          <p className="font-mono font-semibold">{item.id}</p>
          <p className="text-xs text-muted-foreground">{item.date}</p>
        </div>
      ),
    },
    { id: "title", header: "Necesidad", cell: (item) => item.title },
    { id: "vendor", header: "Proveedor", cell: (item) => item.vendor },
    {
      id: "stage",
      header: "Etapa",
      cell: (item) => (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
          {item.stage}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Valor de referencia",
      cell: (item) => <span className="font-mono font-semibold">{price(item.amount)}</span>,
    },
    { id: "due", header: "Vencimiento", cell: (item) => item.due },
    { id: "status", header: "Estado", cell: (item) => <StatusBadge status={item.status} /> },
  ];
  const vendors = [...new Set(procurement.map((item) => item.vendor))];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finanzas y recursos" },
        { label: "Compras y obligaciones" },
      ]}
      title="Compras y obligaciones"
      description="Seguimiento visual desde la solicitud y comparación de ofertas hasta recepción y cuenta por pagar."
      actions={
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Nueva solicitud
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Solicitudes abiertas"
            value="8"
            icon={ClipboardList}
            caption="Flujo de muestra"
          />
          <StatCard
            label="Cotizaciones por revisar"
            value="3"
            icon={FileText}
            caption="Comparación demostrativa"
          />
          <StatCard
            label="Órdenes en recepción"
            value="2"
            icon={Truck}
            caption="Pendientes de validación"
          />
          <StatCard
            label="Obligaciones próximas"
            value="5"
            icon={ReceiptText}
            caption="Vencimientos de referencia"
          />
        </>
      }
    >
      <DemoNotice>
        Proveedores, órdenes y valores son ficticios. Las etapas ilustran un flujo de revisión, no
        autorizan compras ni reconocen obligaciones reales.
      </DemoNotice>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stages.map((stage, index) => {
          const count = procurement.filter((item) => item.stage === stage).length;
          return (
            <div key={stage} className="relative rounded-xl border bg-card p-3 text-center">
              {index < stages.length - 1 && (
                <span className="absolute -right-3 top-1/2 z-10 hidden h-px w-3 bg-border md:block" />
              )}
              <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-secondary text-primary">
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              <p className="mt-2 text-xs font-semibold">{stage}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{count} ejemplo(s)</p>
            </div>
          );
        })}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="workflow">Flujo de compras</TabsTrigger>
          <TabsTrigger value="payables">Cuentas por pagar</TabsTrigger>
          <TabsTrigger value="vendors">Proveedores</TabsTrigger>
        </TabsList>
        <TabsContent value="workflow" className="space-y-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar solicitud, proveedor o necesidad"
            className="w-full sm:w-96"
          />
          <div className="grid gap-4 xl:grid-cols-5">
            {stages.map((stage) => (
              <section key={stage} className="min-w-0 rounded-xl bg-muted/50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold">{stage}</h2>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                    {records.filter((item) => item.stage === stage).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {records
                    .filter((item) => item.stage === stage)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className="w-full rounded-lg border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/40"
                      >
                        <p className="font-mono text-[10px] text-muted-foreground">{item.id}</p>
                        <p className="mt-1 text-sm font-semibold">{item.title}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{item.vendor}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs font-semibold">{price(item.amount)}</span>
                          <StatusBadge status={item.status} />
                        </div>
                      </button>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="payables" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Obligaciones registradas · demo</p>
                <p className="mt-1 text-xl font-bold">{price(5760000)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Próximos vencimientos</p>
                <p className="mt-1 text-xl font-bold">4</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Soportes por revisar</p>
                <p className="mt-1 text-xl font-bold">2</p>
              </CardContent>
            </Card>
          </div>
          <DataTable
            rows={records.filter(
              (item) => item.stage === "Cuenta por pagar" || item.stage === "Recepción",
            )}
            columns={columns}
            getRowId={(item) => item.id}
            onRowClick={setSelected}
          />
        </TabsContent>
        <TabsContent value="vendors" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor, index) => {
            const supplierRecords = procurement.filter((item) => item.vendor === vendor);
            return (
              <Card key={vendor} className="shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-secondary p-2 text-primary">
                      <Boxes className="size-5" />
                    </div>
                    <StatusBadge status={index === 2 ? "pending" : "active"} />
                  </div>
                  <h2 className="mt-3 font-semibold">{vendor}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Proveedor ficticio · registro DEMO-{String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                    Procesos relacionados: {supplierRecords.length}
                  </div>
                  <p className="mt-2 text-xs">
                    Contacto y datos fiscales no desplegados en la demostración.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
      <FormDialog
        title="Nueva solicitud de compra"
        description="Formulario de vista previa; no envía ni registra una solicitud."
        open={formOpen}
        onOpenChange={setFormOpen}
        trigger={<span className="hidden" />}
        submitLabel="Registrar solicitud"
        onSubmit={(data) => {
          const title = String(data.get("title") ?? "").trim();
          const requestedBy = String(data.get("requestedBy") ?? "").trim();
          if (title.length < 3 || requestedBy.length < 2) return;
          create({
            id: `COM-DEMO-${Date.now()}`,
            title,
            vendor: "Por definir",
            requestedBy,
            amount: 0,
            stage: "Solicitud",
            date: "Hoy · demo",
            due: "Por definir",
            status: "draft",
            items: [title],
            offers: [],
            support: "Solicitud local",
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Necesidad / descripción">
            <Input name="title" placeholder="Bien o servicio requerido" required />
          </FieldGroup>
          <FieldGroup label="Área solicitante">
            <Input placeholder="Área administrativa o pastoral" />
          </FieldGroup>
          <FieldGroup label="Responsable de solicitud">
            <Input name="requestedBy" placeholder="Responsable de muestra" required />
          </FieldGroup>
          <FieldGroup label="Fecha requerida">
            <Input type="date" />
          </FieldGroup>
          <FieldGroup label="Rubro presupuestal de referencia">
            <Input placeholder="Rubro aprobado en presupuesto" />
          </FieldGroup>
          <FieldGroup label="Soporte de necesidad">
            <Input placeholder="Referencia de documento ficticio" />
          </FieldGroup>
        </div>
      </FormDialog>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "Detalle del proceso"}
        description={selected ? `${selected.id} · ${selected.stage}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Área solicitante">{selected.requestedBy}</InfoItem>
              <InfoItem label="Proveedor actual">{selected.vendor}</InfoItem>
              <InfoItem label="Valor de referencia">{price(selected.amount)}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge status={selected.status} />
              </InfoItem>
              <InfoItem label="Fecha de solicitud">{selected.date}</InfoItem>
              <InfoItem label="Vencimiento / pago">{selected.due}</InfoItem>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Etapas del proceso</h3>
              <ActivityTimeline
                entries={stages.map((stage, index) => ({
                  id: selected.id + "-stage-" + index,
                  title: stage,
                  description:
                    index < stages.indexOf(selected.stage)
                      ? "Etapa de muestra completada"
                      : index === stages.indexOf(selected.stage)
                        ? "Etapa actual · requiere revisión"
                        : "Pendiente en flujo",
                  date: index < stages.indexOf(selected.stage) ? "Oct. 2026" : "Por definir",
                }))}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Detalle de bienes o servicios</h3>
              {selected.items.map((item) => (
                <p key={item} className="border-b py-2 text-sm">
                  {item}
                </p>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Comparación de ofertas</h3>
              {selected.offers.length ? (
                <div className="space-y-2">
                  {selected.offers.map((offer) => (
                    <div
                      key={offer.vendor}
                      className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{offer.vendor}</p>
                        <p className="text-xs text-muted-foreground">{offer.note}</p>
                      </div>
                      <span className="font-mono text-sm font-semibold">{price(offer.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  La solicitud está pendiente de cotizaciones.
                </p>
              )}
            </div>
            <div className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
              <BadgeCheck className="mr-1 inline size-3.5 text-primary" />
              Soporte de muestra: {selected.support}. La recepción precede a la referencia de
              obligación por pagar.
            </div>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
