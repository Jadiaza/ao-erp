import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Archive, Building2, FileCheck2, MapPin, Package, Wrench } from "lucide-react";
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
import { FormModal, FormSection, NumberInputField, TextInputField } from "@/components/forms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assets, inventoryMovements, type AssetDemo } from "@/data/economy-demo";
import { useLocalCollection } from "@/data/local-repository";

type AssetFormValues = { name: string; responsible: string; value: number | "" };

const amount = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
const kinds = [...new Set(assets.map((asset) => asset.kind))];

export function AssetsScreen() {
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm<AssetFormValues>({
    defaultValues: { name: "", responsible: "", value: "" },
    mode: "onBlur",
  });
  const { records, create } = useLocalCollection("ao-erp:assets", assets);
  const [tab, setTab] = useState("inventory");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<AssetDemo | null>(null);
  const visible = useMemo(
    () =>
      records.filter(
        (asset) =>
          `${asset.id} ${asset.name} ${asset.location} ${asset.responsible}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (kind === "all" || asset.kind === kind),
      ),
    [records, query, kind],
  );
  const columns: DataTableColumn<AssetDemo>[] = [
    {
      id: "asset",
      header: "Bien inventariado",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.id} · {item.kind}
          </p>
        </div>
      ),
    },
    {
      id: "location",
      header: "Ubicación",
      cell: (item) => (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground" />
          {item.location}
        </span>
      ),
    },
    { id: "responsible", header: "Responsable", cell: (item) => item.responsible },
    {
      id: "condition",
      header: "Conservación física",
      cell: (item) => (
        <span className={item.condition.includes("Requiere") ? "font-medium text-amber-700" : ""}>
          {item.condition}
        </span>
      ),
    },
    { id: "date", header: "Adquisición", cell: (item) => item.acquisitionDate },
    { id: "value", header: "Valor adquisición", cell: (item) => amount(item.acquisitionValue) },
    { id: "status", header: "Estado", cell: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finanzas y recursos" },
        { label: "Inventarios y patrimonio" },
      ]}
      title="Inventarios y patrimonio"
      width="wide"
      description="Control físico de bienes, ubicación, custodia, conservación y referencias documentales."
      actions={
        <div className="rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
          Inventario físico · ciclo DEMO-2026
        </div>
      }
      stats={
        <>
          <StatCard
            label="Bienes inventariados"
            value="286"
            icon={Archive}
            caption="Conteo ilustrativo"
          />
          <StatCard
            label="Ubicaciones"
            value="14"
            icon={MapPin}
            caption="Espacios institucionales"
          />
          <StatCard
            label="Mantenimientos próximos"
            value="9"
            icon={Wrench}
            caption="Seguimiento de muestra"
          />
          <StatCard
            label="Soportes de propiedad"
            value="42"
            icon={FileCheck2}
            caption="Referencias documentales"
          />
        </>
      }
    >
      <DemoNotice>
        Bienes y valores ficticios. El estado físico del inventario es independiente de su
        reconocimiento, depreciación o tratamiento contable.
      </DemoNotice>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Building2, name: "Inmuebles", count: "12 bienes" },
          { icon: Package, name: "Muebles y equipos", count: "174 bienes" },
          { icon: Wrench, name: "Vehículos y tecnología", count: "28 bienes" },
          { icon: Archive, name: "Litúrgicos y culturales", count: "72 bienes" },
        ].map((item) => (
          <Card key={item.name} className="shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-secondary p-2.5 text-primary">
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventario físico</TabsTrigger>
          <TabsTrigger value="movements">Movimientos y mantenimiento</TabsTrigger>
          <TabsTrigger value="documents">Soportes y valoración</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="space-y-4">
          <FilterBar label="Inventario">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar bien, ubicación o responsable"
              className="w-full sm:w-80"
            />
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {kinds.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterBar>
          <DataTable
            rows={visible}
            columns={columns}
            getRowId={(item) => item.id}
            onRowClick={setSelected}
          />
          <p className="text-xs text-muted-foreground">
            Consulta del inventario físico · los detalles contables están en una sección separada.
          </p>
        </TabsContent>
        <TabsContent value="movements" className="space-y-3">
          {inventoryMovements.map((movement) => (
            <div
              key={movement.id}
              className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_1fr_120px]"
            >
              <div>
                <p className="font-semibold">{movement.asset}</p>
                <p className="text-xs text-muted-foreground">
                  {movement.id} · {movement.date}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Tipo de movimiento
                </p>
                <p className="mt-1 text-sm">{movement.kind}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ubicación</p>
                <p className="mt-1 text-sm">
                  {movement.from} → {movement.to}
                </p>
              </div>
              <StatusBadge status={movement.status} />
            </div>
          ))}
          <Card className="shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Agenda de mantenimiento</h2>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {assets
                  .filter((asset) => asset.maintenance)
                  .map((asset) => (
                    <div key={asset.id} className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{asset.maintenance}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          {assets.map((asset) => (
            <Card key={asset.id} className="shadow-none">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-secondary p-2 text-primary">
                    <FileCheck2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{asset.support}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{asset.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Soporte documental de muestra
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(asset)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Ver referencia
                </button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      <FormModal
        title="Registrar bien patrimonial"
        description="Crea un bien local con trazabilidad inicial."
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) form.reset();
        }}
        form={form}
        submitLabel="Guardar bien"
        onSubmit={(values) => {
          const name = values.name.trim();
          const responsible = values.responsible.trim();
          if (name.length < 3) {
            form.setError("name", { message: "Ingresa el nombre del bien." });
            throw new Error("Nombre inválido.");
          }
          if (responsible.length < 2) {
            form.setError("responsible", { message: "Ingresa el custodio." });
            throw new Error("Custodio inválido.");
          }
          const value = Number(values.value || 0);
          create({
            id: `PAT-DEMO-${Date.now()}`,
            name,
            kind: "Bien patrimonial",
            location: "Sede principal",
            responsible,
            condition: "Bueno",
            acquisitionValue: value,
            acquisitionDate: "Hoy · demo",
            maintenance: "Sin mantenimiento programado",
            accountingCategory: "Patrimonio local",
            carryingAmount: value,
            support: "Ficha local",
            status: "active",
          });
        }}
      >
        <FormSection title="Datos del bien" description="Alta local de un bien patrimonial.">
          <TextInputField control={form.control} name="name" label="Nombre del bien" required />
          <TextInputField control={form.control} name="responsible" label="Custodio" required />
          <NumberInputField control={form.control} name="value" label="Valor" min={0} />
        </FormSection>
      </FormModal>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Detalle del bien"}
        description={selected?.id}
      >
        <div>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Categoría física">{selected.kind}</InfoItem>
                <InfoItem label="Estado de conservación">{selected.condition}</InfoItem>
                <InfoItem label="Ubicación actual">{selected.location}</InfoItem>
                <InfoItem label="Responsable de custodia">{selected.responsible}</InfoItem>
                <InfoItem label="Fecha de adquisición">{selected.acquisitionDate}</InfoItem>
                <InfoItem label="Valor de adquisición">
                  {amount(selected.acquisitionValue)}
                </InfoItem>
                <InfoItem label="Mantenimiento">{selected.maintenance}</InfoItem>
                <InfoItem label="Soporte">{selected.support}</InfoItem>
              </div>
              <div className="rounded-xl border border-primary/15 bg-secondary/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Referencia contable · separada del inventario físico
                </p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <InfoItem label="Categoría contable">{selected.accountingCategory}</InfoItem>
                  <InfoItem label="Valor en libros · demo">
                    {amount(selected.carryingAmount)}
                  </InfoItem>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Este panel no calcula depreciación ni reconoce activos; muestra etiquetas de
                  referencia.
                </p>
              </div>
              <ActivityTimeline
                entries={[
                  {
                    id: "a1",
                    title: "Bien registrado en inventario",
                    description: "Alta física demostrativa.",
                    date: selected.acquisitionDate,
                    actor: selected.responsible,
                  },
                  {
                    id: "a2",
                    title: "Seguimiento de conservación",
                    description: selected.maintenance,
                    date: "Próximo ciclo",
                    actor: "Mantenimiento de muestra",
                  },
                ]}
              />
            </div>
          )}
        </div>
      </DetailDrawer>
    </ModuleLayout>
  );
}
