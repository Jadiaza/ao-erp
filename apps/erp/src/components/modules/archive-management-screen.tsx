import { Link } from "@tanstack/react-router";
import {
  Archive, ArrowRight, BookOpen, Boxes, ClipboardList, FileSearch, FileText,
  FolderTree, History, ScanLine, ShieldCheck, Upload,
} from "lucide-react";
import { DemoNotice, ModuleLayout, StatCard } from "@/components/modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const areas = [
  { title: "Recepción documental", description: "Registra documentos físicos y digitales, ingresos individuales y lotes.", href: "/app/archivo-recepcion", icon: Upload, detail: "Control de ingreso y procedencia" },
  { title: "Digitalización y OCR", description: "Organiza capturas, lotes, control de calidad y extracción de texto.", href: "/app/archivo-digitalizacion", icon: ScanLine, detail: "Captura, procesamiento y validación" },
  { title: "Repositorio documental", description: "Consulta documentos, metadatos, versiones y relaciones archivísticas.", href: "/app/archivo-documentos", icon: FileSearch, detail: "Búsqueda y consulta institucional" },
  { title: "Clasificación archivística", description: "Estructura fondos, secciones, series y subseries documentales.", href: "/app/archivo-clasificacion", icon: FolderTree, detail: "Cuadro de clasificación documental" },
  { title: "Expedientes, libros y folios", description: "Organiza unidades documentales y vincula imágenes con sus referencias.", href: "/app/archivo-expedientes", icon: BookOpen, detail: "Expedientes y unidades de archivo" },
  { title: "Instrumentos archivísticos", description: "Administra CCD, TRD, TVD e inventarios documentales.", href: "/app/archivo-instrumentos", icon: ClipboardList, detail: "Instrumentos y versiones" },
  { title: "Transferencias documentales", description: "Prepara inventarios, actas y procesos de entrega y recepción.", href: "/app/archivo-transferencias", icon: Boxes, detail: "Ciclo de vida documental" },
  { title: "Conservación y preservación", description: "Controla integridad, originales, derivados y medidas de preservación.", href: "/app/archivo-conservacion", icon: ShieldCheck, detail: "Integridad y conservación digital" },
];

export function ArchiveManagementScreen() {
  return (
    <ModuleLayout
      width="wide"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Gestión y control" }, { label: "Archivo y Gestión Documental" }]}
      title="Archivo y Gestión Documental"
      description="Administra el archivo institucional de la parroquia, desde la recepción y clasificación hasta la consulta y conservación."
      stats={<>
        <StatCard label="Documentos registrados" value="12.486" icon={FileText} caption="Dato ilustrativo" />
        <StatCard label="Expedientes activos" value="384" icon={Archive} caption="Organización de muestra" />
        <StatCard label="Pendientes de revisión" value="27" icon={ClipboardList} caption="Control de calidad ilustrativo" />
        <StatCard label="Lotes en procesamiento" value="6" icon={ScanLine} caption="Sin procesamiento productivo" />
      </>}
    >
      <DemoNotice>Vista inicial de integración. Los indicadores y contenidos son demostrativos; todavía no existe almacenamiento de documentos, OCR ni persistencia productiva.</DemoNotice>
      <Card className="overflow-hidden border-primary/15 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><Archive className="size-7" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Archivo parroquial</p><h2 className="mt-1 text-lg font-semibold">La memoria documental de la institución, organizada y protegida.</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">El archivo institucional y los libros sacramentales se relacionan mediante referencias controladas, sin confundir sus funciones ni sus permisos.</p></div>
          </div>
          <Link to="/app/archivo-recepcion" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">Registrar ingreso <ArrowRight className="size-4" /></Link>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">Áreas del módulo</h2><p className="mt-1 text-sm text-muted-foreground">Selecciona el proceso que deseas administrar.</p></div><Link to="/app/libros-sacramentales" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Libros sacramentales <BookOpen className="size-4" /></Link></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {areas.map(({ title, description, href, icon: Icon, detail }) => (
          <Link key={href} to={href} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full shadow-none transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader className="pb-3"><div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="size-5" /></div><CardTitle className="text-sm">{title}</CardTitle><CardDescription className="min-h-10 text-xs leading-relaxed">{description}</CardDescription></CardHeader>
              <CardContent className="flex items-center justify-between border-t pt-3"><span className="text-[11px] text-muted-foreground">{detail}</span><ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" /></CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="shadow-none"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><History className="size-4 text-primary" /> Relación con otros módulos de ERP</CardTitle><CardDescription>El archivo complementa los procesos parroquiales; no sustituye los registros de origen.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
        <Link to="/app/libros-sacramentales" className="flex items-center justify-between rounded-lg border p-3 text-sm transition hover:bg-muted/40"><span><strong className="block">Libros sacramentales</strong><span className="text-xs text-muted-foreground">Asientos, libros, tomos y folios</span></span><ArrowRight className="size-4 text-primary" /></Link>
        <Link to="/app/documentos-certificados" className="flex items-center justify-between rounded-lg border p-3 text-sm transition hover:bg-muted/40"><span><strong className="block">Documentos y certificados</strong><span className="text-xs text-muted-foreground">Solicitudes y documentos emitidos</span></span><ArrowRight className="size-4 text-primary" /></Link>
      </CardContent></Card>
    </ModuleLayout>
  );
}
