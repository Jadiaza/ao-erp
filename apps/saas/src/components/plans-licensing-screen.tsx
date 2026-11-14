import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import type { DemoStatus } from "../data/demo";
import {
  BILLING_PERIODS,
  CURRENCIES,
  type CommercialPlan,
  type EntityStatus,
  type License,
} from "../data/saas-domain";
import {
  evaluateOrganizationLicensing,
  resolveModuleDependencies,
  saveCommercialPlan,
  saveLicenseWithEntitlements,
} from "../data/commercial-service";
import { repositories, saasStore, useRepositoryRows } from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  EmptyState,
  FilterToolbar,
  MasterFormModal,
  MasterFormSection,
  StatusBadge,
  SummaryCard,
  TableActionIconButton,
  TableRowActions,
} from "./saas-ui";

type PlansLicensingTab = "plans" | "licenses" | "evaluator";

export function PlansLicensingScreen() {
  const plans = useRepositoryRows(repositories.plans);
  const licenses = useRepositoryRows(repositories.licenses);
  const entitlements = useRepositoryRows(repositories.entitlements);
  const usageLimits = useRepositoryRows(repositories.usageLimits);
  const applications = useRepositoryRows(repositories.applications);
  const modules = useRepositoryRows(repositories.modules);
  const features = useRepositoryRows(repositories.features);
  const organizations = useRepositoryRows(repositories.organizations);
  const institutions = useRepositoryRows(repositories.institutions);
  const subscriptions = useRepositoryRows(repositories.subscriptions);
  const contracts = useRepositoryRows(repositories.contracts);

  const [tab, setTab] = useState<PlansLicensingTab>("plans");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id ?? null);
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(
    licenses[0]?.id ?? null,
  );
  const [evaluatedOrgId, setEvaluatedOrgId] = useState<string>(organizations[0]?.id ?? "ORG-001");

  // Modal de Plan Comercial
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CommercialPlan | null>(null);
  const [planId, setPlanId] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAppId, setPlanAppId] = useState(applications[0]?.id ?? "APP-ERP");
  const [planPrice, setPlanPrice] = useState("290000");
  const [planCurrency, setPlanCurrency] = useState<string>("COP");
  const [planPeriod, setPlanPeriod] = useState<string>("Mensual");
  const [planUserLimit, setPlanUserLimit] = useState("10");
  const [planInstLimit, setPlanInstLimit] = useState("1");
  const [planStorageGb, setPlanStorageGb] = useState("25");
  const [planStatus, setPlanStatus] = useState<DemoStatus>("Activo");
  const [planDetail, setPlanDetail] = useState("");
  const [planConditions, setPlanConditions] = useState("");
  const [planModuleIds, setPlanModuleIds] = useState<string[]>(["MOD-COM", "MOD-SAC"]);
  const [formError, setFormError] = useState("");

  // Modal de Licencia y Entitlements
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [licId, setLicId] = useState("");
  const [licSubId, setLicSubId] = useState(subscriptions[0]?.id ?? "SUB-2026-014");
  const [licOrgId, setLicOrgId] = useState(organizations[0]?.id ?? "ORG-001");
  const [licInstId, setLicInstId] = useState(institutions[0]?.id ?? "INS-014");
  const [licAppId, setLicAppId] = useState(applications[0]?.id ?? "APP-ERP");
  const [licStartsAt, setLicStartsAt] = useState("2026-01-01");
  const [licExpiresAt, setLicExpiresAt] = useState("2026-12-31");
  const [licStatus, setLicStatus] = useState<EntityStatus>("Activo");
  const [licUserLimit, setLicUserLimit] = useState("10");
  const [licInstLimit, setLicInstLimit] = useState("1");
  const [licStorageGb, setLicStorageGb] = useState("25");
  const [licExtraUsers, setLicExtraUsers] = useState("0");
  const [licExceptions, setLicExceptions] = useState("Sin excepciones activas");
  const [licModuleIds, setLicModuleIds] = useState<string[]>(["MOD-COM", "MOD-SAC"]);

  const filteredPlans = plans.filter((plan) => {
    const matchesStatus = statusFilter === "Todos" || plan.status === statusFilter;
    const text = [
      plan.id,
      plan.code,
      plan.name,
      plan.detail,
      plan.coverage,
      plan.billingPeriod,
      plan.conditions,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const filteredLicenses = licenses.filter((lic) => {
    const matchesStatus = statusFilter === "Todos" || lic.status === statusFilter;
    const org = organizations.find((o) => o.id === lic.organizationId);
    const inst = institutions.find((i) => i.id === lic.institutionId);
    const text = [
      lic.id,
      lic.subscriptionId,
      lic.contractId,
      org?.name,
      inst?.name,
      lic.authorizedExceptions,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const selectedPlan =
    plans.find((p) => p.id === selectedPlanId) ?? filteredPlans[0] ?? plans[0] ?? null;
  const selectedLicense =
    licenses.find((l) => l.id === selectedLicenseId) ?? filteredLicenses[0] ?? licenses[0] ?? null;

  const licensingEvaluation = evaluateOrganizationLicensing(evaluatedOrgId);

  const openCreatePlan = () => {
    setEditingPlan(null);
    const nextNum = plans.length + 1;
    setPlanId(`PLAN-0${nextNum}`);
    setPlanCode(`PLN-COM-2026-0${nextNum}`);
    setPlanName("");
    setPlanAppId(applications[0]?.id ?? "APP-ERP");
    setPlanPrice("450000");
    setPlanCurrency("COP");
    setPlanPeriod("Mensual");
    setPlanUserLimit("15");
    setPlanInstLimit("3");
    setPlanStorageGb("50");
    setPlanStatus("Activo");
    setPlanDetail("");
    setPlanConditions("Condiciones comerciales sujetas a suscripción anual o mensual.");
    setPlanModuleIds(["MOD-COM", "MOD-SAC", "MOD-DOC", "MOD-FIN"]);
    setFormError("");
    setPlanModalOpen(true);
  };

  const openEditPlan = (plan: CommercialPlan) => {
    setEditingPlan(plan);
    setPlanId(plan.id);
    setPlanCode(plan.code ?? plan.id);
    setPlanName(plan.name);
    setPlanAppId(plan.applicationId ?? "APP-ERP");
    setPlanPrice(String(plan.price ?? 290000));
    setPlanCurrency(plan.currency ?? "COP");
    setPlanPeriod(plan.billingPeriod ?? "Mensual");
    setPlanUserLimit(String(plan.userLimit));
    setPlanInstLimit(String(plan.institutionLimit));
    setPlanStorageGb(String(plan.storageLimitGb ?? 25));
    setPlanStatus(plan.status);
    setPlanDetail(plan.description ?? plan.detail);
    setPlanConditions(plan.conditions ?? "");
    setPlanModuleIds(plan.moduleIds);
    setFormError("");
    setPlanModalOpen(true);
  };

  const handleSavePlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericPrice = Number(planPrice);
    const numericUsers = Number(planUserLimit);
    const numericInst = Number(planInstLimit);
    const numericStorage = Number(planStorageGb);

    if (
      !planId.trim() ||
      !planName.trim() ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0 ||
      numericUsers < 1
    ) {
      setFormError(
        "Completa el código, el nombre del plan, un precio válido y al menos 1 usuario permitido.",
      );
      return;
    }

    const now = new Date().toISOString();
    const payload: CommercialPlan = {
      id: planId.trim(),
      code: planCode.trim() || planId.trim(),
      name: planName.trim(),
      applicationId: planAppId,
      detail: planDetail.trim() || `Plan comercial ${planName.trim()}`,
      description: planDetail.trim() || `Plan comercial ${planName.trim()}`,
      coverage: `${numericInst} inst. · ${numericUsers} usuarios · ${numericStorage} GB`,
      price: numericPrice,
      currency: planCurrency,
      billingPeriod: planPeriod,
      userLimit: numericUsers,
      institutionLimit: numericInst,
      storageLimitGb: numericStorage,
      moduleIds: planModuleIds.length > 0 ? planModuleIds : ["MOD-COM"],
      conditions: planConditions.trim(),
      status: planStatus,
      version: editingPlan?.version ?? 1,
      createdAt: editingPlan?.createdAt ?? now,
      updatedAt: now,
    };

    const saved = saveCommercialPlan(payload, editingPlan);
    setSelectedPlanId(saved.id);
    setPlanModalOpen(false);
  };

  const openCreateLicense = () => {
    setEditingLicense(null);
    const nextNum = licenses.length + 1;
    const defaultSub = subscriptions[0];
    setLicId(`LIC-2026-0${nextNum}`);
    setLicSubId(defaultSub?.id ?? "SUB-2026-014");
    setLicOrgId(defaultSub?.organizationId ?? organizations[0]?.id ?? "ORG-001");
    setLicInstId(institutions[0]?.id ?? "INS-014");
    setLicAppId("APP-ERP");
    setLicStartsAt("2026-01-01");
    setLicExpiresAt("2026-12-31");
    setLicStatus("Activo");
    setLicUserLimit("15");
    setLicInstLimit("3");
    setLicStorageGb("50");
    setLicExtraUsers("0");
    setLicExceptions("Sin excepciones activas");
    setLicModuleIds(["MOD-COM", "MOD-SAC", "MOD-DOC", "MOD-FIN"]);
    setFormError("");
    setLicenseModalOpen(true);
  };

  const openEditLicense = (lic: License) => {
    setEditingLicense(lic);
    const usrLim = usageLimits.find(
      (lim) => lim.licenseId === lic.id && lim.resource === "usuarios",
    );
    setLicId(lic.id);
    setLicSubId(lic.subscriptionId);
    setLicOrgId(lic.organizationId ?? organizations[0]?.id ?? "ORG-001");
    setLicInstId(lic.institutionId ?? "");
    setLicAppId(lic.applicationId ?? "APP-ERP");
    setLicStartsAt(lic.startsAt ?? "2026-01-01");
    setLicExpiresAt(lic.expiresAt ?? "2026-12-31");
    setLicStatus(lic.status);
    setLicUserLimit(String(lic.userLimit));
    setLicInstLimit(String(lic.institutionLimit ?? 1));
    setLicStorageGb(String(lic.storageLimitGb ?? 25));
    setLicExtraUsers(String(usrLim?.exceptionExtra ?? 0));
    setLicExceptions(lic.authorizedExceptions ?? "Sin excepciones activas");
    setLicModuleIds(lic.moduleIds);
    setFormError("");
    setLicenseModalOpen(true);
  };

  const handleSaveLicense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericUsers = Number(licUserLimit);
    const numericInst = Number(licInstLimit);
    const numericStorage = Number(licStorageGb);
    const numericExtra = Number(licExtraUsers);

    if (!licId.trim() || numericUsers < 1) {
      setFormError("Indica un código de licencia válido y un cupo mínimo de 1 usuario.");
      return;
    }

    const now = new Date().toISOString();
    const sub = subscriptions.find((s) => s.id === licSubId);
    const payload: License = {
      id: licId.trim(),
      subscriptionId: licSubId,
      contractId: sub?.contractId ?? contracts[0]?.id,
      organizationId: licOrgId,
      institutionId: licInstId || undefined,
      applicationId: licAppId,
      startsAt: licStartsAt,
      expiresAt: licExpiresAt,
      status: licStatus,
      userLimit: numericUsers,
      institutionLimit: numericInst,
      storageLimitGb: numericStorage,
      moduleIds: licModuleIds.length > 0 ? licModuleIds : ["MOD-COM"],
      authorizedExceptions: licExceptions.trim() || "Sin excepciones activas",
      createdAt: editingLicense?.createdAt ?? now,
      updatedAt: now,
    };

    const result = saveLicenseWithEntitlements({
      license: payload,
      editingLicense,
      extraUsersException: Number.isNaN(numericExtra) ? 0 : numericExtra,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSelectedLicenseId(result.license.id);
    setLicenseModalOpen(false);
  };

  const toggleModuleInList = (
    modId: string,
    current: string[],
    setter: (next: string[]) => void,
  ) => {
    const nextRaw = current.includes(modId)
      ? current.filter((item) => item !== modId)
      : [...current, modId];
    const { resolvedModuleIds } = resolveModuleDependencies(nextRaw, modules);
    setter(resolvedModuleIds);
  };

  const activeLicensesCount = licenses.filter((l) => l.status === "Activo").length;
  const totalSeats = licenses.reduce((s, l) => s + l.userLimit, 0);

  return (
    <section aria-label="Planes comerciales, licenciamiento y límites de uso">
      <div className="page-header">
        <div>
          <div className="eyebrow">Dominio Comercial · Planes, Licencias y Entitlements</div>
          <h1 className="page-title">Planes y Licenciamiento</h1>
          <p className="page-description">
            Administración de planes comerciales con control de versiones, emisión de licencias,
            entitlements modulares y servicio centralizado de límites de utilización por
            organización.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="button-muted" type="button" onClick={openCreateLicense}>
            <SaasIcon name="shield" size={15} />
            Nueva licencia
          </button>
          <button className="button-primary" type="button" onClick={openCreatePlan}>
            <SaasIcon name="plus" size={15} />
            Nuevo plan comercial
          </button>
        </div>
      </div>

      <div className="summary-grid" aria-label="Indicadores de planes y licencias">
        <SummaryCard
          label="Planes comerciales"
          value={plans.length}
          detail={`${plans.filter((p) => p.status === "Activo").length} activos con versionado inmutable`}
          icon="plans"
        />
        <SummaryCard
          label="Licencias emitidas"
          value={licenses.length}
          detail={`${activeLicensesCount} activas · ${totalSeats} cupos de usuario`}
          icon="shield"
          tone="emerald"
        />
        <SummaryCard
          label="Entitlements activos"
          value={entitlements.filter((e) => e.enabled).length}
          detail="Permisos modulares habilitados por licencia"
          icon="check"
          tone="amber"
        />
        <SummaryCard
          label="Límites monitoreados"
          value={usageLimits.length}
          detail="Usuarios, instituciones, almacenamiento y módulos"
          icon="activity"
        />
      </div>

      <div className="domain-tabs" role="tablist" aria-label="Vistas de planes y licenciamiento">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "plans"}
          className={`domain-tab${tab === "plans" ? " active" : ""}`}
          onClick={() => setTab("plans")}
        >
          <SaasIcon name="plans" size={15} />
          1. Planes comerciales
          <span className="domain-tab-count">{plans.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "licenses"}
          className={`domain-tab${tab === "licenses" ? " active" : ""}`}
          onClick={() => setTab("licenses")}
        >
          <SaasIcon name="shield" size={15} />
          2. Licencias y entitlements
          <span className="domain-tab-count">{licenses.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "evaluator"}
          className={`domain-tab${tab === "evaluator" ? " active" : ""}`}
          onClick={() => setTab("evaluator")}
        >
          <SaasIcon name="activity" size={15} />
          3. Límites de utilización por organización (Servicio centralizado)
        </button>
      </div>

      {tab === "plans" && (
        <>
          <div className="panel table-panel">
            <FilterToolbar
              query={query}
              onQueryChange={setQuery}
              searchPlaceholder="Buscar plan por código, nombre, periodicidad o cobertura..."
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              statusOptions={["Todos", "Activo", "Pendiente", "Suspendido"]}
              onReset={() => saasStore.reset()}
              resetLabel="Restablecer demo"
            />

            {filteredPlans.length === 0 ? (
              <EmptyState
                title="No se encontraron planes comerciales"
                description="Ajusta la búsqueda o crea un nuevo plan comercial."
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
                      <th>Plan / Código</th>
                      <th>Producto asociado</th>
                      <th>Precio y periodicidad</th>
                      <th>Límites contratables</th>
                      <th>Versión</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => {
                      const app = applications.find(
                        (a) => a.id === (plan.applicationId ?? "APP-ERP"),
                      );
                      const isSelected = selectedPlan?.id === plan.id;
                      return (
                        <tr
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          style={{
                            cursor: "pointer",
                            background: isSelected ? "var(--blue-50)" : undefined,
                          }}
                        >
                          <td>
                            <strong className="row-title">{plan.name}</strong>
                            <span className="row-sub">
                              {plan.id} · Código: {plan.code ?? plan.id}
                            </span>
                          </td>
                          <td>
                            <strong className="row-title">{app?.name ?? "A&O ERP"}</strong>
                            <span className="row-sub">
                              {plan.moduleIds.length} módulos incluidos
                            </span>
                          </td>
                          <td>
                            <strong className="row-title">
                              {plan.currency ?? "COP"} {(plan.price ?? 0).toLocaleString("es-CO")}
                            </strong>
                            <span className="row-sub">
                              Periodicidad: {plan.billingPeriod ?? "Mensual"}
                            </span>
                          </td>
                          <td>
                            <strong className="row-title">
                              {plan.userLimit} usuarios · {plan.institutionLimit} inst.
                            </strong>
                            <span className="row-sub">
                              {plan.storageLimitGb ?? 25} GB almacenamiento
                            </span>
                          </td>
                          <td>
                            <span className="code-badge">v{plan.version ?? 1}</span>
                          </td>
                          <td>
                            <StatusBadge status={plan.status} />
                          </td>
                          <td>
                            <TableRowActions>
                              <TableActionIconButton
                                kind="edit"
                                label="Editar"
                                onClick={() => openEditPlan(plan)}
                              />
                              <button
                                className="action-link"
                                type="button"
                                onClick={() =>
                                  repositories.plans.update(plan.id, {
                                    status: plan.status === "Activo" ? "Suspendido" : "Activo",
                                  })
                                }
                              >
                                {plan.status === "Activo" ? "Desactivar" : "Activar"}
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

          {selectedPlan && (
            <article
              className="master-sheet"
              aria-label={`Ficha maestra del plan ${selectedPlan.name}`}
            >
              <header className="master-sheet-header">
                <div className="master-sheet-identity">
                  <div className="master-sheet-badges">
                    <span className="code-badge">{selectedPlan.id}</span>
                    <span className="code-badge">{selectedPlan.code ?? selectedPlan.id}</span>
                    <span className="code-badge">Versión v{selectedPlan.version ?? 1}</span>
                    <StatusBadge status={selectedPlan.status} />
                  </div>
                  <h2 className="master-sheet-title">Plan {selectedPlan.name}</h2>
                  <p className="master-sheet-subtitle">
                    {selectedPlan.description ?? selectedPlan.detail} · Los cambios a este plan
                    generan una nueva versión sin modificar retroactivamente los contratos ya
                    celebrados.
                  </p>
                </div>
                <div className="master-sheet-actions">
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() => openEditPlan(selectedPlan)}
                  >
                    <SaasIcon name="settings" size={15} />
                    Editar condiciones del plan
                  </button>
                </div>
              </header>

              <div className="master-summary-strip">
                <div className="master-summary-item">
                  <span>Tarifa Base</span>
                  <strong>
                    {selectedPlan.currency ?? "COP"}{" "}
                    {(selectedPlan.price ?? 0).toLocaleString("es-CO")}
                  </strong>
                  <small>Facturación {selectedPlan.billingPeriod ?? "Mensual"}</small>
                </div>
                <div className="master-summary-item">
                  <span>Capacidad de Usuarios</span>
                  <strong>{selectedPlan.userLimit} usuarios permitidos</strong>
                  <small>Límite base por suscripción</small>
                </div>
                <div className="master-summary-item">
                  <span>Instituciones y Almacenamiento</span>
                  <strong>
                    {selectedPlan.institutionLimit} inst. · {selectedPlan.storageLimitGb ?? 25} GB
                  </strong>
                  <small>Repositorio documental y sedes</small>
                </div>
                <div className="master-summary-item">
                  <span>Contratos Vinculados</span>
                  <strong>
                    {contracts.filter((c) => c.planId === selectedPlan.id).length} contrato(s)
                  </strong>
                  <small>Protegidos con snapshot contractual</small>
                </div>
              </div>

              <div className="master-sheet-body">
                <div className="master-section-grid">
                  <section className="master-section-card">
                    <div className="master-section-header">
                      <h4>Módulos incluidos en el plan ({selectedPlan.moduleIds.length})</h4>
                    </div>
                    <div className="master-relation-list">
                      {selectedPlan.moduleIds.map((modId) => {
                        const mod = modules.find((m) => m.id === modId);
                        return (
                          <div key={modId} className="master-relation-item">
                            <div>
                              <strong className="row-title">
                                {mod?.name ?? modId} ({mod?.code ?? modId})
                              </strong>
                              <span className="row-sub">
                                {mod?.description || "Módulo incluido en el plan"}
                              </span>
                            </div>
                            <StatusBadge status={mod?.status ?? "Activo"} />
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="master-section-card">
                    <div className="master-section-header">
                      <h4>Condiciones comerciales y observaciones</h4>
                    </div>
                    <div className="master-field-grid">
                      <div className="master-field span-2">
                        <span>Condiciones vigentes</span>
                        <strong>
                          {selectedPlan.conditions ||
                            "Plan sujeto a términos estándar de licenciamiento A&O."}
                        </strong>
                      </div>
                      <div className="master-field">
                        <span>Producto base</span>
                        <strong>
                          {applications.find((a) => a.id === selectedPlan.applicationId)?.name ??
                            "A&O ERP"}
                        </strong>
                      </div>
                      <div className="master-field">
                        <span>Versión de catálogo</span>
                        <strong>v{selectedPlan.version ?? 1}</strong>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </article>
          )}
        </>
      )}

      {tab === "licenses" && (
        <>
          <div className="panel table-panel">
            <FilterToolbar
              query={query}
              onQueryChange={setQuery}
              searchPlaceholder="Buscar licencia por código, organización, institución o excepción..."
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              statusOptions={["Todos", "Activo", "Pendiente", "Suspendido", "Vencido"]}
              onReset={() => saasStore.reset()}
              resetLabel="Restablecer demo"
            />

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Licencia / Suscripción</th>
                    <th>Organización e institución</th>
                    <th>Producto y módulos</th>
                    <th>Límites y excepciones</th>
                    <th>Vigencia</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((lic) => {
                    const org = organizations.find((o) => o.id === lic.organizationId);
                    const inst = institutions.find((i) => i.id === lic.institutionId);
                    const app = applications.find((a) => a.id === lic.applicationId);
                    const isSelected = selectedLicense?.id === lic.id;

                    return (
                      <tr
                        key={lic.id}
                        onClick={() => setSelectedLicenseId(lic.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--blue-50)" : undefined,
                        }}
                      >
                        <td>
                          <strong className="row-title">{lic.id}</strong>
                          <span className="row-sub">Suscripción: {lic.subscriptionId}</span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {org?.name ?? lic.organizationId ?? "Organización"}
                          </strong>
                          <span className="row-sub">
                            Sede: {inst?.name ?? "Cobertura global organizacional"}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">{app?.name ?? "A&O ERP"}</strong>
                          <span className="row-sub">
                            {lic.moduleIds.length} módulos ·{" "}
                            {(lic.featureIds ?? []).length || features.length} funcionalidades
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {lic.userLimit} usr · {lic.institutionLimit ?? 1} inst. ·{" "}
                            {lic.storageLimitGb ?? 25} GB
                          </strong>
                          <span className="row-sub">
                            {lic.authorizedExceptions || "Sin excepciones"}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {lic.startsAt ?? "2026-01-01"} a {lic.expiresAt ?? "2026-12-31"}
                          </strong>
                        </td>
                        <td>
                          <StatusBadge status={lic.status} />
                        </td>
                        <td>
                          <TableRowActions>
                            <TableActionIconButton
                              kind="edit"
                              label="Editar"
                              onClick={() => openEditLicense(lic)}
                            />
                            <button
                              className="action-link"
                              type="button"
                              onClick={() =>
                                repositories.licenses.update(lic.id, {
                                  status: lic.status === "Activo" ? "Suspendido" : "Activo",
                                })
                              }
                            >
                              {lic.status === "Activo" ? "Suspender" : "Reactivar"}
                            </button>
                          </TableRowActions>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedLicense && (
            <article
              className="master-sheet"
              aria-label={`Ficha maestra de licencia ${selectedLicense.id}`}
            >
              <header className="master-sheet-header">
                <div className="master-sheet-identity">
                  <div className="master-sheet-badges">
                    <span className="code-badge">{selectedLicense.id}</span>
                    <span className="code-badge">{selectedLicense.subscriptionId}</span>
                    <StatusBadge status={selectedLicense.status} />
                  </div>
                  <h2 className="master-sheet-title">
                    Licencia {selectedLicense.id} ·{" "}
                    {organizations.find((o) => o.id === selectedLicense.organizationId)?.name ??
                      selectedLicense.organizationId}
                  </h2>
                  <p className="master-sheet-subtitle">
                    Excepciones autorizadas:{" "}
                    <strong>
                      {selectedLicense.authorizedExceptions || "Sin excepciones activas"}
                    </strong>
                  </p>
                </div>
                <div className="master-sheet-actions">
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() => openEditLicense(selectedLicense)}
                  >
                    <SaasIcon name="settings" size={15} />
                    Configurar licencia y excepciones
                  </button>
                </div>
              </header>

              <div className="master-sheet-body">
                <div className="master-section-grid">
                  <section className="master-section-card">
                    <div className="master-section-header">
                      <h4>Entitlements modulares autorizados</h4>
                    </div>
                    <div className="master-relation-list">
                      {selectedLicense.moduleIds.map((modId) => {
                        const mod = modules.find((m) => m.id === modId);
                        const modFeats = features.filter((f) => f.moduleId === modId);
                        return (
                          <div key={modId} className="master-relation-item">
                            <div>
                              <strong className="row-title">
                                {mod?.name ?? modId} ({modId})
                              </strong>
                              <span className="row-sub">
                                Funcionalidades habilitadas:{" "}
                                {modFeats.map((f) => f.code ?? f.id).join(", ")}
                              </span>
                            </div>
                            <StatusBadge status={selectedLicense.status} />
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="master-section-card">
                    <div className="master-section-header">
                      <h4>Límites de utilización de la licencia</h4>
                    </div>
                    <div className="master-relation-list">
                      {usageLimits
                        .filter((lim) => lim.licenseId === selectedLicense.id)
                        .map((lim) => {
                          const effectiveMax = lim.maximum + (lim.exceptionExtra ?? 0);
                          const remaining = Math.max(effectiveMax - lim.used, 0);
                          return (
                            <div key={lim.id} className="master-relation-item">
                              <div>
                                <strong className="row-title">
                                  Recurso: {lim.resource.toUpperCase()}
                                </strong>
                                <span className="row-sub">
                                  Contratado: {lim.maximum} {lim.unit ?? lim.resource}
                                  {lim.exceptionExtra
                                    ? ` (+${lim.exceptionExtra} por excepción)`
                                    : ""}{" "}
                                  · Consumo actual: {lim.used} · Disponible: {remaining}
                                </span>
                              </div>
                              <span className="code-badge">
                                {lim.used} / {effectiveMax}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                </div>
              </div>
            </article>
          )}
        </>
      )}

      {tab === "evaluator" && (
        <article
          className="master-sheet"
          aria-label="Evaluador centralizado de licenciamiento y límites por organización"
        >
          <header className="master-sheet-header">
            <div className="master-sheet-identity">
              <div className="master-sheet-badges">
                <span className="code-badge">{licensingEvaluation.organizationId}</span>
                <StatusBadge status={licensingEvaluation.licenseStatus} />
              </div>
              <h2 className="master-sheet-title">
                Autorización Centralizada y Límites · {licensingEvaluation.organizationName}
              </h2>
              <p className="master-sheet-subtitle">
                Consulta en tiempo real del motor centralizado{" "}
                <code>evaluateOrganizationLicensing()</code> con aislamiento multi-tenant.
              </p>
            </div>
            <div className="master-sheet-actions">
              <label className="form-field" style={{ minWidth: 280 }}>
                <span>Seleccionar organización a evaluar</span>
                <select
                  aria-label="Seleccionar organización para evaluar licenciamiento"
                  value={evaluatedOrgId}
                  onChange={(e) => setEvaluatedOrgId(e.target.value)}
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.id})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          <div className="master-summary-strip">
            {(
              [
                licensingEvaluation.capacities.users,
                licensingEvaluation.capacities.institutions,
                licensingEvaluation.capacities.storageGb,
                licensingEvaluation.capacities.modules,
              ] as const
            ).map((metric) => (
              <div key={metric.resource} className="master-summary-item">
                <span>{metric.resource}</span>
                <strong>
                  {metric.used} / {metric.effectiveMaximum} {metric.unit} (
                  {metric.utilizationPercent}%)
                </strong>
                <small>
                  Contratado: {metric.contracted}
                  {metric.exceptionExtra > 0 ? ` + Excepción: ${metric.exceptionExtra}` : ""} ·
                  Disponible: {metric.remaining} {metric.unit}
                </small>
              </div>
            ))}
          </div>

          <div className="master-sheet-body">
            <div className="master-section-grid">
              <section className="master-section-card">
                <div className="master-section-header">
                  <h4>Productos y módulos autorizados para la organización</h4>
                </div>
                <div className="master-relation-list">
                  {modules.map((mod) => {
                    const isAllowed = licensingEvaluation.enabledModuleIds.includes(mod.id);
                    return (
                      <div key={mod.id} className="master-relation-item">
                        <div>
                          <strong className="row-title">
                            {mod.name} ({mod.code ?? mod.id})
                          </strong>
                          <span className="row-sub">
                            Producto: {mod.applicationId} ·{" "}
                            {isAllowed
                              ? "Autorizado por licencia vigente"
                              : "No contratado en la licencia actual"}
                          </span>
                        </div>
                        <StatusBadge status={isAllowed ? "Activo" : "Suspendido"} />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="master-section-card">
                <div className="master-section-header">
                  <h4>Excepciones autorizadas y trazabilidad contractual</h4>
                </div>
                <div className="master-field-grid">
                  <div className="master-field span-2">
                    <span>Licencias activas de la organización</span>
                    <strong>
                      {licensingEvaluation.activeLicenseIds.join(", ") || "Ninguna licencia activa"}
                    </strong>
                  </div>
                  <div className="master-field span-2">
                    <span>Excepciones autorizadas vigentes</span>
                    <strong>
                      {licensingEvaluation.authorizedExceptions.join(" · ") ||
                        "Sin excepciones adicionales autorizadas"}
                    </strong>
                  </div>
                  <div className="master-field span-2">
                    <span>Vínculo con Contratos y Suscripciones</span>
                    <div>
                      <Link to="/suscripciones" className="action-link">
                        Ir a Contratos y Suscripciones de la organización →
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </article>
      )}

      {planModalOpen && (
        <MasterFormModal
          sheetLabel="Dominio Comercial · Planes Comerciales"
          entityName={editingPlan ? `Plan ${editingPlan.name}` : planName.trim() || "Nuevo plan"}
          recordCode={planId}
          operation={editingPlan ? "edit" : "create"}
          errorMessage={formError}
          onClose={() => setPlanModalOpen(false)}
          onSubmit={handleSavePlan}
        >
          <MasterFormSection
            step="A"
            title="Información general del plan"
            description="Nombre, código comercial, producto al que pertenece y estado en la oferta."
          >
            <label className="form-field">
              <span>ID del plan</span>
              <input
                value={planId}
                disabled={Boolean(editingPlan)}
                onChange={(e) => setPlanId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Código comercial</span>
              <input
                value={planCode}
                placeholder="Ej. PLN-PAR-2026"
                onChange={(e) => setPlanCode(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Nombre del plan *</span>
              <input
                value={planName}
                placeholder="Ej. Parroquial / Congregacional"
                onChange={(e) => setPlanName(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Producto al que pertenece</span>
              <select value={planAppId} onChange={(e) => setPlanAppId(e.target.value)}>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field span-2">
              <span>Descripción comercial</span>
              <input
                value={planDetail}
                placeholder="Resumen de cobertura y propósito del plan..."
                onChange={(e) => setPlanDetail(e.target.value)}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Precio, moneda y periodicidad"
            description="Condiciones tarifarias para nuevas contrataciones (los contratos previos conservan su snapshot)."
          >
            <label className="form-field">
              <span>Precio base *</span>
              <input
                type="number"
                min={0}
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Moneda</span>
              <select value={planCurrency} onChange={(e) => setPlanCurrency(e.target.value)}>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Periodicidad de facturación</span>
              <select value={planPeriod} onChange={(e) => setPlanPeriod(e.target.value)}>
                {BILLING_PERIODS.map((per) => (
                  <option key={per} value={per}>
                    {per}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Estado comercial</span>
              <select
                value={planStatus}
                onChange={(e) => setPlanStatus(e.target.value as DemoStatus)}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Límites de uso e infraestructura"
            description="Capacidades incluidas de usuarios, instituciones y almacenamiento documental."
          >
            <label className="form-field">
              <span>Usuarios permitidos *</span>
              <input
                type="number"
                min={1}
                value={planUserLimit}
                onChange={(e) => setPlanUserLimit(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Instituciones permitidas *</span>
              <input
                type="number"
                min={1}
                value={planInstLimit}
                onChange={(e) => setPlanInstLimit(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Almacenamiento contratado (GB)</span>
              <input
                type="number"
                min={1}
                value={planStorageGb}
                onChange={(e) => setPlanStorageGb(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Condiciones y observaciones</span>
              <input value={planConditions} onChange={(e) => setPlanConditions(e.target.value)} />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="D"
            title="Módulos incluidos"
            description="Las dependencias entre módulos se incluyen automáticamente al seleccionar un módulo."
          >
            <div className="form-field span-2">
              <span>Seleccionar módulos incluidos en el plan</span>
              <div className="master-relation-list">
                {modules.map((mod) => {
                  const checked = planModuleIds.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className="master-relation-item"
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <strong className="row-title">
                          {mod.name} ({mod.code ?? mod.id})
                        </strong>
                        <span className="row-sub">{mod.description || mod.category}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleModuleInList(mod.id, planModuleIds, setPlanModuleIds)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {licenseModalOpen && (
        <MasterFormModal
          sheetLabel="Dominio Comercial · Licencias y Entitlements"
          entityName={editingLicense ? `Licencia ${editingLicense.id}` : "Nueva licencia"}
          recordCode={licId}
          operation={editingLicense ? "edit" : "create"}
          errorMessage={formError}
          onClose={() => setLicenseModalOpen(false)}
          onSubmit={handleSaveLicense}
        >
          <MasterFormSection
            step="A"
            title="Vinculación organizacional y contractual"
            description="Relación con la suscripción, organización beneficiaria, sede e inicio/vencimiento."
          >
            <label className="form-field">
              <span>Código de licencia</span>
              <input
                value={licId}
                disabled={Boolean(editingLicense)}
                onChange={(e) => setLicId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Suscripción asociada</span>
              <select value={licSubId} onChange={(e) => setLicSubId(e.target.value)}>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.id} (Contrato {sub.contractId})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Organización titular</span>
              <select value={licOrgId} onChange={(e) => setLicOrgId(e.target.value)}>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Institución asignada (opcional)</span>
              <select value={licInstId} onChange={(e) => setLicInstId(e.target.value)}>
                <option value="">Cobertura organizacional completa</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Producto habilitado</span>
              <select value={licAppId} onChange={(e) => setLicAppId(e.target.value)}>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Estado de la licencia</span>
              <select
                value={licStatus}
                onChange={(e) => setLicStatus(e.target.value as EntityStatus)}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Vencido">Vencido</option>
              </select>
            </label>
            <label className="form-field">
              <span>Fecha de inicio</span>
              <input
                type="date"
                value={licStartsAt}
                onChange={(e) => setLicStartsAt(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Fecha de vencimiento</span>
              <input
                type="date"
                value={licExpiresAt}
                onChange={(e) => setLicExpiresAt(e.target.value)}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Límites contratados y excepciones autorizadas"
            description="Capacidades máximas de usuarios, instituciones, almacenamiento y cupos por excepción."
          >
            <label className="form-field">
              <span>Usuarios máximos *</span>
              <input
                type="number"
                min={1}
                value={licUserLimit}
                onChange={(e) => setLicUserLimit(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Instituciones máximas *</span>
              <input
                type="number"
                min={1}
                value={licInstLimit}
                onChange={(e) => setLicInstLimit(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Almacenamiento contratado (GB)</span>
              <input
                type="number"
                min={1}
                value={licStorageGb}
                onChange={(e) => setLicStorageGb(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Cupos de usuarios extra por excepción</span>
              <input
                type="number"
                min={0}
                value={licExtraUsers}
                onChange={(e) => setLicExtraUsers(e.target.value)}
              />
            </label>
            <label className="form-field span-2">
              <span>Justificación de excepciones autorizadas</span>
              <input
                value={licExceptions}
                placeholder="Ej. +5 usuarios temporales autorizados para misión parroquial"
                onChange={(e) => setLicExceptions(e.target.value)}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Módulos y entitlements habilitados"
            description="Selecciona los módulos autorizados para esta licencia."
          >
            <div className="form-field span-2">
              <span>Módulos habilitados</span>
              <div className="master-relation-list">
                {modules.map((mod) => {
                  const checked = licModuleIds.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className="master-relation-item"
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <strong className="row-title">
                          {mod.name} ({mod.code ?? mod.id})
                        </strong>
                        <span className="row-sub">{mod.description || mod.category}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleModuleInList(mod.id, licModuleIds, setLicModuleIds)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </MasterFormSection>
        </MasterFormModal>
      )}
    </section>
  );
}
