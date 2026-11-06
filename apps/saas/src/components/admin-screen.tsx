import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Organization, SaaSRecord } from "../data/demo";

type Row = Organization | SaaSRecord;
type ScreenProps = {
  title: string;
  description: string;
  eyebrow?: string;
  storageKey: string;
  rows: Row[];
  columns: string[];
  createLabel: string;
  empty: string;
};

function detailOf(row: Row) {
  return "detail" in row ? row.detail : row.type;
}
function contextOf(row: Row) {
  return "organization" in row
    ? row.organization
    : "contact" in row
      ? row.contact
      : (row.owner ?? "—");
}

export function AdminScreen({
  title,
  description,
  eyebrow = "A&O SaaS / Consola del operador",
  storageKey,
  rows: initialRows,
  columns,
  createLabel,
  empty,
}: ScreenProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [selected, setSelected] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [dialog, setDialog] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setRows(JSON.parse(saved) as Row[]);
    } catch {
      /* Usa fixtures si el navegador bloquea el almacenamiento. */
    }
  }, [storageKey]);
  const persist = (next: Row[]) => {
    setRows(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* El estado permanece en memoria durante esta sesión. */
    }
  };
  const openCreate = () => {
    setEditing(null);
    setName("");
    setDetail("");
    setError("");
    setDialog(true);
  };
  const openEdit = (row: Row) => {
    setEditing(row);
    setName(row.name);
    setDetail(detailOf(row));
    setError("");
    setDialog(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanDetail = detail.trim();
    if (cleanName.length < 2) {
      setError("Escribe un nombre de referencia.");
      return;
    }
    if (cleanDetail.length < 3) {
      setError("Agrega una descripción breve.");
      return;
    }
    if (editing) {
      persist(
        rows.map((row) =>
          row.id === editing.id
            ? {
                ...row,
                name: cleanName,
                ...("detail" in row ? { detail: cleanDetail } : { type: cleanDetail }),
              }
            : row,
        ),
      );
    } else {
      const template = rows[0];
      const created =
        template && "contact" in template
          ? {
              id: `ORG-DEMO-${Date.now()}`,
              name: cleanName,
              type: "Organización demo",
              contact: "pendiente@example.test",
              plan: "Pendiente de asignación",
              status: "Borrador" as const,
              institutions: 0,
              users: 0,
            }
          : {
              id: `DEMO-${Date.now()}`,
              name: cleanName,
              detail: cleanDetail,
              status: "Borrador" as const,
            };
      persist([...rows, created]);
    }
    setDialog(false);
  };
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          `${row.name} ${row.id} ${detailOf(row)} ${contextOf(row)}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "Todos" || row.status === status),
      ),
    [rows, query, status],
  );
  const statuses = [...new Set(rows.map((row) => row.status))];
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="button-primary" onClick={openCreate}>
          + {createLabel}
        </button>
      </header>
      <section className="summary-grid">
        <div className="panel summary-card">
          <small>Registros visibles</small>
          <strong>{filtered.length}</strong>
          <span>De {rows.length} demostrativos</span>
        </div>
        <div className="panel summary-card">
          <small>Activos</small>
          <strong>{rows.filter((row) => row.status === "Activo").length}</strong>
          <span>Estado operativo de muestra</span>
        </div>
        <div className="panel summary-card">
          <small>Requieren atención</small>
          <strong>
            {rows.filter((row) => row.status === "Pendiente" || row.status === "Borrador").length}
          </strong>
          <span>Estado local</span>
        </div>
      </section>
      <section className="panel table-panel">
        <div className="toolbar">
          <input
            aria-label={`Buscar ${title}`}
            placeholder={`Buscar en ${title.toLowerCase()}...`}
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
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                      <small>{row.id}</small>
                    </td>
                    <td>{detailOf(row)}</td>
                    <td>{contextOf(row)}</td>
                    <td>
                      <span className={`status status-${row.status.toLowerCase()}`}>
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
            <strong>{empty}</strong>
            <span>Ajusta la búsqueda o limpia el filtro para continuar.</span>
          </div>
        )}
        <footer className="table-footer">
          <span>Vista demostrativa · {filtered.length} registros</span>
          <span>‹ Anterior &nbsp; 1 &nbsp; Siguiente ›</span>
        </footer>
      </section>
      {dialog && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <header>
              <h2 id="create-title">{editing ? `Editar ${title.toLowerCase()}` : createLabel}</h2>
              <button className="icon-button" onClick={() => setDialog(false)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <p>
              Los cambios se guardan únicamente en el almacenamiento local de esta demostración.
            </p>
            <form onSubmit={submit}>
              <label>
                Nombre de referencia
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre de demostración"
                />
              </label>
              <label>
                Descripción o referencia
                <input
                  required
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="Descripción breve"
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
                <button className="button-primary" type="submit">
                  {editing ? "Guardar cambios" : "Crear registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selected && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <header>
              <h2 id="detail-title">{selected.name}</h2>
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
                Detalle<strong>{detailOf(selected)}</strong>
              </span>
              <span>
                Contexto<strong>{contextOf(selected)}</strong>
              </span>
            </div>
            <div className="notice">
              Registro ficticio administrado localmente. No representa una organización ni un
              permiso válido en servidor.
            </div>
          </div>
        </div>
      )}
      {deleting && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 id="delete-title">Eliminar registro</h2>
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
