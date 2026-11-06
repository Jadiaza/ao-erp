import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormModal, FormSection, TextareaInputField, TextInputField } from "@/components/forms";
import { ConfirmDialog } from "@/components/modules/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecordValues = { name: string; detail: string };
export type DemoCrudRecord = RecordValues & { id: string };

export function DemoCrudPanel({
  storageKey,
  title,
  description,
  initialRecords,
}: {
  storageKey: string;
  title: string;
  description: string;
  initialRecords: DemoCrudRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const [editing, setEditing] = useState<DemoCrudRecord | null>(null);
  const [deleting, setDeleting] = useState<DemoCrudRecord | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm<RecordValues>({ defaultValues: { name: "", detail: "" } });
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setRecords(JSON.parse(saved) as DemoCrudRecord[]);
    } catch {
      /* Continúa con fixtures si el almacenamiento está restringido. */
    }
  }, [storageKey]);
  const persist = (next: DemoCrudRecord[]) => {
    setRecords(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* El CRUD permanece en memoria durante la sesión. */
    }
  };
  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", detail: "" });
    setOpen(true);
  };
  const openEdit = (record: DemoCrudRecord) => {
    setEditing(record);
    form.reset({ name: record.name, detail: record.detail });
    setOpen(true);
  };
  const submit = (values: RecordValues) => {
    const name = values.name.trim();
    const detail = values.detail.trim();
    if (name.length < 2) {
      form.setError("name", { message: "Escribe un nombre de referencia." });
      return;
    }
    if (detail.length < 3) {
      form.setError("detail", { message: "Agrega una descripción breve." });
      return;
    }
    const next = editing
      ? records.map((record) => (record.id === editing.id ? { ...record, name, detail } : record))
      : [...records, { name, detail, id: `DEMO-${Date.now()}` }];
    persist(next);
    setOpen(false);
  };
  const sorted = useMemo(() => records.slice().reverse(), [records]);
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          Agregar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {record.name}
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      {record.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{record.detail}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(record)}
                      >
                        <Pencil className="mr-1 size-3.5" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleting(record)}
                      >
                        <Trash2 className="mr-1 size-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No hay registros. Agrega el primero para la demostración.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Vista previa local: los cambios se conservan en el navegador y no representan persistencia
          institucional.
        </p>
      </CardContent>
      <FormModal
        form={form}
        title={editing ? `Editar ${title.toLowerCase()}` : `Agregar ${title.toLowerCase()}`}
        description="Completa los datos de referencia. La acción modifica únicamente el estado local de la demostración."
        open={open}
        onOpenChange={setOpen}
        onSubmit={submit}
        submitLabel={editing ? "Aplicar vista previa" : "Crear vista previa"}
      >
        <FormSection
          title="Información básica"
          description="Usa nombres y descripciones coherentes con la institución de muestra."
        >
          <TextInputField
            control={form.control}
            name="name"
            label="Nombre"
            required
            placeholder="Nombre de referencia"
          />
          <TextareaInputField
            control={form.control}
            name="detail"
            label="Descripción"
            required
            placeholder="Descripción breve"
          />
        </FormSection>
      </FormModal>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(next) => !next && setDeleting(null)}
        title="Eliminar registro de demostración"
        description={`Se quitará “${deleting?.name ?? "este registro"}” del estado local del navegador.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleting) persist(records.filter((record) => record.id !== deleting.id));
          setDeleting(null);
        }}
      />
    </Card>
  );
}
