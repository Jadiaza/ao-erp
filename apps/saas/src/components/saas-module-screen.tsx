import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  getEcosystemSection,
  type EcosystemRecord,
  type EcosystemSection,
  type EcosystemStatus,
} from "../data/ecosystem-demo";
import { getModuleRepository } from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  DetailDrawer,
  EmptyState,
  FilterToolbar,
  ModalDialog,
  StatusBadge,
  SummaryCard,
  TableActionIconButton,
  TableRowActions,
} from "./saas-ui";

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
  const [form, setForm] = useState<{
    name: string;
    detail: string;
    context: string;
    owner: string;
    status: EcosystemStatus;
  }>({
    name: "",
    detail: "",
    context: "",
    owner: "",
    status: "Borrador",
  });
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
    setForm({
      name: "",
      detail: "",
      context: "",
      owner: "Administrador SaaS",
      status: "Borrador",
    });
    setError("");
    setDialog(true);
  };

  const openEdit = (row: EcosystemRecord) => {
    setEditing(row);
    setForm({
      name: row.name,
      detail: row.detail,
      context: row.context,
      owner: row.owner,
      status: row.status,
    });
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
      owner: form.owner.trim() || "Administrador SaaS",
      status: form.status,
    };
    if (editing) persist(rows.map((row) => (row.id === editing.id ? { ...row, ...values } : row)));
    else persist([...rows, { id: `DEMO-${Date.now()}`, ...values }]);
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
        <button className="button-primary" type="button" onClick={openCreate}>
          <SaasIcon name="plus" size={16} />
          {section.createLabel}
        </button>
      </header>

      <div className="notice">
        <strong>Modo demostración.</strong> Los datos son ficticios y se guardan únicamente en el
        navegador. No se ejecutan facturación, licenciamiento ni diagnósticos reales.
      </div>

      <section className="summary-grid">
        <SummaryCard
          label="Registros visibles"
          value={visible.length}
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
          label="Atención requerida"
          value={
            rows.filter((row) => row.status === "Pendiente" || row.status === "En revisión").length
          }
          detail="Seguimiento local"
          icon="alert"
        />
        <SummaryCard label="Ecosistema" value={3} detail="ERP · SaaS · Diocesano" icon="plans" />
      </section>

      <section className="panel table-panel">
        <FilterToolbar
          searchLabel={`Buscar ${section.title}`}
          placeholder="Buscar registros..."
          query={query}
          onQueryChange={setQuery}
          status={status}
          statuses={statuses}
          onStatusChange={setStatus}
          visibleCount={visible.length}
          totalCount={rows.length}
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
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <TableRowActions stopPropagation={false}>
                        <TableActionIconButton
                          kind="view"
                          label="Ver detalle"
                          onClick={() => setSelected(row)}
                        />
                        <TableActionIconButton
                          kind="edit"
                          label="Editar"
                          onClick={() => openEdit(row)}
                        />
                        <TableActionIconButton
                          kind="delete"
                          label="Eliminar"
                          onClick={() => setDeleting(row)}
                        />
                      </TableRowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No hay registros para este filtro"
            description="Ajusta la búsqueda o limpia el estado."
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
          <span>Vista demostrativa · {visible.length} registros</span>
          <span>Página 1 de 1</span>
        </footer>
      </section>

      <div className="module-shortcuts">
        <Link to="/">
          <SaasIcon name="arrow-left" size={14} />
          Volver al dashboard
        </Link>
        <span>Los cambios no representan acciones comerciales o técnicas reales.</span>
      </div>

      {dialog && (
        <ModalDialog
          title={editing ? `Editar ${section.title.toLowerCase()}` : section.createLabel}
          description="Guarda un registro de demostración en el almacenamiento local."
          onClose={() => setDialog(false)}
        >
          <form onSubmit={submit}>
            <label>
              Nombre
              <input
                autoFocus
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Nombre o referencia principal"
              />
            </label>
            <label>
              Detalle
              <input
                value={form.detail}
                onChange={(event) => setForm({ ...form, detail: event.target.value })}
                placeholder="Descripción operativa"
              />
            </label>
            <label>
              Contexto
              <input
                value={form.context}
                onChange={(event) => setForm({ ...form, context: event.target.value })}
                placeholder="Entidad, cliente o aplicación"
              />
            </label>
            <label>
              Responsable
              <input
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                placeholder="Área o responsable asignado"
              />
            </label>
            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as EcosystemStatus })
                }
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En revisión">En revisión</option>
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
          subtitle={section.title}
          items={[
            { label: "ID", value: selected.id, mono: true },
            { label: "Estado", value: <StatusBadge status={selected.status} /> },
            { label: "Detalle", value: selected.detail },
            { label: "Contexto", value: selected.context },
            { label: "Responsable", value: selected.owner },
          ]}
          notice="Ficha demostrativa. No contiene permisos ni acceso real a instituciones."
          onClose={() => setSelected(null)}
        />
      )}

      {deleting && (
        <ModalDialog
          title="Eliminar registro"
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
