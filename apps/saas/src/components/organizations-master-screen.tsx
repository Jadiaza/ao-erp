import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import type { DemoStatus } from "../data/demo";
import { IDENTIFICATION_TYPES, ORGANIZATION_TYPES, type Organization } from "../data/saas-domain";
import { repositories, saasStore, useRepositoryRows } from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  EmptyState,
  FilterToolbar,
  MasterFormModal,
  MasterFormSection,
  ModalDialog,
  SummaryCard,
  StatusBadge,
  TableActionIconButton,
  TableRowActions,
} from "./saas-ui";

type OrganizationTab =
  | "all"
  | "general"
  | "identificacion"
  | "ubicacion"
  | "responsables"
  | "relaciones"
  | "administracion";

type OrganizationDraft = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  legalNature: string;
  status: DemoStatus;
  idType: string;
  idNumber: string;
  taxId: string;
  legalRegistry: string;
  country: string;
  department: string;
  municipality: string;
  address: string;
  postalCode: string;
  adminManager: string;
  financeManager: string;
  techManager: string;
  contact: string;
  clientId: string;
  parentOrganizationId: string;
  registeredAt: string;
  operationalStatus: string;
  plan: string;
  contractedServicesText: string;
};

const emptyOrganizationDraft = (
  nextNumber: number,
  defaultClientId: string,
): OrganizationDraft => ({
  id: `ORG-${String(nextNumber).padStart(3, "0")}`,
  name: "",
  shortName: "",
  type: "Diócesis",
  legalNature: "Persona jurídica canónica pública",
  status: "Activo",
  idType: "NIT",
  idNumber: "",
  taxId: "",
  legalRegistry: "",
  country: "Colombia",
  department: "",
  municipality: "",
  address: "",
  postalCode: "",
  adminManager: "",
  financeManager: "",
  techManager: "",
  contact: "",
  clientId: defaultClientId,
  parentOrganizationId: "",
  registeredAt: "2026-11-09",
  operationalStatus: "En operación",
  plan: "Institucional",
  contractedServicesText: "A&O ERP, Gestión Documental, Finanzas y Recursos",
});

function draftFromOrganization(org: Organization): OrganizationDraft {
  return {
    id: org.id,
    name: org.name,
    shortName: org.shortName ?? "",
    type: org.type,
    legalNature: org.legalNature ?? "",
    status: org.status,
    idType: org.idType ?? "NIT",
    idNumber: org.idNumber ?? "",
    taxId: org.taxId ?? "",
    legalRegistry: org.legalRegistry ?? "",
    country: org.country ?? "Colombia",
    department: org.department ?? "",
    municipality: org.municipality ?? "",
    address: org.address ?? "",
    postalCode: org.postalCode ?? "",
    adminManager: org.adminManager ?? "",
    financeManager: org.financeManager ?? "",
    techManager: org.techManager ?? "",
    contact: org.contact,
    clientId: org.clientId,
    parentOrganizationId: org.parentOrganizationId ?? "",
    registeredAt: org.registeredAt ?? org.createdAt.slice(0, 10),
    operationalStatus: org.operationalStatus ?? "En operación",
    plan: org.plan,
    contractedServicesText: (org.contractedServices ?? ["A&O ERP"]).join(", "),
  };
}

