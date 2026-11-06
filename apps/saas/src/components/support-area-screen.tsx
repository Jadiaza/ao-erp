import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supportAreaConfig, type SupportArea, type SupportRecord } from "../data/support-demo";
import { getSupportRepository, useSupportRows } from "../data/saas-repository";

const supportLinks: Array<[SupportArea, string]> = [
  ["mesa-ayuda", "Mesa de ayuda"],
  ["asistencia-contextual", "Asistencia contextual"],
  ["diagnostico-postgresql", "Diagnóstico PostgreSQL"],
  ["diagnostico-documental", "Diagnóstico documental"],
  ["logs-trazabilidad", "Logs y trazabilidad"],
  ["sesiones-asistencia", "Sesiones autorizadas"],
  ["base-conocimientos", "Base de conocimientos"],
  ["asistente-inteligente", "Asistente inteligente"],
  ["indicadores-soporte", "Indicadores de soporte"],
];

export function SupportAreaScreen({ area }: { area: SupportArea }) {
  const config = supportAreaConfig[area];
  const [repository] = useState(() => getSupportRepository(area));
  const records = useSupportRows(repository);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [selected, setSelected] = useState<SupportRecord | null>(null);
  const statuses = [...new Set(records.map((item) => item.status))];
  const visible = useMemo(
    () =>
      records.filter(
        (item) =>
          `${item.id} ${item.title} ${item.detail} ${item.context} ${item.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "Todos" || item.status === status),
      ),
    [records, query, status],
  );
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A&amp;O SaaS / Centro de soporte</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <button
          className="button-primary"
          onClick={() =>
            repository.create({
              id: `SUP-${Date.now()}`,
              title: config.createLabel,
              detail: "Registro local de demostración",
              context: "Centro de soporte",
              status: "Demostrativo",
              owner: "Administrador SaaS",
            })
          }
        >
          + {config.createLabel}
        </button>
      </header>
      <div className="notice">
        <strong>Modo seguro de demostración.</strong> No se consultan PostgreSQL, Paperless, logs
        productivos ni instituciones reales. Las fichas no contienen credenciales, tokens ni cadenas
        de conexión.
      </div>
      <nav className="support-nav" aria-label="Áreas de soporte">
        {supportLinks.map(([path, label]) => (
          <Link
            key={path}
            to={`/soporte/${path}` as never}
            className={path === area ? "support-nav-link active" : "support-nav-link"}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="summary-grid">
        <div className="panel summary-card">
          <small>Registros</small>
          <strong>{visible.length}</strong>
          <span>Vista filtrada</span>
        </div>
        <div className="panel summary-card">
          <small>En atención</small>
          <strong>{records.filter((item) => item.status === "En diagnóstico").length}</strong>
          <span>Seguimiento demo</span>
        </div>
        <div className="panel summary-card">
          <small>SLA</small>
          <strong>92%</strong>
          <span>Indicador sintético</span>
        </div>
        <div className="panel summary-card">
          <small>Aplicaciones</small>
          <strong>3</strong>
          <span>ERP · SaaS · Diocesano</span>
        </div>
      </section>
      <section className="panel table-panel">
        <div className="toolbar">
          <input
            aria-label={`Buscar ${config.title}`}
            placeholder="Buscar en soporte..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            aria-label="Filtrar por estado"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>Todos</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        {visible.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Registro</th>
                  <th>Detalle</th>
                  <th>Contexto</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <small>{item.id}</small>
                    </td>
                    <td>{item.detail}</td>
                    <td>{item.context}</td>
                    <td>{item.owner}</td>
                    <td>
                      <span className="status status-activo">{item.status}</span>
                    </td>
                    <td>
                      <button className="link-button" onClick={() => setSelected(item)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No hay eventos para este filtro</strong>
            <span>Ajusta la búsqueda o el estado.</span>
          </div>
        )}
        <footer className="table-footer">
          <span>Datos relacionados de soporte · demostración</span>
          <span>‹ Anterior &nbsp; 1 &nbsp; Siguiente ›</span>
        </footer>
      </section>
      {selected && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <header>
              <h2>{selected.title}</h2>
              <button className="icon-button" onClick={() => setSelected(null)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <div className="detail-grid">
              <span>
                ID<strong>{selected.id}</strong>
              </span>
              <span>
                Estado<strong>{selected.status}</strong>
              </span>
              <span>
                Detalle<strong>{selected.detail}</strong>
              </span>
              <span>
                Contexto<strong>{selected.context}</strong>
              </span>
              <span>
                Responsable<strong>{selected.owner}</strong>
              </span>
            </div>
            <div className="notice">
              Vista de detalle demostrativa. El diagnóstico no ejecuta consultas ni cambia sistemas
              reales.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
