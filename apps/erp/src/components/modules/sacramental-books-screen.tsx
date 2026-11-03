import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileSearch, LockKeyhole, Search } from "lucide-react";
import { DataTable, type DataTableColumn, DemoNotice, DetailDrawer, FieldGroup, FilterBar, FormDialog, InfoItem, ModuleLayout, SearchInput, StatCard, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sacramentalEntries, type SacramentalEntryDemo } from "@/data/community-demo";
import { parishDemo } from "@/data/parish-demo";

const books = ["Bautismos", "Confirmaciones", "Matrimonios", "Defunciones"] as const;
type BookName = (typeof books)[number];

export function SacramentalBooksScreen() {
  const [book, setBook] = useState<BookName>("Bautismos");
  const [query, setQuery] = useState("");
  const [folio, setFolio] = useState("");
  const [celebrant, setCelebrant] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<SacramentalEntryDemo | null>(null);
  const [queryOpen, setQueryOpen] = useState(false);
  const entries = useMemo(() => sacramentalEntries.filter((entry) => entry.book === book && `${entry.id} ${entry.entry} ${entry.date} ${entry.celebrant} ${entry.folio}`.toLowerCase().includes(query.toLowerCase()) && entry.folio.toLowerCase().includes(folio.toLowerCase()) && entry.celebrant.toLowerCase().includes(celebrant.toLowerCase()) && (!dateFrom || entry.dateISO >= dateFrom) && (!dateTo || entry.dateISO <= dateTo)), [book, query, folio, celebrant, dateFrom, dateTo]);
  const columns: DataTableColumn<SacramentalEntryDemo>[] = [
    { id: "number", header: "Numeración de partida", cell: (entry) => <div><p className="font-semibold">{entry.entry}</p><p className="text-xs text-muted-foreground">Partida {entry.folio}</p></div> },
    { id: "date", header: "Celebración", cell: (entry) => <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" />{entry.date}</span> },
    { id: "subject", header: "Asiento", cell: () => <span className="inline-flex items-center gap-2 text-muted-foreground"><LockKeyhole className="size-3.5" />Registro reservado</span> },
    { id: "celebrant", header: "Celebrante", cell: (entry) => entry.celebrant },
    { id: "reference", header: "Referencia", cell: (entry) => entry.reference },
  ];

  return <ModuleLayout breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Comunidad y pastoral" }, { label: "Libros sacramentales" }]} title="Libros sacramentales" width="wide" description="Consulta documental de partidas de muestra asentadas. La interfaz no crea, modifica ni valida inscripciones oficiales." actions={<Button variant="outline" className="gap-2" onClick={() => setQueryOpen(true)}><FileSearch className="size-4" />Consulta avanzada</Button>} stats={<><StatCard label="Libros de referencia" value="4" icon={BookOpen} caption="Bautismos, confirmaciones, matrimonios y defunciones" /><StatCard label="Partidas de muestra" value="5" caption="Asientos ficticios en el prototipo" /><StatCard label="Consulta por folio" value="Disponible" icon={Search} caption="Filtros documentales" /></>}>
    <DemoNotice>Todos los folios, personas y celebrantes son ficticios. Una partida de libro es distinta de una solicitud sacramental y no se genera desde esta pantalla.</DemoNotice>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <Tabs value={book} onValueChange={(value) => setBook(value as BookName)}><TabsList className="h-auto flex-wrap"><TabsTrigger value="Bautismos">Bautismos</TabsTrigger><TabsTrigger value="Confirmaciones">Confirmaciones</TabsTrigger><TabsTrigger value="Matrimonios">Matrimonios</TabsTrigger><TabsTrigger value="Defunciones">Defunciones</TabsTrigger></TabsList>
          {books.map((bookName) => <TabsContent value={bookName} key={bookName} className="space-y-4"><FilterBar label="Consulta documental"><SearchInput value={query} onChange={setQuery} placeholder="Buscar folio, partida, fecha o celebrante" className="w-full sm:w-80" /><Input value={folio} onChange={(event) => setFolio(event.target.value)} placeholder="Número de partida" className="w-full sm:w-44" /><Input value={celebrant} onChange={(event) => setCelebrant(event.target.value)} placeholder="Celebrante" className="w-full sm:w-48" /></FilterBar><DataTable rows={entries} columns={columns} getRowId={(entry) => entry.id} onRowClick={setSelected} emptyTitle={`Sin partidas de muestra en ${bookName.toLowerCase()}`} emptyDescription="Modifica los criterios de consulta." /><p className="text-xs text-muted-foreground">{entries.length} asientos de referencia · El detalle se abre bajo consulta puntual.</p></TabsContent>)}
        </Tabs>
      </div>
      <aside className="space-y-4"><Card className="overflow-hidden border-primary/15 shadow-none"><div className="h-1.5 bg-primary" /><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-secondary p-2.5 text-primary"><BookOpen className="size-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Libro parroquial</p><p className="font-semibold">{book}</p></div></div><div className="my-5 space-y-3 border-y py-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Tomo de referencia</span><span className="font-medium">DEMO-12</span></div><div className="flex justify-between"><span className="text-muted-foreground">Comunidad</span><span className="font-medium">{parishDemo.shortName} ? demo</span></div><div className="flex justify-between"><span className="text-muted-foreground">Año de muestra</span><span className="font-medium">2026</span></div></div><p className="text-xs leading-relaxed text-muted-foreground">Consulta visible solo para la referencia ficticia de esta demostración. Los permisos reales no se modelan aquí.</p></CardContent></Card><div className="rounded-xl border bg-card p-4"><h3 className="text-sm font-semibold">Criterios de búsqueda</h3><ul className="mt-3 space-y-2 text-xs text-muted-foreground"><li>• Número de partida o folio</li><li>• Fecha de celebración</li><li>• Celebrante registrado</li><li>• Tipo de libro parroquial</li></ul></div></aside>
    </div>
    <FormDialog title="Consulta avanzada" description="Búsqueda local en el conjunto ficticio de partidas." open={queryOpen} onOpenChange={setQueryOpen} trigger={<span className="hidden" />} submitLabel="Aplicar consulta"><div className="grid gap-4 sm:grid-cols-2"><FieldGroup label="Nombre o referencia del sacramentado"><Input placeholder="Persona de muestra" onChange={(event) => setQuery(event.target.value)} /></FieldGroup><FieldGroup label="Tomo"><Input placeholder="DEMO-12" /></FieldGroup><FieldGroup label="Número de partida"><Input placeholder="084" onChange={(event) => setFolio(event.target.value)} /></FieldGroup><FieldGroup label="Celebrante"><Input placeholder="Nombre de referencia" onChange={(event) => setCelebrant(event.target.value)} /></FieldGroup><FieldGroup label="Desde"><Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></FieldGroup><FieldGroup label="Hasta"><Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></FieldGroup></div></FormDialog>
    <DetailDrawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)} title="Detalle de partida de muestra" description={selected?.id}>
      {selected && <div className="space-y-5"><div className="rounded-lg border border-primary/15 bg-secondary/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Asiento documental · demostrativo</p><p className="mt-2 text-lg font-semibold">{selected.entry}</p><p className="mt-1 text-sm text-muted-foreground">Libro de {selected.book.toLowerCase()}</p></div><div className="grid grid-cols-2 gap-4"><InfoItem label="Numeración">Partida {selected.folio}</InfoItem><InfoItem label="Fecha de celebración">{selected.date}</InfoItem><InfoItem label="Persona sacramentada">{selected.subject}</InfoItem><InfoItem label="Celebrante">{selected.celebrant}</InfoItem><InfoItem label="Referencia">{selected.reference}</InfoItem><InfoItem label="Parroquia de referencia">{parishDemo.officialName} ? dato ficticio</InfoItem></div><div className="rounded-lg bg-muted/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Observaciones</p><p className="mt-2 text-sm">{selected.note}</p></div><DemoNotice>Detalle de consulta solamente. No representa certificación, validación ni modificación de un libro oficial.</DemoNotice></div>}
    </DetailDrawer>
  </ModuleLayout>;
}
