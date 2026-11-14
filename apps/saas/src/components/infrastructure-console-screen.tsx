import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  Database,
  History,
  Layers,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sliders,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  applyLogicalVersionUpdate,
  computeInfrastructureMetrics,
  reactivateTenantEnvironment,
  suspendTenantEnvironment,
  terminateTenantEnvironment,
} from "../data/provisioning-service";
import type { InfrastructureIncident, TenantEnvironment } from "../data/saas-domain";
import { repositories, useRepositoryRows } from "../data/saas-repository";
import {
  DetailDrawer,
  MasterFormModal,
  MasterFormSection,
  StatusBadge,
  TableActionIconButton,
  TableRowActions,
} from "./saas-ui";

type InfraTab = "environments" | "versions" | "incidents";

export function InfrastructureConsoleScreen() {
  const environments = useRepositoryRows(repositories.environments);
  const organizations = useRepositoryRows(repositories.organizations);
  const applications = useRepositoryRows(repositories.applications);
  const contracts = useRepositoryRows(repositories.contracts);
  const infrastructureIncidents = useRepositoryRows(repositories.infrastructureIncidents);

  const [activeTab, setActiveTab] = useState<InfraTab>("environments");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedEnvId, setSelectedEnvId] = useState<string>(() => environments[0]?.id ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [operationNotice, setOperationNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Lifecycle action modal (suspend / reactivate / terminate / version update)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionMode, setActionMode] = useState<
    "suspend" | "reactivate" | "terminate" | "update_version"
  >("suspend");
  const [actionEnvId, setActionEnvId] = useState("");
  const [actionSuspensionType, setActionSuspensionType] = useState<"Administrativa" | "Comercial">(
    "Administrativa",
  );
  const [actionReason, setActionReason] = useState("");
  const [actionTargetVersion, setActionTargetVersion] = useState("");
  const [actionError, setActionError] = useState<string | undefined>(undefined);

  // Incident modal
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentKind, setIncidentKind] = useState<InfrastructureIncident["kind"]>(
    "Mantenimiento programado",
  );
  const [incidentSeverity, setIncidentSeverity] =
    useState<InfrastructureIncident["severity"]>("Baja");
  const [incidentEnvId, setIncidentEnvId] = useState("");
  const [incidentDetail, setIncidentDetail] = useState("");
  const [incidentScheduledWindow, setIncidentScheduledWindow] = useState("");
  const [incidentError, setIncidentError] = useState<string | undefined>(undefined);

  const metrics = computeInfrastructureMetrics();

  const filteredEnvironments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return environments.filter((env) => {
      if (statusFilter !== "Todos" && env.status !== statusFilter) return false;
      if (!q) return true;
      const org = organizations.find((o) => o.id === env.organizationId);
      const app = applications.find((a) => a.id === env.applicationId);
      return [
        env.id,
        org?.name ?? "",
        app?.name ?? "",
        env.status,
        env.installedProductVersion,
        env.availabilityStatus,
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [environments, organizations, applications, search, statusFilter]);

  const selectedEnv: TenantEnvironment | undefined = useMemo(
    () =>
      filteredEnvironments.find((e) => e.id === selectedEnvId) ??
      filteredEnvironments[0] ??
      environments[0],
    [filteredEnvironments, selectedEnvId, environments],
  );

  function openActionModal(
    mode: "suspend" | "reactivate" | "terminate" | "update_version",
    env: TenantEnvironment,
  ) {
    setActionMode(mode);
    setActionEnvId(env.id);
    setActionReason("");
    setActionSuspensionType("Administrativa");
    setActionTargetVersion(env.availableProductVersion ?? env.installedProductVersion);
    setActionError(undefined);
    setActionModalOpen(true);
  }

  function handleExecuteAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(undefined);
    const targetEnv = environments.find((e) => e.id === actionEnvId);
    if (!targetEnv) {
      setActionError("No se encontró el entorno lógico seleccionado.");
      return;
    }

    if (actionMode === "suspend") {
      const res = suspendTenantEnvironment({
        environmentId: targetEnv.id,
        suspensionType: actionSuspensionType,
        actor: "Infraestructura SaaS",
        reason: actionReason,
      });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      setActionModalOpen(false);
      setOperationNotice({
        type: "success",
        text: `Entorno lógico ${targetEnv.id} suspendido (${actionSuspensionType}). Acceso operativo revocado conservando configuración y datos históricos.`,
      });
      return;
    }

    if (actionMode === "reactivate") {
      const res = reactivateTenantEnvironment({
        environmentId: targetEnv.id,
        actor: "Infraestructura SaaS",
        notes:
          actionReason ||
          "Reactivación operativa tras verificación comercial y de licencias vigentes.",
      });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      setActionModalOpen(false);
      setOperationNotice({
        type: "success",
        text: `Entorno lógico ${targetEnv.id} reactivado y validado comercialmente.`,
      });
      return;
    }

    if (actionMode === "terminate") {
      const res = terminateTenantEnvironment({
        environmentId: targetEnv.id,
        actor: "Infraestructura SaaS",
        reason: actionReason,
      });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      setActionModalOpen(false);
      setOperationNotice({
        type: "success",
        text: `Baja lógica aplicada a ${targetEnv.id}. Datos históricos preservados bajo política de custodia sin eliminación física destructiva.`,
      });
      return;
    }

    if (actionMode === "update_version") {
      const res = applyLogicalVersionUpdate({
        environmentId: targetEnv.id,
        targetProductVersion: actionTargetVersion,
        actor: "Infraestructura SaaS",
        releaseNotes:
          actionReason || `Actualización lógica de software a versión ${actionTargetVersion}.`,
      });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      setActionModalOpen(false);
      setOperationNotice({
        type: "success",
        text: `Entorno ${targetEnv.id} actualizado a versión de software v${actionTargetVersion}.`,
      });
    }
  }

  function handleCreateIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIncidentError(undefined);
    if (!incidentTitle.trim() || !incidentDetail.trim()) {
      setIncidentError(
        "El título y la descripción técnica de la incidencia o ventana son obligatorios.",
      );
      return;
    }
    const targetEnv = environments.find((e) => e.id === incidentEnvId) ?? environments[0];
    const now = new Date().toISOString();
    const newIncident: InfrastructureIncident = {
      id: `INC-2026-${String(infrastructureIncidents.length + 1).padStart(3, "0")}`,
      environmentId: targetEnv?.id ?? "ENV-GLOBAL",
      organizationId: targetEnv?.organizationId ?? "ORG-001",
      applicationId: targetEnv?.applicationId ?? "APP-ERP",
      title: incidentTitle.trim(),
      kind: incidentKind,
      severity: incidentSeverity,
      status: "Abierta",
      detail: incidentDetail.trim(),
      scheduledWindow: incidentScheduledWindow.trim() || undefined,
      reportedBy: "Operaciones de Infraestructura A&O",
      createdAt: now,
      updatedAt: now,
    };
    repositories.infrastructureIncidents.create(newIncident);
    setIncidentModalOpen(false);
    setIncidentTitle("");
    setIncidentDetail("");
    setIncidentScheduledWindow("");
    setOperationNotice({
      type: "success",
      text: `Registro ${newIncident.id} creado en la bitácora de infraestructura.`,
    });
  }

  function handleResolveIncident(inc: InfrastructureIncident) {
    const now = new Date().toISOString();
    repositories.infrastructureIncidents.update(inc.id, {
      status: "Resuelta",
      updatedAt: now,
    });
    setOperationNotice({
      type: "success",
      text: `Incidencia ${inc.id} marcada como Resuelta.`,
    });
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Aprovisionamiento e Infraestructura Multi-Tenant</div>
          <h1 className="page-title">Panel de Infraestructura y Entornos Lógicos</h1>
          <p className="page-subtitle">
            Supervisión operativa de instancias lógicas multi-tenant, aislamiento por organización,
            versionado de software, políticas de conservación, suspensiones y mantenimiento.
          </p>
        </div>
        <div className="action-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIncidentTitle("");
              setIncidentDetail("");
              setIncidentScheduledWindow("");
              setIncidentEnvId(environments[0]?.id ?? "");
              setIncidentError(undefined);
              setIncidentModalOpen(true);
            }}
          >
            <Plus size={15} /> Registrar mantenimiento / incidencia
          </button>
        </div>
      </header>

      {/* Aviso explícito de arquitectura multi-tenant sin telemetría física ficticia */}
      <div className="info-banner">
        <Server size={16} />
        <div>
          <strong>Arquitectura SaaS Multi-Tenant sobre Infraestructura Compartida:</strong> Cada
          organización eclesial opera en una instancia lógica aislada (`TenantEnvironment`) dentro
          del clúster compartido de A&O. Todos los indicadores provienen de registros persistidos
          reales (no se simulan métricas ficticias de CPU, RAM o servidores físicos por cliente).
        </div>
      </div>

      {operationNotice && (
        <div
          className={`info-banner ${
            operationNotice.type === "error" ? "banner-danger" : "banner-success"
          }`}
        >
          {operationNotice.type === "error" ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <div style={{ flex: 1 }}>{operationNotice.text}</div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setOperationNotice(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 8 Indicadores reales obligatorios de la Sección 13 */}
      <section className="summary-grid">
        <article className="panel summary-card" data-tone="blue">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <ShieldCheck size={16} />
            </span>
            <small>Organizaciones aprovisionadas</small>
          </div>
          <strong>{metrics.provisionedOrganizationsCount}</strong>
          <span>Con entorno lógico operativo en plataforma</span>
        </article>

        <article className="panel summary-card" data-tone="emerald">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <CheckCircle2 size={16} />
            </span>
            <small>Entornos operativos</small>
          </div>
          <strong>{metrics.operativeEnvironmentsCount}</strong>
          <span>Instancias lógicas activas y disponibles</span>
        </article>

        <article className="panel summary-card" data-tone="gold">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <Clock size={16} />
            </span>
            <small>Aprovisionamientos pendientes</small>
          </div>
          <strong>{metrics.pendingProvisioningsCount}</strong>
          <span>En cola o en ejecución por etapas</span>
        </article>

        <article className="panel summary-card" data-tone="amber">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <XCircle size={16} />
            </span>
            <small>Procesos fallidos</small>
          </div>
          <strong>{metrics.failedProcessesCount}</strong>
          <span>Solicitudes detenidas listas para reintento</span>
        </article>

        <article className="panel summary-card" data-tone="gold">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <PauseCircle size={16} />
            </span>
            <small>Organizaciones suspendidas</small>
          </div>
          <strong>{metrics.suspendedOrganizationsCount}</strong>
          <span>Con acceso operativo bloqueado temporalmente</span>
        </article>

        <article className="panel summary-card" data-tone="blue">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <Layers size={16} />
            </span>
            <small>Módulos activos</small>
          </div>
          <strong>{metrics.activeModulesCount}</strong>
          <span>Módulos habilitados en entornos operativos</span>
        </article>

        <article className="panel summary-card" data-tone="violet">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <ArrowUpCircle size={16} />
            </span>
            <small>Actualizaciones pendientes</small>
          </div>
          <strong>{metrics.pendingUpdatesCount}</strong>
          <span>Entornos con nueva versión de software disponible</span>
        </article>

        <article className="panel summary-card" data-tone="gold">
          <div className="summary-card-head">
            <span className="summary-card-icon">
              <Wrench size={16} />
            </span>
            <small>Incidencias de infraestructura</small>
          </div>
          <strong>{metrics.openIncidentsCount}</strong>
          <span>Incidencias o mantenimientos abiertos / en curso</span>
        </article>
      </section>

      {/* Navegación de subdominios de Infraestructura */}
      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "environments" ? "active" : ""}`}
          onClick={() => setActiveTab("environments")}
        >
          <Database size={14} /> 1. Entornos Lógicos Multi-Tenant ({environments.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "versions" ? "active" : ""}`}
          onClick={() => setActiveTab("versions")}
        >
          <ArrowUpCircle size={14} /> 2. Versiones de Software y Compatibilidad (
          {metrics.pendingUpdatesCount} pendientes)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "incidents" ? "active" : ""}`}
          onClick={() => setActiveTab("incidents")}
        >
          <Wrench size={14} /> 3. Incidencias y Mantenimiento ({infrastructureIncidents.length})
        </button>
      </div>

      {/* TAB 1: ENTORNOS LÓGICOS MULTI-TENANT */}
      {activeTab === "environments" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Entornos lógicos por organización y producto</h2>
              <p>
                Selecciona un entorno para inspeccionar su configuración regional, módulos activos,
                retención de datos, historial y ejecutar suspensión, reactivación o baja lógica.
              </p>
            </div>
            <div className="filter-bar">
              <div className="search-input-wrap">
                <Search size={15} />
                <input
                  type="search"
                  placeholder="Buscar por ID de entorno, organización o versión..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Todos">Todos los estados</option>
                <option value="Operativo">Operativo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="En configuración">En configuración</option>
                <option value="En mantenimiento">En mantenimiento</option>
                <option value="Terminado">Terminado (Baja lógica)</option>
                <option value="Fallido">Fallido</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Entorno / Modelo</th>
                  <th>Organización</th>
                  <th>Producto / Contrato</th>
                  <th>Versión Software</th>
                  <th>Estado Operativo</th>
                  <th>Disponibilidad</th>
                  <th>Módulos activos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnvironments.map((env) => {
                  const org = organizations.find((o) => o.id === env.organizationId);
                  const app = applications.find((a) => a.id === env.applicationId);
                  const contract = contracts.find((c) => c.id === env.contractId);
                  const enabledModules = env.moduleConfigurations.filter((m) => m.enabled).length;
                  const isSelected = selectedEnv?.id === env.id;
                  const hasUpdate = Boolean(
                    env.availableProductVersion &&
                    env.availableProductVersion !== env.installedProductVersion,
                  );
                  return (
                    <tr
                      key={env.id}
                      className={isSelected ? "row-selected" : ""}
                      onClick={() => setSelectedEnvId(env.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className="cell-strong">{env.id}</div>
                        <div className="cell-muted">{env.isolationModel}</div>
                      </td>
                      <td>
                        <div className="cell-strong">{org?.name ?? env.organizationId}</div>
                        <div className="cell-muted">
                          {org?.type ?? "Organización"} · {env.regionalConfig.timezone}
                        </div>
                      </td>
                      <td>
                        <div className="cell-strong">{app?.name ?? env.applicationId}</div>
                        <div className="cell-muted">
                          Plan comercial v{contract?.planSnapshot?.planVersion ?? 1} · Contrato{" "}
                          {env.contractId}
                        </div>
                      </td>
                      <td>
                        <div className="cell-strong">v{env.installedProductVersion}</div>
                        {hasUpdate ? (
                          <span className="status-pill status-pendiente">
                            Disponible v{env.availableProductVersion}
                          </span>
                        ) : (
                          <div className="cell-muted">{env.updateStatus}</div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={env.status} />
                      </td>
                      <td>
                        <StatusBadge status={env.availabilityStatus} />
                      </td>
                      <td>
                        <div className="cell-strong">{enabledModules} activos</div>
                        <div className="cell-muted">Solicitud {env.provisioningRequestId}</div>
                      </td>
                      <td>
                        <TableRowActions>
                          <TableActionIconButton
                            kind="view"
                            label="Ver ficha"
                            onClick={() => {
                              setSelectedEnvId(env.id);
                              setDrawerOpen(true);
                            }}
                          />
                          {env.status === "Operativo" && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openActionModal("suspend", env)}
                            >
                              <PauseCircle size={13} /> Suspender
                            </button>
                          )}
                          {env.status === "Suspendido" && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => openActionModal("reactivate", env)}
                            >
                              <PlayCircle size={13} /> Reactivar
                            </button>
                          )}
                        </TableRowActions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ficha detallada inferior del entorno seleccionado */}
          {selectedEnv && (
            <div className="subpanel" style={{ marginTop: "1.25rem" }}>
              <div className="panel-header">
                <div>
                  <div className="eyebrow">Entorno Lógico Seleccionado · {selectedEnv.id}</div>
                  <h3>
                    {organizations.find((o) => o.id === selectedEnv.organizationId)?.name ??
                      selectedEnv.organizationId}{" "}
                    —{" "}
                    {applications.find((a) => a.id === selectedEnv.applicationId)?.name ??
                      selectedEnv.applicationId}
                  </h3>
                  <p>
                    Creado: {selectedEnv.createdAt.slice(0, 10)} · Última actualización:{" "}
                    {selectedEnv.updatedAt.slice(0, 10)} · Versión software:{" "}
                    <strong>v{selectedEnv.installedProductVersion}</strong> (Plan comercial v
                    {contracts.find((c) => c.id === selectedEnv.contractId)?.planSnapshot
                      ?.planVersion ?? 1}
                    )
                  </p>
                </div>
                <div className="action-row">
                  {selectedEnv.availableProductVersion &&
                    selectedEnv.availableProductVersion !== selectedEnv.installedProductVersion && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openActionModal("update_version", selectedEnv)}
                      >
                        <ArrowUpCircle size={15} /> Actualizar a v
                        {selectedEnv.availableProductVersion}
                      </button>
                    )}
                  {selectedEnv.status === "Operativo" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => openActionModal("suspend", selectedEnv)}
                    >
                      <PauseCircle size={15} /> Suspender entorno
                    </button>
                  )}
                  {selectedEnv.status === "Suspendido" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openActionModal("reactivate", selectedEnv)}
                    >
                      <PlayCircle size={15} /> Reactivar entorno
                    </button>
                  )}
                  {selectedEnv.status !== "Terminado" && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => openActionModal("terminate", selectedEnv)}
                    >
                      <XCircle size={15} /> Terminar servicio (Baja lógica)
                    </button>
                  )}
                </div>
              </div>

              <div className="detail-grid-2">
                <div className="detail-card">
                  <h4>
                    <Sliders size={15} /> Configuración Regional y Retención
                  </h4>
                  <dl className="kv-list">
                    <div>
                      <dt>Modelo de aislamiento</dt>
                      <dd>{selectedEnv.isolationModel}</dd>
                    </div>
                    <div>
                      <dt>Zona horaria / Locale</dt>
                      <dd>
                        {selectedEnv.regionalConfig.timezone} · {selectedEnv.regionalConfig.locale}
                      </dd>
                    </div>
                    <div>
                      <dt>Moneda operativa / Ubicación</dt>
                      <dd>
                        {selectedEnv.regionalConfig.currency} ·{" "}
                        {selectedEnv.regionalConfig.municipality},{" "}
                        {selectedEnv.regionalConfig.department}
                      </dd>
                    </div>
                    <div>
                      <dt>Política de retención de datos</dt>
                      <dd>{selectedEnv.dataRetentionPolicy}</dd>
                    </div>
                    <div>
                      <dt>Eliminación física bloqueada</dt>
                      <dd>Sí (Baja lógica auditable obligatoria)</dd>
                    </div>
                  </dl>
                </div>

                <div className="detail-card">
                  <h4>
                    <Layers size={15} /> Módulos Configurados en el Entorno (
                    {selectedEnv.moduleConfigurations.filter((m) => m.enabled).length} activos)
                  </h4>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Módulo</th>
                          <th>Versión instalada</th>
                          <th>Estado en entorno</th>
                          <th>Activado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEnv.moduleConfigurations.map((mc) => (
                          <tr key={mc.moduleId}>
                            <td>
                              <div className="cell-strong">{mc.moduleName}</div>
                              <div className="cell-muted">{mc.moduleCode}</div>
                            </td>
                            <td>v{mc.installedVersion}</td>
                            <td>
                              <span
                                className={`status-pill ${
                                  mc.enabled ? "status-activo" : "status-suspendido"
                                }`}
                              >
                                {mc.enabled ? "Activo en entorno" : "Deshabilitado"}
                              </span>
                            </td>
                            <td>{mc.activatedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="detail-card" style={{ marginTop: "1rem" }}>
                <h4>
                  <History size={15} /> Historial de Operaciones del Entorno Lógico
                </h4>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Operación</th>
                        <th>Actor</th>
                        <th>Resultado</th>
                        <th>Detalle de auditoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEnv.operationHistory.map((op) => (
                        <tr key={op.id}>
                          <td>{op.date}</td>
                          <td className="cell-strong">{op.action}</td>
                          <td>{op.actor}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                op.result === "Exitoso"
                                  ? "status-activo"
                                  : op.result === "Advertencia"
                                    ? "status-pendiente"
                                    : "status-vencido"
                              }`}
                            >
                              {op.result}
                            </span>
                          </td>
                          <td>{op.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: VERSIONES DE SOFTWARE Y COMPATIBILIDAD */}
      {activeTab === "versions" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Control de Versiones de Software por Organización</h2>
              <p>
                Diferenciación estricta entre la <strong>versión del software instalado</strong> en
                el entorno lógico (`installedProductVersion`) y la{" "}
                <strong>versión del plan comercial contratado</strong> (`planVersion`).
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organización</th>
                  <th>Producto</th>
                  <th>Versión Software Instalada</th>
                  <th>Versión Software Disponible</th>
                  <th>Versión Plan Comercial</th>
                  <th>Compatibilidad de Módulos</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {environments.map((env) => {
                  const org = organizations.find((o) => o.id === env.organizationId);
                  const app = applications.find((a) => a.id === env.applicationId);
                  const contract = contracts.find((c) => c.id === env.contractId);
                  const hasUpdate = Boolean(
                    env.availableProductVersion &&
                    env.availableProductVersion !== env.installedProductVersion,
                  );
                  return (
                    <tr key={env.id}>
                      <td>
                        <div className="cell-strong">{org?.name ?? env.organizationId}</div>
                        <div className="cell-muted">{env.id}</div>
                      </td>
                      <td>{app?.name ?? env.applicationId}</td>
                      <td>
                        <span className="status-pill status-activo">
                          Software v{env.installedProductVersion}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            hasUpdate ? "status-pendiente" : "status-activo"
                          }`}
                        >
                          {env.availableProductVersion
                            ? `Disponible v${env.availableProductVersion}`
                            : `v${env.installedProductVersion} (Al día)`}
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-validado">
                          Plan Comercial v{contract?.planSnapshot?.planVersion ?? 1}
                        </span>
                      </td>
                      <td>
                        {env.moduleConfigurations.length} módulos compatibles con v
                        {env.installedProductVersion}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            hasUpdate ? "status-pendiente" : "status-activo"
                          }`}
                        >
                          {env.updateStatus}
                        </span>
                      </td>
                      <td>
                        {hasUpdate && env.status !== "Terminado" ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openActionModal("update_version", env)}
                          >
                            <RefreshCw size={13} /> Aplicar v{env.availableProductVersion}
                          </button>
                        ) : (
                          <span className="cell-muted">Sin cambios pendientes</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: INCIDENCIAS Y MANTENIMIENTO */}
      {activeTab === "incidents" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Bitácora de Incidencias y Mantenimiento Programado</h2>
              <p>
                Seguimiento real de ventanas de actualización, verificación de migraciones y
                disponibilidad de entornos lógicos.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIncidentTitle("");
                setIncidentDetail("");
                setIncidentScheduledWindow("");
                setIncidentEnvId(environments[0]?.id ?? "");
                setIncidentError(undefined);
                setIncidentModalOpen(true);
              }}
            >
              <Plus size={15} /> Nueva incidencia / mantenimiento
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Título y Detalle</th>
                  <th>Entorno / Organización</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>Ventana / Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {infrastructureIncidents.map((inc) => {
                  const org = organizations.find((o) => o.id === inc.organizationId);
                  return (
                    <tr key={inc.id}>
                      <td className="cell-strong">{inc.id}</td>
                      <td>{inc.kind}</td>
                      <td>
                        <div className="cell-strong">{inc.title}</div>
                        <div className="cell-muted">{inc.detail}</div>
                      </td>
                      <td>
                        <div>{org?.name ?? "Plataforma Global"}</div>
                        <div className="cell-muted">{inc.environmentId}</div>
                      </td>
                      <td>
                        <StatusBadge status={inc.severity} />
                      </td>
                      <td>
                        <StatusBadge status={inc.status} />
                      </td>
                      <td>
                        <div>{inc.scheduledWindow ?? inc.createdAt.slice(0, 10)}</div>
                        <div className="cell-muted">Reportó: {inc.reportedBy}</div>
                      </td>
                      <td>
                        {inc.status !== "Resuelta" ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleResolveIncident(inc)}
                          >
                            <CheckCircle2 size={13} /> Marcar resuelta
                          </button>
                        ) : (
                          <span className="cell-muted">Cerrada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Drawer rápido de entorno */}
      {drawerOpen && selectedEnv && (
        <DetailDrawer
          onClose={() => setDrawerOpen(false)}
          title={`Entorno ${selectedEnv.id}`}
          subtitle={`Estado: ${selectedEnv.status} · Software v${selectedEnv.installedProductVersion}`}
          items={[
            { label: "ID de Entorno", value: selectedEnv.id, mono: true },
            { label: "Modelo de Aislamiento", value: selectedEnv.isolationModel },
            { label: "Estado Operativo", value: selectedEnv.status },
            { label: "Disponibilidad", value: selectedEnv.availabilityStatus },
            {
              label: "Versión Software Instalada",
              value: `v${selectedEnv.installedProductVersion}`,
              mono: true,
            },
            { label: "Política de Retención", value: selectedEnv.dataRetentionPolicy },
          ]}
          notice="Instancia lógica multi-tenant aislada sobre infraestructura compartida."
        />
      )}

      {/* Modal de Suspensión / Reactivación / Baja lógica / Actualización de versión */}
      {actionModalOpen && (
        <MasterFormModal
          onClose={() => setActionModalOpen(false)}
          sheetLabel="Gobierno de Entornos Lógicos"
          entityName={
            actionMode === "suspend"
              ? "Suspender Entorno Lógico Multi-Tenant"
              : actionMode === "reactivate"
                ? "Reactivar Entorno Lógico Multi-Tenant"
                : actionMode === "terminate"
                  ? "Terminación y Baja Lógica de Servicio"
                  : "Aplicar Actualización de Versión de Software"
          }
          recordCode={actionEnvId}
          operation="edit"
          errorMessage={actionError}
          submitLabel={
            actionMode === "suspend"
              ? "Confirmar suspensión"
              : actionMode === "reactivate"
                ? "Validar y reactivar"
                : actionMode === "terminate"
                  ? "Ejecutar baja lógica"
                  : "Aplicar actualización"
          }
          onSubmit={handleExecuteAction}
        >
          <MasterFormSection
            step="01"
            title="Parámetros de la Operación"
            description={
              actionMode === "suspend"
                ? "La suspensión bloquea el acceso operativo e impide nuevas activaciones, conservando intactos los datos y configuraciones."
                : actionMode === "reactivate"
                  ? "La reactivación verifica automáticamente la vigencia del contrato y la licencia antes de restablecer el servicio."
                  : actionMode === "terminate"
                    ? "La baja lógica finaliza el servicio preservando el historial contractual y operativo según la política de retención, sin borrado físico destructivo."
                    : "Actualiza la versión de software del entorno lógico y alinea la compatibilidad de sus módulos activos sin alterar el snapshot del plan comercial."
            }
          >
            {actionMode === "suspend" && (
              <div className="form-field">
                <label htmlFor="suspension-type-select">Tipo de suspensión *</label>
                <select
                  id="suspension-type-select"
                  value={actionSuspensionType}
                  onChange={(e) =>
                    setActionSuspensionType(e.target.value as "Administrativa" | "Comercial")
                  }
                >
                  <option value="Administrativa">Administrativa</option>
                  <option value="Comercial">Comercial (Mora o incumplimiento)</option>
                </select>
              </div>
            )}

            {actionMode === "update_version" && (
              <div className="form-field">
                <label htmlFor="target-version-input">Versión de software objetivo *</label>
                <input
                  id="target-version-input"
                  type="text"
                  value={actionTargetVersion}
                  onChange={(e) => setActionTargetVersion(e.target.value)}
                  placeholder="Ej. 2026.4.2"
                />
              </div>
            )}

            <div className="form-field span-2">
              <label htmlFor="action-reason-input">
                {actionMode === "suspend" || actionMode === "terminate"
                  ? "Motivo obligatorio de auditoría *"
                  : "Notas de auditoría de la operación"}
              </label>
              <textarea
                id="action-reason-input"
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Describe el sustento comercial, técnico o contractual de esta operación..."
              />
            </div>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {/* Modal para registrar ventana de mantenimiento o incidencia */}
      {incidentModalOpen && (
        <MasterFormModal
          onClose={() => setIncidentModalOpen(false)}
          sheetLabel="Bitácora de Infraestructura"
          entityName="Registrar Incidencia o Mantenimiento de Infraestructura"
          recordCode="NUEVO-REGISTRO"
          operation="create"
          errorMessage={incidentError}
          submitLabel="Guardar registro"
          onSubmit={handleCreateIncident}
        >
          <MasterFormSection
            step="01"
            title="Datos del Evento de Infraestructura"
            description="Registra una ventana programada de mantenimiento o incidencia de actualización sobre los entornos lógicos."
          >
            <div className="form-field">
              <label htmlFor="inc-title">Título del evento *</label>
              <input
                id="inc-title"
                type="text"
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                placeholder="Ej. Actualización programada a v2026.4.2"
              />
            </div>
            <div className="form-field">
              <label htmlFor="inc-env">Entorno lógico relacionado</label>
              <select
                id="inc-env"
                value={incidentEnvId}
                onChange={(e) => setIncidentEnvId(e.target.value)}
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.id} ({env.organizationId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="inc-kind">Tipo de evento *</label>
              <select
                id="inc-kind"
                value={incidentKind}
                onChange={(e) => setIncidentKind(e.target.value as InfrastructureIncident["kind"])}
              >
                <option value="Mantenimiento programado">Mantenimiento programado</option>
                <option value="Incidencia de actualización">Incidencia de actualización</option>
                <option value="Incidencia de entorno">Incidencia de entorno</option>
                <option value="Alerta de capacidad">Alerta de capacidad</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="inc-severity">Severidad *</label>
              <select
                id="inc-severity"
                value={incidentSeverity}
                onChange={(e) =>
                  setIncidentSeverity(e.target.value as InfrastructureIncident["severity"])
                }
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div className="form-field span-2">
              <label htmlFor="inc-window">Ventana programada (opcional)</label>
              <input
                id="inc-window"
                type="text"
                value={incidentScheduledWindow}
                onChange={(e) => setIncidentScheduledWindow(e.target.value)}
                placeholder="Ej. 2026-11-15 02:00 - 03:00 COT"
              />
            </div>
            <div className="form-field span-2">
              <label htmlFor="inc-detail">Descripción técnica y alcance *</label>
              <textarea
                id="inc-detail"
                rows={3}
                value={incidentDetail}
                onChange={(e) => setIncidentDetail(e.target.value)}
                placeholder="Detalla las tareas de verificación, compatibilidad o mantenimiento..."
              />
            </div>
          </MasterFormSection>
        </MasterFormModal>
      )}
    </div>
  );
}
