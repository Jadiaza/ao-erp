import { useMemo, useState } from "react";
import { AlertTriangle, Eye, FileLock2, History, LockKeyhole, Plus, ShieldCheck, UserRound } from "lucide-react";
import {
  ActivityTimeline,
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
} from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalCollection } from "@/data/local-repository";
import { pastoralCareRecords, type PastoralCareRecord, type PastoralCareType } from "@/data/pastoral-care-demo";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { canAccessPastoralCare, canWritePastoralCare, isChristianProfile, maskPastoralSensitive } from "@/lib/ao-cristiano-profile";

const careTypes: PastoralCareType[] = [
  "Visita pastoral",
  "Seguimiento a nuevo miembro",
  "Consejería",
  "Acompañamiento familiar",
  "Petición de oración",
  "Compromiso pastoral",
];

function appendAccessLog(record: PastoralCareRecord, action: "view" | "create" | "update", actor: string, role: string): PastoralCareRecord {
  return {
    ...record,
    accessLog: [
      ...(record.accessLog ?? []),
      { id: `APL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), actor, action, role },
    ],
  };
}

export function PastoralCareScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const role = settings.pastoralAccessRole;
  const allowed = christian && canAccessPastoralCare(role);
  const canWrite = christian && canWritePastoralCare(role);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<PastoralCareRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ type: "Visita pastoral" as PastoralCareType, person: "", responsible: "", summary: "", notes: "", campusId: settings.campusId || "SEDE-PRINCIPAL" });
  const { records, create, update } = useLocalCollection("ao-erp:pastoral-care:records", pastoralCareRecords);

  const scoped = useMemo(
    () => records.filter((r) => r.organizationId === settings.organizationId && (settings.campusId ? r.campusId === settings.campusId || settings.campusId === "SEDE-PRINCIPAL" ? true : r.campusId === settings.campusId : true)),
    [records, settings.organizationId, settings.campusId],
  );
  const visible = useMemo(
    () =>
      scoped.filter((r) => {
        if (!`${r.person} ${r.type} ${r.responsible} ${r.summary} ${r.family ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
        if (typeFilter !== "all" && r.type !== typeFilter) return false;
        if (statusFilter !== "all" && String(r.status) !== statusFilter) return false;
        return true;
      }),
    [scoped, query, typeFilter, statusFilter],
  );

  const onSelect = (record: PastoralCareRecord) => {
    const logged = appendAccessLog(record, "view", "Usuario autorizado · demo", role);
    update(record.id, { accessLog: logged.accessLog });
    setSelected(logged);
  };

  const columns: DataTableColumn<PastoralCareRecord>[] = [
    { id: "type", header: "Tipo", cell: (r) => <div><p className="font-medium">{r.type}</p><p className="text-xs text-muted-foreground">{r.id}</p></div> },
    { id: "person", header: "Persona / familia", cell: (r) => <div><p>{r.person}</p>{r.family && <p className="text-xs text-muted-foreground">{r.family}</p>}</div> },
    { id: "responsible", header: "Responsable", cell: (r) => r.responsible },
    { id: "date", header: "Fecha", cell: (r) => r.date },
    { id: "status", header: "Estado", cell: (r) => <StatusBadge status={String(r.status).toLowerCase().includes("cerr") ? "approved" : String(r.status).toLowerCase().includes("segu") ? "pending" : "active"} label={String(r.status)} /> },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Comunidad cristiana" }, { label: "Acompañamiento pastoral" }]}
      title="Acompañamiento pastoral"
      description="Visitas, seguimiento, consejería, acompañamiento familiar, peticiones de oración y compromisos con acceso restringido. Información confidencial separada de datos administrativos."
      actions={canWrite ? <Button className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="size-4" />Nuevo registro pastoral</Button> : undefined}
      stats={
        <>
          <StatCard label="Casos registrados" value={String(scoped.length)} icon={FileLock2} caption="Ámbito organización/sede" />
          <StatCard label="En seguimiento" value={String(scoped.filter((r) => String(r.status).includes("seguimiento") || String(r.status) === "Abierto").length)} icon={History} caption="Actuaciones abiertas" />
          <StatCard label="Acceso autorizado" value={allowed ? "Sí" : "No"} icon={ShieldCheck} caption={`Rol: ${role}`} />
          <StatCard label="IA sobre sensible" value={settings.allowPastoralAiAnalysis ? "Autorizada" : "Bloqueada"} icon={LockKeyhole} caption="Requiere autorización expresa" />
        </>
      }
    >
      <DemoNotice>
        Acompañamiento pastoral confidencial en almacenamiento local demostrativo. Solo roles autorizados pueden ver notas sensibles. No se exponen detalles confidenciales en informes generales y el análisis IA sobre información sensible permanece bloqueado sin autorización expresa.
      </DemoNotice>

      {!allowed ? (
        <Card className="border-red-200 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800"><AlertTriangle className="size-5" />Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-red-900">
            <p>Tu rol demostrativo actual ({role}) no tiene autorización para consultar información pastoral confidencial. Este control protege visitas, consejería, peticiones de oración y notas sensibles.</p>
            <p className="text-xs text-red-800">Configura un rol pastoral autorizado en Configuración (demo local) o solicita permisos institucionales. No se muestran registros confidenciales.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <FilterBar label="Registros autorizados">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por persona, tipo o responsable" className="w-full sm:w-80" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {careTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Abierto">Abierto</SelectItem>
                <SelectItem value="En seguimiento">En seguimiento</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </FilterBar>

          <Card className="border-amber-200 bg-amber-50/50 shadow-none">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-950">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Protección de confidencialidad</p>
                <p className="text-xs">Los accesos y modificaciones se registran localmente cuando es posible. Las notas sensibles no se incluyen en informes administrativos generales. IA: {settings.allowPastoralAiAnalysis ? "autorizada explícitamente en configuración demo." : "no autorizada para contenido sensible."}</p>
              </div>
            </CardContent>
          </Card>

          <DataTable rows={visible} columns={columns} getRowId={(r) => r.id} onRowClick={onSelect} emptyTitle="Sin registros visibles" emptyDescription="No hay actuaciones pastorales en el ámbito y filtros seleccionados." />
          <p className="text-xs text-muted-foreground">Mostrando {visible.length} de {scoped.length} registros autorizados · Organización {settings.organizationId}.</p>
        </>
      )}

      <FormDialog title="Nuevo registro de acompañamiento pastoral" description="Registro confidencial demostrativo asociado a organización y sede." open={createOpen} onOpenChange={setCreateOpen} submitLabel="Guardar registro" onSubmit={() => {
        if (!canWrite || !form.person.trim()) return;
        const newRecord: PastoralCareRecord = {
          id: `AP-${Date.now()}`,
          organizationId: settings.organizationId,
          campusId: form.campusId || settings.campusId,
          type: form.type,
          person: form.person.trim(),
          responsible: form.responsible.trim() || "Responsable · demo",
          date: new Date().toISOString().slice(0, 10),
          status: "Abierto",
          summary: form.summary.trim() || "Registro pastoral demostrativo",
          confidentialNotes: form.notes.trim() || "Nota confidencial demostrativa.",
          commitments: [],
          authorizedRoles: ["pastor_principal", "lider_pastoral", "consejero_autorizado"],
          history: [{ id: `APH-${Date.now()}`, date: new Date().toISOString().slice(0, 10), action: "Registro creado", actor: "Usuario autorizado · demo" }],
          accessLog: [{ id: `APL-${Date.now()}`, at: new Date().toISOString(), actor: "Usuario autorizado · demo", action: "create", role }],
        };
        create(newRecord);
        setCreateOpen(false);
        setForm({ type: "Visita pastoral", person: "", responsible: "", summary: "", notes: "", campusId: settings.campusId || "SEDE-PRINCIPAL" });
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Tipo"><Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as PastoralCareType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{careTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FieldGroup>
          <FieldGroup label="Persona / familia"><Input value={form.person} onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))} placeholder="Nombre de la persona o familia" /></FieldGroup>
          <FieldGroup label="Responsable"><Input value={form.responsible} onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))} placeholder="Responsable pastoral" /></FieldGroup>
          <FieldGroup label="Sede"><Input value={form.campusId} onChange={(e) => setForm((f) => ({ ...f, campusId: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Resumen autorizado"><Input value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} placeholder="Resumen operativo no sensible" /></FieldGroup>
          <FieldGroup label="Notas confidenciales"><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Solo visible para roles autorizados" /></FieldGroup>
        </div>
      </FormDialog>

      <DetailDrawer open={!!selected && allowed} onOpenChange={(open) => !open && setSelected(null)} title={selected ? `${selected.type} · ${selected.person}` : "Registro"} description={selected ? `${selected.id} · ${selected.date} · ${selected.campusId}` : undefined}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Responsable">{selected.responsible}</InfoItem>
              <InfoItem label="Estado"><StatusBadge status={String(selected.status).toLowerCase().includes("cerr") ? "approved" : "active"} label={String(selected.status)} /></InfoItem>
              <InfoItem label="Organización">{selected.organizationId}</InfoItem>
              <InfoItem label="Sede">{selected.campusId}</InfoItem>
            </div>
            <InfoItem label="Resumen">{selected.summary}</InfoItem>
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-900"><LockKeyhole className="size-4" />Notas confidenciales</p>
              <p className="text-sm text-red-950">{maskPastoralSensitive(allowed, selected.confidentialNotes)}</p>
              {!settings.allowPastoralAiAnalysis && <p className="mt-2 text-xs text-red-800">Análisis IA no autorizado para este contenido sensible.</p>}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Compromisos</h3>
              <ul className="space-y-1 text-sm">{(selected.commitments ?? []).map((c, i) => <li key={i} className="rounded border p-2">{c}</li>)}{(selected.commitments ?? []).length === 0 && <li className="text-muted-foreground">Sin compromisos registrados.</li>}</ul>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><History className="size-4" />Historial de actuaciones</h3>
              <ActivityTimeline entries={(selected.history ?? []).map((h) => ({ id: h.id, title: h.action, description: "Actuación pastoral autorizada", date: h.date, actor: h.actor }))} />
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Eye className="size-4" />Registro de accesos/modificaciones (demo local)</h3>
              <div className="space-y-2">{(selected.accessLog ?? []).slice().reverse().map((log) => <div key={log.id} className="rounded border p-2 text-xs"><span className="font-medium">{log.action}</span> · {log.actor} ({log.role}) · {log.at}</div>)}</div>
            </div>
            {canWrite && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { const next = appendAccessLog({ ...selected, status: "En seguimiento" }, "update", "Usuario autorizado · demo", role); update(selected.id, { status: next.status, accessLog: next.accessLog }); setSelected(next); }}>Marcar en seguimiento</Button><Button size="sm" variant="outline" onClick={() => { const next = appendAccessLog({ ...selected, status: "Cerrado" }, "update", "Usuario autorizado · demo", role); update(selected.id, { status: next.status, accessLog: next.accessLog }); setSelected(next); }}>Cerrar caso</Button></div>}
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
