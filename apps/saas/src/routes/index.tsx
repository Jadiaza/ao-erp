import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ecosystemSections } from "../data/ecosystem-demo";
import {
  getSupportRepository,
  repositories,
  useRepositoryRows,
  useSupportRows,
} from "../data/saas-repository";

export const Route = createFileRoute("/")({ component: Dashboard });

const applicationColors = ["#1976d2", "#20b98b", "#8157e8"];

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="metric-card panel">
      <span className="metric-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
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
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#e8eff5" strokeWidth="7" />
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
                  strokeWidth="7"
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

function Dashboard() {
  const [period, setPeriod] = useState("30");
  const organizations = useRepositoryRows(repositories.organizations);
  const institutions = useRepositoryRows(repositories.institutions);
  const clients = useRepositoryRows(repositories.clients);
  const subscriptions = useRepositoryRows(repositories.subscriptions);
  const invoices = useRepositoryRows(repositories.invoices);
  const applications = useRepositoryRows(repositories.applications);
  const supportRepository = useMemo(() => getSupportRepository("mesa-ayuda"), []);
  const tickets = useSupportRows(supportRepository);
  const openTickets = tickets.filter((ticket) => ticket.status !== "Resuelto").length;
  const activeClients = clients.filter((client) => client.status === "Activo").length;
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "Activo",
  ).length;
  const mrr = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const applicationDistribution = applications
    .map((application) => ({
      label: application.name,
      value: subscriptions.filter((subscription) =>
        subscription.applicationIds.includes(application.id),
      ).length,
    }))
    .filter((item) => item.value > 0);
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
  const activities = [
    {
      icon: "▦",
      title: "Institución en aprovisionamiento",
      detail: institutions[0]?.name ?? "Dato demo",
      time: "Registro local",
    },
    {
      icon: "□",
      title: "Ticket asignado a soporte",
      detail: tickets[0]?.id ?? "Sin ticket",
      time: "Registro local",
    },
    {
      icon: "▱",
      title: "Suscripción revisada",
      detail: subscriptions[0]?.id ?? "Sin suscripción",
      time: "Registro local",
    },
    {
      icon: "♙",
      title: "Directorio de clientes consultado",
      detail: `${clients.length} registros`,
      time: "Registro local",
    },
  ];

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">A&amp;O SaaS</p>
          <h1>Dashboard</h1>
          <p>Administración comercial y técnica del ecosistema de productos A&amp;O.</p>
        </div>
        <div className="dashboard-actions">
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
        <strong>Entorno local.</strong> Los indicadores y eventos proceden de repositorios de
        demostración en el navegador. No representan actividad productiva ni conexiones externas.
      </section>
      <section className="kpi-grid" aria-label="Indicadores ejecutivos">
        <MetricCard
          icon="♙"
          label="Clientes activos"
          value={activeClients}
          detail={`${clients.length} clientes demo`}
        />
        <MetricCard
          icon="▦"
          label="Instituciones"
          value={institutions.length}
          detail="Registros relacionados"
        />
        <MetricCard
          icon="▱"
          label="Aplicaciones activas"
          value={applications.length}
          detail="Catálogo local A&O"
        />
        <MetricCard
          icon="▣"
          label="Suscripciones vigentes"
          value={activeSubscriptions}
          detail={`${subscriptions.length} contratos demo`}
        />
        <MetricCard
          icon="$"
          label="MRR demostrativo"
          value={`$${(mrr / 1000000).toFixed(1)}M`}
          detail="Calculado desde facturas demo"
        />
        <MetricCard
          icon="♧"
          label="Tickets abiertos"
          value={openTickets}
          detail="Centro de Soporte"
        />
      </section>
      <section className="executive-grid">
        <article className="panel chart-panel">
          <div className="section-heading">
            <div>
              <h2>Crecimiento de instituciones</h2>
              <p>La serie temporal estará disponible cuando existan eventos históricos.</p>
            </div>
            <span className="info-chip">{period} días</span>
          </div>
          <div className="chart-empty chart-empty-tall">
            <div className="chart-placeholder">
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
            <strong>Sin historial temporal suficiente</strong>
            <small>
              Actualmente hay {institutions.length} instituciones en el repositorio local.
            </small>
          </div>
        </article>
        <article className="panel chart-panel">
          <div className="section-heading">
            <div>
              <h2>Distribución de aplicaciones</h2>
              <p>Instituciones por aplicación contratada.</p>
            </div>
            <span className="info-chip">Datos locales</span>
          </div>
          <DistributionChart data={applicationDistribution} />
        </article>
        <article className="panel ecosystem-panel">
          <div className="section-heading">
            <div>
              <h2>Estado del ecosistema</h2>
              <p>Disponibilidad conocida de las aplicaciones.</p>
            </div>
          </div>
          <div className="ecosystem-list">
            <div>
              <span className="ecosystem-icon erp">ERP</span>
              <span>
                <strong>A&amp;O ERP</strong>
                <small>Estado demostrativo · sin conexión real</small>
              </span>
              <b>›</b>
            </div>
            <div>
              <span className="ecosystem-icon dio">DIO</span>
              <span>
                <strong>A&amp;O Diocesano</strong>
                <small>Estado demostrativo · sin conexión real</small>
              </span>
              <b>›</b>
            </div>
            <div>
              <span className="ecosystem-icon doc">DOC</span>
              <span>
                <strong>Servicios documentales</strong>
                <small>No conectado · Paperless no configurado</small>
              </span>
              <b>›</b>
            </div>
          </div>
        </article>
      </section>
      <section className="lower-grid">
        <article className="panel activity-panel">
          <div className="section-heading">
            <div>
              <h2>Actividad reciente</h2>
              <p>Eventos disponibles en los datos locales.</p>
            </div>
            <span className="info-chip">{activities.length} eventos</span>
          </div>
          <div className="activity-list executive-activity">
            {activities.map((activity) => (
              <div key={activity.title}>
                <span className="activity-icon">{activity.icon}</span>
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
            <div>
              <h2>Tickets prioritarios</h2>
              <p>Casos tomados del área Mesa de ayuda.</p>
            </div>
            <Link to="/soporte/mesa-ayuda" className="card-link">
              Ver todos ›
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
                          className={`priority-badge priority-${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status status-${ticket.status === "En diagnóstico" ? "en-diagnóstico" : ticket.status === "Abierto" ? "pendiente" : "resuelto"}`}
                        >
                          {ticket.status}
                        </span>
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
          <div>
            <h2>Accesos rápidos</h2>
            <p>{ecosystemSections.length} dominios de administración central.</p>
          </div>
        </div>
        <div className="quick-grid">
          {ecosystemSections.map((section) => (
            <Link key={section.path} className="quick-link" to={`/${section.path}` as never}>
              <strong>{section.title}</strong>
              <small>{section.group}</small>
              <span>Administrar →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
