import { useEffect, type FormEvent, type ReactNode } from "react";
import { SaasIcon, type SaasIconName } from "./saas-icons";

function slugifyStatus(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export type TableActionKind = "view" | "edit" | "delete" | "configure";

const TABLE_ACTION_META: Record<TableActionKind, { icon: SaasIconName; defaultLabel: string }> = {
  view: { icon: "eye", defaultLabel: "Ver ficha" },
  edit: { icon: "edit", defaultLabel: "Editar" },
  delete: { icon: "trash", defaultLabel: "Eliminar" },
  configure: { icon: "settings", defaultLabel: "Configurar" },
};

export function TableActionIconButton({
  kind,
  label,
  onClick,
  disabled,
}: {
  kind: TableActionKind;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const meta = TABLE_ACTION_META[kind];
  const resolvedLabel = label ?? meta.defaultLabel;
  return (
    <button
      type="button"
      className={`ao-table-action-btn ao-table-action-btn--${kind}`}
      title={resolvedLabel}
      aria-label={resolvedLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <SaasIcon name={meta.icon} size={17} />
    </button>
  );
}

export function TableRowActions({
  children,
  stopPropagation = true,
}: {
  children: ReactNode;
  stopPropagation?: boolean;
}) {
  return (
    <div
      className="row-actions"
      onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = slugifyStatus(status);
  return <span className={`status status-${normalized}`}>{status}</span>;
}

export function SummaryCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon?: SaasIconName | undefined;
  tone?: "blue" | "emerald" | "amber" | "gold" | "violet" | undefined;
}) {
  return (
    <div className="panel summary-card" data-tone={tone}>
      <div className="summary-card-head">
        {icon && (
          <span className="summary-card-icon">
            <SaasIcon name={icon} size={16} />
          </span>
        )}
        <small>{label}</small>
      </div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}

export function FilterToolbar({
  searchLabel,
  placeholder,
  searchPlaceholder,
  query,
  onQueryChange,
  status,
  statuses,
  onStatusChange,
  statusFilter,
  statusOptions,
  onStatusFilterChange,
  secondaryFilter,
  onSecondaryFilterChange,
  secondaryOptions,
  secondaryAriaLabel,
  onReset,
  resetLabel,
  totalCount,
  visibleCount,
}: {
  searchLabel?: string | undefined;
  placeholder?: string | undefined;
  searchPlaceholder?: string | undefined;
  query: string;
  onQueryChange: (value: string) => void;
  status?: string | undefined;
  statuses?: string[] | undefined;
  onStatusChange?: ((value: string) => void) | undefined;
  statusFilter?: string | undefined;
  statusOptions?: string[] | undefined;
  onStatusFilterChange?: ((value: string) => void) | undefined;
  secondaryFilter?: string | undefined;
  onSecondaryFilterChange?: ((value: string) => void) | undefined;
  secondaryOptions?: string[] | undefined;
  secondaryAriaLabel?: string | undefined;
  onReset?: (() => void) | undefined;
  resetLabel?: string | undefined;
  totalCount?: number | undefined;
  visibleCount?: number | undefined;
}) {
  const currentStatus = statusFilter ?? status ?? "Todos";
  const handleStatusChange = onStatusFilterChange ?? onStatusChange ?? (() => undefined);
  const rawStatuses = statusOptions ?? statuses ?? [];
  const normalizedStatuses = rawStatuses.filter((item) => item !== "Todos");
  const hasActiveFilters =
    query.trim().length > 0 ||
    currentStatus !== "Todos" ||
    (secondaryFilter !== undefined && secondaryFilter !== "Todos");

  return (
    <div className="toolbar">
      <div className="toolbar-search">
        <SaasIcon name="search" size={15} className="toolbar-search-icon" />
        <input
          aria-label={searchLabel ?? searchPlaceholder ?? "Buscar registros"}
          placeholder={placeholder ?? searchPlaceholder ?? "Buscar..."}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="toolbar-clear"
            aria-label="Limpiar búsqueda"
            onClick={() => onQueryChange("")}
          >
            <SaasIcon name="close" size={13} />
          </button>
        )}
      </div>
      <div className="toolbar-controls">
        {secondaryOptions && onSecondaryFilterChange && (
          <select
            aria-label={secondaryAriaLabel ?? "Filtrar por tipo"}
            value={secondaryFilter ?? "Todos"}
            onChange={(event) => onSecondaryFilterChange(event.target.value)}
          >
            {secondaryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}
        <select
          aria-label="Filtrar por estado"
          value={currentStatus}
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <option value="Todos">Todos los estados</option>
          {normalizedStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            className="button-muted button-compact"
            onClick={() => {
              onQueryChange("");
              handleStatusChange("Todos");
              onSecondaryFilterChange?.("Todos");
            }}
          >
            Limpiar filtros
          </button>
        )}
        {onReset && (
          <button type="button" className="button-ghost button-compact" onClick={onReset}>
            {resetLabel ?? "Restablecer demo"}
          </button>
        )}
        {typeof visibleCount === "number" && typeof totalCount === "number" && (
          <span className="info-chip">
            {visibleCount} de {totalCount}
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  onReset,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  onReset?: (() => void) | undefined;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
}) {
  const handleClick = onAction ?? onReset;
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <SaasIcon name="search" size={20} />
      </span>
      <strong>{title}</strong>
      <span>{description}</span>
      {handleClick && (
        <button type="button" className="button-muted button-compact" onClick={handleClick}>
          {actionLabel ?? "Restablecer filtros"}
        </button>
      )}
    </div>
  );
}

export function ModalDialog({
  title,
  titleId,
  description,
  onClose,
  children,
}: {
  title: string;
  titleId?: string | undefined;
  description?: string | undefined;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            <SaasIcon name="close" size={18} />
          </button>
        </header>
        {description && <p>{description}</p>}
        {children}
      </div>
    </div>
  );
}

export function DetailDrawer({
  title,
  titleId,
  subtitle,
  items,
  notice,
  onClose,
}: {
  title: string;
  titleId?: string | undefined;
  subtitle?: string | undefined;
  items: Array<{ label: string; value: ReactNode; mono?: boolean | undefined }>;
  notice: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop drawer-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="modal detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <div>
            {subtitle && <span className="drawer-eyebrow">{subtitle}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            <SaasIcon name="close" size={18} />
          </button>
        </header>
        <div className="detail-grid">
          {items.map((item) => (
            <span key={item.label}>
              {item.label}
              <strong className={item.mono ? "mono-text" : undefined}>{item.value}</strong>
            </span>
          ))}
        </div>
        <div className="notice">{notice}</div>
      </aside>
    </div>
  );
}

export function MasterFormModal({
  sheetLabel,
  entityName,
  recordCode,
  operation,
  errorMessage,
  submitLabel = "Guardar cambios",
  onClose,
  onSubmit,
  children,
}: {
  sheetLabel: string;
  entityName: string;
  recordCode: string;
  operation: "create" | "edit";
  errorMessage?: string | undefined;
  submitLabel?: string | undefined;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const operationText = operation === "edit" ? "Edición de ficha" : "Creación de registro";

  return (
    <div
      className="modal-backdrop master-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="master-modal-window"
        role="dialog"
        aria-modal="true"
        aria-label={`${sheetLabel} · ${entityName}`}
        onSubmit={onSubmit}
      >
        <header className="master-modal-header">
          <div className="master-modal-header-main">
            <div className="master-modal-meta">
              <span className="master-modal-sheet-tag">{sheetLabel}</span>
              <span className={`master-modal-op-tag op-${operation}`}>{operationText}</span>
              <span className="code-badge">{recordCode || "NUEVO"}</span>
            </div>
            <h2 className="master-modal-title">{entityName}</h2>
          </div>
          <button
            type="button"
            className="master-modal-close"
            onClick={onClose}
            aria-label="Cerrar ventana"
          >
            <SaasIcon name="close" size={18} />
          </button>
        </header>

        <div className="master-modal-body">
          {errorMessage ? (
            <div className="master-form-error-banner" role="alert">
              <SaasIcon name="alert" size={16} />
              <span>{errorMessage}</span>
            </div>
          ) : null}
          <div className="master-form-sections">{children}</div>
        </div>

        <footer className="master-modal-footer">
          <div className="master-modal-footer-info">
            <span>Registro:</span>
            <strong>{recordCode || "Sin código"}</strong>
            <span>·</span>
            <span>{operationText}</span>
          </div>
          <div className="master-modal-footer-actions">
            <button type="button" className="button-muted" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="button-primary">
              <SaasIcon name="check" size={15} />
              {submitLabel}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

export function MasterFormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section className="master-form-group">
      <header className="master-form-group-header">
        <span className="master-form-step-badge">{step}</span>
        <div>
          <h4>{title}</h4>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      <div className="master-form-grid">{children}</div>
    </section>
  );
}
