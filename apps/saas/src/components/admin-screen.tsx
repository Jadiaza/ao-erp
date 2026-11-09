import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Organization, SaaSRecord } from "../data/demo";
import type { EntityCollectionKey, EntityRepository } from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  DetailDrawer,
  EmptyState,
  FilterToolbar,
  ModalDialog,
  StatusBadge,
  SummaryCard,
} from "./saas-ui";

type Row = Organization | SaaSRecord;
export type AdminRepository = EntityRepository<EntityCollectionKey>;
type ScreenProps = {
  title: string;
  description: string;
  eyebrow?: string;
  storageKey: string;
  rows: Row[];
  columns: string[];
  createLabel: string;
  empty: string;
  repository?: AdminRepository;
};

function detailOf(row: Row) {
  return "detail" in row ? row.detail : row.type;
}

function contextOf(row: Row) {
  return "organization" in row && row.organization
    ? row.organization
    : "contact" in row
      ? row.contact
      : "plan" in row && row.plan
        ? row.plan
        : "role" in row && row.role
          ? row.role
          : (row.owner ?? "—");
}

export function AdminScreen({
  title,
  description,
  eyebrow = "A&O SaaS / Consola del operador",
  rows: initialRows,
  columns,
  createLabel,
  empty,
  repository,
}: ScreenProps) {
  const [localRows, setLocalRows] = useState<Row[]>(initialRows);
  const [repositoryRows, setRepositoryRows] = useState<Row[]>(() =>
    repository ? (repository.list() as Row[]) : initialRows,
  );

  useEffect(() => {
    if (!repository) return;
    const sync = () => setRepositoryRows(repository.list() as Row[]);
    sync();
    return repository.subscribe(sync);
  }, [repository]);

  const rows = repository ? repositoryRows : localRows;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [selected, setSelected] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [dialog, setDialog] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [contextValue, setContextValue] = useState("");
  const [recordStatus, setRecordStatus] = useState<Row["status"]>("Activo");
  const [error, setError] = useState("");

  const persist = (next: Row[]) => {
    if (repository) repository.replace(next as never);
    else setLocalRows(next);
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDetail("");
    setContextValue("");
    setRecordStatus("Borrador");
    setError("");
    setDialog(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setName(row.name);
    setDetail(detailOf(row));
    setContextValue(contextOf(row) === "—" ? "" : contextOf(row));
    setRecordStatus(row.status);
    setError("");
    setDialog(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanDetail = detail.trim();
    const cleanContext = contextValue.trim();

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
                status: recordStatus,
                ...("detail" in row ? { detail: cleanDetail } : { type: cleanDetail }),
                ...("contact" in row
                  ? { contact: cleanContext || row.contact }
                  : { owner: cleanContext || "A&O SaaS" }),
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
              type: cleanDetail,
              contact: cleanContext || "pendiente@example.test",
              plan: "Pendiente de asignación",
              status: recordStatus,
              institutions: 0,
              users: 0,
            }
          : {
              id: `DEMO-${Date.now()}`,
              name: cleanName,
              detail: cleanDetail,
              owner: cleanContext || "Administrador SaaS",
              status: recordStatus,
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
        <button className="button-primary" type="button" onClick={openCreate}>
          <SaasIcon name="plus" size={16} />
          {createLabel}
        </button>
      </header>

      <section className="summary-grid summary-grid-3">
        <SummaryCard
          label="Registros visibles"
          value={filtered.length}
          detail={`De ${rows.length} demostrativos`}
          icon="filter"
        />
        <SummaryCard
          label="Activos"
          value={rows.filter((row) => row.status === "Activo").length}
          detail="Estado operativo de muestra"
          icon="check"
        />
        <SummaryCard
          label="Requieren atención"
          value={
            rows.filter((row) => row.status === "Pendiente" || row.status === "Borrador").length
          }
          detail="Estado local"
          icon="alert"
        />
      </section>

      <section className="panel table-panel">
        <FilterToolbar
          searchLabel={`Buscar ${title}`}
          placeholder={`Buscar en ${title.toLowerCase()}...`}
          query={query}
          onQueryChange={setQuery}
          status={status}
          statuses={statuses}
          onStatusChange={setStatus}
          visibleCount={filtered.length}
          totalCount={rows.length}
        />

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
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setSelected(row)}
                        >
                          <SaasIcon name="eye" size={14} />
                          Ver
                        </button>
                        <button type="button" className="link-button" onClick={() => openEdit(row)}>
                          <SaasIcon name="edit" size={14} />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="link-button danger-link"
                          onClick={() => setDeleting(row)}
                        >
                          <SaasIcon name="trash" size={14} />
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
          <EmptyState
            title={empty}
            description="Ajusta la búsqueda o limpia el filtro para continuar."
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
          <span>Vista demostrativa · {filtered.length} registros</span>
          <span>Página 1 de 1</span>
        </footer>
      </section>

      {dialog && (
        <ModalDialog
          title={editing ? `Editar ${title.toLowerCase()}` : createLabel}
          titleId="create-title"
          description="Los cambios se guardan únicamente en el almacenamiento local de esta demostración."
          onClose={() => setDialog(false)}
        >
          <form onSubmit={submit}>
            <label>
              {columns[0] ?? "Nombre de referencia"}
              <input
                autoFocus
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre de demostración"
              />
            </label>
            <label>
              {columns[1] ?? "Descripción o referencia"}
              <input
                required
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Descripción breve"
              />
            </label>
            <label>
              {columns[2] ?? "Contexto o responsable"}
              <input
                value={contextValue}
                onChange={(event) => setContextValue(event.target.value)}
                placeholder="Organización, contacto o alcance"
              />
            </label>
            <label>
              Estado operativo
              <select
                value={recordStatus}
                onChange={(event) => setRecordStatus(event.target.value as Row["status"])}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Borrador">Borrador</option>
                <option value="Suspendido">Suspendido</option>
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
                {editing ? "Guardar cambios" : "Crear registro"}
              </button>
            </div>
          </form>
        </ModalDialog>
      )}

      {selected && (
        <DetailDrawer
          title={selected.name}
          titleId="detail-title"
          subtitle={title}
          items={[
            { label: "ID", value: selected.id, mono: true },
            { label: "Estado", value: <StatusBadge status={selected.status} /> },
            { label: columns[1] ?? "Detalle", value: detailOf(selected) },
            { label: columns[2] ?? "Contexto", value: contextOf(selected) },
          ]}
          notice="Registro ficticio administrado localmente. No representa una organización ni un permiso válido en servidor."
          onClose={() => setSelected(null)}
        />
      )}

      {deleting && (
        <ModalDialog
          title="Eliminar registro"
          titleId="delete-title"
          description={`¿Eliminar “${deleting.name}” de esta demostración?`}
          onClose={() => setDeleting(null)}
        >
          <div className="modal-actions">
            <button type="button" className="button-muted" onClick={() => setDeleting(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="button-primary danger-button"
              onClick={() => {
                persist(rows.filter((row) => row.id !== deleting.id));
                setDeleting(null);
              }}
            >
              Eliminar
            </button>
          </div>
        </ModalDialog>
      )}
    </div>
  );
}
