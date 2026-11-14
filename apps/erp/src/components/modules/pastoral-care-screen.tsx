import { useMemo, useState } from "react";
import { AlertTriangle, Eye, FileLock2, History, LockKeyhole, Plus, ShieldCheck } from "lucide-react";
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
import { christianMembers, parishioners, type ParishionerDemo } from "@/data/community-demo";
import { useLocalCollection } from "@/data/local-repository";
import { pastoralCareRecords, type PastoralCareRecord, type PastoralCareType } from "@/data/pastoral-care-demo";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import {
  canAccessPastoralCare,
  canAccessPastoralRecord,
  canWritePastoralCare,
  getProfileStorageKey,
  isChristianProfile,
  maskPastoralSensitive,
} from "@/lib/ao-cristiano-profile";

const careTypes: PastoralCareType[] = [
  "Visita pastoral",
  "Seguimiento a nuevo miembro",
  "Consejería",
  "Acompañamiento familiar",
  "Petición de oración",
  "Compromiso pastoral",
];

function appendAccessLog(
  record: PastoralCareRecord,
  action: "view" | "create" | "update",
  actor: string,
  role: string,
): PastoralCareRecord {
  return {
    ...record,
    accessLog: [
      ...(record.accessLog ?? []),
      {
        id: `APL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        at: new Date().toISOString(),
        actor,
        action,
        role,
      },
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCommitment, setNewCommitment] = useState("");
  const [form, setForm] = useState({
    type: "Visita pastoral" as PastoralCareType,
    personId: "__manual__",
    person: "",
    responsible: "",
    summary: "",
    notes: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const { records, create, update } = useLocalCollection(
    "ao-erp:pastoral-care:records",
    pastoralCareRecords,
  );
  const membersStore = useLocalCollection<ParishionerDemo>(
    getProfileStorageKey("ao-erp:community:parishioners", settings.profile),
    christian ? christianMembers : parishioners,
  );
  const scopedMembers = useMemo(
    () =>
      membersStore.records.filter(
        (m) => !m.organizationId || m.organizationId === settings.organizationId,
      ),
    [membersStore.records, settings.organizationId],
  );

  const scoped = useMemo(
    () =>
      records.filter(
        (r) =>
          r.organizationId === settings.organizationId &&
          (!settings.campusId || r.campusId === settings.campusId),
      ),
    [records, settings.organizationId, settings.campusId],
  );

  const authorizedRecords = useMemo(
    () => scoped.filter((r) => canAccessPastoralRecord(role, r.authorizedRoles)),
    [scoped, role],
  );
  const restrictedCount = scoped.length - authorizedRecords.length;

  const selected = useMemo(
    () => authorizedRecords.find((r) => r.id === selectedId) ?? null,
    [authorizedRecords, selectedId],
  );

  const visible = useMemo(
    () =>
      authorizedRecords.filter((r) => {
        if (
          !`${r.person} ${r.type} ${r.responsible} ${r.summary} ${r.family ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        ) {
          return false;
        }
        if (typeFilter !== "all" && r.type !== typeFilter) return false;
        if (statusFilter !== "all" && String(r.status) !== statusFilter) return false;
        return true;
      }),
    [authorizedRecords, query, typeFilter, statusFilter],
  );

  const onSelect = (record: PastoralCareRecord) => {
    if (!canAccessPastoralRecord(role, record.authorizedRoles)) return;
    const logged = appendAccessLog(record, "view", "Usuario autorizado · demo", role);
    update(record.id, { accessLog: logged.accessLog });
    setSelectedId(record.id);
    setNewCommitment("");
  };

  const updateCaseStatus = (
    record: PastoralCareRecord,
    nextStatus: "En seguimiento" | "Cerrado",
  ) => {
    if (!canWrite || !canAccessPastoralRecord(role, record.authorizedRoles)) return;
    const today = new Date().toISOString().slice(0, 10);
    const nextHistory = [
      ...(record.history ?? []),
      {
        id: `APH-${Date.now()}`,
        date: today,
        action: `Estado actualizado a ${nextStatus}`,
        actor: `Usuario (${role}) · demo`,
      },
    ];
    const logged = appendAccessLog(
      { ...record, status: nextStatus, history: nextHistory },
      "update",
      "Usuario autorizado · demo",
      role,
    );
    update(record.id, {
      status: logged.status,
      history: logged.history,
      accessLog: logged.accessLog,
    });
  };

  const addCommitmentToCase = (record: PastoralCareRecord) => {
    if (!canWrite || !canAccessPastoralRecord(role, record.authorizedRoles)) return;
    if (!newCommitment.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const commitments = [...(record.commitments ?? []), newCommitment.trim()];
    const history = [
      ...(record.history ?? []),
      {
        id: `APH-${Date.now()}`,
        date: today,
        action: `Compromiso agregado: ${newCommitment.trim()}`,
        actor: `Usuario (${role}) · demo`,
      },
    ];
    const logged = appendAccessLog(
      { ...record, commitments, history },
      "update",
      "Usuario autorizado · demo",
      role,
    );
    update(record.id, {
      commitments: logged.commitments,
      history: logged.history,
      accessLog: logged.accessLog,
    });
    setNewCommitment("");
  };

  const columns: DataTableColumn<PastoralCareRecord>[] = [
    {
      id: "type",
      header: "Tipo",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.type}</p>
          <p className="text-xs text-muted-foreground">{r.id}</p>
        </div>
      ),
    },
    {
      id: "person",
      header: "Persona / familia",
      cell: (r) => (
        <div>
          <p>{r.person}</p>
          {r.family && <p className="text-xs text-muted-foreground">{r.family}</p>}
        </div>
      ),
    },
    { id: "responsible", header: "Responsable", cell: (r) => r.responsible },
    { id: "date", header: "Fecha", cell: (r) => r.date },
    {
      id: "status",
      header: "Estado",
      cell: (r) => (
        <StatusBadge
          status={
            String(r.status).toLowerCase().includes("cerr")
              ? "approved"
              : String(r.status).toLowerCase().includes("segu")
                ? "pending"
                : "active"
          }
          label={String(r.status)}
        />
      ),
    },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Comunidad cristiana" },
        { label: "Acompañamiento pastoral" },
      ]}
      title="Acompañamiento pastoral"
      description="Visitas, seguimiento, consejería, acompañamiento familiar, peticiones de oración y compromisos con validación por rol autorizado y aislamiento organizacional (demo local)."
      actions={
        canWrite ? (
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nuevo registro pastoral
          </Button>
        ) : undefined
      }
      stats={
        <>
          <StatCard
            label="Casos autorizados"
            value={String(authorizedRecords.length)}
            icon={FileLock2}
            caption={`${restrictedCount} restringido(s) por rol`}
          />
          <StatCard
            label="En seguimiento"
            value={String(
              authorizedRecords.filter(
                (r) => String(r.status).includes("seguimiento") || String(r.status) === "Abierto",
              ).length,
            )}
            icon={History}
            caption="Actuaciones abiertas"
          />
          <StatCard
            label="Acceso autorizado"
            value={allowed ? "Sí (demo)" : "No"}
            icon={ShieldCheck}
            caption={`Rol demo: ${role}`}
          />
          <StatCard
            label="IA sobre sensible"
            value={settings.allowPastoralAiAnalysis ? "Autorizada" : "Bloqueada"}
            icon={LockKeyhole}
            caption="Desactivada por defecto"
          />
        </>
      }
    >
      <DemoNotice>
        Demostración local en navegador (localStorage): no constituye seguridad productiva ni
        sustituye autenticación, RLS ni auditoría en servidor (pendientes de Fase 3). Los casos se
        validan por organización, sede y authorizedRoles; no se trasladan notas confidenciales al
        Dashboard ni a reportes generales, y el análisis IA permanece desactivado por defecto.
      </DemoNotice>

      {!allowed ? (
        <Card className="border-red-200 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="size-5" />
              Acceso restringido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-red-900">
            <p>
              Tu rol demostrativo actual ({role}) no tiene autorización para consultar información
              pastoral confidencial. Este control protege visitas, consejería, peticiones de oración
              y notas sensibles.
            </p>
            <p className="text-xs text-red-800">
              Nota: en esta fase demostrativa el control es únicamente de interfaz local; la
              seguridad productiva real (Auth + RLS) corresponde a la Fase 3.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <FilterBar label="Registros autorizados">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por persona, tipo o responsable"
              className="w-full sm:w-80"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {careTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
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
                <p className="font-medium">Protección de confidencialidad (demo local)</p>
                <p className="text-xs">
                  Los permisos de interfaz no constituyen seguridad real de servidor. Ninguna nota
                  confidencial se expone en Dashboard ni informes generales. IA:{" "}
                  {settings.allowPastoralAiAnalysis
                    ? "autorizada explícitamente en configuración demo."
                    : "desactivada por defecto."}
                </p>
              </div>
            </CardContent>
          </Card>

          <DataTable
            rows={visible}
            columns={columns}
            getRowId={(r) => r.id}
            onRowClick={onSelect}
            emptyTitle="Sin registros visibles"
            emptyDescription="No hay actuaciones pastorales en el ámbito y filtros seleccionados."
          />
          <p className="text-xs text-muted-foreground">
            Mostrando {visible.length} de {authorizedRecords.length} registros autorizados (
            {restrictedCount} excluidos por rol) · Organización {settings.organizationId} · Sede{" "}
            {settings.campusId}.
          </p>
        </>
      )}

      <FormDialog
        title="Nuevo registro de acompañamiento pastoral"
        description="Registro confidencial demostrativo vinculado a organización, sede y directorio de miembros."
        open={createOpen}
        onOpenChange={setCreateOpen}
        submitLabel="Guardar registro"
        onSubmit={() => {
          const linkedPerson =
            form.personId !== "__manual__"
              ? scopedMembers.find((m) => m.id === form.personId)
              : undefined;
          const personName = linkedPerson?.name || form.person.trim();
          if (!canWrite || !personName) return;
          const defaultAuthorizedRoles =
            form.type === "Consejería"
              ? ["pastor_principal", "consejero_autorizado"]
              : ["pastor_principal", "lider_pastoral", "consejero_autorizado"];
          if (!defaultAuthorizedRoles.includes(role)) {
            defaultAuthorizedRoles.push(role);
          }
          const today = new Date().toISOString().slice(0, 10);
          const newRecord: PastoralCareRecord = {
            id: `AP-${Date.now()}`,
            organizationId: settings.organizationId,
            campusId: form.campusId || settings.campusId,
            type: form.type,
            personId: linkedPerson?.id,
            person: personName,
            familyId: linkedPerson?.familyId,
            family: linkedPerson?.familyName,
            responsible: form.responsible.trim() || "Responsable · demo",
            date: today,
            status: "Abierto",
            summary: form.summary.trim() || "Registro pastoral demostrativo",
            confidentialNotes: form.notes.trim() || "Nota confidencial demostrativa.",
            commitments: [],
            authorizedRoles: defaultAuthorizedRoles,
            history: [
              {
                id: `APH-${Date.now()}`,
                date: today,
                action: "Registro creado",
                actor: "Usuario autorizado · demo",
              },
            ],
            accessLog: [
              {
                id: `APL-${Date.now()}`,
                at: new Date().toISOString(),
                actor: "Usuario autorizado · demo",
                action: "create",
                role,
              },
            ],
          };
          create(newRecord);
          setCreateOpen(false);
          setForm({
            type: "Visita pastoral",
            personId: "__manual__",
            person: "",
            responsible: "",
            summary: "",
            notes: "",
            campusId: settings.campusId || "SEDE-PRINCIPAL",
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Tipo">
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as PastoralCareType }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {careTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Miembro / visitante (directorio)">
            <Select
              value={form.personId}
              onValueChange={(v) => setForm((f) => ({ ...f, personId: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__manual__">Ingresar nombre manualmente</SelectItem>
                {scopedMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Nombre persona / familia (si manual)">
            <Input
              value={form.person}
              onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
              placeholder="Nombre de la persona o familia"
            />
          </FieldGroup>
          <FieldGroup label="Responsable">
            <Input
              value={form.responsible}
              onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))}
              placeholder="Responsable pastoral"
            />
          </FieldGroup>
          <FieldGroup label="Sede">
            <Input
              value={form.campusId}
              onChange={(e) => setForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Resumen operativo">
            <Input
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="Resumen no sensible"
            />
          </FieldGroup>
          <FieldGroup label="Notas confidenciales">
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Solo visible para roles autorizados"
            />
          </FieldGroup>
        </div>
      </FormDialog>

      <DetailDrawer
        open={!!selected && canAccessPastoralRecord(role, selected.authorizedRoles)}
        onOpenChange={(open) => !open && setSelectedId(null)}
        title={selected ? `${selected.type} · ${selected.person}` : "Registro"}
        description={
          selected ? `${selected.id} · ${selected.date} · ${selected.campusId}` : undefined
        }
      >
        {selected && canAccessPastoralRecord(role, selected.authorizedRoles) && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Responsable">{selected.responsible}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge
                  status={
                    String(selected.status).toLowerCase().includes("cerr") ? "approved" : "active"
                  }
                  label={String(selected.status)}
                />
              </InfoItem>
              <InfoItem label="Organización">{selected.organizationId}</InfoItem>
              <InfoItem label="Sede">{selected.campusId}</InfoItem>
              {selected.personId && (
                <InfoItem label="ID Directorio">{selected.personId}</InfoItem>
              )}
              <InfoItem label="Roles autorizados">
                {selected.authorizedRoles.join(", ")}
              </InfoItem>
            </div>
            <InfoItem label="Resumen">{selected.summary}</InfoItem>
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-900">
                <LockKeyhole className="size-4" />
                Notas confidenciales
              </p>
              <p className="text-sm text-red-950">
                {maskPastoralSensitive(
                  canAccessPastoralRecord(role, selected.authorizedRoles),
                  selected.confidentialNotes,
                )}
              </p>
              {!settings.allowPastoralAiAnalysis && (
                <p className="mt-2 text-xs text-red-800">
                  Análisis IA desactivado por defecto para este contenido sensible.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Compromisos pastorales</h3>
              <ul className="space-y-1 text-sm">
                {(selected.commitments ?? []).map((c, i) => (
                  <li key={i} className="rounded border p-2">
                    {c}
                  </li>
                ))}
                {(selected.commitments ?? []).length === 0 && (
                  <li className="text-muted-foreground">Sin compromisos registrados.</li>
                )}
              </ul>
              {canWrite && (
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Agregar compromiso pastoral..."
                    value={newCommitment}
                    onChange={(e) => setNewCommitment(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCommitmentToCase(selected)}
                  >
                    Agregar
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <History className="size-4" />
                Historial de actuaciones
              </h3>
              <ActivityTimeline
                entries={(selected.history ?? []).map((h) => ({
                  id: h.id,
                  title: h.action,
                  description: "Actuación pastoral autorizada",
                  date: h.date,
                  actor: h.actor,
                }))}
              />
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Eye className="size-4" />
                Registro local de accesos/modificaciones (demo)
              </h3>
              <div className="space-y-2">
                {(selected.accessLog ?? [])
                  .slice()
                  .reverse()
                  .map((log) => (
                    <div key={log.id} className="rounded border p-2 text-xs">
                      <span className="font-medium">{log.action}</span> · {log.actor} ({log.role})
                      · {log.at}
                    </div>
                  ))}
              </div>
            </div>
            {canWrite && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCaseStatus(selected, "En seguimiento")}
                >
                  Marcar en seguimiento
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCaseStatus(selected, "Cerrado")}
                >
                  Cerrar caso
                </Button>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
