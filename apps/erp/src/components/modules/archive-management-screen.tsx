import { useMemo, useState } from "react";
import { Archive, ArrowRight, BookOpen, Boxes, ClipboardList, FileArchive, FileClock, FileLock2, FileText, Folder, FolderOpen, FolderTree, History, ScanLine, ShieldCheck, Upload } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DataTable, type DataTableColumn, DemoNotice, DetailDrawer, InfoItem, ModuleLayout, SearchInput, StatCard, StatusBadge } from "@/components/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { institutionalDocuments, type InstitutionalDocument } from "@/data/system-demo";

const folders = ["Todos los documentos", "Pastoral / Planificación", "Pastoral / Evidencias", "Administración / Actas", "Economía / Informes", "Patrimonio / Jurídicos", "Archivo sacramental / Restringido"];

const archiveAreas = [
  { title: "Recepción documental", description: "Registra ingresos físicos y digitales, remitentes, procedencia y lotes.", href: "/app/archivo-recepcion", icon: Upload },
  { title: "Digitalización y OCR", description: "Controla captura, calidad, imágenes maestras y extracción de texto.", href: "/app/archivo-digitalizacion", icon: ScanLine },
  { title: "Repositorio documental", description: "Consulta documentos, metadatos, versiones y relaciones archivísticas.", href: "/app/archivo-documentos", icon: FileArchive },
  { title: "Clasificación archivística", description: "Organiza fondos, secciones, series y subseries documentales.", href: "/app/archivo-clasificacion", icon: FolderTree },
  { title: "Expedientes, libros y folios", description: "Vincula expedientes y unidades físicas con sus imágenes digitales.", href: "/app/archivo-expedientes", icon: BookOpen },
  { title: "Instrumentos archivísticos", description: "Administra CCD, TRD, TVD e inventarios documentales.", href: "/app/archivo-instrumentos", icon: ClipboardList },
  { title: "Transferencias documentales", description: "Prepara inventarios, actas y entregas entre archivos.", href: "/app/archivo-transferencias", icon: Boxes },
  { title: "Conservación y preservación", description: "Controla integridad, originales, derivados y preservación.", href: "/app/archivo-conservacion", icon: ShieldCheck },
] as const;

