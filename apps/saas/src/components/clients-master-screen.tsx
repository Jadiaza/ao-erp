import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  CLIENT_TYPES,
  IDENTIFICATION_TYPES,
  TAX_REGIMES,
  type Client,
  type Contact,
  type EntityStatus,
} from "../data/saas-domain";
import {
  getModuleRepository,
  repositories,
  saasStore,
  useRepositoryRows,
} from "../data/saas-repository";
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

type ClientTab =
  "all" | "general" | "identificacion" | "contacto" | "juridica" | "ubicacion" | "comercial";

type ClientDraft = {
  id: string;
  clientType: string;
  legalName: string;
  tradeName: string;
  status: EntityStatus;
  idType: string;
  idNumber: string;
  verificationDigit: string;
  taxResponsibilities: string;
  taxRegime: string;
  economicActivity: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  legalRepresentative: string;
  representativeId: string;
  representationType: string;
  country: string;
  department: string;
  municipality: string;
  postalCode: string;
  address: string;
  addressComplement: string;
  joinedAt: string;
  commercialContact: string;
  owner: string;
  commercialStatus: string;
};

const emptyClientDraft = (nextNumber: number): ClientDraft => ({
  id: `CLI-${String(nextNumber).padStart(3, "0")}`,
  clientType: "Entidad eclesial contratante",
  legalName: "",
  tradeName: "",
  status: "Activo",
  idType: "NIT",
  idNumber: "",
  verificationDigit: "",
  taxResponsibilities: "O-48 No responsable de IVA",
  taxRegime: "No responsable de IVA / Entidad eclesial",
  economicActivity: "9491 · Actividades de organizaciones religiosas",
  email: "",
  phone: "",
  mobile: "",
  website: "",
  legalRepresentative: "",
  representativeId: "",
  representationType: "Representante legal canónico / titular",
  country: "Colombia",
  department: "",
  municipality: "",
  postalCode: "",
  address: "",
  addressComplement: "",
  joinedAt: "2026-11-09",
  commercialContact: "",
  owner: "Dirección Comercial",
  commercialStatus: "Contrato anual vigente",
});

function draftFromClient(client: Client): ClientDraft {
  return {
    id: client.id,
    clientType: client.clientType ?? "Entidad eclesial contratante",
    legalName: client.legalName ?? client.name,
    tradeName: client.tradeName ?? client.name,
    status: client.status,
    idType: client.idType ?? "NIT",
    idNumber: client.idNumber ?? "",
    verificationDigit: client.verificationDigit ?? "",
    taxResponsibilities: client.taxResponsibilities ?? "",
    taxRegime: client.taxRegime ?? "",
    economicActivity: client.economicActivity ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    mobile: client.mobile ?? "",
    website: client.website ?? "",
    legalRepresentative: client.legalRepresentative ?? "",
    representativeId: client.representativeId ?? "",
    representationType: client.representationType ?? "",
    country: client.country || "Colombia",
    department: client.department ?? "",
    municipality: client.municipality ?? "",
    postalCode: client.postalCode ?? "",
    address: client.address ?? "",
    addressComplement: client.addressComplement ?? "",
    joinedAt: client.joinedAt ?? client.createdAt.slice(0, 10),
    commercialContact: client.commercialContact ?? "",
    owner: client.owner,
    commercialStatus: client.commercialStatus ?? "Relación activa",
  };
}

