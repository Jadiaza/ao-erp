import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog, FieldGroup } from "@/components/modules";
import {
  FormModal,
  FormSection,
  SelectInputField,
  TextInputField,
  EmailInputField,
} from "@/components/forms";
import { Button } from "@/components/ui/button";
import { useLocalCollection } from "@/data/local-repository";
import {
  christianDepartments,
  christianResponsibles,
  christianSites,
  institutionalDepartments,
  institutionalResponsibles,
  institutionalSites,
  type InstitutionalDepartment,
  type InstitutionalResponsible,
  type InstitutionalSite,
} from "@/data/institutional-structure-demo";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

type Editor = { kind: "site" | "department" | "responsible"; id?: string };
type InstitutionFormValues = {
  name: string;
  address: string;
  role: string;
  email: string;
  siteId: string;
  responsibleId: string;
};

export function InstitutionOperationsPanel() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);

  const sites = useLocalCollection(
    getProfileStorageKey("ao-erp:institution:sites", settings.profile),
    christian ? christianSites : institutionalSites,
  );
  const responsibles = useLocalCollection(
    getProfileStorageKey("ao-erp:institution:responsibles", settings.profile),
    christian ? christianResponsibles : institutionalResponsibles,
  );
  const departments = useLocalCollection(
    getProfileStorageKey("ao-erp:institution:departments", settings.profile),
    christian ? christianDepartments : institutionalDepartments,
  );
  const scopedSites = sites.records.filter(
    (s) => !s.organizationId || s.organizationId === settings.organizationId,
  );
  const scopedResponsibles = responsibles.records.filter(
    (r) => !r.organizationId || r.organizationId === settings.organizationId,
  );
  const scopedDepartments = departments.records.filter(
    (d) => !d.organizationId || d.organizationId === settings.organizationId,
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: Editor["kind"]; id: string } | null>(
    null,
  );
  const form = useForm<InstitutionFormValues>({
    defaultValues: { name: "", address: "", role: "", email: "", siteId: "", responsibleId: "" },
    mode: "onBlur",
  });
  const selectedSite = editor?.id ? sites.records.find((item) => item.id === editor.id) : undefined;
  const selectedResponsible = editor?.id
    ? responsibles.records.find((item) => item.id === editor.id)
    : undefined;
  const selectedDepartment = editor?.id
    ? departments.records.find((item) => item.id === editor.id)
    : undefined;
  const title =
    editor?.kind === "site"
      ? "sede"
      : editor?.kind === "department"
        ? "dependencia"
        : "responsable";

  useEffect(() => {
    form.reset({
      name: selectedSite?.name ?? selectedResponsible?.name ?? selectedDepartment?.name ?? "",
      address: selectedSite?.address ?? "",
      role: selectedResponsible?.role ?? "",
      email: selectedResponsible?.email ?? "",
      siteId: selectedDepartment?.siteId ?? sites.records[0]?.id ?? "",
      responsibleId: selectedDepartment?.responsibleId ?? responsibles.records[0]?.id ?? "",
    });
  }, [
    editor?.id,
    editor?.kind,
    selectedSite,
    selectedResponsible,
    selectedDepartment,
    sites.records,
    responsibles.records,
    form,
  ]);

  const remove = () => {
    if (!deleteTarget) return;
    if (
      deleteTarget.kind === "site" &&
      departments.records.some((item) => item.siteId === deleteTarget.id)
    )
      return;
    if (
      deleteTarget.kind === "responsible" &&
      departments.records.some((item) => item.responsibleId === deleteTarget.id)
    )
      return;
    if (deleteTarget.kind === "site") sites.remove(deleteTarget.id);
    if (deleteTarget.kind === "responsible") responsibles.remove(deleteTarget.id);
    if (deleteTarget.kind === "department") departments.remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const save = (values: InstitutionFormValues) => {
    const name = values.name.trim();
    if (name.length < 3 || !editor) {
      form.setError("name", { message: "Ingresa al menos 3 caracteres." });
      throw new Error("Nombre inválido.");
    }
    if (editor.kind === "site") {
      const record: InstitutionalSite = {
        id: selectedSite?.id ?? `SED-DEMO-${Date.now()}`,
        name,
        address: values.address.trim(),
        status: "active",
        organizationId: settings.organizationId,
      };
      if (selectedSite) sites.update(record.id, record);
      else sites.create(record);
    }
    if (editor.kind === "responsible") {
      const record: InstitutionalResponsible = {
        id: selectedResponsible?.id ?? `RES-DEMO-${Date.now()}`,
        name,
        role: values.role.trim(),
        email: values.email.trim(),
        status: "active",
        organizationId: settings.organizationId,
      };
      if (selectedResponsible) responsibles.update(record.id, record);
      else responsibles.create(record);
    }
    if (editor.kind === "department") {
      const siteId = values.siteId;
      const responsibleId = values.responsibleId;
      if (!siteId || !responsibleId) throw new Error("Sede y responsable son obligatorios.");
      const record: InstitutionalDepartment = {
        id: selectedDepartment?.id ?? `DEP-DEMO-${Date.now()}`,
        name,
        siteId,
        responsibleId,
        status: "active",
        organizationId: settings.organizationId,
      };
      if (selectedDepartment) departments.update(record.id, record);
      else departments.create(record);
    }
    setEditor(null);
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4">
      <div>
        <h2 className="font-semibold">
          {christian ? "Sedes, responsables y dependencias congregacionales" : "Estructura operativa local"}
        </h2>
        <p className="text-xs text-muted-foreground">
          Sedes, dependencias y responsables asociados a {settings.organizationId}.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            kind: "site" as const,
            label: christian ? "Sedes / congregaciones" : "Sedes",
            records: scopedSites,
            render: (item: InstitutionalSite) => (
              <>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.address}</p>
              </>
            ),
          },
          {
            kind: "responsible" as const,
            label: "Responsables",
            records: scopedResponsibles,
            render: (item: InstitutionalResponsible) => (
              <>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </>
            ),
          },
          {
            kind: "department" as const,
            label: "Dependencias",
            records: scopedDepartments,
            render: (item: InstitutionalDepartment) => (
              <>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {scopedSites.find((site) => site.id === item.siteId)?.name} ·{" "}
                  {scopedResponsibles.find((person) => person.id === item.responsibleId)?.name}
                </p>
              </>
            ),
          },
        ].map((group) => (
          <div key={group.kind} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <Button size="sm" variant="outline" onClick={() => setEditor({ kind: group.kind })}>
                <Plus className="mr-1 size-3.5" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {group.records.map((item) => (
                <div key={item.id} className="flex items-start gap-2 rounded-md bg-muted/30 p-2">
                  <div className="min-w-0 flex-1">{group.render(item as never)}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${group.label}`}
                    onClick={() => setEditor({ kind: group.kind, id: item.id })}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Eliminar ${group.label}`}
                    onClick={() => setDeleteTarget({ kind: group.kind, id: item.id })}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <FormModal
        key={`${editor?.kind ?? "none"}-${editor?.id ?? "new"}`}
        title={`Registrar ${title}`}
        description="Los cambios se conservan en el repositorio local institucional."
        open={!!editor}
        form={form}
        onOpenChange={(open) => {
          if (!open) {
            setEditor(null);
            form.reset();
          }
        }}
        submitLabel={editor?.id ? "Guardar cambios" : "Crear registro"}
        onSubmit={save}
      >
        {editor?.kind === "site" && (
          <>
            <FieldGroup label="Nombre de la sede">
              <TextInputField
                control={form.control}
                name="name"
                label="Nombre de la sede"
                required
              />
            </FieldGroup>
            <FieldGroup label="Dirección">
              <TextInputField control={form.control} name="address" label="Dirección" required />
            </FieldGroup>
          </>
        )}
        {editor?.kind === "responsible" && (
          <>
            <FieldGroup label="Nombre">
              <TextInputField control={form.control} name="name" label="Nombre" required />
            </FieldGroup>
            <FieldGroup label="Cargo">
              <TextInputField control={form.control} name="role" label="Cargo" required />
            </FieldGroup>
            <FieldGroup label="Correo">
              <EmailInputField control={form.control} name="email" label="Correo" required />
            </FieldGroup>
          </>
        )}
        {editor?.kind === "department" && (
          <>
            <FieldGroup label="Nombre">
              <TextInputField control={form.control} name="name" label="Nombre" required />
            </FieldGroup>
            <FieldGroup label="Sede">
              <SelectInputField
                control={form.control}
                name="siteId"
                label="Sede"
                required
                options={scopedSites.map((site) => ({ value: site.id, label: site.name }))}
              />
            </FieldGroup>
            <FieldGroup label="Responsable">
              <SelectInputField
                control={form.control}
                name="responsibleId"
                label="Responsable"
                required
                options={scopedResponsibles.map((person) => ({
                  value: person.id,
                  label: person.name,
                }))}
              />
            </FieldGroup>
          </>
        )}
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar registro institucional"
        description="Solo se eliminará el registro si no tiene dependencias relacionadas. Reasigna primero las relaciones existentes."
        confirmLabel="Eliminar"
        onConfirm={remove}
      />
    </section>
  );
}
