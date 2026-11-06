import { useMemo, useState } from "react";
import { useForm, type Control } from "react-hook-form";
import {
  CalendarDays,
  Eye,
  FileText,
  Heart,
  Info,
  ListFilter,
  Search,
  UserRound,
} from "lucide-react";
import {
  DateInputField,
  FormDrawer,
  FormModal,
  FormPage,
  FormSection,
  SelectInputField,
  TextInputField,
  TextareaInputField,
} from "@/components/forms";
import { DataTable, type DataTableColumn, DetailDrawer } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormValues = {
  requesterName: string;
  contactMethod: string;
  contactDetail: string;
  intentionType: string;
  intention: string;
  suggestedDate: string;
  suggestedTimeRange: string;
  preferredSite: string;
  observations: string;
};

const demoValues: FormValues = {
  requesterName: "Elena Ríos (dato ficticio)",
  contactMethod: "correo",
  contactDetail: "elena.rios@example.org",
  intentionType: "deceased",
  intention: "Por el eterno descanso de una persona ficticia.",
  suggestedDate: "2026-11-17",
  suggestedTimeRange: "mañana",
  preferredSite: "Templo parroquial (muestra)",
  observations: "Ejemplo visual; sin instrucciones operativas.",
};

type Example = {
  id: string;
  requester: string;
  category: string;
  date: string;
  intention: string;
  note: string;
};

const examples: Example[] = [
  {
    id: "DEMO-INT-01",
    requester: "Elena Ríos (ejemplo)",
    category: "Por un difunto",
    date: "17 nov. 2026",
    intention: "Por el eterno descanso de una persona ficticia.",
    note: "Referencia visual; no es un registro parroquial.",
  },
  {
    id: "DEMO-INT-02",
    requester: "Andrés Luna (ejemplo)",
    category: "Acción de gracias",
    date: "Sin fecha preferida",
    intention: "Acción de gracias por una intención ficticia.",
    note: "Referencia visual; no es un registro parroquial.",
  },
  {
    id: "DEMO-INT-03",
    requester: "Lucía Sol (ejemplo)",
    category: "Por una familia",
    date: "22 nov. 2026",
    intention: "Por una familia ficticia de la comunidad.",
    note: "Referencia visual; no es un registro parroquial.",
  },
];

function usePreviewForm(onPreview: (values: FormValues) => void) {
  const form = useForm<FormValues>({ defaultValues: demoValues });
  return { form, onSubmit: (values: FormValues) => onPreview(values) };
}

function IntentionFields({ control }: { control: Control<FormValues> }) {
  return (
    <div className="space-y-5">
      <FormSection
        title="Datos del solicitante"
        description="Información ficticia para revisar la composición del formulario."
        icon={<UserRound className="size-4" />}
      >
        <TextInputField
          control={control}
          name="requesterName"
          label="Nombre de contacto (ejemplo)"
          placeholder="Nombre de muestra"
        />
        <SelectInputField
          control={control}
          name="contactMethod"
          label="Medio de contacto preferido (ejemplo)"
          options={[
            { value: "correo", label: "Correo electrónico" },
            { value: "telefono", label: "Teléfono" },
          ]}
        />
        <div className="sm:col-span-2">
          <TextInputField
            control={control}
            name="contactDetail"
            label="Dato de contacto (ficticio)"
            placeholder="persona@example.org"
          />
        </div>
      </FormSection>

      <FormSection
        title="Información de la intención"
        description="Categoría configurable y texto breve de ejemplo."
        icon={<Heart className="size-4" />}
      >
        <SelectInputField
          control={control}
          name="intentionType"
          label="Categoría (muestra)"
          options={[
            { value: "deceased", label: "Por una persona difunta" },
            { value: "living", label: "Por una persona viva, familia o comunidad" },
            { value: "thanksgiving", label: "Acción de gracias" },
            { value: "other", label: "Otra intención pastoral" },
          ]}
        />
        <div className="sm:col-span-2">
          <TextareaInputField
            control={control}
            name="intention"
            label="Texto breve (ficticio)"
            placeholder="Ejemplo sin datos personales reales."
            rows={3}
            maxLength={250}
          />
        </div>
      </FormSection>

      <FormSection
        title="Preferencia de celebración"
        description="Una preferencia no constituye una asignación ni una reserva."
        icon={<CalendarDays className="size-4" />}
      >
        <DateInputField control={control} name="suggestedDate" label="Fecha preferida (opcional)" />
        <SelectInputField
          control={control}
          name="suggestedTimeRange"
          label="Franja horaria preferida (ejemplo)"
          options={[
            { value: "mañana", label: "Mañana (ejemplo)" },
            { value: "tarde", label: "Tarde (ejemplo)" },
          ]}
        />
        <div className="sm:col-span-2">
          <TextInputField
            control={control}
            name="preferredSite"
            label="Sede preferida (ejemplo)"
            placeholder="Sede de muestra"
          />
        </div>
        <div className="sm:col-span-2">
          <TextareaInputField
            control={control}
            name="observations"
            label="Observaciones operativas mínimas (ejemplo)"
            placeholder="Notas ficticias, sin información sensible."
            rows={2}
            maxLength={250}
          />
        </div>
      </FormSection>
    </div>
  );
}

