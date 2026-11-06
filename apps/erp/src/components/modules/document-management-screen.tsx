import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  ClipboardList,
  FileArchive,
  FileClock,
  FileLock2,
  FileText,
  Folder,
  FolderOpen,
  History,
  Pencil,
  ScanLine,
  Share2,
  ShieldCheck,
  Upload,
  FolderTree,
} from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  InfoItem,
  ModuleLayout,
  SearchInput,
  StatCard,
  StatusBadge,
} from "@/components/modules";
import { FormModal, FormSection, TextInputField } from "@/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { institutionalDocuments, type InstitutionalDocument } from "@/data/system-demo";
import { useLocalCollection } from "@/data/local-repository";

type DocumentFormValues = { name: string; type: string; owner: string };

const folders = [
  "Todos los documentos",
  "Pastoral / Planificación",
  "Pastoral / Evidencias",
  "Administración / Actas",
  "Economía / Informes",
  "Patrimonio / Jurídicos",
  "Archivo sacramental / Restringido",
];

const archiveAreas = [
  {
    title: "Recepción documental",
    description: "Registra ingresos físicos y digitales, remitentes, procedencia y lotes.",
    icon: Upload,
    href: "/app/gestion-documental/recepcion",
  },
  {
    title: "Digitalización y OCR",
    description: "Controla captura, calidad, imágenes maestras y extracción de texto.",
    icon: ScanLine,
    href: "/app/gestion-documental/digitalizacion",
  },
  {
    title: "Repositorio documental",
    description: "Consulta documentos, metadatos, versiones y relaciones archivísticas.",
    icon: FileArchive,
    href: "/app/gestion-documental/repositorio",
  },
  {
    title: "Clasificación archivística",
    description: "Organiza fondos, secciones, series y subseries documentales.",
    icon: FolderTree,
    href: "/app/gestion-documental/clasificacion",
  },
  {
    title: "Expedientes, libros y folios",
    description: "Vincula expedientes y unidades físicas con sus imágenes digitalizadas.",
    icon: BookOpen,
    href: "/app/gestion-documental/expedientes",
  },
  {
    title: "Instrumentos archivísticos",
    description: "Administra CCD, TRD, TVD e inventarios documentales.",
    icon: ClipboardList,
    href: "/app/gestion-documental/instrumentos",
  },
  {
    title: "Transferencias documentales",
    description: "Prepara inventarios, actas y entregas entre archivos.",
    icon: Share2,
    href: "/app/gestion-documental/transferencias",
  },
  {
    title: "Conservación y preservación",
    description: "Controla integridad, originales, derivados y preservación.",
    icon: ShieldCheck,
    href: "/app/gestion-documental/conservacion",
  },
] as const;

