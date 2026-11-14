import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SaasIcon, type SaasIconName } from "../components/saas-icons";
import { StatusBadge } from "../components/saas-ui";
import {
  calculateCommercialMetricsByCurrency,
  type CurrencyBreakdown,
} from "../data/commercial-service";
import { ecosystemSections } from "../data/ecosystem-demo";
import {
  getModuleRepository,
  getSupportRepository,
  repositories,
  useRepositoryRows,
  useSupportRows,
} from "../data/saas-repository";

export const Route = createFileRoute("/")({ component: Dashboard });

const applicationColors = ["#1769B0", "#10B981", "#E6A72E"];

const sectionIcons: Record<string, SaasIconName> = {
  clientes: "clients",
  "productos-servicios": "products",
  suscripciones: "subscriptions",
  "facturacion-cartera": "billing",
  "identidad-seguridad": "security",
  aprovisionamiento: "provisioning",
  soporte: "support",
  infraestructura: "infrastructure",
  "auditoria-cumplimiento": "audit",
  "analitica-reportes": "analytics",
};

type MetricTone = "blue" | "gold" | "violet" | "emerald";

function MetricCard({
  icon,
  label,
  value,
  detail,
  to,
  tone = "blue",
}: {
  icon: SaasIconName;
  label: string;
  value: string | number;
  detail: string;
  to: string;
  tone?: MetricTone | undefined;
}) {
  return (
    <Link to={to as never} className="metric-card panel" data-tone={tone}>
      <div className="metric-card-top">
        <span className={`metric-icon metric-icon--${tone}`}>
          <SaasIcon name={icon} size={16} />
        </span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-card-body">
        <strong>{value}</strong>
        <span className="metric-detail">
          <span>{detail}</span>
          <SaasIcon name="chevron-right" size={13} />
        </span>
      </div>
    </Link>
  );
}

function DistributionChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!total)
    return <div className="chart-empty">No hay suscripciones con aplicaciones relacionadas.</div>;
  let offset = 0;
  return (
    <div className="donut-layout">
      <div className="donut-chart">
        <svg viewBox="0 0 42 42" role="img" aria-label="Distribución de aplicaciones">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--line)" strokeWidth="6.8" />
          <g transform="rotate(-90 21 21)">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const segment = (
                <circle
                  key={item.label}
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke={applicationColors[index % applicationColors.length]}
                  strokeWidth="6.8"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={-offset}
                  pathLength="100"
                />
              );
              offset += percentage;
              return segment;
            })}
          </g>
        </svg>
        <strong>{total}</strong>
        <small>Asignaciones</small>
      </div>
      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={item.label}>
            <span style={{ background: applicationColors[index % applicationColors.length] }} />
            <strong>{item.label}</strong>
            <small>
              {item.value} · {Math.round((item.value / total) * 100)}%
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

function useModuleRecords(path: string) {
  const repository = useMemo(() => getModuleRepository(path), [path]);
  const [rows, setRows] = useState(() => repository.list());
  useEffect(() => {
    const sync = () => setRows(repository.list());
    sync();
    return repository.subscribe(sync);
  }, [repository]);
  return rows;
}

function formatCompactCop(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
    return `$${formatted}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${amount.toLocaleString("es-CO")}`;
}

