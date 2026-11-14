import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  createProvisioningRequest,
  executeProvisioningWorkflow,
  retryProvisioningWorkflow,
  transitionProvisioningStatus,
  validateCommercialReadinessForProvisioning,
} from "../data/provisioning-service";
import {
  CURRENCIES,
  ORGANIZATION_TYPES,
  PROVISIONING_STATUSES,
  type ProvisioningRequest,
} from "../data/saas-domain";
import {
  getModuleRepository,
  repositories,
  saasStore,
  useRepositoryRows,
} from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  DetailDrawer,
  EmptyState,
  FilterToolbar,
  MasterFormModal,
  MasterFormSection,
  ModalDialog,
  StatusBadge,
  SummaryCard,
  TableActionIconButton,
  TableRowActions,
} from "./saas-ui";

type ProvisioningDetailTab = "stages" | "config" | "modules" | "timeline";

export function ProvisioningConsoleScreen() {
  const requests = useRepositoryRows(repositories.provisioningRequests);
  const environments = useRepositoryRows(repositories.environments);
  const organizations = useRepositoryRows(repositories.organizations);
  const institutions = useRepositoryRows(repositories.institutions);
  const clients = useRepositoryRows(repositories.clients);
  const contracts = useRepositoryRows(repositories.contracts);
  const subscriptions = useRepositoryRows(repositories.subscriptions);
  const licenses = useRepositoryRows(repositories.licenses);
  const applications = useRepositoryRows(repositories.applications);
  const modules = useRepositoryRows(repositories.modules);
  const plans = useRepositoryRows(repositories.plans);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    requests[0]?.id ?? null,
  );
  const [detailTab, setDetailTab] = useState<ProvisioningDetailTab>("stages");
  const [actionFeedback, setActionFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  // Drawer para auditar una operación específica
  const [drawerRequest, setDrawerRequest] = useState<ProvisioningRequest | null>(null);

  // Modal de creación de solicitud de aprovisionamiento
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingConfigReq, setEditingConfigReq] = useState<ProvisioningRequest | null>(null);
  const [reqId, setReqId] = useState("");
  const [contractId, setContractId] = useState(contracts[0]?.id ?? "");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "ORG-001");
  const [appId, setAppId] = useState(applications[0]?.id ?? "APP-ERP");
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [orgType, setOrgType] = useState<string>("Diócesis");
  const [country, setCountry] = useState("Colombia");
  const [department, setDepartment] = useState("Cundinamarca");
  const [municipality, setMunicipality] = useState("Bogotá D.C.");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [timezone, setTimezone] = useState("America/Bogota");
  const [locale, setLocale] = useState("es-CO");
  const [currency, setCurrency] = useState("COP");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [structureNotes, setStructureNotes] = useState("");
  const [selectedInstIds, setSelectedInstIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  // Modal de confirmación de cancelación
  const [cancelTarget, setCancelTarget] = useState<ProvisioningRequest | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const syncEcosystemProvisioning = () => {
    const repo = getModuleRepository("aprovisionamiento");
    repo.replace(
      repositories.provisioningRequests.list().map((req) => {
        const org = repositories.organizations.getById(req.organizationId);
        const completedCount = req.stages.filter((s) => s.status === "Completado").length;
        return {
          id: req.id,
          name: `Aprovisionamiento ${org?.name ?? req.organizationId}`,
          detail: `Etapa ${completedCount} de ${req.stages.length} · Contrato ${req.contractId}`,
          context: `Producto ${req.applicationId} · ${req.status}`,
          owner: req.requestedBy,
          status:
            req.status === "Operativo"
              ? "Activo"
              : req.status === "Fallido" || req.status === "Suspendido"
                ? "Suspendido"
                : "En revisión",
        };
      }),
    );
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "Todos" || req.status === statusFilter;
    const org = organizations.find((o) => o.id === req.organizationId);
    const cli = clients.find((c) => c.id === req.clientId);
    const app = applications.find((a) => a.id === req.applicationId);
    const text = [
      req.id,
      req.contractId,
      req.subscriptionId,
      req.licenseId,
      req.environmentId,
      org?.name,
      cli?.name,
      app?.name,
      req.status,
      req.lastError,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && (!query.trim() || text.includes(query.toLowerCase()));
  });

  const selectedRequest =
    requests.find((r) => r.id === selectedRequestId) ?? filteredRequests[0] ?? requests[0] ?? null;

  const operativeCount = requests.filter((r) => r.status === "Operativo").length;
  const failedCount = requests.filter((r) => r.status === "Fallido").length;
  const inProgressCount = requests.filter((r) =>
    [
      "Pendiente",
      "En validación",
      "Validado",
      "En aprovisionamiento",
      "Configurando",
      "Activando servicios",
    ].includes(r.status),
  ).length;

  const populateFromContract = (targetContractId: string) => {
    const con = contracts.find((c) => c.id === targetContractId);
    if (!con) return;
    const org =
      organizations.find((o) => o.id === con.organizationId) ??
      organizations.find((o) => o.clientId === con.clientId) ??
      organizations[0];
    const cli = clients.find((c) => c.id === con.clientId);
    const orgInsts = institutions
      .filter((inst) => inst.organizationId === org?.id)
      .map((inst) => inst.id);

    setContractId(con.id);
    if (org) {
      setOrgId(org.id);
      setLegalName(org.name);
      setDisplayName(org.shortName ?? org.name);
      setTaxId(org.taxId ?? org.idNumber ?? "");
      setOrgType(org.type);
      setCountry(org.country ?? "Colombia");
      setDepartment(org.department ?? "Cundinamarca");
      setMunicipality(org.municipality ?? "Bogotá D.C.");
      setAddress(org.address ?? "Dirección institucional");
      setSelectedInstIds(orgInsts);
      setStructureNotes(
        `Configuración multi-tenant para ${org.type} (${org.name}) con ${orgInsts.length} institución(es) autorizada(s).`,
      );
    }
    setAppId(con.applicationId ?? con.planSnapshot?.applicationId ?? "APP-ERP");
    setContactEmail(cli?.email ?? "contacto@institucion.org.co");
    setContactPhone(cli?.phone ?? "+57 (601) 300 0000");
    setCurrency(con.currency ?? "COP");
  };

  const openCreateModal = () => {
    const nextNum = requests.length + 1;
    const defaultCon = contracts.find((c) => c.status === "Activo") ?? contracts[0];
    setEditingConfigReq(null);
    setReqId(`PROV-${String(nextNum).padStart(3, "0")}`);
    if (defaultCon) {
      populateFromContract(defaultCon.id);
    }
    setTimezone("America/Bogota");
    setLocale("es-CO");
    setDateFormat("DD/MM/YYYY");
    setFormError("");
    setCreateModalOpen(true);
  };

  const openEditConfigModal = (req: ProvisioningRequest) => {
    setEditingConfigReq(req);
    setReqId(req.id);
    setContractId(req.contractId);
    setOrgId(req.organizationId);
    setAppId(req.applicationId);
    setLegalName(req.initialConfig.legalName);
    setDisplayName(req.initialConfig.displayName);
    setTaxId(req.initialConfig.taxId ?? "");
    setOrgType(req.initialConfig.organizationType);
    setCountry(req.initialConfig.country);
    setDepartment(req.initialConfig.department);
    setMunicipality(req.initialConfig.municipality);
    setAddress(req.initialConfig.address);
    setContactEmail(req.initialConfig.contactEmail);
    setContactPhone(req.initialConfig.contactPhone);
    setTimezone(req.initialConfig.timezone);
    setLocale(req.initialConfig.locale);
    setCurrency(req.initialConfig.currency);
    setDateFormat(req.initialConfig.dateFormat);
    setStructureNotes(req.initialConfig.ecclesiasticalStructureNotes);
    setSelectedInstIds(req.initialConfig.authorizedInstitutionIds);
    setFormError("");
    setCreateModalOpen(true);
  };

  const handleSaveRequestOrConfig = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!legalName.trim() || !country.trim() || !timezone.trim()) {
      setFormError("La razón social/nombre legal, el país y la zona horaria son obligatorios.");
      return;
    }

    if (editingConfigReq) {
      const now = new Date().toISOString();
      repositories.provisioningRequests.update(editingConfigReq.id, {
        initialConfig: {
          legalName: legalName.trim(),
          displayName: displayName.trim() || legalName.trim(),
          taxId: taxId.trim() || undefined,
          organizationType: orgType,
          country: country.trim(),
          department: department.trim(),
          municipality: municipality.trim(),
          address: address.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          timezone,
          locale,
          currency,
          dateFormat,
          ecclesiasticalStructureNotes: structureNotes.trim(),
          authorizedInstitutionIds: selectedInstIds,
        },
        updatedAt: now,
      });
      syncEcosystemProvisioning();
      setCreateModalOpen(false);
      setActionFeedback({
        tone: "success",
        message: `Configuración inicial de ${editingConfigReq.id} actualizada.`,
      });
      return;
    }

    const result = createProvisioningRequest({
      id: reqId.trim(),
      organizationId: orgId,
      contractId,
      applicationId: appId,
      initialConfig: {
        legalName: legalName.trim(),
        displayName: displayName.trim() || legalName.trim(),
        taxId: taxId.trim() || undefined,
        organizationType: orgType,
        country: country.trim(),
        department: department.trim(),
        municipality: municipality.trim(),
        address: address.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        timezone,
        locale,
        currency,
        dateFormat,
        ecclesiasticalStructureNotes: structureNotes.trim(),
        authorizedInstitutionIds: selectedInstIds,
      },
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    syncEcosystemProvisioning();
    setSelectedRequestId(result.request.id);
    setCreateModalOpen(false);
    setActionFeedback({
      tone: "success",
      message: `Solicitud ${result.request.id} creada y validada comercialmente.`,
    });
  };

  const handleExecuteWorkflow = (req: ProvisioningRequest) => {
    const res = executeProvisioningWorkflow({ requestId: req.id });
    syncEcosystemProvisioning();
    if (!res.ok) {
      setActionFeedback({
        tone: "error",
        message: res.error,
      });
      return;
    }
    setActionFeedback({
      tone: "success",
      message: `Aprovisionamiento completado con éxito. Entorno lógico ${res.environment.id} en estado Operativo.`,
    });
  };

  const handleRetryWorkflow = (req: ProvisioningRequest) => {
    const res = retryProvisioningWorkflow({ requestId: req.id });
    syncEcosystemProvisioning();
    if (!res.ok) {
      setActionFeedback({
        tone: "error",
        message: res.error,
      });
      return;
    }
    setActionFeedback({
      tone: "success",
      message: `Reintento exitoso en ${req.id}. Se conservaron las etapas previas y el entorno ${res.environment.id} quedó Operativo.`,
    });
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    const res = transitionProvisioningStatus({
      requestId: cancelTarget.id,
      toStatus: "Cancelado",
      actor: "Dirección de Onboarding",
      notes: cancelReason.trim() || "Cancelación administrativa de solicitud.",
      result: "Advertencia",
    });
    syncEcosystemProvisioning();
    setCancelTarget(null);
    setCancelReason("");
    if (res.ok) {
      setActionFeedback({
        tone: "success",
        message: `Solicitud ${res.request.id} cancelada conservando su historial.`,
      });
    }
  };

  const toggleInstitutionSelection = (instId: string) => {
    setSelectedInstIds((prev) =>
      prev.includes(instId) ? prev.filter((item) => item !== instId) : [...prev, instId],
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Bloque 4 · Aprovisionamiento e Instancias Lógicas Multi-Tenant</p>
          <h1>Consola de Aprovisionamiento Institucional</h1>
          <p>
            Conversión controlada, idempotente y auditable de contrataciones comerciales aprobadas
            en entornos organizacionales operativos.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/infraestructura" className="button-muted">
            <SaasIcon name="infrastructure" size={15} />
            Ver entornos e infraestructura
          </Link>
          <button className="button-primary" type="button" onClick={openCreateModal}>
            <SaasIcon name="plus" size={15} />
            Nueva solicitud de aprovisionamiento
          </button>
        </div>
      </header>

      <div className="notice" style={{ marginBottom: 16 }}>
        <strong>Arquitectura Multi-Tenant Compartida:</strong> Cada organización aprovisionada
        recibe una <strong>instancia lógica aislada</strong> (con su propia configuración regional,
        estructura eclesial, usuarios, permisos, productos, módulos y licencias) dentro de la
        infraestructura compartida de A&amp;O. No se crean aplicaciones ni servidores físicos
        independientes por parroquia o cliente.
      </div>

      {actionFeedback ? (
        <div
          className="notice"
          style={{
            marginBottom: 16,
            borderColor:
              actionFeedback.tone === "error"
                ? "var(--status-suspended-border)"
                : "var(--status-active-border)",
          }}
        >
          <strong>
            {actionFeedback.tone === "error"
              ? "Atención en aprovisionamiento:"
              : "Operación completada:"}
          </strong>{" "}
          {actionFeedback.message}
        </div>
      ) : null}

      <div className="summary-grid">
        <SummaryCard
          label="Solicitudes registradas"
          value={requests.length}
          detail={`${inProgressCount} en flujo de preparación o validación`}
          icon="provisioning"
        />
        <SummaryCard
          label="Organizaciones operativas"
          value={operativeCount}
          detail={`${environments.filter((e) => e.status === "Operativo").length} entornos lógicos activos`}
          icon="check"
          tone="emerald"
        />
        <SummaryCard
          label="Procesos fallidos"
          value={failedCount}
          detail="Con etapas previas conservadas para reintento seguro"
          icon="alert"
          tone="amber"
        />
        <SummaryCard
          label="Módulos activados"
          value={requests.reduce((sum, r) => sum + r.activatedModuleIds.length, 0)}
          detail="Sincronizados con licencias y dependencias del Bloque 3"
          icon="plans"
        />
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por código PROV, organización, cliente, contrato, entorno o estado..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", ...PROVISIONING_STATUSES]}
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer demo"
          totalCount={requests.length}
          visibleCount={filteredRequests.length}
        />

        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No se encontraron solicitudes de aprovisionamiento"
            description="Limpia los filtros o inicia una solicitud vinculada a un contrato aprobado."
            actionLabel="Limpiar filtros"
            onAction={() => {
              setQuery("");
              setStatusFilter("Todos");
            }}
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Solicitud / Idempotencia</th>
                  <th>Organización beneficiaria y cliente</th>
                  <th>Contrato, plan y licencia</th>
                  <th>Progreso por etapas</th>
                  <th>Entorno lógico</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const org = organizations.find((o) => o.id === req.organizationId);
                  const cli = clients.find((c) => c.id === req.clientId);
                  const app = applications.find((a) => a.id === req.applicationId);
                  const pln = plans.find((p) => p.id === req.planId);
                  const completedStages = req.stages.filter(
                    (s) => s.status === "Completado",
                  ).length;
                  const isSelected = selectedRequest?.id === req.id;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--blue-50)" : undefined,
                      }}
                    >
                      <td>
                        <strong className="row-title">{req.id}</strong>
                        <span className="row-sub">
                          Reintentos: {req.retryCount} · {req.requestedBy}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{org?.name ?? req.organizationId}</strong>
                        <span className="row-sub">Cliente: {cli?.name ?? req.clientId}</span>
                      </td>
                      <td>
                        <strong className="row-title">
                          {req.contractId} · Plan {pln?.name ?? req.planId}
                        </strong>
                        <span className="row-sub">
                          {app?.name ?? req.applicationId} · Lic: {req.licenseId}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">
                          {completedStages} de {req.stages.length} completadas
                        </strong>
                        <span className="row-sub">
                          {req.activatedModuleIds.length > 0
                            ? `${req.activatedModuleIds.length} módulos activos`
                            : `${req.requestedModuleIds.length} módulos autorizados`}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">
                          {req.environmentId ?? "Pendiente de asignar"}
                        </strong>
                        <span className="row-sub">
                          {req.initialConfig.timezone} · {req.initialConfig.currency}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <TableRowActions>
                          <TableActionIconButton
                            kind="view"
                            label="Ver ficha"
                            onClick={() => setSelectedRequestId(req.id)}
                          />
                          {req.status === "Fallido" ? (
                            <button
                              className="action-link"
                              type="button"
                              onClick={() => handleRetryWorkflow(req)}
                            >
                              Reintentar
                            </button>
                          ) : req.status !== "Operativo" && req.status !== "Cancelado" ? (
                            <button
                              className="action-link"
                              type="button"
                              onClick={() => handleExecuteWorkflow(req)}
                            >
                              Ejecutar
                            </button>
                          ) : null}
                          <button
                            className="action-link"
                            type="button"
                            onClick={() => setDrawerRequest(req)}
                          >
                            Trazabilidad
                          </button>
                        </TableRowActions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ficha Detallada de la Solicitud de Aprovisionamiento */}
      {selectedRequest ? (
        <section className="panel master-detail-panel" style={{ marginTop: 20 }}>
          {(() => {
            const org = organizations.find((o) => o.id === selectedRequest.organizationId);
            const cli = clients.find((c) => c.id === selectedRequest.clientId);
            const con = contracts.find((c) => c.id === selectedRequest.contractId);
            const sub = subscriptions.find((s) => s.id === selectedRequest.subscriptionId);
            const lic = licenses.find((l) => l.id === selectedRequest.licenseId);
            const app = applications.find((a) => a.id === selectedRequest.applicationId);
            const env = environments.find((e) => e.id === selectedRequest.environmentId);
            const readinessCheck = validateCommercialReadinessForProvisioning({
              organizationId: selectedRequest.organizationId,
              contractId: selectedRequest.contractId,
              subscriptionId: selectedRequest.subscriptionId,
              licenseId: selectedRequest.licenseId,
              applicationId: selectedRequest.applicationId,
              requestedModuleIds: selectedRequest.requestedModuleIds,
            });

            return (
              <>
                <header className="master-sheet-header">
                  <div>
                    <div className="master-sheet-badges">
                      <span className="code-badge">{selectedRequest.id}</span>
                      <span className="type-badge">{selectedRequest.idempotencyKey}</span>
                      <StatusBadge status={selectedRequest.status} />
                    </div>
                    <h2>
                      Aprovisionamiento de {org?.name ?? selectedRequest.organizationId} (
                      {app?.name ?? selectedRequest.applicationId})
                    </h2>
                    <p>
                      Cliente contratante: <strong>{cli?.name ?? selectedRequest.clientId}</strong>{" "}
                      · Contrato: <strong>{selectedRequest.contractId}</strong> · Licencia:{" "}
                      <strong>{selectedRequest.licenseId}</strong>
                    </p>
                  </div>
                  <div className="header-actions">
                    {selectedRequest.status === "Fallido" ? (
                      <button
                        type="button"
                        className="button-primary button-compact"
                        onClick={() => handleRetryWorkflow(selectedRequest)}
                      >
                        <SaasIcon name="subscriptions" size={14} />
                        Reintentar operación fallida
                      </button>
                    ) : selectedRequest.status !== "Operativo" &&
                      selectedRequest.status !== "Cancelado" ? (
                      <button
                        type="button"
                        className="button-primary button-compact"
                        onClick={() => handleExecuteWorkflow(selectedRequest)}
                      >
                        <SaasIcon name="check" size={14} />
                        Ejecutar aprovisionamiento
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="button-muted button-compact"
                      onClick={() => openEditConfigModal(selectedRequest)}
                    >
                      <SaasIcon name="edit" size={14} />
                      Editar configuración inicial
                    </button>
                    {selectedRequest.status !== "Operativo" &&
                    selectedRequest.status !== "Cancelado" ? (
                      <button
                        type="button"
                        className="button-ghost button-compact"
                        onClick={() => setCancelTarget(selectedRequest)}
                      >
                        Cancelar solicitud
                      </button>
                    ) : null}
                  </div>
                </header>

                {selectedRequest.lastError ? (
                  <div
                    className="notice"
                    style={{
                      marginBottom: 14,
                      borderColor: "var(--status-suspended-border)",
                    }}
                  >
                    <strong>Error registrado en la última ejecución:</strong>{" "}
                    {selectedRequest.lastError}
                  </div>
                ) : null}

                <div className="master-summary-strip">
                  <div className="master-summary-item">
                    <span>Validación comercial previa</span>
                    <strong>{readinessCheck.ok ? "Autorizada" : "Bloqueada"}</strong>
                    <small>
                      {readinessCheck.ok
                        ? `Contrato ${con?.status ?? "Activo"} · Licencia ${lic?.status ?? "Activo"}`
                        : readinessCheck.error}
                    </small>
                  </div>
                  <div className="master-summary-item">
                    <span>Producto y plan contratado</span>
                    <strong>{app?.name ?? selectedRequest.applicationId}</strong>
                    <small>
                      Plan {con?.planSnapshot?.planName ?? selectedRequest.planId} (Snapshot v
                      {con?.planSnapshot?.planVersion ?? 1})
                    </small>
                  </div>
                  <div className="master-summary-item">
                    <span>Módulos contratados / activos</span>
                    <strong>
                      {selectedRequest.activatedModuleIds.length} /{" "}
                      {selectedRequest.requestedModuleIds.length}
                    </strong>
                    <small>
                      {selectedRequest.activatedFeatureIds.length} funcionalidades habilitadas
                    </small>
                  </div>
                  <div className="master-summary-item">
                    <span>Entorno lógico multi-tenant</span>
                    <strong>{env ? env.id : "Pendiente de activación"}</strong>
                    <small>
                      {env
                        ? `Versión software v${env.installedProductVersion} · ${env.availabilityStatus}`
                        : "Sin instancia activa aún"}
                    </small>
                  </div>
                </div>

                <div
                  className="domain-tabs"
                  role="tablist"
                  aria-label="Secciones de la ficha de aprovisionamiento"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === "stages"}
                    className={`domain-tab${detailTab === "stages" ? " active" : ""}`}
                    onClick={() => setDetailTab("stages")}
                  >
                    <SaasIcon name="provisioning" size={14} />
                    1. Etapas e idempotencia ({selectedRequest.stages.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === "config"}
                    className={`domain-tab${detailTab === "config" ? " active" : ""}`}
                    onClick={() => setDetailTab("config")}
                  >
                    <SaasIcon name="organizations" size={14} />
                    2. Configuración e instituciones
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === "modules"}
                    className={`domain-tab${detailTab === "modules" ? " active" : ""}`}
                    onClick={() => setDetailTab("modules")}
                  >
                    <SaasIcon name="products" size={14} />
                    3. Productos, módulos y entorno
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === "timeline"}
                    className={`domain-tab${detailTab === "timeline" ? " active" : ""}`}
                    onClick={() => setDetailTab("timeline")}
                  >
                    <SaasIcon name="audit" size={14} />
                    4. Línea de tiempo e historial ({selectedRequest.history.length})
                  </button>
                </div>

                {detailTab === "stages" ? (
                  <div className="master-section-grid">
                    <div className="master-section">
                      <h4>Etapas obligatorias del aprovisionamiento</h4>
                      <div className="relation-list">
                        {selectedRequest.stages.map((stage) => (
                          <div key={stage.stageCode} className="relation-card">
                            <div>
                              <strong>
                                {stage.stageName} · <code>{stage.operationId}</code>
                              </strong>
                              <small>{stage.detail}</small>
                              {stage.errorMessage ? (
                                <small
                                  style={{
                                    color: "var(--status-suspended-fg)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Error: {stage.errorMessage}
                                </small>
                              ) : null}
                              <small>
                                Intentos ejecutados: {stage.attempts}
                                {stage.executedAt
                                  ? ` · Última ejecución: ${stage.executedAt.slice(0, 19).replace("T", " ")}`
                                  : ""}
                              </small>
                            </div>
                            <StatusBadge
                              status={
                                stage.status === "Completado"
                                  ? "Activo"
                                  : stage.status === "Fallido"
                                    ? "Fallido"
                                    : "Pendiente"
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="master-section">
                      <h4>Resumen comercial y validación previa</h4>
                      <div className="master-field-grid">
                        <div className="master-field">
                          <span>Cliente contratante</span>
                          <strong>
                            <Link to="/clientes">{cli?.name ?? selectedRequest.clientId}</Link>
                          </strong>
                        </div>
                        <div className="master-field">
                          <span>Organización beneficiaria</span>
                          <strong>
                            <Link to="/organizaciones">
                              {org?.name ?? selectedRequest.organizationId}
                            </Link>
                          </strong>
                        </div>
                        <div className="master-field">
                          <span>Contrato y suscripción</span>
                          <strong>
                            <Link to="/suscripciones">
                              {selectedRequest.contractId} /{" "}
                              {sub?.id ?? selectedRequest.subscriptionId}
                            </Link>
                          </strong>
                        </div>
                        <div className="master-field">
                          <span>Licencia comercial</span>
                          <strong>
                            <Link to="/planes-licencias">
                              {selectedRequest.licenseId} ({lic?.userLimit ?? 10} usuarios ·{" "}
                              {lic?.institutionLimit ?? 1} sedes)
                            </Link>
                          </strong>
                        </div>
                        <div className="master-field span-2">
                          <span>Clave de idempotencia de operación</span>
                          <strong>{selectedRequest.idempotencyKey}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === "config" ? (
                  <div className="master-section-grid">
                    <div className="master-section">
                      <h4>A. Identidad y parámetros regionales de la organización</h4>
                      <div className="master-field-grid">
                        <div className="master-field">
                          <span>Razón social / Nombre legal</span>
                          <strong>{selectedRequest.initialConfig.legalName}</strong>
                        </div>
                        <div className="master-field">
                          <span>Nombre comercial o de uso</span>
                          <strong>{selectedRequest.initialConfig.displayName}</strong>
                        </div>
                        <div className="master-field">
                          <span>Identificación tributaria</span>
                          <strong>
                            {selectedRequest.initialConfig.taxId ??
                              "Sin NIT / Identificación canónica"}
                          </strong>
                        </div>
                        <div className="master-field">
                          <span>Tipo de organización</span>
                          <strong>{selectedRequest.initialConfig.organizationType}</strong>
                        </div>
                        <div className="master-field">
                          <span>Ubicación geográfica</span>
                          <strong>
                            {selectedRequest.initialConfig.municipality},{" "}
                            {selectedRequest.initialConfig.department} (
                            {selectedRequest.initialConfig.country})
                          </strong>
                        </div>
                        <div className="master-field">
                          <span>Dirección sede principal</span>
                          <strong>{selectedRequest.initialConfig.address}</strong>
                        </div>
                        <div className="master-field">
                          <span>Contacto institucional</span>
                          <strong>
                            {selectedRequest.initialConfig.contactEmail} ·{" "}
                            {selectedRequest.initialConfig.contactPhone}
                          </strong>
                        </div>
                        <div className="master-field">
                          <span>Zona horaria, idioma y moneda</span>
                          <strong>
                            {selectedRequest.initialConfig.timezone} ·{" "}
                            {selectedRequest.initialConfig.locale} ·{" "}
                            {selectedRequest.initialConfig.currency} (
                            {selectedRequest.initialConfig.dateFormat})
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="master-section">
                      <h4>B. Estructura institucional eclesial autorizada</h4>
                      <p style={{ marginBottom: 10 }}>
                        {selectedRequest.initialConfig.ecclesiasticalStructureNotes}
                      </p>
                      <div className="relation-list">
                        {selectedRequest.initialConfig.authorizedInstitutionIds.length === 0 ? (
                          <div className="relation-card">
                            <div>
                              <strong>Operación centralizada en la organización</strong>
                              <small>
                                No se han vinculado instituciones subordinadas adicionales.
                              </small>
                            </div>
                          </div>
                        ) : (
                          selectedRequest.initialConfig.authorizedInstitutionIds.map((instId) => {
                            const inst = institutions.find((i) => i.id === instId);
                            return (
                              <div key={instId} className="relation-card">
                                <div>
                                  <strong>
                                    {inst?.name ?? instId} ({inst?.institutionType ?? "Institución"}
                                    )
                                  </strong>
                                  <small>
                                    Código: {instId} · {inst?.municipality ?? "Colombia"} · ID
                                    Canónico: {inst?.canonicalId ?? "No registrado"}
                                  </small>
                                </div>
                                <StatusBadge status={inst?.status ?? "Activo"} />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === "modules" ? (
                  <div className="master-section-grid">
                    <div className="master-section">
                      <h4>
                        Módulos contratados y estado de activación (
                        {selectedRequest.requestedModuleIds.length})
                      </h4>
                      <div className="relation-list">
                        {modules
                          .filter(
                            (m) =>
                              m.applicationId === selectedRequest.applicationId ||
                              selectedRequest.requestedModuleIds.includes(m.id),
                          )
                          .map((mod) => {
                            const isRequested = selectedRequest.requestedModuleIds.includes(mod.id);
                            const isActivated = selectedRequest.activatedModuleIds.includes(mod.id);
                            return (
                              <div key={mod.id} className="relation-card">
                                <div>
                                  <strong>
                                    {mod.name} ({mod.code ?? mod.id})
                                  </strong>
                                  <small>
                                    {isRequested
                                      ? `Incluido en licencia ${selectedRequest.licenseId}`
                                      : "No incluido en plan/licencia contratada (permanece deshabilitado)"}
                                    {mod.requiredModuleIds && mod.requiredModuleIds.length > 0
                                      ? ` · Requiere: ${mod.requiredModuleIds.join(", ")}`
                                      : ""}
                                  </small>
                                </div>
                                <StatusBadge
                                  status={
                                    isActivated
                                      ? "Operativo"
                                      : isRequested
                                        ? "Pendiente"
                                        : "Inactivo"
                                  }
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="master-section">
                      <h4>Estado del entorno lógico asignado</h4>
                      {env ? (
                        <div className="master-field-grid">
                          <div className="master-field">
                            <span>Identificador de entorno</span>
                            <strong>{env.id}</strong>
                          </div>
                          <div className="master-field">
                            <span>Estado operativo / disponibilidad</span>
                            <strong>
                              {env.status} · {env.availabilityStatus}
                            </strong>
                          </div>
                          <div className="master-field">
                            <span>Versión de software instalada</span>
                            <strong>
                              v{env.installedProductVersion} (Plan comercial v
                              {con?.planSnapshot?.planVersion ?? 1})
                            </strong>
                          </div>
                          <div className="master-field">
                            <span>Modelo de aislamiento</span>
                            <strong>{env.isolationModel}</strong>
                          </div>
                          <div className="master-field span-2">
                            <span>Política de conservación y exportación</span>
                            <strong>{env.dataRetentionPolicy}</strong>
                          </div>
                        </div>
                      ) : (
                        <p>
                          El entorno lógico se generará al completar la etapa 4 (
                          <code>environment_allocation</code>) del flujo de aprovisionamiento.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {detailTab === "timeline" ? (
                  <div className="master-section">
                    <h4>
                      Historial cronológico de transiciones y ejecuciones (
                      {selectedRequest.history.length})
                    </h4>
                    <div className="relation-list">
                      {selectedRequest.history.map((item) => (
                        <div key={item.id} className="relation-card">
                          <div>
                            <strong>
                              {item.fromStatus} → {item.toStatus} · <code>{item.operationId}</code>
                            </strong>
                            <small>{item.notes}</small>
                            <small>
                              Fecha: {item.timestamp.slice(0, 19).replace("T", " ")} · Responsable:{" "}
                              {item.actor}
                            </small>
                          </div>
                          <StatusBadge
                            status={
                              item.result === "Exitoso"
                                ? "Activo"
                                : item.result === "Fallido"
                                  ? "Fallido"
                                  : "En revisión"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            );
          })()}
        </section>
      ) : null}

      {/* Modal para crear solicitud o editar configuración inicial */}
      {createModalOpen ? (
        <MasterFormModal
          sheetLabel="Ficha de Aprovisionamiento Multi-Tenant"
          entityName={
            editingConfigReq
              ? `Configuración Inicial · ${editingConfigReq.id}`
              : "Nueva Solicitud de Aprovisionamiento"
          }
          recordCode={editingConfigReq ? editingConfigReq.id : reqId}
          operation={editingConfigReq ? "edit" : "create"}
          errorMessage={formError || undefined}
          submitLabel={
            editingConfigReq ? "Guardar configuración inicial" : "Crear solicitud validada"
          }
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleSaveRequestOrConfig}
        >
          <MasterFormSection
            step="A"
            title="Contrato aprobado y organización beneficiaria"
            description="Vincula la solicitud a una contratación comercial vigente con licencia activa."
          >
            <label className="form-field">
              <span>Código de solicitud *</span>
              <input
                value={reqId}
                disabled={Boolean(editingConfigReq)}
                onChange={(e) => setReqId(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Contrato comercial aprobado *</span>
              <select
                value={contractId}
                disabled={Boolean(editingConfigReq)}
                onChange={(e) => populateFromContract(e.target.value)}
              >
                {contracts.map((con) => {
                  const cli = clients.find((c) => c.id === con.clientId);
                  return (
                    <option key={con.id} value={con.id}>
                      {con.id} ({con.status}) — {cli?.name ?? con.clientId}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="form-field">
              <span>Organización beneficiaria *</span>
              <select
                value={orgId}
                disabled={Boolean(editingConfigReq)}
                onChange={(e) => setOrgId(e.target.value)}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.id} — {org.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Producto a aprovisionar *</span>
              <select
                value={appId}
                disabled={Boolean(editingConfigReq)}
                onChange={(e) => setAppId(e.target.value)}
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.id} — {app.name}
                  </option>
                ))}
              </select>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Configuración inicial e identidad de la organización"
            description="Datos legales, ubicación e identidad institucional del tenant."
          >
            <label className="form-field">
              <span>Razón social / Nombre legal *</span>
              <input value={legalName} onChange={(e) => setLegalName(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Nombre de uso / Nombre corto *</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Identificación tributaria (cuando corresponda)</span>
              <input
                value={taxId}
                placeholder="Ej. 860.009.124-1"
                onChange={(e) => setTaxId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Tipo de organización *</span>
              <select value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                {ORGANIZATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>País *</span>
              <input value={country} onChange={(e) => setCountry(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Departamento o región *</span>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Municipio / Ciudad *</span>
              <input
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Dirección institucional *</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Correo de contacto institucional *</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Teléfono de contacto *</span>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Parámetros regionales y estructura institucional eclesial"
            description="Zona horaria, idioma, moneda y entidades eclesiales autorizadas bajo la organización."
          >
            <label className="form-field">
              <span>Zona horaria *</span>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="America/Bogota">America/Bogota (UTC-5)</option>
                <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                <option value="America/Lima">America/Lima (UTC-5)</option>
                <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
              </select>
            </label>
            <label className="form-field">
              <span>Idioma / Configuración regional *</span>
              <select value={locale} onChange={(e) => setLocale(e.target.value)}>
                <option value="es-CO">Español — Colombia (es-CO)</option>
                <option value="es-MX">Español — México (es-MX)</option>
                <option value="es-ES">Español — España (es-ES)</option>
              </select>
            </label>
            <label className="form-field">
              <span>Moneda de operación *</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Formato de fecha *</span>
              <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </label>
            <label className="form-field span-2">
              <span>
                Notas de estructura institucional (relación diócesis, parroquias, comunidades,
                colegios)
              </span>
              <input value={structureNotes} onChange={(e) => setStructureNotes(e.target.value)} />
            </label>
            <div className="form-field span-2">
              <span>
                Instituciones validadas de esta organización para habilitar en el entorno (
                {selectedInstIds.length})
              </span>
              <div className="relation-list" style={{ marginTop: 6 }}>
                {institutions
                  .filter((inst) => inst.organizationId === orgId)
                  .map((inst) => {
                    const checked = selectedInstIds.includes(inst.id);
                    return (
                      <label key={inst.id} className="relation-card" style={{ cursor: "pointer" }}>
                        <div>
                          <strong>
                            {inst.name} ({inst.id})
                          </strong>
                          <small>
                            {inst.institutionType ?? "Institución"} ·{" "}
                            {inst.municipality ?? "Colombia"}
                          </small>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInstitutionSelection(inst.id)}
                        />
                      </label>
                    );
                  })}
              </div>
            </div>
          </MasterFormSection>
        </MasterFormModal>
      ) : null}

      {/* Modal de confirmación de cancelación */}
      {cancelTarget ? (
        <ModalDialog
          title={`Cancelar solicitud ${cancelTarget.id}`}
          description="La solicitud pasará a estado Cancelado sin eliminar su historial de auditoría."
          onClose={() => setCancelTarget(null)}
        >
          <label className="form-field" style={{ marginBottom: 14 }}>
            <span>Motivo de la cancelación *</span>
            <input
              value={cancelReason}
              placeholder="Ej. Reemplazada por nuevo alcance contractual"
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="button-muted" onClick={() => setCancelTarget(null)}>
              Volver
            </button>
            <button type="button" className="button-primary" onClick={handleConfirmCancel}>
              Confirmar cancelación
            </button>
          </div>
        </ModalDialog>
      ) : null}

      {/* Drawer de auditoría rápida */}
      {drawerRequest ? (
        <DetailDrawer
          title={`Trazabilidad · ${drawerRequest.id}`}
          subtitle={drawerRequest.idempotencyKey}
          items={[
            { label: "Estado actual", value: drawerRequest.status },
            { label: "Organización", value: drawerRequest.organizationId, mono: true },
            { label: "Contrato", value: drawerRequest.contractId, mono: true },
            { label: "Licencia", value: drawerRequest.licenseId, mono: true },
            {
              label: "Entorno lógico",
              value: drawerRequest.environmentId ?? "No asignado",
              mono: true,
            },
            {
              label: "Módulos activos",
              value: drawerRequest.activatedModuleIds.join(", ") || "Ninguno activo",
            },
            {
              label: "Reintentos ejecutados",
              value: String(drawerRequest.retryCount),
            },
          ]}
          notice="El aprovisionamiento es idempotente: repetir o reintentar esta solicitud conserva las etapas completadas y nunca duplica entornos ni organizaciones."
          onClose={() => setDrawerRequest(null)}
        />
      ) : null}
    </div>
  );
}