export function MassIntentionsVisualPilot() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Example | null>(null);
  const [preview, setPreview] = useState<FormValues | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ampliado");
  const modal = usePreviewForm((values) => {
    setPreview(values);
    setModalOpen(false);
  });
  const page = usePreviewForm(setPreview);
  const drawer = usePreviewForm((values) => {
    setPreview(values);
    setDrawerOpen(false);
  });
  const filtered = useMemo(
    () =>
      examples.filter((item) =>
        `${item.id} ${item.requester} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const columns: DataTableColumn<Example>[] = [
    {
      id: "id",
      header: "Referencia",
      cell: (item) => <span className="font-medium text-primary">{item.id}</span>,
    },
    { id: "requester", header: "Solicitante ficticio", cell: (item) => item.requester },
    {
      id: "category",
      header: "Categoría",
      className: "hidden md:table-cell",
      cell: (item) => item.category,
    },
    {
      id: "date",
      header: "Fecha preferida",
      className: "hidden md:table-cell",
      cell: (item) => item.date,
    },
    {
      id: "detail",
      header: "Detalle",
      className: "w-20",
      cell: (item) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Ver detalle de ${item.id}`}
          onClick={() => setSelected(item)}
        >
          Ver
        </Button>
      ),
    },
  ];

  const openModal = () => {
    modal.form.reset(demoValues);
    setModalOpen(true);
  };
  const openDrawer = () => {
    drawer.form.reset(demoValues);
    setDrawerOpen(true);
  };

  return (
    <section
      aria-labelledby="mass-intentions-title"
      className="w-full min-w-0 max-w-[calc(100vw-2rem)] space-y-5 overflow-x-hidden"
    >
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 id="mass-intentions-title" className="font-heading text-lg font-bold">
            Intenciones de Misa · prototipo visual
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Composición del formulario, consulta y detalle con datos ficticios. La captura solo
            genera una vista previa local.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button type="button" className="gap-2" onClick={openModal}>
            <FileText className="size-4" />
            Abrir modal estándar
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={openDrawer}>
            <Eye className="size-4" />
            Abrir panel lateral
          </Button>
        </div>
      </div>

      <div
        role="note"
        className="flex min-w-0 gap-3 rounded-xl border border-accent/50 bg-secondary/60 p-4 text-sm"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <span className="font-semibold">Demostración visual.</span> Canal presencial de ejemplo.
          No registra solicitudes, asigna celebraciones ni confirma procesos; tampoco guarda ni
          envía información.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 max-w-full">
        <TabsList className="flex h-auto w-full max-w-full flex-wrap justify-start">
          <TabsTrigger value="ampliado" className="gap-2 whitespace-normal">
            <ListFilter className="size-4" /> Formulario ampliado
          </TabsTrigger>
          <TabsTrigger value="modal" className="gap-2 whitespace-normal">
            <FileText className="size-4" /> Modal estándar
          </TabsTrigger>
          <TabsTrigger value="lateral" className="gap-2 whitespace-normal">
            <Eye className="size-4" /> Panel lateral
          </TabsTrigger>
          <TabsTrigger value="consulta" className="gap-2 whitespace-normal">
            <Search className="size-4" /> Consulta y detalle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ampliado" className="min-w-0 max-w-full pt-4">
          <FormPage
            form={page.form}
            title="Registrar intención de Misa"
            description="Formulario demostrativo de recepción presencial. Completa o cambia los datos para ver la composición; no crea un registro."
            eyebrow="Liturgia y celebraciones · prototipo"
            icon={<CalendarDays className="size-5" />}
            submitLabel="Mostrar vista previa"
            cancelLabel="Restablecer ejemplo"
            onSubmit={page.onSubmit}
            onCancel={() => {
              page.form.reset(demoValues);
              setPreview(null);
            }}
            className="min-w-0 w-full max-w-full"
          >
            <IntentionFields control={page.form.control} />
          </FormPage>
        </TabsContent>

        <TabsContent value="modal" className="min-w-0 max-w-full space-y-4 pt-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Modal estándar</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ventana centrada para revisar la misma composición en un formato compacto.
            </p>
            <Button type="button" className="mt-4" onClick={openModal}>
              Abrir modal de ejemplo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="lateral" className="min-w-0 max-w-full space-y-4 pt-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Panel lateral</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Formulario contextual que conserva a la vista el módulo de origen.
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={openDrawer}>
              Abrir panel de ejemplo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="consulta" className="min-w-0 max-w-full space-y-4 pt-4">
          <div className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
            <label htmlFor="intention-search" className="text-sm font-medium">
              Buscar ejemplos
            </label>
            <Input
              id="intention-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Referencia, solicitante ficticio o categoría"
              className="min-w-0 sm:max-w-md"
            />
            <span className="text-xs text-muted-foreground">
              {filtered.length} referencias demostrativas
            </span>
          </div>
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <DataTable
              rows={filtered}
              columns={columns}
              getRowId={(item) => item.id}
              emptyTitle="Sin coincidencias"
              emptyDescription="Prueba otra búsqueda entre los datos ficticios."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Usa «Ver» para consultar la ficha ficticia. No es una partida sacramental ni un registro
            parroquial.
          </p>
        </TabsContent>
      </Tabs>

      {preview && <PreviewSummary values={preview} />}

      <FormModal
        form={modal.form}
        title="Registrar intención de Misa · demostración"
        description="Datos de muestra para visualizar el modal. Nada se registra, guarda ni envía."
        icon={<CalendarDays className="size-5" />}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={modal.onSubmit}
        submitLabel="Mostrar vista previa"
        cancelLabel="Cerrar"
        contentClassName="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-3xl"
      >
        <IntentionFields control={modal.form.control} />
      </FormModal>

      <FormDrawer
        form={drawer.form}
        title="Intención de Misa · panel de ejemplo"
        description="Edición exclusivamente visual de datos ficticios; no modifica registros."
        icon={<UserRound className="size-5" />}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSubmit={drawer.onSubmit}
        submitLabel="Mostrar vista previa"
        cancelLabel="Cerrar"
      >
        <IntentionFields control={drawer.form.control} />
      </FormDrawer>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Referencia demostrativa"
        description={selected?.id ?? "Detalle de ejemplo"}
      >
        {selected && (
          <div className="space-y-5 py-3">
            <div className="rounded-lg border border-accent/50 bg-secondary/50 p-3 text-sm">
              Información ficticia para revisar el detalle.
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Solicitante ficticio" value={selected.requester} />
              <DetailItem label="Categoría de ejemplo" value={selected.category} />
              <DetailItem label="Fecha preferida" value={selected.date} />
              <DetailItem label="Referencia" value={selected.id} />
              <div className="sm:col-span-2">
                <DetailItem label="Texto de ejemplo" value={selected.intention} />
              </div>
              <div className="sm:col-span-2">
                <DetailItem label="Nota" value={selected.note} />
              </div>
            </dl>
          </div>
        )}
      </DetailDrawer>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function PreviewSummary({ values }: { values: FormValues }) {
  return (
    <div role="status" className="rounded-xl border border-accent/50 bg-secondary/50 p-4">
      <h3 className="font-semibold">Vista previa local</h3>
      <p className="mt-1 text-sm">
        {values.requesterName || "Solicitante ficticio"} ·{" "}
        {values.suggestedDate || "Sin fecha preferida"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Solo se actualizaron datos temporales de esta vista; ningún registro fue creado.
      </p>
    </div>
  );
}
