import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  BILLING_PERIODS,
  COMMERCIAL_STATUSES,
  CURRENCIES,
  type Contract,
  type EntityStatus,
  type Subscription,
} from "../data/saas-domain";
import { saveContractWithRelations, transitionContractStatus } from "../data/commercial-service";
import {
  getModuleRepository,
  repositories,
  saasStore,
  useRepositoryRows,
} from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
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

type CommercialTab = "contracts" | "subscriptions";

export function ContractsSubscriptionsScreen() {
  const contracts = useRepositoryRows(repositories.contracts);
  const subscriptions = useRepositoryRows(repositories.subscriptions);
  const clients = useRepositoryRows(repositories.clients);
  const organizations = useRepositoryRows(repositories.organizations);
  const applications = useRepositoryRows(repositories.applications);
  const plans = useRepositoryRows(repositories.plans);
  const licenses = useRepositoryRows(repositories.licenses);

  const [tab, setTab] = useState<CommercialTab>("contracts");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    contracts[0]?.id ?? null,
  );

  // Modal de Contrato + Suscripción
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [conId, setConId] = useState("");
  const [subId, setSubId] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "CLI-001");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "ORG-001");
  const [appId, setAppId] = useState(applications[0]?.id ?? "APP-ERP");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "PLAN-01");
  const [contractedAt, setContractedAt] = useState("2026-11-09");
  const [startsAt, setStartsAt] = useState("2026-11-09");
  const [endsAt, setEndsAt] = useState("2027-11-09");
  const [renewalAt, setRenewalAt] = useState("2027-11-09");
  const [billingPeriod, setBillingPeriod] = useState<string>("Mensual");
  const [currency, setCurrency] = useState<string>("COP");
  const [contractedAmount, setContractedAmount] = useState("290000");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [contractStatus, setContractStatus] = useState<EntityStatus>("Activo");
  const [subStatus, setSubStatus] = useState<EntityStatus>("Activo");
  const [autoRenew, setAutoRenew] = useState(true);
  const [specialConditions, setSpecialConditions] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [allowNovation, setAllowNovation] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal de confirmación para acciones sensibles de ciclo comercial
  const [lifecycleTarget, setLifecycleTarget] = useState<{
    contract: Contract;
    nextStatus: EntityStatus;
  } | null>(null);
  const [lifecycleReason, setLifecycleReason] = useState("");

  const syncEcosystemSubscriptions = () => {
    const repo = getModuleRepository("suscripciones");
    repo.replace(
      repositories.subscriptions.list().map((sub) => {
        const client = repositories.clients.getById(sub.clientId);
        const org = repositories.organizations.getById(sub.organizationId ?? "");
        return {
          id: sub.id,
          name: org?.name ?? client?.name ?? sub.id,
          detail: `Contrato ${sub.contractId} · Renovación ${sub.renewalAt}`,
          context: `Cliente ${client?.name ?? sub.clientId}`,
          owner: "Gobierno Comercial",
          status:
            sub.status === "Activo"
              ? "Activo"
              : sub.status === "Suspendido"
                ? "Suspendido"
                : "Pendiente",
        };
      }),
    );
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesStatus = statusFilter === "Todos" || contract.status === statusFilter;
    const client = clients.find((c) => c.id === contract.clientId);
    const org = organizations.find((o) => o.id === contract.organizationId);
    const plan = plans.find((p) => p.id === contract.planId);
    const text = [
      contract.id,
      client?.name,
      org?.name,
      plan?.name,
      contract.planSnapshot?.planName,
      contract.specialConditions,
      contract.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus = statusFilter === "Todos" || sub.status === statusFilter;
    const client = clients.find((c) => c.id === sub.clientId);
    const org = organizations.find((o) => o.id === sub.organizationId);
    const text = [sub.id, sub.contractId, client?.name, org?.name, sub.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const selectedContract =
    contracts.find((c) => c.id === selectedContractId) ??
    filteredContracts[0] ??
    contracts[0] ??
    null;

  const openCreateContract = () => {
    setEditingContract(null);
    const nextNum = contracts.length + 25;
    const defaultPlan = plans[0];
    setConId(`CON-SUB-2026-0${nextNum}`);
    setSubId(`SUB-2026-0${nextNum}`);
    setClientId(clients[0]?.id ?? "CLI-001");
    setOrgId(organizations[0]?.id ?? "ORG-001");
    setAppId(defaultPlan?.applicationId ?? "APP-ERP");
    setPlanId(defaultPlan?.id ?? "PLAN-01");
    setContractedAt("2026-11-09");
    setStartsAt("2026-11-09");
    setEndsAt("2027-11-09");
    setRenewalAt("2027-11-09");
    setBillingPeriod(defaultPlan?.billingPeriod ?? "Mensual");
    setCurrency(defaultPlan?.currency ?? "COP");
    setContractedAmount(String(defaultPlan?.price ?? 290000));
    setDiscountAmount("0");
    setContractStatus("Activo");
    setSubStatus("Activo");
    setAutoRenew(true);
    setSpecialConditions(
      "Condiciones acordadas para licenciamiento institucional y soporte técnico.",
    );
    setChangeSummary("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditContract = (contract: Contract) => {
    setEditingContract(contract);
    const linkedSub = subscriptions.find((s) => s.contractId === contract.id);
    setConId(contract.id);
    setSubId(linkedSub?.id ?? `SUB-${contract.id.replace("CON-", "")}`);
    setClientId(contract.clientId);
    setOrgId(contract.organizationId ?? organizations[0]?.id ?? "ORG-001");
    setAppId(contract.applicationId ?? "APP-ERP");
    setPlanId(contract.planId);
    setContractedAt(contract.contractedAt ?? contract.startsAt);
    setStartsAt(contract.startsAt);
    setEndsAt(contract.endsAt);
    setRenewalAt(linkedSub?.renewalAt ?? contract.endsAt);
    setBillingPeriod(contract.billingPeriod ?? "Mensual");
    setCurrency(contract.currency ?? "COP");
    setContractedAmount(
      String(contract.contractedAmount ?? contract.planSnapshot?.price ?? 290000),
    );
    setDiscountAmount(String(contract.discountAmount ?? 0));
    setContractStatus(contract.status);
    setSubStatus(linkedSub?.status ?? contract.status);
    setAutoRenew(contract.autoRenew ?? true);
    setSpecialConditions(contract.specialConditions ?? "");
    setChangeSummary("");
    setFormError("");
    setModalOpen(true);
  };

  const handlePlanChange = (nextPlanId: string) => {
    setPlanId(nextPlanId);
    const chosen = plans.find((p) => p.id === nextPlanId);
    if (chosen && !editingContract) {
      setAppId(chosen.applicationId ?? "APP-ERP");
      setBillingPeriod(chosen.billingPeriod ?? "Mensual");
      setCurrency(chosen.currency ?? "COP");
      setContractedAmount(String(chosen.price ?? 290000));
    }
  };

  const handleSaveContract = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(contractedAmount);
    const numericDiscount = Number(discountAmount);

    if (!conId.trim() || !startsAt || !endsAt || Number.isNaN(numericAmount)) {
      setFormError(
        "Completa el código del contrato, las fechas de inicio/vencimiento y el valor contratado.",
      );
      return;
    }

    const now = new Date().toISOString();
    const contractPayload: Contract = {
      id: conId.trim(),
      clientId,
      organizationId: orgId,
      applicationId: appId,
      planId,
      status: contractStatus,
      contractedAt: contractedAt || startsAt,
      startsAt,
      endsAt,
      billingPeriod,
      contractedAmount: numericAmount,
      discountAmount: Number.isNaN(numericDiscount) ? 0 : numericDiscount,
      currency,
      specialConditions: specialConditions.trim(),
      autoRenew,
      planSnapshot: editingContract?.planSnapshot,
      modificationHistory: editingContract?.modificationHistory,
      createdAt: editingContract?.createdAt ?? now,
      updatedAt: now,
    };

    const result = saveContractWithRelations({
      contract: contractPayload,
      editingContract,
      allowCommercialNovation: allowNovation,
      preserveExistingSnapshot: !allowNovation,
      author: "Dirección Comercial",
      changeSummary: changeSummary.trim() || undefined,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    // Sincronizar o crear la suscripción asociada al período de servicio
    const existingSub = subscriptions.find((s) => s.contractId === result.contract.id);
    const subPayload: Subscription = {
      id: existingSub?.id ?? (subId.trim() || `SUB-${result.contract.id.replace("CON-", "")}`),
      contractId: result.contract.id,
      clientId: result.contract.clientId,
      organizationId: result.contract.organizationId,
      applicationIds: appId === "APP-DIO" ? ["APP-ERP", "APP-DIO"] : [appId],
      status: subStatus,
      startsAt: result.contract.startsAt,
      endsAt: result.contract.endsAt,
      renewalAt: renewalAt || result.contract.endsAt,
      billingPeriod: result.contract.billingPeriod,
      autoRenew: result.contract.autoRenew,
      notes: `Período operativo vinculado al contrato ${result.contract.id}`,
      createdAt: existingSub?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingSub) {
      repositories.subscriptions.update(existingSub.id, subPayload);
    } else {
      repositories.subscriptions.create(subPayload);
    }

    syncEcosystemSubscriptions();
    setSelectedContractId(result.contract.id);
    setModalOpen(false);
  };

  const confirmLifecycleTransition = () => {
    if (!lifecycleTarget) return;
    const reason =
      lifecycleReason.trim() || `Transición autorizada al estado ${lifecycleTarget.nextStatus}.`;
    transitionContractStatus(lifecycleTarget.contract.id, lifecycleTarget.nextStatus, reason);
    const linkedSub = subscriptions.find((s) => s.contractId === lifecycleTarget.contract.id);
    if (linkedSub) {
      repositories.subscriptions.update(linkedSub.id, {
        status: lifecycleTarget.nextStatus,
      });
    }
    syncEcosystemSubscriptions();
    setLifecycleTarget(null);
    setLifecycleReason("");
  };

  const activeContractsCount = contracts.filter((c) => c.status === "Activo").length;
  const activeSubsCount = subscriptions.filter((s) => s.status === "Activo").length;
  const totalContractedValue = contracts
    .filter((c) => c.status === "Activo")
    .reduce((sum, c) => sum + (c.contractedAmount ?? c.planSnapshot?.price ?? 0), 0);

  const selectedSub = selectedContract
    ? subscriptions.find((s) => s.contractId === selectedContract.id)
    : undefined;
  const selectedClient = selectedContract
    ? clients.find((c) => c.id === selectedContract.clientId)
    : undefined;
  const selectedOrg = selectedContract
    ? organizations.find((o) => o.id === selectedContract.organizationId)
    : undefined;
  const catalogPlan = selectedContract
    ? plans.find((p) => p.id === selectedContract.planId)
    : undefined;

  return (
    <section aria-label="Contratos comerciales y suscripciones">
      <div className="page-header">
        <div>
          <div className="eyebrow">Dominio Comercial · Contratos y Suscripciones</div>
          <h1 className="page-title">Contratos y Suscripciones</h1>
          <p className="page-description">
            El Contrato formaliza las condiciones comerciales e inmutabiliza el snapshot del plan
            contratado; la Suscripción controla el período operativo de prestación del servicio y su
            renovación.
          </p>
        </div>
        <button className="button-primary" type="button" onClick={openCreateContract}>
          <SaasIcon name="plus" size={16} />
          Nuevo contrato y suscripción
        </button>
      </div>

      <div className="summary-grid" aria-label="Indicadores de contratos y suscripciones">
        <SummaryCard
          label="Contratos celebrados"
          value={contracts.length}
          detail={`${activeContractsCount} vigentes con condiciones congeladas`}
          icon="file-text"
        />
        <SummaryCard
          label="Suscripciones operativas"
          value={subscriptions.length}
          detail={`${activeSubsCount} períodos activos de prestación de servicio`}
          icon="subscriptions"
          tone="emerald"
        />
        <SummaryCard
          label="Valor mensual contratado"
          value={`COP ${totalContractedValue.toLocaleString("es-CO")}`}
          detail="Suma de contratos activos (sin facturas pendientes)"
          icon="billing"
          tone="amber"
        />
        <SummaryCard
          label="Renovación automática"
          value={contracts.filter((c) => c.autoRenew !== false).length}
          detail="Contratos configurados con prórroga automática"
          icon="check"
        />
      </div>

      <div className="domain-tabs" role="tablist" aria-label="Vistas de contratos y suscripciones">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "contracts"}
          className={`domain-tab${tab === "contracts" ? " active" : ""}`}
          onClick={() => setTab("contracts")}
        >
          <SaasIcon name="file-text" size={15} />
          1. Contratos comerciales (Condiciones acordadas)
          <span className="domain-tab-count">{contracts.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "subscriptions"}
          className={`domain-tab${tab === "subscriptions" ? " active" : ""}`}
          onClick={() => setTab("subscriptions")}
        >
          <SaasIcon name="subscriptions" size={15} />
          2. Suscripciones (Períodos de servicio)
          <span className="domain-tab-count">{subscriptions.length}</span>
        </button>
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por código de contrato, suscripción, cliente, organización o plan..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", ...COMMERCIAL_STATUSES]}
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer demo"
        />

        {tab === "contracts" ? (
          filteredContracts.length === 0 ? (
            <EmptyState
              title="No se encontraron contratos comerciales"
              description="Limpia los filtros o celebra un nuevo contrato comercial."
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
                    <th>Contrato / Suscripción</th>
                    <th>Cliente contratante y organización</th>
                    <th>Producto y plan (Snapshot)</th>
                    <th>Valor contratado y periodicidad</th>
                    <th>Vigencia</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => {
                    const client = clients.find((c) => c.id === contract.clientId);
                    const org = organizations.find((o) => o.id === contract.organizationId);
                    const sub = subscriptions.find((s) => s.contractId === contract.id);
                    const snap = contract.planSnapshot;
                    const isSelected = selectedContract?.id === contract.id;

                    return (
                      <tr
                        key={contract.id}
                        onClick={() => setSelectedContractId(contract.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--blue-50)" : undefined,
                        }}
                      >
                        <td>
                          <strong className="row-title">{contract.id}</strong>
                          <span className="row-sub">Suscripción: {sub?.id ?? "Por emitir"}</span>
                        </td>
                        <td>
                          <strong className="row-title">{client?.name ?? contract.clientId}</strong>
                          <span className="row-sub">
                            Beneficiaria: {org?.name ?? contract.organizationId ?? "Global"}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            Plan {snap?.planName ?? contract.planId} (v
                            {snap?.planVersion ?? 1})
                          </strong>
                          <span className="row-sub">
                            Producto: {contract.applicationId ?? "APP-ERP"} ·{" "}
                            {snap?.userLimit ?? 10} usr
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {contract.currency ?? "COP"}{" "}
                            {(contract.contractedAmount ?? snap?.price ?? 0).toLocaleString(
                              "es-CO",
                            )}
                          </strong>
                          <span className="row-sub">
                            {contract.billingPeriod ?? "Mensual"}
                            {contract.discountAmount
                              ? ` · Desc. $${contract.discountAmount.toLocaleString("es-CO")}`
                              : ""}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {contract.startsAt} a {contract.endsAt}
                          </strong>
                          <span className="row-sub">
                            {contract.autoRenew !== false
                              ? "Renovación automática"
                              : "Renovación manual"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={contract.status} />
                        </td>
                        <td>
                          <TableRowActions>
                            <TableActionIconButton
                              kind="view"
                              label="Ver ficha"
                              onClick={() => setSelectedContractId(contract.id)}
                            />
                            <TableActionIconButton
                              kind="edit"
                              label="Editar"
                              onClick={() => openEditContract(contract)}
                            />
                            {contract.status !== "Suspendido" && (
                              <button
                                className="action-link danger"
                                type="button"
                                onClick={() =>
                                  setLifecycleTarget({
                                    contract,
                                    nextStatus: "Suspendido",
                                  })
                                }
                              >
                                Suspender
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
          )
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Suscripción</th>
                  <th>Contrato origen</th>
                  <th>Cliente y organización</th>
                  <th>Productos habilitados</th>
                  <th>Período y próxima renovación</th>
                  <th>Estado de suscripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => {
                  const client = clients.find((c) => c.id === sub.clientId);
                  const org = organizations.find((o) => o.id === sub.organizationId);
                  const parentContract = contracts.find((c) => c.id === sub.contractId);

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedContractId(sub.contractId)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <strong className="row-title">{sub.id}</strong>
                        <span className="row-sub">
                          {sub.billingPeriod ?? "Mensual"} ·{" "}
                          {sub.autoRenew !== false ? "Auto-renovable" : "Fija"}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{sub.contractId}</strong>
                        <span className="row-sub">
                          Estado contrato: {parentContract?.status ?? "Activo"}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{client?.name ?? sub.clientId}</strong>
                        <span className="row-sub">
                          Organización: {org?.name ?? sub.organizationId ?? "N/A"}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{sub.applicationIds.join(", ")}</strong>
                        <span className="row-sub">
                          {licenses.filter((l) => l.subscriptionId === sub.id).length} licencia(s)
                          emitida(s)
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">Renovación: {sub.renewalAt}</strong>
                        <span className="row-sub">
                          Inicio: {sub.startsAt ?? "2026-01-01"} · Fin: {sub.endsAt ?? "2026-12-31"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>
                        <TableRowActions>
                          {parentContract && (
                            <TableActionIconButton
                              kind="configure"
                              label="Configurar contrato"
                              onClick={() => openEditContract(parentContract)}
                            />
                          )}
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

      {selectedContract && (
        <article
          className="master-sheet"
          aria-label={`Ficha maestra del contrato ${selectedContract.id}`}
        >
          <header className="master-sheet-header">
            <div className="master-sheet-identity">
              <div className="master-sheet-badges">
                <span className="code-badge">{selectedContract.id}</span>
                {selectedSub && <span className="code-badge">{selectedSub.id}</span>}
                <StatusBadge status={selectedContract.status} />
              </div>
              <h2 className="master-sheet-title">
                Contrato {selectedContract.id} · {selectedClient?.name ?? selectedContract.clientId}
              </h2>
              <p className="master-sheet-subtitle">
                Organización beneficiaria:{" "}
                <strong>{selectedOrg?.name ?? selectedContract.organizationId}</strong> · Fecha de
                contratación:{" "}
                <strong>{selectedContract.contractedAt ?? selectedContract.startsAt}</strong> · Los
                contratos no se eliminan para preservar la trazabilidad comercial.
              </p>
            </div>
            <div className="master-sheet-actions">
              {selectedContract.status !== "Activo" && (
                <button
                  className="button-muted"
                  type="button"
                  onClick={() =>
                    setLifecycleTarget({
                      contract: selectedContract,
                      nextStatus: "Activo",
                    })
                  }
                >
                  Activar contrato
                </button>
              )}
              {selectedContract.status !== "Terminado" && (
                <button
                  className="button-muted"
                  type="button"
                  onClick={() =>
                    setLifecycleTarget({
                      contract: selectedContract,
                      nextStatus: "Terminado",
                    })
                  }
                >
                  Terminar contrato
                </button>
              )}
              <button
                className="button-primary"
                type="button"
                onClick={() => openEditContract(selectedContract)}
              >
                <SaasIcon name="settings" size={15} />
                Editar contrato y suscripción
              </button>
            </div>
          </header>

          <div className="master-summary-strip">
            <div className="master-summary-item">
              <span>Condiciones Contratadas (Snapshot)</span>
              <strong>
                Plan {selectedContract.planSnapshot?.planName ?? catalogPlan?.name} (v
                {selectedContract.planSnapshot?.planVersion ?? 1})
              </strong>
              <small>
                Inmutable ante cambios futuros del catálogo (Actual: v{catalogPlan?.version ?? 1})
              </small>
            </div>
            <div className="master-summary-item">
              <span>Valor Acordado y Descuentos</span>
              <strong>
                {selectedContract.currency ?? "COP"}{" "}
                {(
                  selectedContract.contractedAmount ??
                  selectedContract.planSnapshot?.price ??
                  0
                ).toLocaleString("es-CO")}
              </strong>
              <small>
                Periodicidad {selectedContract.billingPeriod ?? "Mensual"} · Desc.:{" "}
                {(selectedContract.discountAmount ?? 0).toLocaleString("es-CO")}
              </small>
            </div>
            <div className="master-summary-item">
              <span>Período de Suscripción</span>
              <strong>
                {selectedContract.startsAt} → {selectedContract.endsAt}
              </strong>
              <small>
                Suscripción {selectedSub?.id ?? "N/A"} ({selectedSub?.status ?? "Activo"})
              </small>
            </div>
            <div className="master-summary-item">
              <span>Capacidades Congeladas</span>
              <strong>
                {selectedContract.planSnapshot?.userLimit ?? 10} usr ·{" "}
                {selectedContract.planSnapshot?.institutionLimit ?? 1} inst.
              </strong>
              <small>{selectedContract.planSnapshot?.storageLimitGb ?? 25} GB almacenamiento</small>
            </div>
          </div>

          <div className="master-sheet-body">
            <div className="master-section-grid">
              <section className="master-section-card">
                <div className="master-section-header">
                  <h4>Detalles contractuales y suscripción vinculada</h4>
                </div>
                <div className="master-field-grid">
                  <div className="master-field">
                    <span>Cliente contratante</span>
                    <strong>
                      <Link to="/clientes">
                        {selectedClient?.name ?? selectedContract.clientId}
                      </Link>
                    </strong>
                  </div>
                  <div className="master-field">
                    <span>Organización beneficiaria</span>
                    <strong>
                      <Link to="/organizaciones">
                        {selectedOrg?.name ?? selectedContract.organizationId}
                      </Link>
                    </strong>
                  </div>
                  <div className="master-field">
                    <span>Renovación automática</span>
                    <strong>
                      {selectedContract.autoRenew !== false ? "Habilitada" : "Deshabilitada"}
                    </strong>
                  </div>
                  <div className="master-field">
                    <span>Próxima renovación de suscripción</span>
                    <strong>{selectedSub?.renewalAt ?? selectedContract.endsAt}</strong>
                  </div>
                  <div className="master-field span-2">
                    <span>Condiciones particulares acordadas</span>
                    <strong>
                      {selectedContract.specialConditions ||
                        "Términos generales de servicio A&O SaaS."}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="master-section-card">
                <div className="master-section-header">
                  <h4>
                    Historial de modificaciones contractuales (
                    {(selectedContract.modificationHistory ?? []).length})
                  </h4>
                </div>
                <div className="master-relation-list">
                  {(selectedContract.modificationHistory ?? []).map((entry, idx) => (
                    <div key={`${entry.date}-${idx}`} className="master-relation-item">
                      <div>
                        <strong className="row-title">
                          {entry.action} · {entry.date}
                        </strong>
                        <span className="row-sub">{entry.summary}</span>
                        <span className="row-sub">Responsable: {entry.author}</span>
                      </div>
                      <span className="code-badge">Auditado</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </article>
      )}

      {modalOpen && (
        <MasterFormModal
          sheetLabel="Dominio Comercial · Contratos y Suscripciones"
          entityName={
            editingContract
              ? `Contrato ${editingContract.id}`
              : "Celebrar nuevo contrato y suscripción"
          }
          recordCode={conId}
          operation={editingContract ? "edit" : "create"}
          errorMessage={formError}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSaveContract}
        >
          <MasterFormSection
            step="A"
            title="Partes contratantes y producto"
            description="Cliente que suscribe el acuerdo, organización beneficiaria y producto/plan seleccionado."
          >
            <label className="form-field">
              <span>Código del contrato</span>
              <input
                value={conId}
                disabled={Boolean(editingContract)}
                onChange={(e) => setConId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Código de suscripción operativa</span>
              <input
                value={subId}
                disabled={Boolean(editingContract)}
                onChange={(e) => setSubId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Cliente contratante *</span>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Organización beneficiaria *</span>
              <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Producto contratado</span>
              <select value={appId} onChange={(e) => setAppId(e.target.value)}>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Plan comercial seleccionado</span>
              <select value={planId} onChange={(e) => handlePlanChange(e.target.value)}>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (v{plan.version ?? 1} · {plan.currency ?? "COP"}{" "}
                    {(plan.price ?? 0).toLocaleString("es-CO")})
                  </option>
                ))}
              </select>
              <small>Al guardar se conserva una copia inmutable de las condiciones del plan.</small>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Vigencia, fechas y estados del ciclo comercial"
            description="Fechas de contratación, inicio, vencimiento y estados independientes de contrato y suscripción."
          >
            <label className="form-field">
              <span>Fecha de contratación</span>
              <input
                type="date"
                value={contractedAt}
                onChange={(e) => setContractedAt(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Fecha de inicio *</span>
              <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </label>
            <label className="form-field">
              <span>Fecha de vencimiento *</span>
              <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </label>
            <label className="form-field">
              <span>Fecha de renovación de suscripción</span>
              <input type="date" value={renewalAt} onChange={(e) => setRenewalAt(e.target.value)} />
            </label>
            <label className="form-field">
              <span>Estado del contrato</span>
              <select
                value={contractStatus}
                onChange={(e) => setContractStatus(e.target.value as EntityStatus)}
              >
                {COMMERCIAL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Estado de la suscripción</span>
              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value as EntityStatus)}
              >
                {COMMERCIAL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Condiciones económicas y renovación"
            description="Periodicidad, valor pactado, descuentos, condiciones particulares y registro de auditoría."
          >
            <label className="form-field">
              <span>Periodicidad</span>
              <select value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)}>
                {BILLING_PERIODS.map((per) => (
                  <option key={per} value={per}>
                    {per}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Moneda</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Valor contratado *</span>
              <input
                type="number"
                min={0}
                value={contractedAmount}
                onChange={(e) => setContractedAmount(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Descuentos otorgados</span>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Renovación automática</span>
              <select
                value={autoRenew ? "si" : "no"}
                onChange={(e) => setAutoRenew(e.target.value === "si")}
              >
                <option value="si">Sí · Prórroga automática al vencimiento</option>
                <option value="no">No · Requiere renovación expresa</option>
              </select>
            </label>
            <label className="form-field">
              <span>Resumen del cambio para historial</span>
              <input
                value={changeSummary}
                placeholder="Ej. Ajuste de descuento institucional 2026"
                onChange={(e) => setChangeSummary(e.target.value)}
              />
            </label>
            {editingContract ? (
              <label className="form-field span-2">
                <span>Autorización de novación comercial / renovación</span>
                <select
                  value={allowNovation ? "si" : "no"}
                  onChange={(e) => setAllowNovation(e.target.value === "si")}
                >
                  <option value="no">
                    No · Conservar condiciones originales congeladas (solo edición administrativa)
                  </option>
                  <option value="si">
                    Sí · Autorizar novación de tarifa/plan o renovación con trazabilidad en
                    historial
                  </option>
                </select>
              </label>
            ) : null}
            <label className="form-field span-2">
              <span>Condiciones particulares del contrato</span>
              <input
                value={specialConditions}
                placeholder="Cláusulas especiales, acuerdos de nivel de servicio o cobertura..."
                onChange={(e) => setSpecialConditions(e.target.value)}
              />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {lifecycleTarget && (
        <ModalDialog
          title={`Confirmar cambio de estado: ${lifecycleTarget.nextStatus}`}
          description={`El contrato ${lifecycleTarget.contract.id} cambiará a estado "${lifecycleTarget.nextStatus}". El registro se conservará íntegramente en el historial comercial.`}
          onClose={() => setLifecycleTarget(null)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <label className="form-field">
              <span>Motivo o justificación para la bitácora contractual</span>
              <input
                value={lifecycleReason}
                placeholder="Ej. Suspensión temporal solicitada por el ecónomo diocesano"
                onChange={(e) => setLifecycleReason(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="button-muted"
                onClick={() => setLifecycleTarget(null)}
              >
                Cancelar
              </button>
              <button type="button" className="button-primary" onClick={confirmLifecycleTransition}>
                Confirmar transición
              </button>
            </div>
          </div>
        </ModalDialog>
      )}
    </section>
  );
}