function Dashboard() {
  const [period, setPeriod] = useState("30");
  const organizations = useRepositoryRows(repositories.organizations);
  const institutions = useRepositoryRows(repositories.institutions);
  const clients = useRepositoryRows(repositories.clients);
  const contracts = useRepositoryRows(repositories.contracts);
  const subscriptions = useRepositoryRows(repositories.subscriptions);
  const licenses = useRepositoryRows(repositories.licenses);
  const usageLimits = useRepositoryRows(repositories.usageLimits);
  const invoices = useRepositoryRows(repositories.invoices);
  const payments = useRepositoryRows(repositories.payments);
  const applications = useRepositoryRows(repositories.applications);
  const provisioningRequests = useRepositoryRows(repositories.provisioningRequests);
  const infrastructureIncidents = useRepositoryRows(repositories.infrastructureIncidents);
  const infrastructureRecords = useModuleRecords("infraestructura");
  const provisioningRecords = useModuleRecords("aprovisionamiento");
  const supportRepository = useMemo(() => getSupportRepository("mesa-ayuda"), []);
  const tickets = useSupportRows(supportRepository);

  const openTickets = tickets.filter((ticket) => ticket.status !== "Resuelto").length;
  const activeOrganizations = organizations.filter((org) => org.status === "Activo").length;
  const activeInstitutions = institutions.filter((inst) => inst.status === "Activo").length;
  const activeClients = clients.filter((client) => client.status === "Activo").length;
  const activeContracts = contracts.filter((contract) => contract.status === "Activo").length;
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Activo",
  ).length;
  const activeLicenses = licenses.filter((license) => license.status === "Activo").length;
  const totalLicenseSeats = licenses.reduce((sum, license) => sum + license.userLimit, 0);

  // Distinción estricta entre MRR contratado, Facturación pendiente e Ingresos efectivamente recaudados,
  // desglosados por moneda (sin sumar COP, USD y EUR entre sí) y excluyendo contratos no activos/no recurrentes.
  const formatBreakdown = (breakdown: CurrencyBreakdown): string => {
    const entries = Object.entries(breakdown).filter(([, val]) => val > 0);
    if (entries.length === 0) return "COP 0";
    return entries.map(([curr, val]) => `${curr} ${val.toLocaleString("es-CO")}`).join(" · ");
  };

  const commercialMetrics = useMemo(() => {
    void contracts;
    void invoices;
    void payments;
    return calculateCommercialMetricsByCurrency();
  }, [contracts, invoices, payments]);

  const primaryMrrDisplay = useMemo(() => {
    const copVal = commercialMetrics.mrrByCurrency["COP"] ?? 0;
    const otherEntries = Object.entries(commercialMetrics.mrrByCurrency).filter(
      ([curr, val]) => curr !== "COP" && val > 0,
    );
    if (copVal > 0 && otherEntries.length === 0) {
      return formatCompactCop(copVal);
    }
    if (copVal > 0 && otherEntries.length > 0) {
      return `${formatCompactCop(copVal)} + ${otherEntries.map(([c, v]) => `${c} ${v}`).join(" · ")}`;
    }
    return formatBreakdown(commercialMetrics.mrrByCurrency);
  }, [commercialMetrics]);

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status !== "Activo" && invoice.status !== "Anulada",
  );
  const confirmedPayments = payments.filter((payment) => payment.status === "Activo");

  const applicationDistribution = applications
    .map((application) => ({
      label: application.name,
      value: subscriptions.filter((subscription) =>
        subscription.applicationIds.includes(application.id),
      ).length,
    }))
    .filter((item) => item.value > 0);

  const licenseSchedule = useMemo(
    () =>
      licenses.map((license, index) => {
        const subscription = subscriptions.find((item) => item.id === license.subscriptionId);
        const contract = contracts.find((item) => item.id === subscription?.contractId);
        const client = clients.find(
          (item) => item.id === (subscription?.clientId ?? contract?.clientId),
        );
        const institution =
          institutions.find((item) => item.id === license.institutionId) ??
          institutions[index % Math.max(institutions.length, 1)];
        const organization = organizations.find(
          (item) => item.id === institution?.organizationId || item.clientId === client?.id,
        );
        const usage = usageLimits.find(
          (item) => item.licenseId === license.id && item.resource === "usuarios",
        );
        return {
          id: license.id,
          subscriptionId: license.subscriptionId,
          clientName: client?.name ?? "Cliente no asignado",
          organizationName: organization?.name ?? "Organización independiente",
          institutionName: institution?.name ?? organization?.name ?? "Sin institución vinculada",
          seatsText: usage
            ? `${usage.used}/${usage.maximum} usuarios`
            : `${license.userLimit} usuarios`,
          modulesCount: license.moduleIds.length,
          contractEndsAt: contract?.endsAt ?? license.expiresAt ?? "No disponible",
          renewalAt: subscription?.renewalAt ?? "No disponible",
          status: license.status,
        };
      }),
    [licenses, subscriptions, contracts, clients, organizations, institutions, usageLimits],
  );

  const operationalAlerts = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      detail: string;
      status: string;
      to: string;
      icon: SaasIconName;
    }> = [];

    for (const infra of infrastructureRecords) {
      if (infra.status !== "Activo") {
        items.push({
          id: infra.id,
          title: infra.name,
          detail: `${infra.detail} · ${infra.context}`,
          status: infra.status,
          to: "/infraestructura",
          icon: "infrastructure",
        });
      }
    }

    for (const prov of provisioningRecords) {
      if (prov.status !== "Activo") {
        items.push({
          id: prov.id,
          title: prov.name,
          detail: `${prov.detail} · ${prov.context}`,
          status: prov.status,
          to: "/aprovisionamiento",
          icon: "provisioning",
        });
      }
    }

    for (const req of provisioningRequests) {
      if (req.status === "Fallido" || req.status === "Pendiente") {
        const org = organizations.find((o) => o.id === req.organizationId);
        items.push({
          id: req.id,
          title: `Aprovisionamiento ${req.id} (${org?.name ?? req.organizationId})`,
          detail: req.lastError ?? `Solicitud en estado ${req.status}`,
          status: req.status,
          to: "/aprovisionamiento",
          icon: "provisioning",
        });
      }
    }

    for (const inc of infrastructureIncidents) {
      if (inc.status !== "Resuelta") {
        items.push({
          id: inc.id,
          title: inc.title,
          detail: `${inc.kind} · Entorno ${inc.environmentId}`,
          status: inc.status,
          to: "/infraestructura",
          icon: "infrastructure",
        });
      }
    }

    for (const invoice of invoices) {
      if (invoice.status !== "Activo" && invoice.status !== "Anulada") {
        items.push({
          id: invoice.id,
          title: `Factura ${invoice.id}`,
          detail: `Vencimiento ${invoice.dueAt} · COP ${invoice.amount.toLocaleString("es-CO")}`,
          status: invoice.status,
          to: "/facturacion-cartera",
          icon: "billing",
        });
      }
    }

    for (const org of organizations) {
      if (org.status !== "Activo") {
        items.push({
          id: org.id,
          title: org.name,
          detail: `Organización (${org.type}) · Plan ${org.plan}`,
          status: org.status,
          to: "/organizaciones",
          icon: "organizations",
        });
      }
    }

    return items.slice(0, 5);
  }, [
    infrastructureRecords,
    provisioningRecords,
    provisioningRequests,
    infrastructureIncidents,
    invoices,
    organizations,
  ]);

  const priorityTickets = tickets.slice(0, 5).map((ticket, index) => ({
    ...ticket,
    priority: ticket.detail.toLowerCase().includes("alta")
      ? "Alta"
      : index === 2
        ? "Media"
        : "Baja",
    institution:
      institutions[index % Math.max(institutions.length, 1)]?.name ?? "Sin institución relacionada",
  }));

  const activities: Array<{
    icon: SaasIconName;
    title: string;
    detail: string;
    time: string;
  }> = [
    {
      icon: "institutions",
      title: "Institución en aprovisionamiento",
      detail: institutions[0]?.name ?? "Dato demo",
      time: "Registro local",
    },
    {
      icon: "support",
      title: "Ticket asignado a soporte",
      detail: tickets[0]?.id ?? "Sin ticket",
      time: "Registro local",
    },
    {
      icon: "subscriptions",
      title: "Suscripción revisada",
      detail: subscriptions[0]?.id ?? "Sin suscripción",
      time: "Registro local",
    },
    {
      icon: "clients",
      title: "Directorio de clientes consultado",
      detail: `${clients.length} registros`,
      time: "Registro local",
    },
  ];

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div className="dashboard-hero-backdrop" aria-hidden="true">
          <img src="/church-hero.jpg" alt="" className="dashboard-hero-church" />
          <svg
            className="dashboard-hero-wave"
            viewBox="0 0 600 180"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ao-dash-gold-wave" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ca8a04" stopOpacity="0" />
                <stop offset="45%" stopColor="#e5a01b" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d="M 180 175 C 330 165, 470 120, 600 32 L 600 62 C 470 142, 330 178, 180 180 Z"
              fill="url(#ao-dash-gold-wave)"
            />
          </svg>
        </div>
        <div className="dashboard-header-copy">
          <p className="eyebrow">A&amp;O SaaS · Centro de Control Ejecutivo</p>
          <h1>Dashboard Ejecutivo</h1>
          <p className="dashboard-subtitle-full">
            Administración comercial y técnica del ecosistema de productos A&amp;O.
          </p>
          <p className="dashboard-subtitle-compact">Administración del ecosistema A&amp;O</p>
        </div>
        <div className="dashboard-actions">
          <div className="dashboard-quick-actions">
            <Link to="/organizaciones" className="button-muted button-compact">
              <SaasIcon name="organizations" size={14} />
              Organizaciones
            </Link>
            <Link to="/aprovisionamiento" className="button-muted button-compact">
              <SaasIcon name="provisioning" size={14} />
              Aprovisionamiento
            </Link>
          </div>
          <select
            className="dashboard-ecosystem-pill"
            aria-label="Ecosistema activo"
            defaultValue="ecosistema"
          >
            <option value="ecosistema">Ecosistema A&amp;O</option>
          </select>
          <select
            aria-label="Periodo del dashboard"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          <span className="demo-badge">Solo demostración</span>
        </div>
      </header>

      <section className="notice executive-notice">
        <span className="executive-notice-icon" aria-hidden="true">
          <SaasIcon name="info" size={15} />
        </span>
        <div>
          <strong>Entorno local.</strong> Los indicadores y eventos proceden de repositorios de
          demostración en el navegador. No representan actividad productiva ni conexiones externas.
        </div>
      </section>

      <section className="kpi-grid" aria-label="Indicadores ejecutivos por entidad">
        <MetricCard
          icon="organizations"
          tone="blue"
          label="Organizaciones"
          value={organizations.length}
          detail={`${activeOrganizations} activas · ${clients.length} clientes`}
          to="/organizaciones"
        />
        <MetricCard
          icon="institutions"
          tone="gold"
          label="Instituciones"
          value={institutions.length}
          detail={`${activeInstitutions} activas vinculadas`}
          to="/instituciones"
        />
        <MetricCard
          icon="plans"
          tone="blue"
          label="Licencias emitidas"
          value={licenses.length}
          detail={`${activeLicenses} activas · ${totalLicenseSeats} cupos`}
          to="/planes-licencias"
        />
        <MetricCard
          icon="subscriptions"
          tone="blue"
          label="Suscripciones vigentes"
          value={activeSubscriptions}
          detail={`${subscriptions.length} suscripciones · ${contracts.length} contratos`}
          to="/suscripciones"
        />
        <MetricCard
          icon="billing"
          tone="gold"
          label="MRR contratado"
          value={primaryMrrDisplay}
          detail={`${activeClients} clientes activos · ${invoices.length} factura(s)`}
          to="/facturacion-cartera"
        />
        <MetricCard
          icon="support"
          tone="violet"
          label="Tickets abiertos"
          value={openTickets}
          detail={`${tickets.length} casos en Mesa de ayuda`}
          to="/soporte/mesa-ayuda"
        />
      </section>

      <section className="executive-grid">
        <article className="panel chart-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--blue">
                <SaasIcon name="analytics" size={16} />
              </span>
              <div>
                <h2>Crecimiento de instituciones</h2>
                <p>La serie temporal estará disponible cuando existan eventos históricos.</p>
              </div>
            </div>
            <span className="info-chip">{period} días</span>
          </div>
          <div className="chart-empty chart-empty-tall">
            <svg
              className="chart-trend-icon"
              width="34"
              height="22"
              viewBox="0 0 34 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2.5 18.5L12 9.5L18.5 15.5L31.5 3.5M31.5 3.5H23.5M31.5 3.5V11.5"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <strong>Sin historial temporal suficiente</strong>
            <small>
              Actualmente hay {institutions.length} instituciones y {organizations.length}{" "}
              organizaciones en el repositorio local.
            </small>
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--blue">
                <SaasIcon name="activity" size={16} />
              </span>
              <div>
                <h2>Distribución de aplicaciones</h2>
                <p>Suscripciones por aplicación contratada ({applications.length} en catálogo).</p>
              </div>
            </div>
            <span className="info-chip">Datos locales</span>
          </div>
          <DistributionChart data={applicationDistribution} />
        </article>

        <article className="panel ecosystem-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--blue">
                <SaasIcon name="plans" size={16} />
              </span>
              <div>
                <h2>Estado del ecosistema</h2>
                <p>Disponibilidad conocida de las aplicaciones.</p>
              </div>
            </div>
          </div>
          <div className="ecosystem-list">
            <Link to="/productos-servicios" className="ecosystem-item">
              <span className="ecosystem-icon erp">ERP</span>
              <span>
                <strong>A&amp;O ERP</strong>
                <small>Estado demostrativo · sin conexión real</small>
              </span>
              <span className="ecosystem-item-right">
                <span className="ecosystem-item-status">
                  <StatusBadge status="Operativo" />
                </span>
                <span className="ecosystem-chevron">
                  <SaasIcon name="chevron-right" size={16} />
                </span>
              </span>
            </Link>
            <Link to="/productos-servicios" className="ecosystem-item">
              <span className="ecosystem-icon dio">DIO</span>
              <span>
                <strong>A&amp;O Diocesano</strong>
                <small>Estado demostrativo · sin conexión real</small>
              </span>
              <span className="ecosystem-item-right">
                <span className="ecosystem-item-status">
                  <StatusBadge status="Operativo" />
                </span>
                <span className="ecosystem-chevron">
                  <SaasIcon name="chevron-right" size={16} />
                </span>
              </span>
            </Link>
            <Link to="/soporte/diagnostico-documental" className="ecosystem-item">
              <span className="ecosystem-icon doc">DOC</span>
              <span>
                <strong>Servicios documentales</strong>
                <small>No conectado · Paperless no configurado</small>
              </span>
              <span className="ecosystem-item-right">
                <span className="ecosystem-item-status">
                  <StatusBadge status="Inactivo" />
                </span>
                <span className="ecosystem-chevron">
                  <SaasIcon name="chevron-right" size={16} />
                </span>
              </span>
            </Link>
          </div>
        </article>
      </section>

      <section className="mid-grid">
        <article className="panel licenses-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--blue">
                <SaasIcon name="subscriptions" size={16} />
              </span>
              <div>
                <h2>Licencias y vigencias contractuales</h2>
                <p>
                  Estado de licencias, cupos y fechas de fin de contrato o renovación en el
                  repositorio local.
                </p>
              </div>
            </div>
            <Link to="/suscripciones" className="card-link">
              Suscripciones
              <SaasIcon name="chevron-right" size={14} />
            </Link>
          </div>
          {licenseSchedule.length ? (
            <div className="priority-table-wrap">
              <table className="priority-table">
                <thead>
                  <tr>
                    <th>Licencia</th>
                    <th>Institución</th>
                    <th>Capacidad</th>
                    <th>Fin contrato / Renovación</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseSchedule.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to="/planes-licencias">{item.id}</Link>
                        <small>{item.subscriptionId}</small>
                      </td>
                      <td>
                        <strong>{item.institutionName}</strong>
                        <small>{item.clientName}</small>
                      </td>
                      <td>
                        {item.seatsText} · {item.modulesCount} módulos
                      </td>
                      <td>
                        <strong>{item.contractEndsAt}</strong>{" "}
                        <small className="inline-renewal">Renovación: {item.renewalAt}</small>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <strong>No hay licencias registradas</strong>
              <span>El repositorio local no contiene asignaciones de licencia.</span>
            </div>
          )}
        </article>

        <article id="alertas-operativas" className="panel alerts-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--gold">
                <SaasIcon name="bell" size={16} />
              </span>
              <div>
                <h2>Alertas operativas</h2>
                <p>Registros en revisión o pendientes de atención.</p>
              </div>
            </div>
            <span className="info-chip">{operationalAlerts.length} activas</span>
          </div>
          {operationalAlerts.length ? (
            <div className="alerts-list">
              {operationalAlerts.map((alert) => (
                <Link key={alert.id} to={alert.to as never} className="alert-item">
                  <span className="alert-item-icon">
                    <SaasIcon name={alert.icon} size={16} />
                  </span>
                  <span>
                    <strong>{alert.title}</strong>
                    <small>{alert.detail}</small>
                  </span>
                  <StatusBadge status={alert.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Sin alertas pendientes</strong>
              <span>Todos los registros consultados se encuentran en estado activo.</span>
            </div>
          )}
        </article>
      </section>

      <section
        className="panel financial-separation-panel"
        aria-label="Distinción de facturación, cartera e ingresos"
      >
        <div className="section-heading">
          <div className="section-heading-title">
            <span className="section-heading-icon section-heading-icon--gold">
              <SaasIcon name="billing" size={16} />
            </span>
            <div>
              <h2>Indicadores financieros por divisa (COP · USD · EUR)</h2>
              <p>
                Separación estricta entre ingreso mensual recurrente contratado (MRR), facturación
                pendiente en cartera e ingresos efectivamente recaudados.
              </p>
            </div>
          </div>
          <Link to="/facturacion-cartera" className="card-link">
            Ir a Facturación y Cartera
            <SaasIcon name="chevron-right" size={14} />
          </Link>
        </div>
        <div className="financial-breakdown-grid">
          <div className="master-summary-item">
            <span>1. MRR Contratado (Desglosado por divisa)</span>
            <strong>{formatBreakdown(commercialMetrics.mrrByCurrency)}</strong>
            <small>
              Ingreso mensual recurrente de {activeContracts} contrato(s) activo(s) con snapshot
              congelado ({commercialMetrics.excludedContractsCount} excluidos por suspensión,
              vencimiento o periodo no recurrente).
            </small>
          </div>
          <div className="master-summary-item">
            <span>2. Facturación Pendiente (Cartera por divisa)</span>
            <strong>{formatBreakdown(commercialMetrics.pendingPortfolioByCurrency)}</strong>
            <small>
              {pendingInvoices.length} factura(s) emitida(s) pendiente(s) de cobro (vencimiento{" "}
              {pendingInvoices[0]?.dueAt ?? "N/A"}).
            </small>
          </div>
          <div className="master-summary-item">
            <span>3. Ingresos Efectivamente Recaudados (Por divisa)</span>
            <strong>{formatBreakdown(commercialMetrics.collectedRevenueByCurrency)}</strong>
            <small>
              {confirmedPayments.length} pago(s) conciliado(s) en estado Activo (último recaudo:{" "}
              {confirmedPayments[0]?.paidAt ?? "N/A"}).
            </small>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <article className="panel activity-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--blue">
                <SaasIcon name="activity" size={16} />
              </span>
              <div>
                <h2>Actividad reciente</h2>
                <p>Eventos disponibles en los datos locales.</p>
              </div>
            </div>
            <span className="info-chip">{activities.length} eventos</span>
          </div>
          <div className="activity-list executive-activity">
            {activities.map((activity) => (
              <div key={activity.title}>
                <span className="activity-icon">
                  <SaasIcon name={activity.icon} size={15} />
                </span>
                <span>
                  <strong>{activity.title}</strong>
                  <small>{activity.detail}</small>
                </span>
                <time>{activity.time}</time>
              </div>
            ))}
          </div>
        </article>

        <article className="panel tickets-panel">
          <div className="section-heading">
            <div className="section-heading-title">
              <span className="section-heading-icon section-heading-icon--blue">
                <SaasIcon name="support" size={16} />
              </span>
              <div>
                <h2>Tickets prioritarios</h2>
                <p>Casos tomados del área Mesa de ayuda.</p>
              </div>
            </div>
            <Link to="/soporte/mesa-ayuda" className="card-link">
              Ver todos
              <SaasIcon name="chevron-right" size={14} />
            </Link>
          </div>
          {priorityTickets.length ? (
            <div className="priority-table-wrap">
              <table className="priority-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Institución</th>
                    <th>Asunto</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {priorityTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <Link to="/soporte/mesa-ayuda">{ticket.id}</Link>
                      </td>
                      <td>{ticket.institution}</td>
                      <td>{ticket.title}</td>
                      <td>
                        <span
                          className={`priority-badge priority-${ticket.priority
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={ticket.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <strong>No hay tickets prioritarios</strong>
              <span>La mesa de ayuda no tiene registros locales.</span>
            </div>
          )}
        </article>
      </section>

      <section className="catalog-panel panel">
        <div className="section-heading">
          <div className="section-heading-title">
            <span className="section-heading-icon section-heading-icon--gold">
              <SaasIcon name="dashboard" size={16} />
            </span>
            <div>
              <h2>Accesos rápidos del ecosistema</h2>
              <p>{ecosystemSections.length} dominios de administración central.</p>
            </div>
          </div>
        </div>
        <div className="quick-grid">
          {ecosystemSections.map((section) => (
            <Link key={section.path} className="quick-link" to={`/${section.path}` as never}>
              <div className="quick-link-top">
                <strong>{section.title}</strong>
                <span className="quick-link-icon">
                  <SaasIcon name={sectionIcons[section.path] ?? "dashboard"} size={14} />
                </span>
              </div>
              <small>{section.group}</small>
              <span>
                Administrar
                <SaasIcon name="arrow-right" size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
