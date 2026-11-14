import { useMemo, useState } from "react";
import { ArrowLeft, FileCheck2, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { FormModal, FormSection, TextInputField } from "@/components/forms";
import {
  DataTable,
  type DataTableColumn,
  ConfirmDialog,
  DemoNotice,
  DetailDrawer,
  ModuleLayout,
  SearchInput,
  StatCard,
  StatusBadge,
} from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  archiveAreaConfig,
  archiveDemoRecords,
  type ArchiveArea,
  type ArchiveDemoRecord,
} from "@/data/archive-demo";
import { useLocalCollection } from "@/data/local-repository";

type ArchiveFormValues = { title: string; type: string; responsible: string; notes: string };

export function ArchiveAreaScreen({ area }: { area: ArchiveArea }) {
  const config = archiveAreaConfig[area];
  const form = useForm<ArchiveFormValues>({
    defaultValues: { title: "", type: "", responsible: "", notes: "" },
    mode: "onBlur",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<ArchiveDemoRecord | null>(null);
  const [editing, setEditing] = useState<ArchiveDemoRecord | null>(null);
  const [query, setQuery] = useState("");
  const { records, create, update, remove } = useLocalCollection(
    `ao-erp:archive:${area}`,
    archiveDemoRecords.filter((record) => record.area === area),
  );
  const visible = useMemo(
    () =>
      records.filter((record) =>
        `${record.id} ${record.title} ${record.type} ${record.responsible}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [records, query],
  );
  const columns: DataTableColumn<ArchiveDemoRecord>[] = [
    {
      id: "title",
      header: "Registro",
      cell: (record) => (
        <div>
          <p className="font-semibold">{record.title}</p>
          <p className="text-xs text-muted-foreground">
            {record.id} · {record.type}
          </p>
        </div>
      ),
    },
    { id: "responsible", header: "Responsable", cell: (record) => record.responsible },
    { id: "updatedAt", header: "Actualizado", cell: (record) => record.updatedAt },
    { id: "status", header: "Estado", cell: (record) => <StatusBadge status={record.status} /> },
  ];
  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Gestión y control" },
        { label: "Gestión documental", href: "/app/gestion-documental" },
        { label: config.title },
      ]}
      title={config.title}
      description={config.description}
      actions={
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            form.reset({ title: "", type: "", responsible: "", notes: "" });
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Nuevo registro
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Registros demo"
            value={String(records.length)}
            icon={FileCheck2}
            caption="Persistencia local"
          />
          <StatCard
            label="Pendientes"
            value={String(records.filter((record) => record.status === "pending").length)}
            icon={ShieldAlert}
            caption="Revisión requerida"
          />
          <StatCard label="Motor externo" value="No conectado" caption="Paperless-NGX pendiente" />
        </>
      }
    >
      <DemoNotice>
        Esta pantalla funciona con datos locales de demostración. Paperless-NGX no está conectado;
        no se ejecuta OCR, no se inventan identificadores externos y no se confirma almacenamiento
        remoto.
      </DemoNotice>
      {area === "digitalizacion" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex gap-3 p-4 text-sm text-amber-900">
            <ShieldAlert className="size-5 shrink-0" />
            <p>
              <strong>Motor OCR no conectado.</strong> Los estados de esta cola son referencias demo
              y no representan procesamiento real.
            </p>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar en esta área"
          className="w-full sm:w-80"
        />
        <Link
          to="/app/gestion-documental"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Volver al repositorio
        </Link>
      </div>
      <DataTable
        rows={visible}
        columns={columns}
        getRowId={(record) => record.id}
        onRowClick={setSelected}
        emptyTitle={config.emptyTitle}
      />
      <FormModal
        title={editing ? "Editar registro documental" : "Nuevo registro documental"}
        description={config.description}
        form={form}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            form.reset({ title: "", type: "", responsible: "", notes: "" });
          }
        }}
        onSubmit={(values) => {
          if (values.title.trim().length < 3) {
            form.setError("title", { message: "Ingresa un título válido." });
            throw new Error("Título inválido.");
          }
          if (editing) {
            update(editing.id, {
              title: values.title.trim(),
              type: values.type.trim() || "Registro documental",
              responsible: values.responsible.trim() || "Pendiente de asignar",
              notes: values.notes.trim() || "Registro guardado en modo demostraciÃ³n.",
              updatedAt: "Hoy · demo",
            });
            return;
          }
          create({
            id: `ARC-${area.toUpperCase()}-${Date.now()}`,
            title: values.title.trim(),
            type: values.type.trim() || "Registro documental",
            responsible: values.responsible.trim() || "Pendiente de asignar",
            status: "pending",
            notes: values.notes.trim() || "Registro creado en modo demostración.",
            updatedAt: "Hoy · demo",
            area,
            demoOnly: true,
          });
        }}
        submitLabel={editing ? "Actualizar registro" : "Guardar registro"}
      >
        <FormSection
          title="Datos del registro"
          description="El registro se guarda únicamente en el repositorio local de demostración."
        >
          <TextInputField control={form.control} name="title" label="Nombre o título" required />
          <TextInputField control={form.control} name="type" label="Tipo documental" />
          <TextInputField control={form.control} name="responsible" label="Responsable" />
          <TextInputField control={form.control} name="notes" label="Observaciones" />
        </FormSection>
      </FormModal>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? config.title}
        description={selected?.id}
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="text-xs text-muted-foreground">Tipo</span>
                <br />
                {selected.type}
              </p>
              <p>
                <span className="text-xs text-muted-foreground">Responsable</span>
                <br />
                {selected.responsible}
              </p>
              <p>
                <span className="text-xs text-muted-foreground">Estado</span>
                <br />
                <StatusBadge status={selected.status} />
              </p>
              <p>
                <span className="text-xs text-muted-foreground">Actualizado</span>
                <br />
                {selected.updatedAt}
              </p>
            </div>
            <p className="rounded-lg bg-muted/50 p-3 text-sm">{selected.notes}</p>
            <Button
              variant="outline"
              onClick={() => {
                update(selected.id, {
                  notes: `${selected.notes} Revisión consultada en modo demo.`,
                });
                setSelected(null);
              }}
            >
              Registrar revisión demo
            </Button>
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(selected);
                  form.reset({
                    title: selected.title,
                    type: selected.type,
                    responsible: selected.responsible,
                    notes: selected.notes,
                  });
                  setSelected(null);
                  setFormOpen(true);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </Button>
              <ConfirmDialog
                title="Eliminar registro documental"
                description={`Esta acciÃ³n eliminarÃ¡ “${selected.title}” del almacenamiento local de demostraciÃ³n.`}
                confirmLabel="Eliminar"
                trigger={
                  <Button type="button" variant="destructive">
                    <Trash2 className="mr-2 size-4" />
                    Eliminar
                  </Button>
                }
                onConfirm={() => {
                  remove(selected.id);
                  setSelected(null);
                }}
              />
            </div>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
