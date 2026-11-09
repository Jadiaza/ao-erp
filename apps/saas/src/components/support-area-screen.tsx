import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { supportAreaConfig, type SupportArea, type SupportRecord } from "../data/support-demo";
import { getSupportRepository, useSupportRows } from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  DetailDrawer,
  EmptyState,
  FilterToolbar,
  ModalDialog,
  StatusBadge,
  SummaryCard,
} from "./saas-ui";

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
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    detail: string;
    context: string;
    owner: string;
    status: SupportRecord["status"];
  }>({
    title: "",
    detail: "",
    context: "",
    owner: "Mesa de ayuda",
    status: "Abierto",
  });
  const [error, setError] = useState("");

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

  const openCreate = () => {
    setForm({
      title: "",
      detail: "",
      context: "Centro de soporte",
      owner: "Administrador SaaS",
      status: "Abierto",
    });
    setError("");
    setDialog(true);
  };

  const submitCreate = (event: FormEvent) => {
    event.preventDefault();
    if (form.title.trim().length < 3) {
      setError("Ingresa un asunto o título descriptivo.");
      return;
    }
    if (form.detail.trim().length < 3) {
      setError("Agrega un detalle técnico o descripción.");
      return;
    }
    repository.create({
      id: `SUP-${Date.now()}`,
      title: form.title.trim(),
      detail: form.detail.trim(),
      context: form.context.trim() || "Centro de soporte",
      status: form.status,
      owner: form.owner.trim() || "Administrador SaaS",
    });
    setDialog(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A&amp;O SaaS / Centro de soporte</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <button className="button-primary" type="button" onClick={openCreate}>
          <SaasIcon name="plus" size={16} />
          {config.createLabel}
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
        <SummaryCard
          label="Registros"
          value={visible.length}
          detail="Vista filtrada"
          icon="support"
        />
        <SummaryCard
          label="En atención"
          value={
            records.filter((item) => item.status === "En diagnóstico" || item.status === "Abierto")
              .length
          }
          detail="Seguimiento demo"
          icon="activity"
        />
        <SummaryCard label="SLA" value="92%" detail="Indicador sintético" icon="check" />
        <SummaryCard label="Aplicaciones" value={3} detail="ERP · SaaS · Diocesano" icon="plans" />
      </section>

      <section className="panel table-panel">
        <FilterToolbar
          searchLabel={`Buscar ${config.title}`}
          placeholder="Buscar en soporte..."
          query={query}
          onQueryChange={setQuery}
          status={status}
          statuses={statuses}
          onStatusChange={setStatus}
          visibleCount={visible.length}
          totalCount={records.length}
        />

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
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setSelected(item)}
                      >
                        <SaasIcon name="eye" size={14} />
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No hay eventos para este filtro"
            description="Ajusta la búsqueda o el estado."
            onReset={
              query || status !== "Todos"
                ? () => {
                    setQuery("");
                    setStatus("Todos");
                  }
                : undefined
            }
          />
        )}

        <footer className="table-footer">
          <span>Datos relacionados de soporte · demostración</span>
          <span>Página 1 de 1</span>
        </footer>
      </section>

      {dialog && (
        <ModalDialog
          title={config.createLabel}
          description="Registra un caso o evento demostrativo en el almacenamiento local."
          onClose={() => setDialog(false)}
        >
          <form onSubmit={submitCreate}>
            <label>
              Asunto o referencia
              <input
                autoFocus
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Ej. Revisión de conectividad o incidencia"
              />
            </label>
            <label>
              Detalle técnico
              <input
                required
                value={form.detail}
                onChange={(event) => setForm({ ...form, detail: event.target.value })}
                placeholder="Prioridad, código SQLSTATE o resumen"
              />
            </label>
            <label>
              Contexto / Institución
              <input
                value={form.context}
                onChange={(event) => setForm({ ...form, context: event.target.value })}
                placeholder="Aplicación o institución relacionada"
              />
            </label>
            <label>
              Responsable
              <input
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                placeholder="Especialista o área asignada"
              />
            </label>
            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as SupportRecord["status"],
                  })
                }
              >
                <option value="Abierto">Abierto</option>
                <option value="En diagnóstico">En diagnóstico</option>
                <option value="En espera">En espera</option>
                <option value="Programado">Programado</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Demostrativo">Demostrativo</option>
              </select>
            </label>
            {error && (
              <span className="form-error" role="alert">
                {error}
              </span>
            )}
            <div className="modal-actions">
              <button type="button" className="button-muted" onClick={() => setDialog(false)}>
                Cancelar
              </button>
              <button className="button-primary" type="submit">
                Registrar en soporte
              </button>
            </div>
          </form>
        </ModalDialog>
      )}

      {selected && (
        <DetailDrawer
          title={selected.title}
          subtitle={config.title}
          items={[
            { label: "ID", value: selected.id, mono: true },
            { label: "Estado", value: <StatusBadge status={selected.status} /> },
            { label: "Detalle", value: selected.detail },
            { label: "Contexto", value: selected.context },
            { label: "Responsable", value: selected.owner },
          ]}
          notice="Vista de detalle demostrativa. El diagnóstico no ejecuta consultas ni cambia sistemas reales."
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
