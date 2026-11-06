import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  getEcosystemSection,
  type EcosystemRecord,
  type EcosystemSection,
} from "../data/ecosystem-demo";
import { getModuleRepository } from "../data/saas-repository";

export function SaasModuleScreen({ path }: { path: string }) {
  const section = getEcosystemSection(path) as EcosystemSection;
  const [repository] = useState(() => getModuleRepository(path));
  const [rows, setRows] = useState<EcosystemRecord[]>(() => repository.list());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [editing, setEditing] = useState<EcosystemRecord | null>(null);
  const [selected, setSelected] = useState<EcosystemRecord | null>(null);
  const [deleting, setDeleting] = useState<EcosystemRecord | null>(null);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ name: "", detail: "", context: "" });
  const [error, setError] = useState("");
  const statuses = [...new Set(rows.map((row) => row.status))];
  useEffect(() => {
    const sync = () => setRows(repository.list());
    sync();
    return repository.subscribe(sync);
  }, [repository]);
  const persist = (next: EcosystemRecord[]) => {
    repository.replace(next);
  };
  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          `${row.id} ${row.name} ${row.detail} ${row.context} ${row.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "Todos" || row.status === status),
      ),
    [rows, query, status],
  );
  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", detail: "", context: "" });
    setError("");
    setDialog(true);
  };
  const openEdit = (row: EcosystemRecord) => {
    setEditing(row);
    setForm({ name: row.name, detail: row.detail, context: row.context });
    setError("");
    setDialog(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 3) return setError("Ingresa un nombre válido.");
    if (form.detail.trim().length < 3) return setError("Agrega una descripción breve.");
    const values = {
      name: form.name.trim(),
      detail: form.detail.trim(),
      context: form.context.trim() || "A&O Technologies",
    };
    if (editing) persist(rows.map((row) => (row.id === editing.id ? { ...row, ...values } : row)));
    else
      persist([
        ...rows,
        { id: `DEMO-${Date.now()}`, ...values, status: "Borrador", owner: "Administrador SaaS" },
      ]);
    setDialog(false);
  };
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A&amp;O SaaS / {section.group}</p>
          <h1>{section.title}</h1>
          <p>{section.description}</p>
        </div>
        <button className="button-primary" onClick={openCreate}>
          + {section.createLabel}
        </button>
      </header>
      <div className="notice">
        <strong>Modo demostración.</strong> Los datos son ficticios y se guardan únicamente en el
        navegador. No se ejecutan facturación, licenciamiento ni diagnósticos reales.
      </div>
      <section className="summary-grid">
        <div className="panel summary-card">
          <small>Registros visibles</small>
          <strong>{visible.length}</strong>
          <span>De {rows.length} demostrativos</span>
        </div>
        <div className="panel summary-card">
          <small>Activos</small>
          <strong>{rows.filter((row) => row.status === "Activo").length}</strong>
          <span>Estado operativo de muestra</span>
        </div>
        <div className="panel summary-card">
          <small>Atención requerida</small>
          <strong>
            {
              rows.filter((row) => row.status === "Pendiente" || row.status === "En revisión")
                .length
            }
          </strong>
          <span>Seguimiento local</span>
        </div>
        <div className="panel summary-card">
          <small>Aplicación</small>
          <strong>3</strong>
          <span>ERP · SaaS · Diocesano</span>
        </div>
      </section>
      <section className="panel table-panel">
        <div className="toolbar">
          <input
            aria-label={`Buscar ${section.title}`}
            placeholder="Buscar registros..."
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
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                      <small>{row.id}</small>
                    </td>
                    <td>{row.detail}</td>
                    <td>{row.context}</td>
                    <td>{row.owner}</td>
                    <td>
                      <span
                        className={`status status-${row.status.toLowerCase().replace(" ", "-")}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="link-button" onClick={() => setSelected(row)}>
                          Ver
                        </button>
                        <button className="link-button" onClick={() => openEdit(row)}>
                          Editar
                        </button>
                        <button
                          className="link-button danger-link"
                          onClick={() => setDeleting(row)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No hay registros para este filtro</strong>
            <span>Ajusta la búsqueda o limpia el estado.</span>
          </div>
        )}
        <footer className="table-footer">
          <span>Vista demostrativa · {visible.length} registros</span>
          <span>‹ Anterior &nbsp; 1 &nbsp; Siguiente ›</span>
        </footer>
      </section>
      <div className="module-shortcuts">
        <Link to="/">← Volver al dashboard</Link>
        <span>Los cambios no representan acciones comerciales o técnicas reales.</span>
      </div>
      {dialog && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <header>
              <h2>{editing ? `Editar ${section.title.toLowerCase()}` : section.createLabel}</h2>
              <button className="icon-button" onClick={() => setDialog(false)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <p>Guarda un registro de demostración en el almacenamiento local.</p>
            <form onSubmit={submit}>
              <label>
                Nombre
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label>
                Detalle
                <input
                  value={form.detail}
                  onChange={(event) => setForm({ ...form, detail: event.target.value })}
                />
              </label>
              <label>
                Contexto
                <input
                  value={form.context}
                  onChange={(event) => setForm({ ...form, context: event.target.value })}
                />
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
                <button className="button-primary">
                  {editing ? "Guardar cambios" : "Crear registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <header>
              <h2>{selected.name}</h2>
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
              Ficha demostrativa. No contiene permisos ni acceso real a instituciones.
            </div>
          </div>
        </div>
      )}
      {deleting && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Eliminar registro</h2>
            <p>¿Eliminar “{deleting.name}” de esta demostración?</p>
            <div className="modal-actions">
              <button className="button-muted" onClick={() => setDeleting(null)}>
                Cancelar
              </button>
              <button
                className="button-primary danger-button"
                onClick={() => {
                  persist(rows.filter((row) => row.id !== deleting.id));
                  setDeleting(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
