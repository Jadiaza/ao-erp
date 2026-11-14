import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Archive,
  Building2,
  FileCheck2,
  MapPin,
  Package,
  Pencil,
  Plus,
  Wrench,
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
import { FormDrawer, FormModal, FormSection, NumberInputField, TextInputField } from "@/components/forms";
import { Card, CardContent } from "@/components/ui/card";
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
  assets,
  christianAssets,
  inventoryMovements,
  type AssetDemo,
} from "@/data/economy-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

type AssetFormValues = {
  name: string;
  kind: string;
  location: string;
  responsible: string;
  campusId: string;
  condition: string;
  value: number | "";
};

const amount = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export function AssetsScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);

  const [formOpen, setFormOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [decommissionReason, setDecommissionReason] = useState("");
  const [showDecommissionBox, setShowDecommissionBox] = useState(false);

  const form = useForm<AssetFormValues>({
    defaultValues: {
      name: "",
      kind: christian ? "Equipo audiovisual" : "Bien patrimonial",
      location: "",
      responsible: "",
      campusId: settings.campusId || "SEDE-PRINCIPAL",
      condition: "Bueno",
      value: "",
    },
    mode: "onBlur",
  });
  const editForm = useForm<AssetFormValues>({ mode: "onBlur" });

  const { records, create, update } = useLocalCollection(
    getProfileStorageKey("ao-erp:assets", settings.profile),
    christian ? christianAssets : assets,
  );
  const [tab, setTab] = useState("inventory");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scopedRecords = useMemo(
    () => records.filter((a) => !a.organizationId || a.organizationId === settings.organizationId),
    [records, settings.organizationId],
  );
  const kinds = useMemo(() => [...new Set(scopedRecords.map((asset) => asset.kind))], [scopedRecords]);
  const campuses = useMemo(
    () => [...new Set(scopedRecords.map((a) => a.campusId).filter(Boolean))] as string[],
    [scopedRecords],
  );
  const selected = useMemo(
    () => scopedRecords.find((a) => a.id === selectedId) ?? null,
    [scopedRecords, selectedId],
  );

  const visible = useMemo(
    () =>
      scopedRecords.filter(
        (asset) =>
          `${asset.id} ${asset.name} ${asset.location} ${asset.responsible}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (kind === "all" || asset.kind === kind) &&
          (campusFilter === "all" || (asset.campusId ?? settings.campusId) === campusFilter),
      ),
    [scopedRecords, query, kind, campusFilter, settings.campusId],
  );

  const activeAssetsCount = scopedRecords.filter((a) => a.status !== "inactive").length;
  const maintenanceCount = scopedRecords.filter((a) =>
    a.condition.toLowerCase().includes("revisión") || a.status === "pending",
  ).length;

  const openEditAsset = (asset: AssetDemo) => {
    editForm.reset({
      name: asset.name,
      kind: asset.kind,
      location: asset.location,
      responsible: asset.responsible,
      campusId: asset.campusId ?? settings.campusId,
      condition: asset.condition,
      value: asset.acquisitionValue,
    });
    setEditDrawerOpen(true);
  };

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
      header: "Ubicación / sede",
      cell: (item) => (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground" />
          {item.location}
          {item.campusId ? ` · ${item.campusId}` : ""}
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
    {
      id: "status",
      header: "Estado",
      cell: (item) => (
        <StatusBadge
          status={item.status}
          label={item.status === "inactive" ? "De baja" : undefined}
        />
      ),
    },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finanzas y recursos" },
        { label: christian ? "Inventarios y activos" : "Inventarios y patrimonio" },
      ]}
      title={christian ? "Inventarios y activos" : "Inventarios y patrimonio"}
      width="wide"
      description="Control físico de bienes, edición, bajas controladas, ubicación por sede y conservación."
      actions={
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Registrar bien
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Bienes activos"
            value={String(activeAssetsCount)}
            icon={Archive}
            caption={`De ${scopedRecords.length} registrados`}
          />
          <StatCard
            label="Ubicaciones"
            value={String(new Set(scopedRecords.map((a) => a.location)).size)}
            icon={MapPin}
            caption="Espacios institucionales"
          />
          <StatCard
            label="Requieren revisión"
            value={String(maintenanceCount)}
            icon={Wrench}
            caption="Seguimiento físico"
          />
          <StatCard
            label="Valor en inventario"
            value={amount(
              scopedRecords
                .filter((a) => a.status !== "inactive")
                .reduce((sum, a) => sum + a.acquisitionValue, 0),
            )}
            icon={FileCheck2}
            caption="Total activos vigentes"
          />
        </>
      }
    >
      <DemoNotice>
        Inventario físico asociado a {settings.organizationId}. Las bajas se registran de forma
        controlada conservando el historial del bien.
      </DemoNotice>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Building2,
            name: "Equipos audiovisuales",
            count: `${scopedRecords.filter((a) => a.kind.toLowerCase().includes("audio") || a.kind.toLowerCase().includes("tecnol")).length} bienes`,
          },
          {
            icon: Package,
            name: "Mobiliario y equipos",
            count: `${scopedRecords.filter((a) => a.kind.toLowerCase().includes("mueb") || a.kind.toLowerCase().includes("mobil") || a.kind.toLowerCase().includes("minist")).length} bienes`,
          },
          {
            icon: Wrench,
            name: "En revisión",
            count: `${maintenanceCount} bienes`,
          },
          {
            icon: Archive,
            name: "Dados de baja",
            count: `${scopedRecords.filter((a) => a.status === "inactive").length} bienes`,
          },
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
          </FilterBar>
          <DataTable
            rows={visible}
            columns={columns}
            getRowId={(item) => item.id}
            onRowClick={(item) => {
              setShowDecommissionBox(false);
              setDecommissionReason("");
              setSelectedId(item.id);
            }}
          />
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
                {scopedRecords
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
          {scopedRecords.map((asset) => (
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
                  onClick={() => setSelectedId(asset.id)}
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
        title="Registrar bien o activo"
        description="Crea un bien local asociado a la organización y sede."
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
            id: `${christian ? "ACT-CRI" : "PAT-DEMO"}-${Date.now()}`,
            name,
            kind: values.kind.trim() || "Equipo",
            location: values.location.trim() || "Sede principal",
            responsible,
            condition: values.condition.trim() || "Bueno",
            acquisitionValue: value,
            acquisitionDate: new Date().toISOString().slice(0, 10),
            maintenance: "Sin mantenimiento programado",
            accountingCategory: "Activos locales",
            carryingAmount: value,
            support: "Ficha local",
            status: "active",
            organizationId: settings.organizationId,
            campusId: values.campusId.trim() || settings.campusId,
          });
        }}
      >
        <FormSection title="Datos del bien" description="Alta local de un bien patrimonial o activo.">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInputField control={form.control} name="name" label="Nombre del bien" required />
            <TextInputField control={form.control} name="kind" label="Categoría" required />
            <TextInputField control={form.control} name="location" label="Ubicación" />
            <TextInputField control={form.control} name="campusId" label={settings.terminology.campusLabel} />
            <TextInputField control={form.control} name="responsible" label="Custodio / responsable" required />
            <NumberInputField control={form.control} name="value" label="Valor" min={0} />
          </div>
        </FormSection>
      </FormModal>

      <FormDrawer
        form={editForm}
        open={editDrawerOpen && !!selected}
        onOpenChange={setEditDrawerOpen}
        title={selected ? `Editar · ${selected.name}` : "Editar bien"}
        submitLabel="Guardar cambios"
        onSubmit={(values) => {
          if (!selected) return;
          update(selected.id, {
            name: values.name.trim() || selected.name,
            kind: values.kind.trim() || selected.kind,
            location: values.location.trim() || selected.location,
            responsible: values.responsible.trim() || selected.responsible,
            campusId: values.campusId.trim() || selected.campusId,
            condition: values.condition.trim() || selected.condition,
            acquisitionValue: Number(values.value || selected.acquisitionValue),
          });
        }}
      >
        <FormSection title="Actualizar bien">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInputField control={editForm.control} name="name" label="Nombre" required />
            <TextInputField control={editForm.control} name="kind" label="Categoría" required />
            <TextInputField control={editForm.control} name="location" label="Ubicación" />
            <TextInputField control={editForm.control} name="campusId" label={settings.terminology.campusLabel} />
            <TextInputField control={editForm.control} name="responsible" label="Responsable" required />
            <TextInputField control={editForm.control} name="condition" label="Estado físico" />
            <NumberInputField control={editForm.control} name="value" label="Valor" min={0} />
          </div>
        </FormSection>
      </FormDrawer>

      <DetailDrawer
        open={!!selected && !editDrawerOpen}
        onOpenChange={(open) => !open && setSelectedId(null)}
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
                <InfoItem label={settings.terminology.campusLabel}>
                  {selected.campusId ?? settings.campusId}
                </InfoItem>
                <InfoItem label="Responsable de custodia">{selected.responsible}</InfoItem>
                <InfoItem label="Fecha de adquisición">{selected.acquisitionDate}</InfoItem>
                <InfoItem label="Valor de adquisición">
                  {amount(selected.acquisitionValue)}
                </InfoItem>
                <InfoItem label="Estado">
                  <StatusBadge
                    status={selected.status}
                    label={selected.status === "inactive" ? "De baja" : undefined}
                  />
                </InfoItem>
              </div>
              {selected.decommissionedAt && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <strong>Baja controlada ({selected.decommissionedAt}):</strong>{" "}
                  {selected.decommissionReason}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditAsset(selected)}>
                  <Pencil className="mr-1.5 size-3.5" />
                  Editar bien
                </Button>
                {selected.status !== "inactive" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => setShowDecommissionBox((v) => !v)}
                  >
                    Dar de baja controlada
                  </Button>
                )}
              </div>
              {showDecommissionBox && selected.status !== "inactive" && (
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs font-semibold">Motivo de baja controlada</p>
                  <Input
                    placeholder="Ej. Obsolescencia, daño irreparable, donación..."
                    value={decommissionReason}
                    onChange={(e) => setDecommissionReason(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (decommissionReason.trim().length < 3) return;
                      update(selected.id, {
                        status: "inactive",
                        condition: "Dado de baja",
                        decommissionedAt: new Date().toISOString().slice(0, 10),
                        decommissionReason: decommissionReason.trim(),
                      });
                      setShowDecommissionBox(false);
                    }}
                  >
                    Confirmar baja controlada
                  </Button>
                </div>
              )}
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