export function OrganizationsMasterScreen() {
  const organizations = useRepositoryRows(repositories.organizations);
  const clients = useRepositoryRows(repositories.clients);
  const institutions = useRepositoryRows(repositories.institutions);
  const licenses = useRepositoryRows(repositories.licenses);
  const subscriptions = useRepositoryRows(repositories.subscriptions);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(organizations[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<OrganizationTab>("all");
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<OrganizationDraft>(() =>
    emptyOrganizationDraft(organizations.length + 1, clients[0]?.id ?? "CLI-001"),
  );
  const [formError, setFormError] = useState("");

  const filtered = organizations.filter((org) => {
    const matchesStatus = statusFilter === "Todos" || org.status === statusFilter;
    const matchesType = typeFilter === "Todos" || org.type === typeFilter;
    const clientName = clients.find((c) => c.id === org.clientId)?.name ?? "";
    const searchable = [
      org.id,
      org.name,
      org.shortName,
      org.type,
      org.taxId,
      org.idNumber,
      org.municipality,
      org.contact,
      org.adminManager,
      clientName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && matchesType && searchable.includes(query.trim().toLowerCase());
  });

  const selectedOrg =
    filtered.find((item) => item.id === selectedId) ??
    organizations.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null;

  const activeOrgs = organizations.filter((item) => item.status === "Activo").length;
  const totalCoveredInstitutions = organizations.reduce((sum, item) => sum + item.institutions, 0);

  const openCreate = () => {
    setEditingOrg(null);
    setDraft(emptyOrganizationDraft(organizations.length + 1, clients[0]?.id ?? "CLI-001"));
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    setDraft(draftFromOrganization(org));
    setFormError("");
    setModalOpen(true);
  };

  const saveOrganization = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.id.trim() || !draft.name.trim() || !draft.contact.trim()) {
      setFormError(
        "Completa el código, el nombre oficial y el contacto principal de la organización.",
      );
      return;
    }
    const duplicate = organizations.some(
      (item) =>
        item.id.toLowerCase() === draft.id.trim().toLowerCase() && item.id !== editingOrg?.id,
    );
    if (duplicate) {
      setFormError("Ya existe una organización con ese código identificador.");
      return;
    }

    const now = new Date().toISOString();
    const linkedInstitutions = institutions
      .filter((inst) => inst.organizationId === draft.id.trim())
      .map((inst) => inst.id);
    const services = draft.contractedServicesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload: Organization = {
      id: draft.id.trim(),
      name: draft.name.trim(),
      shortName: draft.shortName.trim() || draft.name.trim(),
      type: draft.type,
      legalNature: draft.legalNature.trim(),
      status: draft.status,
      idType: draft.idType,
      idNumber: draft.idNumber.trim(),
      taxId: draft.taxId.trim() || draft.idNumber.trim(),
      legalRegistry: draft.legalRegistry.trim(),
      country: draft.country.trim() || "Colombia",
      department: draft.department.trim(),
      municipality: draft.municipality.trim(),
      address: draft.address.trim(),
      postalCode: draft.postalCode.trim(),
      adminManager: draft.adminManager.trim(),
      financeManager: draft.financeManager.trim(),
      techManager: draft.techManager.trim(),
      contact: draft.contact.trim(),
      clientId: draft.clientId || (clients[0]?.id ?? "CLI-001"),
      parentOrganizationId: draft.parentOrganizationId || undefined,
      dependentOrganizationIds: editingOrg?.dependentOrganizationIds ?? [],
      institutionIds: editingOrg?.institutionIds ?? linkedInstitutions,
      userIds: editingOrg?.userIds ?? [],
      registeredAt: draft.registeredAt.trim(),
      operationalStatus: draft.operationalStatus.trim(),
      contractedServices: services.length > 0 ? services : ["A&O ERP"],
      licenseIds: editingOrg?.licenseIds ?? [],
      plan: draft.plan,
      institutions: editingOrg?.institutions ?? Math.max(linkedInstitutions.length, 1),
      users: editingOrg?.users ?? 5,
      createdAt: editingOrg?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingOrg) {
      repositories.organizations.update(editingOrg.id, payload);
    } else {
      repositories.organizations.create(payload);
    }
    setSelectedId(payload.id);
    setModalOpen(false);
  };

  const removeOrganization = (id: string) => {
    repositories.organizations.delete(id);
    if (selectedId === id) {
      setSelectedId(repositories.organizations.list()[0]?.id ?? null);
    }
  };

  const associatedClient = selectedOrg
    ? clients.find((client) => client.id === selectedOrg.clientId)
    : undefined;
  const parentOrg = selectedOrg?.parentOrganizationId
    ? organizations.find((org) => org.id === selectedOrg.parentOrganizationId)
    : undefined;
  const dependentOrgs = selectedOrg
    ? organizations.filter((org) => org.parentOrganizationId === selectedOrg.id)
    : [];
  const relatedInstitutions = selectedOrg
    ? institutions.filter(
        (inst) =>
          inst.organizationId === selectedOrg.id || selectedOrg.institutionIds.includes(inst.id),
      )
    : [];
  const relatedLicenses = selectedOrg
    ? licenses.filter((lic) => {
        const sub = subscriptions.find((s) => s.id === lic.subscriptionId);
        return (
          sub?.clientId === selectedOrg.clientId ||
          relatedInstitutions.some((inst) => inst.id === lic.institutionId) ||
          (selectedOrg.licenseIds ?? []).includes(lic.id)
        );
      })
    : [];

  const typeFilterOptions = Array.from(
    new Set(["Todos", ...ORGANIZATION_TYPES, ...organizations.map((o) => o.type)]),
  );

  return (
    <section aria-label="Ficha maestra de organizaciones">
      <div className="page-header">
        <div>
          <div className="eyebrow">Gobierno Institucional y Multi-Tenant · Ficha Maestra</div>
          <h1 className="page-title">Organizaciones</h1>
          <p className="page-description">
            Unidades administrativas que operan A&O ERP (diócesis, arquidiócesis, congregaciones,
            fundaciones y parroquias autónomas), vinculadas a un cliente comercial y a sus
            instituciones.
          </p>
        </div>
        <button className="button-primary" type="button" onClick={openCreate}>
          <SaasIcon name="plus" size={16} />
          Nueva organización
        </button>
      </div>

      <div className="summary-grid" aria-label="Indicadores de organizaciones">
        <SummaryCard
          label="Organizaciones registradas"
          value={organizations.length}
          detail="Tenants administrativos configurados en A&O"
          icon="building"
        />
        <SummaryCard
          label="Organizaciones activas"
          value={activeOrgs}
          detail={`${organizations.length - activeOrgs} en implementación o pendientes`}
          icon="check"
          tone="emerald"
        />
        <SummaryCard
          label="Instituciones vinculadas"
          value={institutions.length}
          detail={`${totalCoveredInstitutions} sedes proyectadas en planes`}
          icon="landmark"
        />
        <SummaryCard
          label="Tipos organizacionales"
          value={ORGANIZATION_TYPES.length}
          detail="Catálogo eclesial y jurídico configurable"
          icon="layers"
          tone="amber"
        />
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por nombre oficial, abreviado, NIT, tipo, municipio o responsable..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", "Activo", "Pendiente", "Suspendido"]}
          secondaryFilter={typeFilter}
          onSecondaryFilterChange={setTypeFilter}
          secondaryOptions={typeFilterOptions}
          secondaryAriaLabel="Filtrar por tipo de organización"
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer demo"
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No se encontraron organizaciones"
            description="Cambia los criterios de búsqueda o registra una nueva organización administrativa."
            actionLabel="Limpiar filtros"
            onAction={() => {
              setQuery("");
              setStatusFilter("Todos");
              setTypeFilter("Todos");
            }}
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organización</th>
                  <th>Tipo y naturaleza</th>
                  <th>Identificación y ubicación</th>
                  <th>Cliente e instituciones</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => {
                  const client = clients.find((c) => c.id === org.clientId);
                  const instCount = institutions.filter((i) => i.organizationId === org.id).length;
                  const isSelected = selectedOrg?.id === org.id;

                  return (
                    <tr
                      key={org.id}
                      onClick={() => setSelectedId(org.id)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--blue-50)" : undefined,
                      }}
                    >
                      <td>
                        <strong className="row-title">{org.name}</strong>
                        <span className="row-sub">
                          {org.id} · {org.shortName ?? org.name}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{org.type}</strong>
                        <span className="row-sub">{org.legalNature ?? `Plan ${org.plan}`}</span>
                      </td>
                      <td>
                        <strong className="row-title">
                          {org.idType ?? "NIT"} {org.taxId ?? org.idNumber ?? "S/I"}
                        </strong>
                        <span className="row-sub">
                          {[org.municipality, org.department, org.country]
                            .filter(Boolean)
                            .join(", ") || "Colombia"}
                        </span>
                      </td>
                      <td>
                        <span className="row-title">Cliente: {client?.name ?? org.clientId}</span>
                        <span className="row-sub">
                          {instCount} inst. vinculada(s) · Contacto: {org.contact}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={org.status} />
                      </td>
                      <td>
                        <TableRowActions>
                          <TableActionIconButton
                            kind="view"
                            label="Ver ficha"
                            onClick={() => setSelectedId(org.id)}
                          />
                          <TableActionIconButton
                            kind="edit"
                            label="Editar"
                            onClick={() => openEdit(org)}
                          />
                          <TableActionIconButton
                            kind="delete"
                            label="Eliminar"
                            onClick={() => setDeletingOrg(org)}
                          />
                        </TableRowActions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <span>
            Mostrando {filtered.length} de {organizations.length} organizaciones (Datos
            demostrativos locales)
          </span>
          <span>
            Selecciona una organización para inspeccionar su Ficha Maestra completa (Secciones A–F)
          </span>
        </div>
      </div>

      {selectedOrg && (
        <article className="master-sheet" aria-label={`Ficha maestra de ${selectedOrg.name}`}>
          <header className="master-sheet-header">
            <div className="master-sheet-identity">
              <div className="master-sheet-badges">
                <span className="code-badge">{selectedOrg.id}</span>
                <span className="code-badge">{selectedOrg.type}</span>
                <span className="code-badge">Plan {selectedOrg.plan}</span>
                <StatusBadge status={selectedOrg.status} />
              </div>
              <h2 className="master-sheet-title">{selectedOrg.name}</h2>
              <p className="master-sheet-subtitle">
                Nombre abreviado: <strong>{selectedOrg.shortName ?? selectedOrg.name}</strong> ·{" "}
                {selectedOrg.idType ?? "NIT"}{" "}
                {selectedOrg.taxId ?? selectedOrg.idNumber ?? "Pendiente"} · Cliente titular:{" "}
                <strong>{associatedClient?.name ?? selectedOrg.clientId}</strong>
              </p>
            </div>
            <div className="master-sheet-actions">
              <Link to="/instituciones" className="button-ghost">
                <SaasIcon name="landmark" size={15} />
                Ver instituciones ({relatedInstitutions.length})
              </Link>
              <button
                className="button-primary"
                type="button"
                onClick={() => openEdit(selectedOrg)}
              >
                <SaasIcon name="settings" size={15} />
                Editar ficha maestra
              </button>
            </div>
          </header>

          <div className="master-summary-strip">
            <div className="master-summary-item">
              <span>Naturaleza y Registro</span>
              <strong>{selectedOrg.type}</strong>
              <small>{selectedOrg.legalNature || "Unidad administrativa eclesial"}</small>
            </div>
            <div className="master-summary-item">
              <span>Cliente Comercial Asociado</span>
              <strong>{associatedClient?.name ?? selectedOrg.clientId}</strong>
              <small>Código titular: {selectedOrg.clientId}</small>
            </div>
            <div className="master-summary-item">
              <span>Alcance Institucional</span>
              <strong>
                {relatedInstitutions.length} registrada(s) · {selectedOrg.institutions} en plan
              </strong>
              <small>{selectedOrg.users} usuarios habilitados</small>
            </div>
            <div className="master-summary-item">
              <span>Estado Operativo</span>
              <strong>{selectedOrg.operationalStatus || "En operación"}</strong>
              <small>
                Registro: {selectedOrg.registeredAt || selectedOrg.createdAt.slice(0, 10)} ·{" "}
                {relatedLicenses.length} licencia(s)
              </small>
            </div>
          </div>

          <nav
            className="master-tabs-bar"
            aria-label="Secciones de la ficha maestra de organización"
          >
            {(
              [
                ["all", "Ficha completa (A–F)"],
                ["general", "A. Información general"],
                ["identificacion", "B. Identificación"],
                ["ubicacion", "C. Ubicación"],
                ["responsables", "D. Responsables"],
                ["relaciones", `E. Relaciones (${relatedInstitutions.length})`],
                ["administracion", "F. Administración y servicios"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`master-tab-btn${activeTab === key ? " active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="master-sheet-body">
            <div className="master-section-grid">
              {(activeTab === "all" || activeTab === "general") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>A. Información general</h4>
                    <span className="code-badge">{selectedOrg.id}</span>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field span-2">
                      <span>Nombre oficial</span>
                      <strong>{selectedOrg.name}</strong>
                    </div>
                    <div className="master-field">
                      <span>Nombre abreviado</span>
                      <strong>{selectedOrg.shortName || selectedOrg.name}</strong>
                    </div>
                    <div className="master-field">
                      <span>Tipo de organización</span>
                      <strong>{selectedOrg.type}</strong>
                    </div>
                    <div className="master-field">
                      <span>Naturaleza jurídica</span>
                      <strong>{selectedOrg.legalNature || "No especificada"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Estado</span>
                      <div>
                        <StatusBadge status={selectedOrg.status} />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "identificacion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>B. Identificación civil, tributaria y jurídica</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Tipo de identificación</span>
                      <strong>{selectedOrg.idType || "NIT"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Número de identificación</span>
                      <strong>{selectedOrg.idNumber || "No registrado"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Identificación tributaria (cuando corresponda)</span>
                      <strong>{selectedOrg.taxId || selectedOrg.idNumber || "No aplica"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Registro jurídico / Personería canónica o civil</span>
                      <strong>{selectedOrg.legalRegistry || "No registrado"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "ubicacion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>C. Ubicación de sede principal</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>País</span>
                      <strong>{selectedOrg.country || "Colombia"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Departamento</span>
                      <strong>{selectedOrg.department || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Municipio</span>
                      <strong>{selectedOrg.municipality || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Código postal</span>
                      <strong>{selectedOrg.postalCode || "No registrado"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Dirección de la sede administrativa</span>
                      <strong>{selectedOrg.address || "No registrada"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "responsables") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>D. Responsables de gobierno y operación</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Responsable administrativo</span>
                      <strong>{selectedOrg.adminManager || "No asignado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Responsable financiero / Ecónomo</span>
                      <strong>{selectedOrg.financeManager || "No asignado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Responsable tecnológico (TI)</span>
                      <strong>{selectedOrg.techManager || "No asignado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Contacto principal</span>
                      <strong>{selectedOrg.contact}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "relaciones") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>E. Relaciones en el ecosistema A&O</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Cliente comercial asociado</span>
                      <strong>
                        {associatedClient
                          ? `${associatedClient.name} (${associatedClient.id})`
                          : selectedOrg.clientId}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Organización matriz</span>
                      <strong>
                        {parentOrg
                          ? `${parentOrg.name} (${parentOrg.id})`
                          : "Autónoma (Sin organización matriz)"}
                      </strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Organizaciones dependientes</span>
                      <strong>
                        {dependentOrgs.length > 0
                          ? dependentOrgs.map((o) => `${o.name} (${o.id})`).join(", ")
                          : "Ninguna organización dependiente registrada"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <span
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "var(--muted)",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      Instituciones relacionadas ({relatedInstitutions.length})
                    </span>
                    <div className="master-relation-list">
                      {associatedClient && (
                        <Link to="/clientes" className="master-relation-item">
                          <div>
                            <strong className="row-title">
                              Cliente contratante: {associatedClient.name} ({associatedClient.id})
                            </strong>
                            <span className="row-sub">
                              {associatedClient.clientType ?? "Cliente"} · Ejecutivo:{" "}
                              {associatedClient.owner}
                            </span>
                          </div>
                          <StatusBadge status={associatedClient.status} />
                        </Link>
                      )}
                      {relatedInstitutions.map((inst) => (
                        <Link key={inst.id} to="/instituciones" className="master-relation-item">
                          <div>
                            <strong className="row-title">
                              {inst.name} ({inst.id})
                            </strong>
                            <span className="row-sub">
                              {inst.institutionType ?? "Institución"} · {inst.address} · Resp.:{" "}
                              {inst.owner ?? "Sin asignar"}
                            </span>
                          </div>
                          <StatusBadge status={inst.status} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "administracion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>F. Administración, servicios contratados y licencias</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Fecha de registro</span>
                      <strong>
                        {selectedOrg.registeredAt || selectedOrg.createdAt.slice(0, 10)}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Estado operativo</span>
                      <strong>{selectedOrg.operationalStatus || "En operación"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Servicios contratados</span>
                      <strong>{(selectedOrg.contractedServices ?? ["A&O ERP"]).join(" · ")}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <span
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "var(--muted)",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      Licencias asociadas ({relatedLicenses.length})
                    </span>
                    <div className="master-relation-list">
                      {relatedLicenses.map((license) => (
                        <Link key={license.id} to="/suscripciones" className="master-relation-item">
                          <div>
                            <strong className="row-title">Licencia {license.id}</strong>
                            <span className="row-sub">
                              Suscripción {license.subscriptionId} · Límite: {license.userLimit}{" "}
                              usuarios · {license.moduleIds.length} módulos
                            </span>
                          </div>
                          <StatusBadge status={license.status} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </article>
      )}

      {modalOpen && (
        <MasterFormModal
          sheetLabel="Ficha Maestra · Organizaciones"
          entityName={
            editingOrg ? editingOrg.name : draft.name.trim() || "Nueva organización administrativa"
          }
          recordCode={draft.id}
          operation={editingOrg ? "edit" : "create"}
          errorMessage={formError}
          submitLabel="Guardar cambios"
          onClose={() => setModalOpen(false)}
          onSubmit={saveOrganization}
        >
          <MasterFormSection
            step="A"
            title="Información general"
            description="Nombre oficial, denominación abreviada, clasificación organizacional y naturaleza jurídica."
          >
            <label className="form-field">
              <span>Código de organización</span>
              <input
                value={draft.id}
                disabled={Boolean(editingOrg)}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              />
              <small>Identificador único de la unidad administrativa (tenant).</small>
            </label>
            <label className="form-field">
              <span>Tipo de organización</span>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              >
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field span-2">
              <span>Nombre oficial *</span>
              <input
                value={draft.name}
                placeholder="Ej. Diócesis de San Gabriel"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Nombre abreviado</span>
              <input
                value={draft.shortName}
                placeholder="Ej. Diócesis San Gabriel"
                onChange={(e) => setDraft({ ...draft, shortName: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Estado de la organización</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as DemoStatus })}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </label>
            <label className="form-field span-2">
              <span>Naturaleza jurídica</span>
              <input
                value={draft.legalNature}
                placeholder="Ej. Persona jurídica canónica pública (C.I.C. c. 373)"
                onChange={(e) => setDraft({ ...draft, legalNature: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Identificación jurídica y tributaria"
            description="Documento de identificación institucional, NIT tributario y acto o personería jurídica."
          >
            <label className="form-field">
              <span>Tipo de identificación</span>
              <select
                value={draft.idType}
                onChange={(e) => setDraft({ ...draft, idType: e.target.value })}
              >
                {IDENTIFICATION_TYPES.map((idType) => (
                  <option key={idType} value={idType}>
                    {idType}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Número de identificación</span>
              <input
                value={draft.idNumber}
                placeholder="Ej. 890980142-4"
                onChange={(e) => setDraft({ ...draft, idNumber: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Identificación tributaria (cuando corresponda)</span>
              <input
                value={draft.taxId}
                placeholder="Ej. 890.980.142-4"
                onChange={(e) => setDraft({ ...draft, taxId: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Registro jurídico / Personería</span>
              <input
                value={draft.legalRegistry}
                placeholder="Ej. Decreto Pontificio · Ley 20 de 1974"
                onChange={(e) => setDraft({ ...draft, legalRegistry: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Ubicación"
            description="Localización geográfica y dirección de la sede administrativa principal."
          >
            <label className="form-field">
              <span>País</span>
              <input
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Departamento / Estado</span>
              <input
                value={draft.department}
                placeholder="Ej. Antioquia"
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Municipio / Ciudad</span>
              <input
                value={draft.municipality}
                placeholder="Ej. Medellín"
                onChange={(e) => setDraft({ ...draft, municipality: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Código postal</span>
              <input
                value={draft.postalCode}
                placeholder="Ej. 050012"
                onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })}
              />
            </label>
            <label className="form-field span-2">
              <span>Dirección principal</span>
              <input
                value={draft.address}
                placeholder="Ej. Calle 54 # 48-20, Curia Episcopal"
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="D"
            title="Responsables y contactos"
            description="Titulares de la gestión administrativa, económica y tecnológica de la organización."
          >
            <label className="form-field">
              <span>Responsable administrativo</span>
              <input
                value={draft.adminManager}
                placeholder="Ej. Pbro. Javier Morales (Ecónomo)"
                onChange={(e) => setDraft({ ...draft, adminManager: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Responsable financiero</span>
              <input
                value={draft.financeManager}
                placeholder="Ej. Lucía Fernanda Ríos (Contadora)"
                onChange={(e) => setDraft({ ...draft, financeManager: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Responsable tecnológico (TI)</span>
              <input
                value={draft.techManager}
                placeholder="Ej. Ing. Mauricio Ospina"
                onChange={(e) => setDraft({ ...draft, techManager: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Contacto principal (correo o teléfono) *</span>
              <input
                value={draft.contact}
                placeholder="Ej. cancilleria@diocesis.org"
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="E"
            title="Relaciones institucionales"
            description="Vinculación con el cliente contratante, organización matriz e instituciones adscritas."
          >
            <label className="form-field">
              <span>Cliente comercial asociado</span>
              <select
                value={draft.clientId}
                onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Organización matriz (opcional)</span>
              <select
                value={draft.parentOrganizationId}
                onChange={(e) => setDraft({ ...draft, parentOrganizationId: e.target.value })}
              >
                <option value="">Ninguna (Organización autónoma)</option>
                {organizations
                  .filter((o) => o.id !== draft.id)
                  .map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.id})
                    </option>
                  ))}
              </select>
            </label>
            <label className="form-field span-2">
              <span>Instituciones vinculadas en el repositorio</span>
              <input
                value={
                  editingOrg
                    ? `${institutions.filter((i) => i.organizationId === editingOrg.id).length} institución(es) adscrita(s)`
                    : "Se asocian desde la ficha maestra de Instituciones"
                }
                disabled
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="F"
            title="Información administrativa"
            description="Plan asignado, estado de operación, fecha de alta y servicios habilitados."
          >
            <label className="form-field">
              <span>Plan comercial activo</span>
              <select
                value={draft.plan}
                onChange={(e) => setDraft({ ...draft, plan: e.target.value })}
              >
                <option value="Parroquial">Parroquial</option>
                <option value="Institucional">Institucional</option>
                <option value="Diocesano">Diocesano</option>
              </select>
            </label>
            <label className="form-field">
              <span>Fecha de registro</span>
              <input
                type="date"
                value={draft.registeredAt}
                onChange={(e) => setDraft({ ...draft, registeredAt: e.target.value })}
              />
            </label>
            <label className="form-field span-2">
              <span>Estado operativo</span>
              <input
                value={draft.operationalStatus}
                placeholder="Ej. En operación multiinstitucional"
                onChange={(e) => setDraft({ ...draft, operationalStatus: e.target.value })}
              />
            </label>
            <label className="form-field span-2">
              <span>Servicios contratados (separados por coma)</span>
              <input
                value={draft.contractedServicesText}
                placeholder="Ej. A&O ERP, A&O Diocesano, Gestión Documental"
                onChange={(e) => setDraft({ ...draft, contractedServicesText: e.target.value })}
              />
              <small>Lista de aplicaciones y módulos contratados para esta organización.</small>
            </label>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {deletingOrg && (
        <ModalDialog
          title="Eliminar organización"
          description={`¿Confirmas eliminar “${deletingOrg.name}” (${deletingOrg.id}) de esta demostración local?`}
          onClose={() => setDeletingOrg(null)}
        >
          <div className="modal-actions">
            <button type="button" className="button-muted" onClick={() => setDeletingOrg(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="button-primary danger-button"
              onClick={() => {
                removeOrganization(deletingOrg.id);
                setDeletingOrg(null);
              }}
            >
              Eliminar
            </button>
          </div>
        </ModalDialog>
      )}
    </section>
  );
}