export function ClientsMasterScreen() {
  const clients = useRepositoryRows(repositories.clients);
  const organizations = useRepositoryRows(repositories.organizations);
  const contracts = useRepositoryRows(repositories.contracts);
  const subscriptions = useRepositoryRows(repositories.subscriptions);
  const contacts = useRepositoryRows(repositories.contacts);
  const plans = useRepositoryRows(repositories.plans);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(clients[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<ClientTab>("all");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<ClientDraft>(() => emptyClientDraft(clients.length + 1));
  const [formError, setFormError] = useState("");

  // Modal rápido para múltiples contactos con diferentes funciones
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("Contacto comercial");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const filtered = clients.filter((client) => {
    const matchesStatus = statusFilter === "Todos" || client.status === statusFilter;
    const resolvedType = client.clientType ?? "Entidad eclesial contratante";
    const matchesType = typeFilter === "Todos" || resolvedType === typeFilter;
    const searchable = [
      client.id,
      client.name,
      client.legalName,
      client.tradeName,
      client.idType,
      client.idNumber,
      client.country,
      client.municipality,
      client.owner,
      client.legalRepresentative,
      client.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && matchesType && searchable.includes(query.trim().toLowerCase());
  });

  const selectedClient =
    filtered.find((item) => item.id === selectedId) ??
    clients.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null;

  const activeClients = clients.filter((item) => item.status === "Activo").length;
  const activeContracts = contracts.filter((item) => item.status === "Activo").length;

  const openCreate = () => {
    setEditingClient(null);
    setDraft(emptyClientDraft(clients.length + 1));
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setDraft(draftFromClient(client));
    setFormError("");
    setModalOpen(true);
  };

  const syncModuleRecords = (nextClients: Client[]) => {
    const moduleRepo = getModuleRepository("clientes");
    moduleRepo.replace(
      nextClients.map((item) => ({
        id: item.id,
        name: item.name,
        detail: `${item.clientType ?? "Cliente"} · ${item.idType ?? "NIT"} ${item.idNumber ?? "S/I"}`,
        context: [item.municipality, item.country].filter(Boolean).join(", ") || item.country,
        owner: item.owner,
        status: item.status === "En revisión" ? "Pendiente" : item.status,
      })),
    );
  };

  const saveClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !draft.id.trim() ||
      !draft.legalName.trim() ||
      !draft.idNumber.trim() ||
      !draft.owner.trim()
    ) {
      setFormError(
        "Completa el código, la razón social o nombres, el número de identificación y el responsable comercial.",
      );
      return;
    }
    const duplicate = clients.some(
      (item) =>
        item.id.toLowerCase() === draft.id.trim().toLowerCase() && item.id !== editingClient?.id,
    );
    if (duplicate) {
      setFormError("Ya existe un cliente registrado con ese código identificador.");
      return;
    }

    const now = new Date().toISOString();
    const displayName = draft.tradeName.trim() || draft.legalName.trim();
    const payload: Client = {
      id: draft.id.trim(),
      name: displayName,
      kind: `${draft.clientType} · ${draft.taxRegime || "Contratante A&O"}`,
      country: draft.country.trim() || "Colombia",
      status: draft.status,
      owner: draft.owner.trim(),
      clientType: draft.clientType,
      legalName: draft.legalName.trim(),
      tradeName: draft.tradeName.trim() || displayName,
      idType: draft.idType,
      idNumber: draft.idNumber.trim(),
      verificationDigit: draft.idType === "NIT" ? draft.verificationDigit.trim() : "",
      taxResponsibilities: draft.taxResponsibilities.trim(),
      taxRegime: draft.taxRegime.trim(),
      economicActivity: draft.economicActivity.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      mobile: draft.mobile.trim(),
      website: draft.website.trim(),
      legalRepresentative: draft.legalRepresentative.trim(),
      representativeId: draft.representativeId.trim(),
      representationType: draft.representationType.trim(),
      department: draft.department.trim(),
      municipality: draft.municipality.trim(),
      postalCode: draft.postalCode.trim(),
      address: draft.address.trim(),
      addressComplement: draft.addressComplement.trim(),
      joinedAt: draft.joinedAt.trim(),
      commercialContact: draft.commercialContact.trim(),
      commercialStatus: draft.commercialStatus.trim(),
      createdAt: editingClient?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingClient) {
      repositories.clients.update(editingClient.id, payload);
    } else {
      repositories.clients.create(payload);
    }
    syncModuleRecords(repositories.clients.list());
    setSelectedId(payload.id);
    setModalOpen(false);
  };

  const removeClient = (id: string) => {
    repositories.clients.delete(id);
    syncModuleRecords(repositories.clients.list());
    if (selectedId === id) {
      setSelectedId(repositories.clients.list()[0]?.id ?? null);
    }
  };

  const addClientContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient || !contactName.trim() || !contactEmail.trim()) return;
    const now = new Date().toISOString();
    const newContact: Contact = {
      id: `CNT-${String(contacts.length + 1).padStart(3, "0")}`,
      clientId: selectedClient.id,
      name: contactName.trim(),
      role: contactRole.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      status: "Activo",
      createdAt: now,
      updatedAt: now,
    };
    repositories.contacts.create(newContact);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactModalOpen(false);
  };

  const clientOrganizations = selectedClient
    ? organizations.filter((org) => org.clientId === selectedClient.id)
    : [];
  const clientContracts = selectedClient
    ? contracts.filter((con) => con.clientId === selectedClient.id)
    : [];
  const clientSubscriptions = selectedClient
    ? subscriptions.filter((sub) => sub.clientId === selectedClient.id)
    : [];
  const clientContacts = selectedClient
    ? contacts.filter((cnt) => cnt.clientId === selectedClient.id)
    : [];

  const isNaturalPerson = draft.clientType === "Persona natural";

  return (
    <section aria-label="Ficha maestra de clientes comerciales">
      <div className="page-header">
        <div>
          <div className="eyebrow">Gobierno Comercial y Contractual · Ficha Maestra</div>
          <h1 className="page-title">Clientes Comerciales</h1>
          <p className="page-description">
            Personas jurídicas, personas naturales y entidades eclesiales que contratan los
            servicios de A&O. Un cliente puede administrar una o varias organizaciones e
            instituciones.
          </p>
        </div>
        <button className="button-primary" type="button" onClick={openCreate}>
          <SaasIcon name="plus" size={16} />
          Nuevo cliente comercial
        </button>
      </div>

      <div className="summary-grid" aria-label="Indicadores de clientes comerciales">
        <SummaryCard
          label="Clientes registrados"
          value={clients.length}
          detail="Titulares jurídicos y contratantes en el repositorio"
          icon="briefcase"
        />
        <SummaryCard
          label="Clientes activos"
          value={activeClients}
          detail={`${clients.length - activeClients} en revisión o renovación`}
          icon="check"
          tone="emerald"
        />
        <SummaryCard
          label="Contratos vigentes"
          value={activeContracts}
          detail={`${contracts.length} acuerdos comerciales registrados`}
          icon="file-text"
          tone="amber"
        />
        <SummaryCard
          label="Organizaciones vinculadas"
          value={organizations.length}
          detail={`${contacts.length} contactos funcionales asociados`}
          icon="building"
        />
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por razón social, NIT, código, representante o municipio..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", "Activo", "Pendiente", "En revisión", "Suspendido"]}
          secondaryFilter={typeFilter}
          onSecondaryFilterChange={setTypeFilter}
          secondaryOptions={["Todos", ...CLIENT_TYPES]}
          secondaryAriaLabel="Filtrar por tipo de cliente"
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer demo"
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No se encontraron clientes comerciales"
            description="Ajusta los filtros de tipo o estado, o registra una nueva ficha maestra de cliente."
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
                  <th>Cliente / Razón social</th>
                  <th>Identificación tributaria</th>
                  <th>Tipo y ubicación</th>
                  <th>Relación comercial</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const orgCount = organizations.filter((o) => o.clientId === client.id).length;
                  const contractCount = contracts.filter((c) => c.clientId === client.id).length;
                  const isSelected = selectedClient?.id === client.id;
                  const idLabel = client.idNumber
                    ? `${client.idType ?? "NIT"} ${client.idNumber}${
                        client.verificationDigit ? `-${client.verificationDigit}` : ""
                      }`
                    : "Sin identificación registrada";

                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedId(client.id)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--blue-50)" : undefined,
                      }}
                    >
                      <td>
                        <strong className="row-title">{client.legalName ?? client.name}</strong>
                        <span className="row-sub">
                          {client.id} · {client.tradeName ?? client.name}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{idLabel}</strong>
                        <span className="row-sub">
                          {client.taxRegime ?? "Régimen no especificado"}
                        </span>
                      </td>
                      <td>
                        <span className="row-title">
                          {client.clientType ?? "Entidad eclesial contratante"}
                        </span>
                        <span className="row-sub">
                          {[client.municipality, client.department, client.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </td>
                      <td>
                        <span className="row-title">
                          {orgCount} org. · {contractCount} contrato(s)
                        </span>
                        <span className="row-sub">Ejecutivo: {client.owner}</span>
                      </td>
                      <td>
                        <StatusBadge status={client.status} />
                      </td>
                      <td>
                        <TableRowActions>
                          <TableActionIconButton
                            kind="view"
                            label="Ver ficha"
                            onClick={() => setSelectedId(client.id)}
                          />
                          <TableActionIconButton
                            kind="edit"
                            label="Editar"
                            onClick={() => openEdit(client)}
                          />
                          <TableActionIconButton
                            kind="delete"
                            label="Eliminar"
                            onClick={() => setDeletingClient(client)}
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
            Mostrando {filtered.length} de {clients.length} clientes comerciales (Datos
            demostrativos locales)
          </span>
          <span>
            Selecciona un cliente para inspeccionar su Ficha Maestra completa (Secciones A–F)
          </span>
        </div>
      </div>

      {selectedClient && (
        <article className="master-sheet" aria-label={`Ficha maestra de ${selectedClient.name}`}>
          <header className="master-sheet-header">
            <div className="master-sheet-identity">
              <div className="master-sheet-badges">
                <span className="code-badge">{selectedClient.id}</span>
                <span className="code-badge">
                  {selectedClient.clientType ?? "Entidad eclesial contratante"}
                </span>
                <StatusBadge status={selectedClient.status} />
              </div>
              <h2 className="master-sheet-title">
                {selectedClient.legalName ?? selectedClient.name}
              </h2>
              <p className="master-sheet-subtitle">
                Nombre comercial: <strong>{selectedClient.tradeName ?? selectedClient.name}</strong>{" "}
                · {selectedClient.idType ?? "NIT"} {selectedClient.idNumber ?? "Pendiente"}
                {selectedClient.verificationDigit
                  ? `-${selectedClient.verificationDigit}`
                  : ""} ·{" "}
                {[selectedClient.municipality, selectedClient.department, selectedClient.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <div className="master-sheet-actions">
              <button
                className="button-ghost"
                type="button"
                onClick={() => setContactModalOpen(true)}
              >
                <SaasIcon name="users" size={15} />
                Añadir contacto
              </button>
              <button
                className="button-primary"
                type="button"
                onClick={() => openEdit(selectedClient)}
              >
                <SaasIcon name="settings" size={15} />
                Editar ficha maestra
              </button>
            </div>
          </header>

          <div className="master-summary-strip">
            <div className="master-summary-item">
              <span>Identificación Tributaria</span>
              <strong>
                {selectedClient.idType ?? "NIT"} {selectedClient.idNumber ?? "No registrado"}
                {selectedClient.verificationDigit ? `-${selectedClient.verificationDigit}` : ""}
              </strong>
              <small>{selectedClient.taxRegime ?? "Régimen tributario por definir"}</small>
            </div>
            <div className="master-summary-item">
              <span>Representante Legal</span>
              <strong>{selectedClient.legalRepresentative || "No especificado"}</strong>
              <small>
                {selectedClient.representativeId || "Sin documento"} ·{" "}
                {selectedClient.representationType || "Titular"}
              </small>
            </div>
            <div className="master-summary-item">
              <span>Ecosistema Vinculado</span>
              <strong>
                {clientOrganizations.length} organización(es) · {clientContracts.length} contrato(s)
              </strong>
              <small>{clientSubscriptions.length} suscripción(es) activa(s)</small>
            </div>
            <div className="master-summary-item">
              <span>Relación Comercial</span>
              <strong>{selectedClient.commercialStatus || "Vigente"}</strong>
              <small>
                Vinculado: {selectedClient.joinedAt || "2026"} · Ejecutivo: {selectedClient.owner}
              </small>
            </div>
          </div>

          <nav className="master-tabs-bar" aria-label="Secciones de la ficha maestra del cliente">
            {(
              [
                ["all", "Ficha completa (A–F)"],
                ["general", "A. Información general"],
                ["identificacion", "B. Identificación"],
                ["contacto", `C. Contacto (${clientContacts.length})`],
                ["juridica", "D. Información jurídica"],
                ["ubicacion", "E. Ubicación"],
                ["comercial", "F. Comercial y contratos"],
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
                    <span className="code-badge">{selectedClient.id}</span>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Tipo de cliente</span>
                      <strong>{selectedClient.clientType ?? "Entidad eclesial contratante"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Estado del cliente</span>
                      <div>
                        <StatusBadge status={selectedClient.status} />
                      </div>
                    </div>
                    <div className="master-field span-2">
                      <span>Razón social o nombres y apellidos</span>
                      <strong>{selectedClient.legalName ?? selectedClient.name}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Nombre comercial / denominación</span>
                      <strong>{selectedClient.tradeName ?? selectedClient.name}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "identificacion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>B. Identificación y perfil tributario</h4>
                    <span className="code-badge">{selectedClient.idType ?? "NIT"}</span>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Tipo de identificación</span>
                      <strong>{selectedClient.idType ?? "NIT"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Número y dígito de verificación</span>
                      <strong>
                        {selectedClient.idNumber || "No registrado"}
                        {selectedClient.verificationDigit
                          ? ` - DV ${selectedClient.verificationDigit}`
                          : ""}
                      </strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Régimen tributario</span>
                      <strong>{selectedClient.taxRegime || "No especificado"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Responsabilidades tributarias</span>
                      <strong>{selectedClient.taxResponsibilities || "No registradas"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Actividad económica (CIIU)</span>
                      <strong>{selectedClient.economicActivity || "No registrada"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "contacto") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>C. Información de contacto y directorio funcional</h4>
                    <button
                      className="action-link"
                      type="button"
                      onClick={() => setContactModalOpen(true)}
                    >
                      + Agregar contacto
                    </button>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Correo electrónico principal</span>
                      <strong>{selectedClient.email || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Teléfono fijo</span>
                      <strong>{selectedClient.phone || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Celular corporativo</span>
                      <strong>{selectedClient.mobile || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Sitio web oficial</span>
                      <strong>{selectedClient.website || "No registrado"}</strong>
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
                      Contactos asociados por función ({clientContacts.length})
                    </span>
                    {clientContacts.length === 0 ? (
                      <p className="row-sub">
                        No hay contactos adicionales vinculados a este cliente.
                      </p>
                    ) : (
                      <div className="master-relation-list">
                        {clientContacts.map((contact) => (
                          <div key={contact.id} className="master-relation-item">
                            <div>
                              <strong className="row-title">{contact.name}</strong>
                              <span className="row-sub">
                                {contact.role ?? "Contacto institucional"} · {contact.email}
                                {contact.phone ? ` · ${contact.phone}` : ""}
                              </span>
                            </div>
                            <button
                              className="action-link danger"
                              type="button"
                              onClick={() => repositories.contacts.delete(contact.id)}
                            >
                              Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "juridica") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>D. Información jurídica y representación</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field span-2">
                      <span>Representante legal titular</span>
                      <strong>
                        {selectedClient.legalRepresentative || "No aplica / No registrado"}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Identificación del representante</span>
                      <strong>{selectedClient.representativeId || "No registrada"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Tipo de representación</span>
                      <strong>{selectedClient.representationType || "No especificada"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "ubicacion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>E. Ubicación geográfica y domicilio fiscal</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>País</span>
                      <strong>{selectedClient.country}</strong>
                    </div>
                    <div className="master-field">
                      <span>Departamento / Región</span>
                      <strong>{selectedClient.department || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Municipio / Ciudad</span>
                      <strong>{selectedClient.municipality || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Código postal</span>
                      <strong>{selectedClient.postalCode || "No registrado"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Dirección principal</span>
                      <strong>{selectedClient.address || "No registrada"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Complemento / Sede administrativa</span>
                      <strong>{selectedClient.addressComplement || "Sin complemento"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "comercial") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>F. Información comercial, contratos y organizaciones</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Fecha de vinculación</span>
                      <strong>
                        {selectedClient.joinedAt || selectedClient.createdAt.slice(0, 10)}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Ejecutivo A&O responsable</span>
                      <strong>{selectedClient.owner}</strong>
                    </div>
                    <div className="master-field">
                      <span>Contacto comercial cliente</span>
                      <strong>{selectedClient.commercialContact || "No asignado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Estado de la relación comercial</span>
                      <strong>{selectedClient.commercialStatus || "Vigente"}</strong>
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
                      Organizaciones administradas ({clientOrganizations.length}) y contratos (
                      {clientContracts.length})
                    </span>
                    <div className="master-relation-list">
                      {clientOrganizations.map((org) => (
                        <Link key={org.id} to="/organizaciones" className="master-relation-item">
                          <div>
                            <strong className="row-title">
                              {org.name} ({org.id})
                            </strong>
                            <span className="row-sub">
                              Organización · Tipo: {org.type} · Plan: {org.plan}
                            </span>
                          </div>
                          <StatusBadge status={org.status} />
                        </Link>
                      ))}
                      {clientContracts.map((contract) => {
                        const planName =
                          plans.find((p) => p.id === contract.planId)?.name ?? contract.planId;
                        return (
                          <Link
                            key={contract.id}
                            to="/suscripciones"
                            className="master-relation-item"
                          >
                            <div>
                              <strong className="row-title">Contrato {contract.id}</strong>
                              <span className="row-sub">
                                Plan {planName} · Vigencia: {contract.startsAt} a {contract.endsAt}
                              </span>
                            </div>
                            <StatusBadge status={contract.status} />
                          </Link>
                        );
                      })}
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
          sheetLabel="Ficha Maestra · Clientes Comerciales"
          entityName={
            editingClient
              ? editingClient.legalName || editingClient.name
              : draft.legalName.trim() || "Nuevo cliente comercial"
          }
          recordCode={draft.id}
          operation={editingClient ? "edit" : "create"}
          errorMessage={formError}
          submitLabel="Guardar cambios"
          onClose={() => setModalOpen(false)}
          onSubmit={saveClient}
        >
          <MasterFormSection
            step="A"
            title="Información general"
            description="Clasificación del contratante, denominación legal y estado dentro del directorio comercial."
          >
            <label className="form-field">
              <span>Código del cliente</span>
              <input
                value={draft.id}
                disabled={Boolean(editingClient)}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              />
              <small>Identificador único en el repositorio comercial.</small>
            </label>
            <label className="form-field">
              <span>Tipo de cliente</span>
              <select
                value={draft.clientType}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    clientType: e.target.value,
                    idType: e.target.value === "Persona natural" ? "CC" : draft.idType,
                  })
                }
              >
                {CLIENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field span-2">
              <span>
                {isNaturalPerson ? "Nombres y apellidos completos *" : "Razón social oficial *"}
              </span>
              <input
                value={draft.legalName}
                placeholder={
                  isNaturalPerson ? "Ej. Juan Carlos Restrepo Gómez" : "Ej. Diócesis de San Gabriel"
                }
                onChange={(e) => setDraft({ ...draft, legalName: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Nombre comercial o abreviado</span>
              <input
                value={draft.tradeName}
                placeholder="Ej. Curia San Gabriel"
                onChange={(e) => setDraft({ ...draft, tradeName: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Estado del cliente</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as EntityStatus })}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En revisión">En revisión</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Identificación jurídica y tributaria"
            description="Documento de identificación fiscal, régimen aplicable, responsabilidades y actividad económica."
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
              <span>Número de identificación *</span>
              <input
                value={draft.idNumber}
                placeholder="Ej. 890980142"
                onChange={(e) => setDraft({ ...draft, idNumber: e.target.value })}
              />
            </label>
            {draft.idType === "NIT" ? (
              <label className="form-field">
                <span>Dígito de verificación (DV)</span>
                <input
                  value={draft.verificationDigit}
                  maxLength={2}
                  placeholder="Ej. 4"
                  onChange={(e) => setDraft({ ...draft, verificationDigit: e.target.value })}
                />
              </label>
            ) : (
              <label className="form-field">
                <span>Dígito de verificación (DV)</span>
                <input value="No aplica para este tipo de documento" disabled />
              </label>
            )}
            <label className="form-field">
              <span>Régimen tributario</span>
              <select
                value={draft.taxRegime}
                onChange={(e) => setDraft({ ...draft, taxRegime: e.target.value })}
              >
                {TAX_REGIMES.map((regime) => (
                  <option key={regime} value={regime}>
                    {regime}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Responsabilidades tributarias</span>
              <input
                value={draft.taxResponsibilities}
                placeholder="Ej. O-48 No responsable de IVA"
                onChange={(e) => setDraft({ ...draft, taxResponsibilities: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Actividad económica (CIIU)</span>
              <input
                value={draft.economicActivity}
                placeholder="Ej. 9491 · Actividades de organizaciones religiosas"
                onChange={(e) => setDraft({ ...draft, economicActivity: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Ubicación"
            description="Domicilio fiscal y ubicación geográfica principal del cliente contratante."
          >
            <label className="form-field">
              <span>País</span>
              <input
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Departamento / Región</span>
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
            <label className="form-field">
              <span>Dirección principal</span>
              <input
                value={draft.address}
                placeholder="Ej. Calle 54 # 48-20, Centro Episcopal"
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Complemento / Sede</span>
              <input
                value={draft.addressComplement}
                placeholder="Ej. Piso 3, Oficina de Ecónomo"
                onChange={(e) => setDraft({ ...draft, addressComplement: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="D"
            title="Responsables y contactos"
            description="Canales oficiales de comunicación y datos de representación legal."
          >
            <label className="form-field">
              <span>Correo electrónico principal</span>
              <input
                type="email"
                value={draft.email}
                placeholder="cancilleria@institucion.org"
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Teléfono fijo</span>
              <input
                value={draft.phone}
                placeholder="(604) 412 8800"
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Celular / WhatsApp institucional</span>
              <input
                value={draft.mobile}
                placeholder="+57 310 445 9100"
                onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Sitio web oficial</span>
              <input
                value={draft.website}
                placeholder="https://institucion.org"
                onChange={(e) => setDraft({ ...draft, website: e.target.value })}
              />
            </label>
            {!isNaturalPerson && (
              <>
                <label className="form-field span-2">
                  <span>Representante legal titular</span>
                  <input
                    value={draft.legalRepresentative}
                    placeholder="Ej. Mons. Alberto Restrepo Giraldo"
                    onChange={(e) => setDraft({ ...draft, legalRepresentative: e.target.value })}
                  />
                </label>
                <label className="form-field">
                  <span>Identificación del representante</span>
                  <input
                    value={draft.representativeId}
                    placeholder="Ej. CC 70.114.220"
                    onChange={(e) => setDraft({ ...draft, representativeId: e.target.value })}
                  />
                </label>
                <label className="form-field">
                  <span>Tipo de representación</span>
                  <input
                    value={draft.representationType}
                    placeholder="Ej. Obispo Diocesano / Representante Legal"
                    onChange={(e) => setDraft({ ...draft, representationType: e.target.value })}
                  />
                </label>
              </>
            )}
          </MasterFormSection>

          <MasterFormSection
            step="E"
            title="Relaciones institucionales"
            description="Vínculo con organizaciones administradoras y contratos activos dentro del ecosistema A&O."
          >
            <label className="form-field">
              <span>Organizaciones asociadas al cliente</span>
              <input
                value={
                  editingClient
                    ? `${organizations.filter((o) => o.clientId === editingClient.id).length} organización(es) vinculada(s)`
                    : "Se vinculan desde la ficha de Organizaciones"
                }
                disabled
              />
              <small>Un cliente puede ser titular de una o múltiples organizaciones ERP.</small>
            </label>
            <label className="form-field">
              <span>Contratos comerciales registrados</span>
              <input
                value={
                  editingClient
                    ? `${contracts.filter((c) => c.clientId === editingClient.id).length} contrato(s) asociado(s)`
                    : "Se asocian al emitir la suscripción"
                }
                disabled
              />
              <small>Los acuerdos contractuales determinan planes y vigencias.</small>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="F"
            title="Información administrativa y comercial"
            description="Parámetros de vinculación comercial, ejecutivo responsable y estado contractual."
          >
            <label className="form-field">
              <span>Fecha de vinculación</span>
              <input
                type="date"
                value={draft.joinedAt}
                onChange={(e) => setDraft({ ...draft, joinedAt: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Ejecutivo A&O responsable *</span>
              <input
                value={draft.owner}
                placeholder="Ej. Dirección Comercial"
                onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Contacto comercial en el cliente</span>
              <input
                value={draft.commercialContact}
                placeholder="Ej. Pbro. Javier Morales (Ecónomo)"
                onChange={(e) => setDraft({ ...draft, commercialContact: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Estado de la relación comercial</span>
              <input
                value={draft.commercialStatus}
                placeholder="Ej. Contrato anual vigente"
                onChange={(e) => setDraft({ ...draft, commercialStatus: e.target.value })}
              />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {contactModalOpen && selectedClient && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Agregar contacto funcional al cliente"
        >
          <form className="modal-card" onSubmit={addClientContact}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">{selectedClient.name}</div>
                <h3>Nuevo contacto funcional</h3>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setContactModalOpen(false)}
                aria-label="Cerrar"
              >
                <SaasIcon name="x" size={16} />
              </button>
            </div>
            <label className="form-field">
              <span>Nombre completo</span>
              <input
                value={contactName}
                placeholder="Ej. Pbro. Javier Morales"
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Función o cargo</span>
              <select value={contactRole} onChange={(e) => setContactRole(e.target.value)}>
                <option value="Contacto comercial">Contacto comercial</option>
                <option value="Ecónomo / Tesorería">Ecónomo / Tesorería</option>
                <option value="Cancillería / Secretaría">Cancillería / Secretaría</option>
                <option value="Delegado Tecnológico (TI)">Delegado Tecnológico (TI)</option>
                <option value="Representación Legal">Representación Legal</option>
              </select>
            </label>
            <label className="form-field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={contactEmail}
                placeholder="correo@institucion.org"
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Teléfono / Celular</span>
              <input
                value={contactPhone}
                placeholder="+57 310 000 0000"
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button
                className="button-ghost"
                type="button"
                onClick={() => setContactModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="button-primary" type="submit">
                Guardar contacto
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingClient && (
        <ModalDialog
          title="Eliminar cliente"
          description={`¿Confirmas eliminar “${deletingClient.name}” (${deletingClient.id}) de esta demostración local?`}
          onClose={() => setDeletingClient(null)}
        >
          <div className="modal-actions">
            <button type="button" className="button-muted" onClick={() => setDeletingClient(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="button-primary danger-button"
              onClick={() => {
                removeClient(deletingClient.id);
                setDeletingClient(null);
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
