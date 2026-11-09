import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  registerCommercialPayment,
  reverseCommercialPayment,
  saveCommercialInvoice,
} from "../data/commercial-service";
import {
  PORTFOLIO_STATUSES,
  type Invoice,
  type Payment,
  type PortfolioStatus,
} from "../data/saas-domain";
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
} from "./saas-ui";

type BillingTab = "invoices" | "payments";

export function BillingPortfolioScreen() {
  const invoices = useRepositoryRows(repositories.invoices);
  const payments = useRepositoryRows(repositories.payments);
  const clients = useRepositoryRows(repositories.clients);
  const organizations = useRepositoryRows(repositories.organizations);
  const contracts = useRepositoryRows(repositories.contracts);
  const subscriptions = useRepositoryRows(repositories.subscriptions);

  const [tab, setTab] = useState<BillingTab>("invoices");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    invoices[0]?.id ?? null,
  );

  // Modal de Factura Comercial
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invId, setInvId] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "CLI-001");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "ORG-001");
  const [contractId, setContractId] = useState(contracts[0]?.id ?? "CON-01");
  const [subscriptionId, setSubscriptionId] = useState(subscriptions[0]?.id ?? "SUB-01");
  const [conceptDescription, setConceptDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("290000");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [taxRatePercent, setTaxRatePercent] = useState("0");
  const [issuedAt, setIssuedAt] = useState("2026-04-19");
  const [dueAt, setDueAt] = useState("2026-05-04");
  const [portfolioStatus, setPortfolioStatus] = useState<PortfolioStatus>("Por vencer");
  const [billingTypeNote, setBillingTypeNote] = useState("");
  const [invoiceError, setInvoiceError] = useState("");

  // Modal de Registro de Pago
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payId, setPayId] = useState("");
  const [payInvoiceId, setPayInvoiceId] = useState("FAC-1041");
  const [payAmount, setPayAmount] = useState("0");
  const [payMethod, setPayMethod] = useState("Transferencia PSE empresarial");
  const [payReference, setPayReference] = useState("");
  const [paidAt, setPaidAt] = useState("2026-04-19");
  const [payNotes, setPayNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Modal de confirmación de anulación comercial
  const [annulTarget, setAnnulTarget] = useState<Invoice | null>(null);

  const syncEcosystemBilling = () => {
    const repo = getModuleRepository("facturacion-cartera");
    repo.replace(
      repositories.invoices.list().map((inv) => {
        const cli = repositories.clients.getById(inv.clientId);
        return {
          id: inv.id,
          name: cli?.name ?? inv.clientId,
          detail: `COP ${inv.amount.toLocaleString("es-CO")} · Vence ${inv.dueAt}`,
          context: `Contrato ${inv.contractId} · Cartera: ${inv.portfolioStatus ?? "Al día"}`,
          owner: "Facturación y Cartera",
          status: inv.status,
        };
      }),
    );
  };

  const validInvoices = invoices.filter((inv) => inv.status !== "Anulada");
  const totalBilledAmount = validInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const confirmedPayments = payments.filter((pay) => pay.status === "Activo");
  const totalCollectedAmount = confirmedPayments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalPendingPortfolio = validInvoices.reduce(
    (sum, inv) => sum + (inv.balanceDue ?? (inv.status === "Pendiente" ? inv.amount : 0)),
    0,
  );
  const overdueInvoicesCount = validInvoices.filter(
    (inv) => inv.portfolioStatus === "En mora",
  ).length;

  const filteredInvoices = invoices.filter((inv) => {
    const pStatus = inv.portfolioStatus ?? (inv.status === "Activo" ? "Pagada" : "Por vencer");
    const matchesStatus =
      statusFilter === "Todos" || pStatus === statusFilter || inv.status === statusFilter;
    const cli = clients.find((c) => c.id === inv.clientId);
    const org = organizations.find((o) => o.id === inv.organizationId);
    const text = [
      inv.id,
      inv.contractId,
      inv.subscriptionId,
      cli?.name,
      org?.name,
      pStatus,
      inv.billingTypeNote,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && (!query.trim() || text.includes(query.toLowerCase()));
  });

  const filteredPayments = payments.filter((pay) => {
    const inv = invoices.find((i) => i.id === pay.invoiceId);
    const cli = clients.find((c) => c.id === inv?.clientId);
    const text = [pay.id, pay.invoiceId, pay.method, pay.reference, pay.notes, cli?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return !query.trim() || text.includes(query.toLowerCase());
  });

  const selectedInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) ??
    filteredInvoices[0] ??
    invoices[0] ??
    null;

  const qtyNum = Math.max(Number(quantity) || 1, 1);
  const unitNum = Math.max(Number(unitPrice) || 0, 0);
  const subtotalPreview = qtyNum * unitNum;
  const discountNum = Math.min(Math.max(Number(discountAmount) || 0, 0), subtotalPreview);
  const taxableBase = Math.max(subtotalPreview - discountNum, 0);
  const taxRateNum = Math.max(Number(taxRatePercent) || 0, 0);
  const taxPreview = Math.round(taxableBase * (taxRateNum / 100));
  const totalPreview = taxableBase + taxPreview;

  const openCreateInvoice = () => {
    const nextNum = 1041 + invoices.length + 1;
    const defaultCon = contracts[0];
    const defaultSub = subscriptions.find((s) => s.contractId === defaultCon?.id);
    setEditingInvoice(null);
    setInvId(`FAC-${nextNum}`);
    setClientId(defaultCon?.clientId ?? clients[0]?.id ?? "CLI-001");
    setOrgId(defaultCon?.organizationId ?? organizations[0]?.id ?? "ORG-001");
    setContractId(defaultCon?.id ?? "CON-01");
    setSubscriptionId(defaultSub?.id ?? "SUB-01");
    setConceptDescription(
      `Suscripción comercial ${defaultCon?.planSnapshot?.planName ?? "A&O SaaS"} (${defaultCon?.billingPeriod ?? "Mensual"})`,
    );
    setQuantity("1");
    setUnitPrice(String(defaultCon?.contractedAmount ?? 290000));
    setDiscountAmount(String(defaultCon?.discountAmount ?? 0));
    setTaxRatePercent("0");
    setIssuedAt("2026-04-19");
    setDueAt("2026-05-04");
    setPortfolioStatus("Por vencer");
    setBillingTypeNote(
      "Facturación comercial interna de suscripción SaaS (no constituye facturación electrónica DIAN).",
    );
    setInvoiceError("");
    setInvoiceModalOpen(true);
  };

  const openEditInvoice = (inv: Invoice) => {
    const firstConcept = inv.concepts?.[0];
    const sub = inv.subtotalAmount ?? inv.amount;
    const disc = inv.discountAmount ?? 0;
    const base = Math.max(sub - disc, 1);
    const approxTax = inv.taxAmount ? Math.round((inv.taxAmount / base) * 100) : 0;

    setEditingInvoice(inv);
    setInvId(inv.id);
    setClientId(inv.clientId);
    setOrgId(inv.organizationId ?? organizations[0]?.id ?? "ORG-001");
    setContractId(inv.contractId);
    setSubscriptionId(inv.subscriptionId ?? "SUB-01");
    setConceptDescription(firstConcept?.description ?? `Suscripción comercial (${inv.id})`);
    setQuantity(String(firstConcept?.quantity ?? 1));
    setUnitPrice(String(firstConcept?.unitPrice ?? sub));
    setDiscountAmount(String(disc));
    setTaxRatePercent(String(approxTax));
    setIssuedAt(inv.issuedAt ?? inv.dueAt);
    setDueAt(inv.dueAt);
    setPortfolioStatus(inv.portfolioStatus ?? "Por vencer");
    setBillingTypeNote(
      inv.billingTypeNote ??
        "Facturación comercial interna de suscripción SaaS (no constituye facturación electrónica DIAN).",
    );
    setInvoiceError("");
    setInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invId.trim() || !conceptDescription.trim()) {
      setInvoiceError(
        "El número de factura comercial y la descripción del concepto facturado son obligatorios.",
      );
      return;
    }

    const now = new Date().toISOString();
    const existingPaid = editingInvoice?.paidAmount ?? 0;
    const balanceDue = Math.max(totalPreview - existingPaid, 0);
    const isPaid = balanceDue === 0 && totalPreview > 0;

    const payload: Invoice = {
      id: editingInvoice ? editingInvoice.id : invId.trim().toUpperCase(),
      clientId,
      organizationId: orgId,
      contractId,
      subscriptionId,
      issuedAt,
      dueAt,
      concepts: [
        {
          description: conceptDescription.trim(),
          quantity: qtyNum,
          unitPrice: unitNum,
          total: subtotalPreview,
        },
      ],
      subtotalAmount: subtotalPreview,
      discountAmount: discountNum,
      taxAmount: taxPreview,
      amount: totalPreview,
      paidAmount: existingPaid,
      balanceDue,
      status: isPaid ? "Activo" : "Pendiente",
      portfolioStatus: isPaid ? "Pagada" : portfolioStatus,
      billingTypeNote: billingTypeNote.trim() || undefined,
      createdAt: editingInvoice?.createdAt ?? now,
      updatedAt: now,
    };

    const result = saveCommercialInvoice({
      invoice: payload,
      editingInvoice,
    });
    if (!result.ok) {
      setInvoiceError(result.error);
      return;
    }

    syncEcosystemBilling();
    setSelectedInvoiceId(result.invoice.id);
    setInvoiceModalOpen(false);
  };

  const handleConfirmAnnul = () => {
    if (!annulTarget) return;
    repositories.invoices.update(annulTarget.id, {
      status: "Anulada",
      portfolioStatus: "Anulada",
      balanceDue: 0,
      billingTypeNote: `Factura anulada comercialmente el ${new Date().toISOString().slice(0, 10)}. Conservada para trazabilidad histórica.`,
    });
    syncEcosystemBilling();
    setAnnulTarget(null);
  };

  const openRegisterPayment = (invoice?: Invoice) => {
    const targetInv =
      invoice ?? selectedInvoice ?? invoices.find((i) => i.status === "Pendiente") ?? invoices[0];
    const nextPayNum = 300 + payments.length + 1;
    const pendingBalance =
      targetInv?.balanceDue ?? (targetInv?.status === "Pendiente" ? targetInv.amount : 0);

    setPayId(`PAG-${nextPayNum}`);
    setPayInvoiceId(targetInv?.id ?? "FAC-1041");
    setPayAmount(String(pendingBalance > 0 ? pendingBalance : (targetInv?.amount ?? 0)));
    setPayMethod("Transferencia PSE empresarial");
    setPayReference(`PSE-2026-${9000 + nextPayNum}`);
    setPaidAt("2026-04-19");
    setPayNotes(`Abono comercial aplicado a ${targetInv?.id ?? "factura comercial"}.`);
    setPaymentError("");
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const payment: Payment = {
      id: payId.trim().toUpperCase(),
      invoiceId: payInvoiceId,
      amount: Number(payAmount) || 0,
      paidAt,
      status: "Activo",
      method: payMethod.trim(),
      reference: payReference.trim() || undefined,
      notes: payNotes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = registerCommercialPayment({ payment });
    if (!result.ok) {
      setPaymentError(result.error);
      return;
    }

    syncEcosystemBilling();
    setSelectedInvoiceId(result.invoice.id);
    setPaymentModalOpen(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dominio Comercial · Facturación y Cartera SaaS</p>
          <h1>Facturación comercial y estado de cartera</h1>
          <p>
            Liquidación de suscripciones contratadas, conceptos facturados, impuestos, descuentos,
            pagos recibidos y saldos pendientes por cliente.
          </p>
        </div>
        <div className="header-actions">
          <button className="button-muted" type="button" onClick={() => openRegisterPayment()}>
            <SaasIcon name="check" size={15} />
            Registrar pago recibido
          </button>
          <button className="button-primary" type="button" onClick={openCreateInvoice}>
            <SaasIcon name="plus" size={15} />
            Emitir factura comercial
          </button>
        </div>
      </header>

      <div className="notice" style={{ marginBottom: 16 }}>
        <strong>Alcance del módulo — Facturación Comercial Interna SaaS:</strong> Este módulo
        administra la facturación comercial y cartera de suscripciones de A&amp;O SaaS.{" "}
        <strong>No constituye facturación electrónica regulada ante la DIAN</strong> ni simula
        transmisión a proveedores tecnológicos tributarios. Las facturas emitidas no se eliminan
        destructivamente; en caso de reversión se registran en estado <code>Anulada</code>.
      </div>

      <div className="summary-grid">
        <SummaryCard
          label="Facturación comercial emitida"
          value={`COP ${totalBilledAmount.toLocaleString("es-CO")}`}
          detail={`${validInvoices.length} facturas comerciales vigentes`}
          icon="billing"
        />
        <SummaryCard
          label="Ingresos efectivamente recaudados"
          value={`COP ${totalCollectedAmount.toLocaleString("es-CO")}`}
          detail={`${confirmedPayments.length} pagos conciliados en firme`}
          icon="check"
          tone="emerald"
        />
        <SummaryCard
          label="Saldo pendiente en cartera"
          value={`COP ${totalPendingPortfolio.toLocaleString("es-CO")}`}
          detail="Facturas comerciales pendientes de recaudo"
          icon="subscriptions"
          tone="amber"
        />
        <SummaryCard
          label="Obligaciones en mora"
          value={overdueInvoicesCount}
          detail={
            overdueInvoicesCount > 0
              ? "Facturas vencidas que requieren gestión de cobro"
              : "Sin obligaciones vencidas en mora"
          }
          icon="alert"
        />
      </div>

      <div className="domain-tabs" role="tablist" aria-label="Vistas de facturación y cartera">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "invoices"}
          className={`domain-tab${tab === "invoices" ? " active" : ""}`}
          onClick={() => setTab("invoices")}
        >
          <SaasIcon name="billing" size={15} />
          1. Facturas comerciales y estado de cartera
          <span className="domain-tab-count">{invoices.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "payments"}
          className={`domain-tab${tab === "payments" ? " active" : ""}`}
          onClick={() => setTab("payments")}
        >
          <SaasIcon name="check" size={15} />
          2. Pagos recibidos y conciliación
          <span className="domain-tab-count">{payments.length}</span>
        </button>
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por número de factura, contrato, suscripción, cliente u organización..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", ...PORTFOLIO_STATUSES]}
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer demo"
        />

        {tab === "invoices" ? (
          filteredInvoices.length === 0 ? (
            <EmptyState
              title="No se encontraron facturas comerciales"
              description="Limpia los filtros o emite una nueva factura comercial."
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
                    <th>Factura / Emisión</th>
                    <th>Cliente contratante y organización</th>
                    <th>Contrato y suscripción</th>
                    <th>Subtotal / Impuestos</th>
                    <th>Total / Saldo pendiente</th>
                    <th>Estado cartera</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const cli = clients.find((c) => c.id === inv.clientId);
                    const org = organizations.find((o) => o.id === inv.organizationId);
                    const pStatus =
                      inv.portfolioStatus ?? (inv.status === "Activo" ? "Pagada" : "Por vencer");
                    const subtotal = inv.subtotalAmount ?? inv.amount;
                    const tax = inv.taxAmount ?? 0;
                    const balance = inv.balanceDue ?? (inv.status === "Pendiente" ? inv.amount : 0);
                    const isSelected = selectedInvoice?.id === inv.id;

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--blue-50)" : undefined,
                        }}
                      >
                        <td>
                          <strong className="row-title">{inv.id}</strong>
                          <span className="row-sub">
                            Emisión: {inv.issuedAt ?? inv.dueAt} · Vence: {inv.dueAt}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">{cli?.name ?? inv.clientId}</strong>
                          <span className="row-sub">
                            {org?.name ?? inv.organizationId ?? "Organización general"}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">{inv.contractId}</strong>
                          <span className="row-sub">
                            Suscripción: {inv.subscriptionId ?? "SUB-01"}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            COP {subtotal.toLocaleString("es-CO")}
                          </strong>
                          <span className="row-sub">
                            Impuestos: COP {tax.toLocaleString("es-CO")}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            COP {inv.amount.toLocaleString("es-CO")}
                          </strong>
                          <span className="row-sub">
                            Saldo: COP {balance.toLocaleString("es-CO")}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={pStatus} />
                        </td>
                        <td>
                          <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="action-link"
                              type="button"
                              onClick={() => setSelectedInvoiceId(inv.id)}
                            >
                              Ver ficha
                            </button>
                            {inv.status !== "Anulada" && balance > 0 ? (
                              <button
                                className="action-link"
                                type="button"
                                onClick={() => openRegisterPayment(inv)}
                              >
                                Abonar
                              </button>
                            ) : null}
                            {inv.status !== "Anulada" ? (
                              <button
                                className="action-link"
                                type="button"
                                onClick={() => openEditInvoice(inv)}
                              >
                                Editar
                              </button>
                            ) : null}
                          </div>
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
                  <th>Código Pago</th>
                  <th>Factura comercial abonada</th>
                  <th>Cliente contratante</th>
                  <th>Método y referencia bancaria</th>
                  <th>Fecha de recaudo</th>
                  <th>Monto recaudado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay) => {
                  const inv = invoices.find((i) => i.id === pay.invoiceId);
                  const cli = clients.find((c) => c.id === inv?.clientId);
                  return (
                    <tr key={pay.id}>
                      <td>
                        <strong className="row-title">{pay.id}</strong>
                      </td>
                      <td>
                        <strong className="row-title">{pay.invoiceId}</strong>
                        <span className="row-sub">Contrato: {inv?.contractId ?? "S/D"}</span>
                      </td>
                      <td>
                        <strong className="row-title">{cli?.name ?? inv?.clientId ?? "S/D"}</strong>
                      </td>
                      <td>
                        <strong className="row-title">{pay.method ?? "Transferencia"}</strong>
                        <span className="row-sub">Ref: {pay.reference ?? "Sin referencia"}</span>
                      </td>
                      <td>{pay.paidAt}</td>
                      <td>
                        <strong className="row-title">
                          COP {pay.amount.toLocaleString("es-CO")}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={pay.status} />
                        {pay.status === "Activo" ? (
                          <button
                            type="button"
                            className="action-link"
                            style={{ marginLeft: 8 }}
                            onClick={() => {
                              reverseCommercialPayment({
                                paymentId: pay.id,
                                reason: "Reversión contable solicitada desde consola",
                              });
                              syncEcosystemBilling();
                            }}
                          >
                            Reversar
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ficha Maestra de la Factura Seleccionada */}
      {selectedInvoice ? (
        <section className="panel master-detail-panel" style={{ marginTop: 20 }}>
          {(() => {
            const cli = clients.find((c) => c.id === selectedInvoice.clientId);
            const org = organizations.find((o) => o.id === selectedInvoice.organizationId);
            const invoicePayments = payments.filter((p) => p.invoiceId === selectedInvoice.id);
            const pStatus =
              selectedInvoice.portfolioStatus ??
              (selectedInvoice.status === "Activo" ? "Pagada" : "Por vencer");
            const subtotal = selectedInvoice.subtotalAmount ?? selectedInvoice.amount;
            const discount = selectedInvoice.discountAmount ?? 0;
            const tax = selectedInvoice.taxAmount ?? 0;
            const paid =
              selectedInvoice.paidAmount ?? invoicePayments.reduce((s, p) => s + p.amount, 0);
            const balance =
              selectedInvoice.balanceDue ?? Math.max(selectedInvoice.amount - paid, 0);

            return (
              <>
                <header className="master-sheet-header">
                  <div>
                    <div className="master-sheet-badges">
                      <span className="code-badge">{selectedInvoice.id}</span>
                      <span className="type-badge">Contrato {selectedInvoice.contractId}</span>
                      <StatusBadge status={pStatus} />
                    </div>
                    <h2>
                      Factura Comercial {selectedInvoice.id} —{" "}
                      {cli?.name ?? selectedInvoice.clientId}
                    </h2>
                    <p>
                      Organización beneficiaria:{" "}
                      <strong>{org?.name ?? selectedInvoice.organizationId}</strong> · Suscripción:{" "}
                      <strong>{selectedInvoice.subscriptionId ?? "SUB-01"}</strong>
                    </p>
                  </div>
                  <div className="header-actions">
                    {selectedInvoice.status !== "Anulada" && balance > 0 ? (
                      <button
                        type="button"
                        className="button-primary button-compact"
                        onClick={() => openRegisterPayment(selectedInvoice)}
                      >
                        <SaasIcon name="check" size={14} />
                        Registrar pago recibido
                      </button>
                    ) : null}
                    {selectedInvoice.status !== "Anulada" ? (
                      <>
                        <button
                          type="button"
                          className="button-muted button-compact"
                          onClick={() => openEditInvoice(selectedInvoice)}
                        >
                          <SaasIcon name="edit" size={14} />
                          Editar factura
                        </button>
                        <button
                          type="button"
                          className="button-ghost button-compact"
                          onClick={() => setAnnulTarget(selectedInvoice)}
                        >
                          Anular factura
                        </button>
                      </>
                    ) : null}
                  </div>
                </header>

                <div className="master-summary-strip">
                  <div className="master-summary-item">
                    <span>Subtotal antes de impuestos</span>
                    <strong>COP {subtotal.toLocaleString("es-CO")}</strong>
                    <small>Descuento: COP {discount.toLocaleString("es-CO")}</small>
                  </div>
                  <div className="master-summary-item">
                    <span>Impuestos liquidados</span>
                    <strong>COP {tax.toLocaleString("es-CO")}</strong>
                    <small>
                      Total factura: COP {selectedInvoice.amount.toLocaleString("es-CO")}
                    </small>
                  </div>
                  <div className="master-summary-item">
                    <span>Pagos recibidos</span>
                    <strong>COP {paid.toLocaleString("es-CO")}</strong>
                    <small>{invoicePayments.length} pago(s) aplicado(s)</small>
                  </div>
                  <div className="master-summary-item">
                    <span>Saldo pendiente en cartera</span>
                    <strong>COP {balance.toLocaleString("es-CO")}</strong>
                    <small>Vencimiento: {selectedInvoice.dueAt}</small>
                  </div>
                </div>

                <div className="master-section-grid">
                  <div className="master-section">
                    <h4>A. Vínculo contractual y partes</h4>
                    <div className="master-field-grid">
                      <div className="master-field">
                        <span>Cliente contratante</span>
                        <strong>
                          <Link to="/clientes">{cli?.name ?? selectedInvoice.clientId}</Link>
                        </strong>
                      </div>
                      <div className="master-field">
                        <span>Organización beneficiaria</span>
                        <strong>
                          <Link to="/organizaciones">
                            {org?.name ?? selectedInvoice.organizationId ?? "N/A"}
                          </Link>
                        </strong>
                      </div>
                      <div className="master-field">
                        <span>Contrato y suscripción</span>
                        <strong>
                          <Link to="/suscripciones">
                            {selectedInvoice.contractId} (
                            {selectedInvoice.subscriptionId ?? "SUB-01"})
                          </Link>
                        </strong>
                      </div>
                      <div className="master-field">
                        <span>Emisión y vencimiento</span>
                        <strong>
                          {selectedInvoice.issuedAt ?? selectedInvoice.dueAt} a{" "}
                          {selectedInvoice.dueAt}
                        </strong>
                      </div>
                      <div className="master-field span-2">
                        <span>Alcance tributario y comercial</span>
                        <strong>
                          {selectedInvoice.billingTypeNote ??
                            "Facturación comercial interna de suscripción SaaS (no constituye facturación electrónica DIAN)."}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="master-section">
                    <h4>B. Conceptos facturados y pagos aplicados</h4>
                    <div className="relation-list">
                      {(selectedInvoice.concepts && selectedInvoice.concepts.length > 0
                        ? selectedInvoice.concepts
                        : [
                            {
                              description: `Suscripción comercial (${selectedInvoice.subscriptionId ?? selectedInvoice.contractId})`,
                              quantity: 1,
                              unitPrice: subtotal,
                              total: subtotal,
                            },
                          ]
                      ).map((concept, idx) => (
                        <div key={idx} className="relation-card">
                          <div>
                            <strong>{concept.description}</strong>
                            <small>
                              Cantidad: {concept.quantity} · Valor unitario: COP{" "}
                              {concept.unitPrice.toLocaleString("es-CO")}
                            </small>
                          </div>
                          <strong>COP {concept.total.toLocaleString("es-CO")}</strong>
                        </div>
                      ))}

                      {invoicePayments.map((pay) => (
                        <div key={pay.id} className="relation-card">
                          <div>
                            <strong>
                              Pago recibido {pay.id} — COP {pay.amount.toLocaleString("es-CO")}
                            </strong>
                            <small>
                              {pay.method ?? "Transferencia"} · Ref: {pay.reference ?? "N/A"} ·
                              Fecha: {pay.paidAt}
                            </small>
                          </div>
                          <StatusBadge status={pay.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      ) : null}

      {/* Modal de Emisión/Edición de Factura Comercial */}
      {invoiceModalOpen ? (
        <MasterFormModal
          sheetLabel="Ficha de Facturación Comercial"
          entityName={
            editingInvoice
              ? `Factura Comercial ${editingInvoice.id}`
              : "Emitir Nueva Factura Comercial"
          }
          recordCode={editingInvoice ? editingInvoice.id : invId}
          operation={editingInvoice ? "edit" : "create"}
          errorMessage={invoiceError || undefined}
          submitLabel={editingInvoice ? "Guardar cambios" : "Emitir factura comercial"}
          onClose={() => setInvoiceModalOpen(false)}
          onSubmit={handleSaveInvoice}
        >
          <MasterFormSection
            step="A"
            title="Información general y vínculo contractual"
            description="Identificación de la factura comercial, cliente contratante, organización y suscripción."
          >
            <label className="form-field">
              <span>Número de factura comercial *</span>
              <input
                value={invId}
                disabled={Boolean(editingInvoice)}
                onChange={(e) => setInvId(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Estado de cartera *</span>
              <select
                value={portfolioStatus}
                onChange={(e) => setPortfolioStatus(e.target.value as PortfolioStatus)}
              >
                {PORTFOLIO_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Cliente contratante *</span>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.id} — {cli.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Organización beneficiaria *</span>
              <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.id} — {org.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Contrato comercial *</span>
              <select value={contractId} onChange={(e) => setContractId(e.target.value)}>
                {contracts.map((con) => (
                  <option key={con.id} value={con.id}>
                    {con.id} — Plan {con.planSnapshot?.planName ?? con.planId}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Suscripción vinculada *</span>
              <select value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)}>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.id} — Renovación {sub.renewalAt}
                  </option>
                ))}
              </select>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Concepto facturado, impuestos y descuentos"
            description="Liquidación económica antes y después de impuestos."
          >
            <label className="form-field span-2">
              <span>Concepto facturado *</span>
              <input
                value={conceptDescription}
                onChange={(e) => setConceptDescription(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Cantidad *</span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Valor unitario antes de impuestos (COP) *</span>
              <input
                type="number"
                min={0}
                step={10000}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Descuento comercial (COP)</span>
              <input
                type="number"
                min={0}
                step={10000}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Impuesto aplicable (% IVA / otro)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
              />
              <small>
                Subtotal: COP {subtotalPreview.toLocaleString("es-CO")} · Impuesto: COP{" "}
                {taxPreview.toLocaleString("es-CO")} · Total: COP{" "}
                {totalPreview.toLocaleString("es-CO")}
              </small>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Fechas de vigencia y alcance comercial"
            description="Fechas de emisión y vencimiento de cobro."
          >
            <label className="form-field">
              <span>Fecha de emisión *</span>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Fecha de vencimiento *</span>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
              />
            </label>
            <label className="form-field span-2">
              <span>Nota de alcance comercial / tributario</span>
              <input value={billingTypeNote} onChange={(e) => setBillingTypeNote(e.target.value)} />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      ) : null}

      {/* Modal de Registro de Pago */}
      {paymentModalOpen ? (
        <MasterFormModal
          sheetLabel="Ficha de Recaudo Comercial"
          entityName="Registrar Pago Recibido y Conciliar Cartera"
          recordCode={payId}
          operation="create"
          errorMessage={paymentError || undefined}
          submitLabel="Confirmar pago y actualizar cartera"
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleSavePayment}
        >
          <MasterFormSection
            step="A"
            title="Factura comercial abonada y monto recaudado"
            description="Al confirmar el pago se recalcula automáticamente el saldo pendiente y estado de cartera de la factura."
          >
            <label className="form-field">
              <span>Código de pago *</span>
              <input value={payId} onChange={(e) => setPayId(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Factura comercial a abonar *</span>
              <select
                value={payInvoiceId}
                onChange={(e) => {
                  const target = invoices.find((i) => i.id === e.target.value);
                  const pending =
                    target?.balanceDue ?? (target?.status === "Pendiente" ? target.amount : 0);
                  setPayInvoiceId(e.target.value);
                  setPayAmount(String(pending > 0 ? pending : (target?.amount ?? 0)));
                }}
              >
                {invoices
                  .filter((i) => i.status !== "Anulada")
                  .map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} — Saldo: COP{" "}
                      {(
                        inv.balanceDue ?? (inv.status === "Pendiente" ? inv.amount : 0)
                      ).toLocaleString("es-CO")}
                    </option>
                  ))}
              </select>
            </label>
            <label className="form-field">
              <span>Valor recibido (COP) *</span>
              <input
                type="number"
                min={1}
                step={10000}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Fecha de recepción del pago *</span>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Método de pago *</span>
              <input value={payMethod} onChange={(e) => setPayMethod(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Referencia / comprobante bancario</span>
              <input value={payReference} onChange={(e) => setPayReference(e.target.value)} />
            </label>
            <label className="form-field span-2">
              <span>Observaciones de conciliación</span>
              <input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      ) : null}

      {/* Modal de confirmación de anulación no destructiva */}
      {annulTarget ? (
        <ModalDialog
          title={`Anular factura comercial ${annulTarget.id}`}
          description="Las facturas comerciales emitidas no se eliminan destructivamente. Al anularla, su saldo pendiente pasa a 0 y se conserva el registro histórico en estado Anulada."
          onClose={() => setAnnulTarget(null)}
        >
          <div className="modal-actions">
            <button type="button" className="button-muted" onClick={() => setAnnulTarget(null)}>
              Cancelar
            </button>
            <button type="button" className="button-primary" onClick={handleConfirmAnnul}>
              Confirmar anulación comercial
            </button>
          </div>
        </ModalDialog>
      ) : null}
    </div>
  );
}