export function DocumentManagementScreen() {
  const [folder, setFolder] = useState("Todos los documentos");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<InstitutionalDocument | null>(null);
  const visible = useMemo(() => institutionalDocuments.filter((doc) => (folder === "Todos los documentos" || doc.folder === folder) && (category === "Todas" || doc.category === category) && `${doc.id} ${doc.name} ${doc.folder} ${doc.type} ${doc.owner}`.toLowerCase().includes(query.toLowerCase())), [folder, category, query]);
  const columns: DataTableColumn<InstitutionalDocument>[] = [
    { id: "name", header: "Documento", cell: (doc) => <div className="flex items-center gap-2.5"><span className={`flex size-8 items-center justify-center rounded-lg ${doc.access === "Restringido" ? "bg-amber-50 text-amber-700" : "bg-primary/5 text-primary"}`}>{doc.access === "Restringido" ? <FileLock2 className="size-4" /> : <FileText className="size-4" />}</span><span><span className="block font-semibold">{doc.name}</span><span className="text-xs text-muted-foreground">{doc.id} · {doc.type}</span></span></div> },
    { id: "category", header: "Clasificación", cell: (doc) => doc.category },
    { id: "owner", header: "Responsable", cell: (doc) => doc.owner },
    { id: "version", header: "Versión", cell: (doc) => doc.version },
    { id: "access", header: "Acceso", cell: (doc) => <StatusBadge status={doc.access === "Restringido" ? "overdue" : doc.access === "Interno" ? "pending" : "active"} label={doc.access} /> },
    { id: "status", header: "Estado", cell: (doc) => <StatusBadge status={doc.status === "Vigente" ? "approved" : doc.status === "En revisión" ? "pending" : "inactive"} label={doc.status} /> },
  ];
  return <ModuleLayout breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Gestión y control" }, { label: "Archivo y Gestión Documental" }]} title="Archivo y Gestión Documental" description="Repositorio institucional y sistema archivístico parroquial para recibir, organizar, consultar, preservar y controlar documentos." stats={<><StatCard label="Documentos en repositorio" value="248" icon={FileArchive} caption="Catálogo de muestra" /><StatCard label="Carpetas organizadas" value="18" icon={FolderOpen} caption="Por área y tipo documental" /><StatCard label="En revisión" value="12" icon={FileClock} caption="Pendientes de revisión interna" /><StatCard label="Acceso restringido" value="7" icon={ShieldCheck} caption="Metadatos limitados en la vista" /></>}>
    <DemoNotice>Vista demostrativa. El explorador conserva la consulta, clasificación, filtros, fichas y control de versiones del repositorio anterior. Las nuevas áreas amplían el ciclo archivístico; todavía no hay persistencia productiva, OCR/HTR ni almacenamiento documental conectado.</DemoNotice>
    <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit shadow-none"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><Folder className="size-4 text-primary" />Carpetas y categorías</CardTitle></CardHeader><CardContent className="space-y-1 p-3 pt-0">{folders.map((item) => <button key={item} onClick={() => setFolder(item)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs ${folder === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><FolderOpen className="size-4 shrink-0" /><span className="flex-1">{item}</span>{item === "Todos los documentos" && <span className="text-[10px]">248</span>}{item.includes("Restringido") && <FileLock2 className="size-3.5" />}</button>)}<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="flex items-center gap-2 text-xs font-semibold text-amber-900"><FileLock2 className="size-3.5" />Archivo restringido</p><p className="mt-1.5 text-[10px] leading-relaxed text-amber-800">El explorador muestra solo metadatos mínimos. El contenido requiere autorización y justificación específicas.</p></div></CardContent></Card>
      <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3">{[{ label: "Pastorales", count: "86", color: "text-emerald-700" }, { label: "Administrativos", count: "72", color: "text-sky-700" }, { label: "Contables y jurídicos", count: "54", color: "text-violet-700" }].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-xl border bg-card p-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted/50"><Archive className={`size-4 ${item.color}`} /></div><div><p className="text-lg font-bold">{item.count}</p><p className="text-[11px] text-muted-foreground">{item.label}</p></div></div>)}</div><Card className="shadow-none"><CardHeader className="border-b pb-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base">Explorador de documentos</CardTitle><p className="mt-1 text-xs text-muted-foreground">{folder} · {visible.length} elementos visibles</p></div><div className="flex flex-wrap gap-2"><SearchInput value={query} onChange={setQuery} placeholder="Buscar documento" className="w-full sm:w-56" /><Select value={category} onValueChange={setCategory}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{["Todas", "Pastoral", "Administrativo", "Contable", "Jurídico", "Sacramental"].map((item) => <SelectItem key={item} value={item}>{item === "Todas" ? "Todas las categorías" : item}</SelectItem>)}</SelectContent></Select></div></div></CardHeader><CardContent className="p-4"><DataTable rows={visible} columns={columns} getRowId={(doc) => doc.id} onRowClick={setSelected} /></CardContent></Card></div>
    </div>
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-base font-semibold">Procesos de Archivo Eclesiástico</h2><p className="mt-1 text-xs text-muted-foreground">Las ocho áreas especializadas se integran al repositorio institucional y comparten sus criterios de clasificación, consulta y seguridad.</p></div>
        <Link to="/app/libros-sacramentales" className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline">Libros sacramentales <BookOpen className="size-4" /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {archiveAreas.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} to={href} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full shadow-none transition-colors group-hover:border-primary/40">
              <CardContent className="flex h-full gap-3 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary"><Icon className="size-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span><span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">Abrir área <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" /></span></span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
    <div className="grid gap-3 sm:grid-cols-2">
      <Link to="/app/documentos-certificados" className="flex items-center justify-between rounded-xl border bg-card p-4 text-sm transition hover:bg-muted/40"><span><strong className="block">Documentos y certificados</strong><span className="text-xs text-muted-foreground">Solicitudes y emisión de documentos oficiales</span></span><ArrowRight className="size-4 text-primary" /></Link>
      <div className="rounded-xl border bg-card p-4"><strong className="block text-sm">Separación de responsabilidades</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">El repositorio conserva las imágenes y referencias archivísticas. Los asientos sacramentales y los certificados emitidos mantienen su gestión en sus módulos de origen.</span></div>
    </div>
    <DetailDrawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)} title={selected?.access === "Restringido" ? "Referencia documental restringida" : selected?.name ?? "Ficha documental"} description={selected ? `${selected.id} · ${selected.folder}` : undefined}>{selected && <div className="space-y-5">{selected.access === "Restringido" ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center gap-2 text-amber-900"><FileLock2 className="size-5" /><h3 className="font-semibold">Contenido protegido</h3></div><p className="mt-2 text-sm leading-relaxed text-amber-900">Este objeto pertenece a una clasificación de acceso restringido. La vista general no muestra datos del sacramento, personas involucradas ni imágenes del documento.</p><p className="mt-3 text-xs text-amber-800">La consulta requiere autorización, propósito legítimo y acceso específico dentro de los procedimientos institucionales.</p></div> : <div className="rounded-xl border bg-muted/20 p-4"><div className="flex items-start gap-3"><FileText className="mt-1 size-5 text-primary" /><div><p className="font-semibold">Vista previa documental</p><p className="mt-1 text-xs text-muted-foreground">{selected.type} · {selected.version}</p><div className="mt-4 min-h-32 rounded-lg border border-dashed bg-white p-4 text-sm leading-relaxed text-muted-foreground">{selected.summary}<br /><br />Esta representación no contiene un archivo oficial.</div></div></div></div>}
        <div className="grid grid-cols-2 gap-4"><InfoItem label="Clasificación">{selected.category}</InfoItem><InfoItem label="Tipo documental">{selected.type}</InfoItem><InfoItem label="Responsable">{selected.owner}</InfoItem><InfoItem label="Estado"><StatusBadge status={selected.status === "Vigente" ? "approved" : selected.status === "En revisión" ? "pending" : "inactive"} label={selected.status} /></InfoItem><InfoItem label="Creación">{selected.created}</InfoItem><InfoItem label="Última actualización">{selected.updated}</InfoItem><InfoItem label="Acceso"><StatusBadge status={selected.access === "Restringido" ? "overdue" : selected.access === "Interno" ? "pending" : "active"} label={selected.access} /></InfoItem><InfoItem label="Versión actual">{selected.version}</InfoItem></div>
        <div><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><History className="size-4 text-primary" />Historial de versiones</h3><div className="space-y-2">{selected.versions.map((version) => <div key={version.version} className="rounded-lg border p-3"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{version.version}</p><p className="text-xs text-muted-foreground">{version.date}</p></div><p className="mt-1 text-xs text-muted-foreground">{version.note}</p><p className="mt-2 text-[10px] text-muted-foreground">Responsable: {version.author}</p></div>)}</div></div>
      </div>}</DetailDrawer>
  </ModuleLayout>;
}