export function DocumentManagementScreen() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InstitutionalDocument | null>(null);
  const form = useForm<DocumentFormValues>({
    defaultValues: { name: "", type: "Documento local", owner: "" },
    mode: "onBlur",
  });
  const { records, create, update } = useLocalCollection(
    "ao-erp:document-management",
    institutionalDocuments,
  );
  const [folder, setFolder] = useState("Todos los documentos");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<InstitutionalDocument | null>(null);
  const visible = useMemo(
    () =>
      records.filter(
        (doc) =>
          (folder === "Todos los documentos" || doc.folder === folder) &&
          (category === "Todas" || doc.category === category) &&
          `${doc.id} ${doc.name} ${doc.folder} ${doc.type} ${doc.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [records, folder, category, query],
  );
  const columns: DataTableColumn<InstitutionalDocument>[] = [
    {
      id: "name",
      header: "Documento",
      cell: (doc) => (
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-8 items-center justify-center rounded-lg ${doc.access === "Restringido" ? "bg-amber-50 text-amber-700" : "bg-primary/5 text-primary"}`}
          >
            {doc.access === "Restringido" ? (
              <FileLock2 className="size-4" />
            ) : (
              <FileText className="size-4" />
            )}
          </span>
          <span>
            <span className="block font-semibold">{doc.name}</span>
            <span className="text-xs text-muted-foreground">
              {doc.id} · {doc.type}
            </span>
          </span>
        </div>
      ),
    },
    { id: "category", header: "Clasificación", cell: (doc) => doc.category },
    { id: "owner", header: "Responsable", cell: (doc) => doc.owner },
    { id: "version", header: "Versión", cell: (doc) => doc.version },
    {
      id: "access",
      header: "Acceso",
      cell: (doc) => (
        <StatusBadge
          status={
            doc.access === "Restringido"
              ? "overdue"
              : doc.access === "Interno"
                ? "pending"
                : "active"
          }
          label={doc.access}
        />
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (doc) => (
        <StatusBadge
          status={
            doc.status === "Vigente"
              ? "approved"
              : doc.status === "En revisión"
                ? "pending"
                : "inactive"
          }
          label={doc.status}
        />
      ),
    },
  ];
  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Gestión y control" },
        { label: "Gestión documental" },
      ]}
      title="Gestión documental"
      description="Repositorio institucional para clasificar, localizar y revisar documentos con control de versiones y acceso."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            form.reset({ name: "", type: "Documento local", owner: "" });
            setFormOpen(true);
          }}
        >
          Registrar documento
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Documentos en repositorio"
            value="248"
            icon={FileArchive}
            caption="Catálogo de muestra"
          />
          <StatCard
            label="Carpetas organizadas"
            value="18"
            icon={FolderOpen}
            caption="Por área y tipo documental"
          />
          <StatCard
            label="En revisión"
            value="12"
            icon={FileClock}
            caption="Pendientes de revisión interna"
          />
          <StatCard
            label="Acceso restringido"
            value="7"
            icon={ShieldCheck}
            caption="Metadatos limitados en la vista"
          />
        </>
      }
    >
      <DemoNotice>
        Repositorio de ejemplo. La gestión documental general no sustituye los libros sacramentales
        ni el módulo de certificados. Los documentos sacramentales aparecen solo como referencias
        clasificadas y su contenido se mantiene oculto en esta vista.
      </DemoNotice>
      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="h-fit shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Folder className="size-4 text-primary" />
              Carpetas y categorías
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {folders.map((item) => (
              <button
                key={item}
                onClick={() => setFolder(item)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs ${folder === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
              >
                <FolderOpen className="size-4 shrink-0" />
                <span className="flex-1">{item}</span>
                {item === "Todos los documentos" && <span className="text-[10px]">248</span>}
                {item.includes("Restringido") && <FileLock2 className="size-3.5" />}
              </button>
            ))}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <FileLock2 className="size-3.5" />
                Archivo restringido
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-amber-800">
                El explorador muestra solo metadatos mínimos. El contenido requiere autorización y
                justificación específicas.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Pastorales", count: "86", color: "text-emerald-700" },
              { label: "Administrativos", count: "72", color: "text-sky-700" },
              { label: "Contables y jurídicos", count: "54", color: "text-violet-700" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted/50">
                  <Archive className={`size-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{item.count}</p>
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <Card className="shadow-none">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Explorador de documentos</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {folder} · {visible.length} elementos visibles
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Buscar documento"
                    className="w-full sm:w-56"
                  />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Todas",
                        "Pastoral",
                        "Administrativo",
                        "Contable",
                        "Jurídico",
                        "Sacramental",
                      ].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item === "Todas" ? "Todas las categorías" : item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <DataTable
                rows={visible}
                columns={columns}
                getRowId={(doc) => doc.id}
                onRowClick={setSelected}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <section className="space-y-4" aria-labelledby="archive-processes-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="archive-processes-title" className="text-lg font-semibold tracking-tight">
              Procesos de Archivo Eclesiástico
            </h2>
            <p className="text-sm text-muted-foreground">
              Las ocho áreas especializadas se integran al repositorio institucional y comparten sus
              criterios de clasificación, consulta y seguridad.
            </p>
          </div>
          <Link
            to="/app/libros-sacramentales"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Libros sacramentales <BookOpen className="size-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {archiveAreas.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.title}
                to={area.href}
                className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.02]"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-primary">
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{area.title}</h3>
                <p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">
                  {area.description}
                </p>
                <span className="mt-3 inline-flex text-xs font-medium text-primary group-hover:underline">
                  Abrir área{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Link
            to="/app/documentos-certificados"
            className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-primary/40"
          >
            <span>
              <span className="block text-sm font-semibold">Documentos y certificados</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Solicitudes y emisión de documentos oficiales
              </span>
            </span>
            <span aria-hidden="true" className="text-lg text-primary">
              →
            </span>
          </Link>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold">Separación de responsabilidades</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              El repositorio conserva las imágenes y referencias archivísticas. Los asientos
              sacramentales y los certificados mantienen su gestión en sus módulos de origen.
            </p>
          </div>
        </div>
      </section>
      <FormModal
        title={editing ? "Editar documento" : "Registrar documento"}
        description="Crea una ficha documental local. La carga de archivo queda representada por metadatos y no se envía a un servidor."
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            form.reset({ name: "", type: "Documento local", owner: "" });
          }
        }}
        form={form}
        submitLabel={editing ? "Guardar cambios" : "Registrar documento"}
        onSubmit={(values) => {
          const name = values.name.trim();
          const owner = values.owner.trim();
          if (name.length < 3) {
            form.setError("name", { message: "Ingresa el nombre del documento." });
            throw new Error("Nombre inválido.");
          }
          if (owner.length < 2) {
            form.setError("owner", { message: "Ingresa el responsable." });
            throw new Error("Responsable inválido.");
          }
          const now = "Hoy · demo";
          if (editing) {
            const type = values.type.trim() || "Documento local";
            update(editing.id, { name, type, owner, updated: "Hoy · demo" });
            setSelected(
              (current) => current && { ...current, name, type, owner, updated: "Hoy · demo" },
            );
            return;
          }
          create({
            id: `DOC-DEMO-${Date.now()}`,
            name,
            folder: "Pastoral / Evidencias",
            category: "Pastoral",
            type: values.type.trim() || "Documento local",
            owner,
            created: now,
            updated: now,
            version: "v1.0",
            status: "En revisión",
            access: "Institucional",
            summary: "Registro documental creado en almacenamiento local de demostración.",
            versions: [
              { version: "v1.0", date: now, author: owner, note: "Versión inicial local." },
            ],
          });
        }}
      >
        <FormSection
          title="Metadatos del documento"
          description="La ficha se guarda localmente; no se sube un archivo al servidor."
        >
          <TextInputField control={form.control} name="name" label="Nombre" required />
          <TextInputField control={form.control} name="type" label="Tipo" required />
          <TextInputField control={form.control} name="owner" label="Responsable" required />
        </FormSection>
      </FormModal>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={
          selected?.access === "Restringido"
            ? "Referencia documental restringida"
            : (selected?.name ?? "Ficha documental")
        }
        description={selected ? `${selected.id} · ${selected.folder}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            {selected.access === "Restringido" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-900">
                  <FileLock2 className="size-5" />
                  <h3 className="font-semibold">Contenido protegido</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">
                  Este objeto pertenece a una clasificación de acceso restringido. La vista general
                  no muestra datos del sacramento, personas involucradas ni imágenes del documento.
                </p>
                <p className="mt-3 text-xs text-amber-800">
                  La consulta requiere autorización, propósito legítimo y acceso específico dentro
                  de los procedimientos institucionales.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Vista previa documental</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selected.type} · {selected.version}
                    </p>
                    <div className="mt-4 min-h-32 rounded-lg border border-dashed bg-white p-4 text-sm leading-relaxed text-muted-foreground">
                      {selected.summary}
                      <br />
                      <br />
                      Esta representación no contiene un archivo oficial.
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Clasificación">{selected.category}</InfoItem>
              <InfoItem label="Tipo documental">{selected.type}</InfoItem>
              <InfoItem label="Responsable">{selected.owner}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge
                  status={
                    selected.status === "Vigente"
                      ? "approved"
                      : selected.status === "En revisión"
                        ? "pending"
                        : "inactive"
                  }
                  label={selected.status}
                />
              </InfoItem>
              <InfoItem label="Creación">{selected.created}</InfoItem>
              <InfoItem label="Última actualización">{selected.updated}</InfoItem>
              <InfoItem label="Acceso">
                <StatusBadge
                  status={
                    selected.access === "Restringido"
                      ? "overdue"
                      : selected.access === "Interno"
                        ? "pending"
                        : "active"
                  }
                  label={selected.access}
                />
              </InfoItem>
              <InfoItem label="Versión actual">{selected.version}</InfoItem>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                className="mb-4 gap-2"
                onClick={() => {
                  setEditing(selected);
                  form.reset({ name: selected.name, type: selected.type, owner: selected.owner });
                  setFormOpen(true);
                }}
              >
                <Pencil className="size-4" />
                Editar metadatos
              </Button>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <History className="size-4 text-primary" />
                Historial de versiones
              </h3>
              <div className="space-y-2">
                {selected.versions.map((version) => (
                  <div key={version.version} className="rounded-lg border p-3">
                    <div className="flex justify-between gap-3">
                      <p className="text-sm font-semibold">{version.version}</p>
                      <p className="text-xs text-muted-foreground">{version.date}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{version.note}</p>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Responsable: {version.author}
                    </p>
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
