import { useState } from "react";
import {
  BadgeCheck,
  FileBadge,
  FileCheck2,
  FileClock,
  FileText,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  FieldGroup,
  FilterBar,
  FormDialog,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documentRequests, type DocumentRequestDemo } from "@/data/community-demo";
import { useLocalCollection } from "@/data/local-repository";

export function DocumentsScreen() {
  const [tab, setTab] = useState("requests");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<DocumentRequestDemo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { records, create, remove } = useLocalCollection(
    "ao-erp:documents:requests",
    documentRequests,
  );
  const list = records.filter(
    (item) =>
      (tab === "issued" ? item.status === "approved" : item.status !== "approved") &&
      `${item.id} ${item.kind} ${item.requester}`.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" || item.status === status),
  );
  const columns: DataTableColumn<DocumentRequestDemo>[] = [
    {
      id: "id",
      header: "Referencia",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.id}</p>
          <p className="text-xs text-muted-foreground">{item.requested}</p>
        </div>
      ),
    },
    {
      id: "kind",
      header: "Documento",
      cell: (item) => (
        <span className="inline-flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          {item.kind}
        </span>
      ),
    },
    { id: "requester", header: "Solicitante", cell: (item) => item.requester },
    {
      id: "verification",
      header: "Verificación",
      cell: (item) => (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span
            className={`size-2 rounded-full ${item.recordVerified ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          {item.recordVerified ? "Referencia localizada" : "Pendiente de revisión"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (item) => (
        <StatusBadge
          status={item.status}
          label={tab === "issued" ? "Emitido · muestra" : undefined}
        />
      ),
    },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Comunidad y pastoral" },
        { label: "Documentos y certificados" },
      ]}
      title="Documentos y certificados"
      description="Seguimiento demostrativo de solicitudes y consulta de documentos de muestra. Los certificados no tienen validez oficial."
      actions={
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Nueva solicitud
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Solicitudes abiertas"
            value="16"
            icon={FileClock}
            caption="Estados de muestra"
          />
          <StatCard
            label="Referencias verificadas"
            value="12"
            icon={ShieldCheck}
            caption="Consulta documental local"
          />
          <StatCard
            label="Documentos de muestra"
            value="38"
            icon={FileBadge}
            caption="Sin validez oficial"
          />
          <StatCard
            label="Entregas pendientes"
            value="4"
            icon={FileCheck2}
            caption="Seguimiento de ejemplo"
          />
        </>
      }
    >
      <DemoNotice>
        Certificados, nombres y referencias son ficticios. La verificación solo ilustra una
        consulta; los documentos representados no son oficiales ni válidos para trámites.
      </DemoNotice>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          setSelected(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          <TabsTrigger value="issued">Emitidos · demostración</TabsTrigger>
        </TabsList>
        {(["requests", "issued"] as const).map((view) => (
          <TabsContent key={view} value={view} className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <FilterBar>
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Buscar por referencia, tipo o solicitante"
                    className="w-full sm:w-80"
                  />
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="active">En revisión</SelectItem>
                      <SelectItem value="approved">Emitido</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterBar>
                <DataTable
                  rows={list}
                  columns={columns}
                  getRowId={(item) => item.id}
                  onRowClick={setSelected}
                  emptyTitle="Sin documentos coincidentes"
                  emptyDescription="Ajusta la búsqueda o los filtros."
                />
                <p className="text-xs text-muted-foreground">
                  {list.length} elementos ficticios · Abre una fila para consultar el detalle.
                </p>
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl border bg-card p-4">
                  <h2 className="text-sm font-semibold">Tipos de documento</h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Certificado de bautismo</li>
                    <li>Certificado de confirmación</li>
                    <li>Certificado de matrimonio</li>
                    <li>Constancias y otros documentos</li>
                  </ul>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-primary" />
                    <h2 className="text-sm font-semibold">Pasos de seguimiento</h2>
                  </div>
                  <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
                    <li>1. Recibir solicitud</li>
                    <li>2. Verificar referencia del libro</li>
                    <li>3. Preparar documento de muestra</li>
                    <li>4. Registrar entrega demostrativa</li>
                  </ol>
                </div>
              </aside>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <FormDialog
        title="Nueva solicitud de documento"
        description="La solicitud se incorpora al listado local de demostración."
        open={formOpen}
        onOpenChange={setFormOpen}
        trigger={<span className="hidden" />}
        submitLabel="Crear solicitud"
        onSubmit={(data) => {
          const requester = String(data.get("requester") ?? "").trim();
          if (requester.length < 2) return;
          create({
            id: `DOC-DEMO-${Date.now()}`,
            kind: "Certificado de bautismo",
            subject: "Persona de muestra",
            requester,
            requested: "Hoy · demo",
            status: "pending",
            recordVerified: false,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Tipo de documento">
            <Select defaultValue="bautismo">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bautismo">Certificado de bautismo</SelectItem>
                <SelectItem value="confirmacion">Certificado de confirmación</SelectItem>
                <SelectItem value="matrimonio">Certificado de matrimonio</SelectItem>
                <SelectItem value="constancia">Constancia parroquial</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Solicitante">
            <Input name="requester" required placeholder="Solicitante de muestra" />
          </FieldGroup>
          <FieldGroup label="Referencia de libro">
            <Input placeholder="Tomo / partida de muestra" />
          </FieldGroup>
          <FieldGroup label="Fecha de solicitud">
            <Input type="date" />
          </FieldGroup>
        </div>
        <p className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
          La consulta de la partida requiere verificación puntual; la pantalla no despliega otros
          datos del registro.
        </p>
      </FormDialog>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Detalle de solicitud documental"
        description={selected?.id}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Documento">{selected.kind}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge status={selected.status} />
              </InfoItem>
              <InfoItem label="Solicitante">{selected.requester}</InfoItem>
              <InfoItem label="Fecha de solicitud">{selected.requested}</InfoItem>
              <InfoItem label="Registro sacramental">
                {selected.recordVerified
                  ? "Referencia de muestra localizada"
                  : "Pendiente de verificación"}
              </InfoItem>
              <InfoItem label="Entrega">{selected.delivered ?? "Sin entrega registrada"}</InfoItem>
            </div>
            {selected.status === "approved" && <CertificatePreview request={selected} />}
            <DemoNotice>
              La verificación es un estado de ejemplo. El detalle no divulga información sacramental
              fuera de la consulta puntual.
            </DemoNotice>
            <Button
              type="button"
              variant="outline"
              className="text-destructive"
              onClick={() => {
                remove(selected.id);
                setSelected(null);
              }}
            >
              Eliminar solicitud demo
            </Button>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}

function CertificatePreview({ request }: { request: DocumentRequestDemo }) {
  return (
    <div className="relative overflow-hidden rounded-lg border-4 border-double border-primary/50 bg-[#fffefa] p-6 text-center shadow-sm">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="-rotate-25 select-none text-5xl font-black tracking-[0.25em] text-amber-700/10">
          DEMOSTRACIÓN
        </span>
      </div>
      <div className="relative space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          Comunidad parroquial · documento de muestra
        </p>
        <div className="mx-auto h-px w-24 bg-accent" />
        <h3 className="font-serif text-xl font-semibold text-primary">{request.kind}</h3>
        <p className="text-sm text-muted-foreground">Referencia ficticia asociada a</p>
        <p className="font-medium">{request.subject}</p>
        <p className="text-xs text-muted-foreground">
          Emitido para demostración · {request.delivered}
        </p>
        <div className="mx-auto mt-5 h-px w-36 bg-primary/30" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">
          Sin validez oficial · no usar para trámites
        </p>
      </div>
    </div>
  );
}
