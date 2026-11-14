import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import type { DemoStatus } from "../data/demo";
import { validateOrganizationCapacity } from "../data/commercial-service";
import { INSTITUTION_TYPES, type Institution } from "../data/saas-domain";
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

type InstitutionTab =
  "all" | "general" | "identificacion" | "eclesial" | "ubicacion" | "contactos" | "relaciones";

type InstitutionDraft = {
  id: string;
  name: string;
  shortName: string;
  institutionType: string;
  status: DemoStatus;
  taxIdType: string;
  taxIdNumber: string;
  canonicalId: string;
  ecclesiasticalRegistry: string;
  foundationDate: string;
  responsibleAuthority: string;
  jurisdictionDiocese: string;
  organizationId: string;
  parentInstitutionId: string;
  country: string;
  department: string;
  municipality: string;
  address: string;
  postalCode: string;
  email: string;
  phone: string;
  website: string;
  owner: string;
  adminManager: string;
  canonicalRelationships: string;
};

const emptyInstitutionDraft = (nextNumber: number, defaultOrgId: string): InstitutionDraft => ({
  id: `INS-${String(nextNumber).padStart(3, "0")}`,
  name: "",
  shortName: "",
  institutionType: "Parroquia",
  status: "Activo",
  taxIdType: "NIT",
  taxIdNumber: "",
  canonicalId: "",
  ecclesiasticalRegistry: "",
  foundationDate: "",
  responsibleAuthority: "",
  jurisdictionDiocese: "",
  organizationId: defaultOrgId,
  parentInstitutionId: "",
  country: "Colombia",
  department: "",
  municipality: "",
  address: "",
  postalCode: "",
  email: "",
  phone: "",
  website: "",
  owner: "",
  adminManager: "",
  canonicalRelationships: "",
});

function draftFromInstitution(inst: Institution): InstitutionDraft {
  return {
    id: inst.id,
    name: inst.name,
    shortName: inst.shortName ?? "",
    institutionType: inst.institutionType ?? "Parroquia",
    status: inst.status,
    taxIdType: inst.taxIdType ?? (inst.taxIdNumber ? "NIT" : "Sin NIT propio"),
    taxIdNumber: inst.taxIdNumber ?? "",
    canonicalId: inst.canonicalId ?? "",
    ecclesiasticalRegistry: inst.ecclesiasticalRegistry ?? "",
    foundationDate: inst.foundationDate ?? "",
    responsibleAuthority: inst.responsibleAuthority ?? inst.owner ?? "",
    jurisdictionDiocese: inst.jurisdictionDiocese ?? "",
    organizationId: inst.organizationId || "",
    parentInstitutionId: inst.parentInstitutionId ?? "",
    country: inst.country ?? "Colombia",
    department: inst.department ?? "",
    municipality: inst.municipality ?? "",
    address: inst.address,
    postalCode: inst.postalCode ?? "",
    email: inst.email ?? "",
    phone: inst.phone ?? "",
    website: inst.website ?? "",
    owner: inst.owner ?? "",
    adminManager: inst.adminManager ?? "",
    canonicalRelationships: inst.canonicalRelationships ?? "",
  };
}

export function InstitutionsMasterScreen() {
  const institutions = useRepositoryRows(repositories.institutions);
  const organizations = useRepositoryRows(repositories.organizations);
  const clients = useRepositoryRows(repositories.clients);
  const licenses = useRepositoryRows(repositories.licenses);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(institutions[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<InstitutionTab>("all");
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [deletingInst, setDeletingInst] = useState<Institution | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<InstitutionDraft>(() =>
    emptyInstitutionDraft(institutions.length + 40, organizations[0]?.id ?? "ORG-001"),
  );
  const [formError, setFormError] = useState("");

  const filtered = institutions.filter((inst) => {
    const matchesStatus = statusFilter === "Todos" || inst.status === statusFilter;
    const resolvedType = inst.institutionType ?? "Parroquia";
    const matchesType = typeFilter === "Todos" || resolvedType === typeFilter;
    const orgName =
      organizations.find((o) => o.id === inst.organizationId)?.name ?? inst.organization ?? "";
    const searchable = [
      inst.id,
      inst.name,
      inst.shortName,
      resolvedType,
      inst.taxIdNumber,
      inst.canonicalId,
      inst.jurisdictionDiocese,
      inst.municipality,
      inst.address,
      inst.owner,
      inst.responsibleAuthority,
      orgName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && matchesType && searchable.includes(query.trim().toLowerCase());
  });

  const selectedInst =
    filtered.find((item) => item.id === selectedId) ??
    institutions.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null;

  const activeInstitutions = institutions.filter((item) => item.status === "Activo").length;
  const withCanonicalId = institutions.filter((item) => Boolean(item.canonicalId)).length;
  const withTaxId = institutions.filter((item) => Boolean(item.taxIdNumber)).length;

  const openCreate = () => {
    setEditingInst(null);
    setDraft(emptyInstitutionDraft(institutions.length + 40, organizations[0]?.id ?? "ORG-001"));
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (inst: Institution) => {
    setEditingInst(inst);
    setDraft(draftFromInstitution(inst));
    setFormError("");
    setModalOpen(true);
  };

  const saveInstitution = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.id.trim() || !draft.name.trim() || !draft.address.trim()) {
      setFormError(
        "Completa el código institucional, el nombre oficial y la dirección de la institución.",
      );
      return;
    }
    const duplicate = institutions.some(
      (item) =>
        item.id.toLowerCase() === draft.id.trim().toLowerCase() && item.id !== editingInst?.id,
    );
    if (duplicate) {
      setFormError("Ya existe una institución registrada con ese código.");
      return;
    }

    // Validación activa de capacidad contratada de instituciones para la organización
    const isAddingInstitutionToOrg =
      !editingInst || editingInst.organizationId !== draft.organizationId;
    if (isAddingInstitutionToOrg && draft.organizationId) {
      const capCheck = validateOrganizationCapacity({
        organizationId: draft.organizationId,
        resource: "institutions",
        requestedDelta: 1,
      });
      if (!capCheck.allowed) {
        setFormError(
          capCheck.reason ??
            "La organización seleccionada ha alcanzado el límite de instituciones contratadas en su licencia.",
        );
        return;
      }
    }

    const now = new Date().toISOString();
    const linkedOrg = organizations.find((o) => o.id === draft.organizationId);
    const hasOwnTaxId = draft.taxIdType !== "Sin NIT propio";

    const payload: Institution = {
      id: draft.id.trim(),
      name: draft.name.trim(),
      shortName: draft.shortName.trim() || draft.name.trim(),
      institutionType: draft.institutionType,
      detail: draft.address.trim(),
      status: draft.status,
      taxIdType: draft.taxIdType,
      taxIdNumber: hasOwnTaxId ? draft.taxIdNumber.trim() : "",
      canonicalId: draft.canonicalId.trim(),
      ecclesiasticalRegistry: draft.ecclesiasticalRegistry.trim(),
      foundationDate: draft.foundationDate.trim(),
      responsibleAuthority: draft.responsibleAuthority.trim() || draft.owner.trim(),
      jurisdictionDiocese: draft.jurisdictionDiocese.trim(),
      organizationId: draft.organizationId,
      organization: linkedOrg?.name ?? "Entidad eclesial independiente",
      parentInstitutionId: draft.parentInstitutionId || undefined,
      clientId: linkedOrg?.clientId ?? clients[0]?.id ?? "CLI-001",
      country: draft.country.trim() || "Colombia",
      department: draft.department.trim(),
      municipality: draft.municipality.trim(),
      address: draft.address.trim(),
      postalCode: draft.postalCode.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      owner: draft.owner.trim() || draft.responsibleAuthority.trim() || "Por asignar",
      adminManager: draft.adminManager.trim(),
      dependentInstitutionIds: editingInst?.dependentInstitutionIds ?? [],
      relatedInstitutionIds: editingInst?.relatedInstitutionIds ?? [],
      canonicalRelationships: draft.canonicalRelationships.trim(),
      createdAt: editingInst?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingInst) {
      repositories.institutions.update(editingInst.id, payload);
    } else {
      repositories.institutions.create(payload);
    }
    setSelectedId(payload.id);
    setModalOpen(false);
  };

  const removeInstitution = (id: string) => {
    repositories.institutions.delete(id);
    if (selectedId === id) {
      setSelectedId(repositories.institutions.list()[0]?.id ?? null);
    }
  };

  const associatedOrg = selectedInst
    ? organizations.find((org) => org.id === selectedInst.organizationId)
    : undefined;
  const associatedClient = selectedInst
    ? clients.find(
        (client) => client.id === selectedInst.clientId || client.id === associatedOrg?.clientId,
      )
    : undefined;
  const parentInst = selectedInst?.parentInstitutionId
    ? institutions.find((inst) => inst.id === selectedInst.parentInstitutionId)
    : undefined;
  const dependentInstitutions = selectedInst
    ? institutions.filter(
        (inst) =>
          inst.parentInstitutionId === selectedInst.id ||
          (selectedInst.dependentInstitutionIds ?? []).includes(inst.id),
      )
    : [];
  const institutionLicenses = selectedInst
    ? licenses.filter((lic) => lic.institutionId === selectedInst.id)
    : [];

  return (
    <section aria-label="Ficha maestra de instituciones">
      <div className="page-header">
        <div>
          <div className="eyebrow">Ecosistema Eclesial y Operativo · Ficha Maestra</div>
          <h1 className="page-title">Instituciones</h1>
          <p className="page-description">
            Entidades concretas del ecosistema eclesial (arquidiócesis, diócesis, parroquias,
            santuarios, seminarios, conventos, monasterios, colegios y centros pastorales).
            Distingue identificación tributaria (opcional) de identificación canónica.
          </p>
        </div>
        <button className="button-primary" type="button" onClick={openCreate}>
          <SaasIcon name="plus" size={16} />
          Nueva institución
        </button>
      </div>

      <div className="summary-grid" aria-label="Indicadores de instituciones">
        <SummaryCard
          label="Instituciones registradas"
          value={institutions.length}
          detail={`${activeInstitutions} activas en el ecosistema`}
          icon="landmark"
        />
        <SummaryCard
          label="Identificación canónica"
          value={withCanonicalId}
          detail="Con decreto o código eclesiástico propio"
          icon="shield"
          tone="emerald"
        />
        <SummaryCard
          label="Identificación tributaria"
          value={withTaxId}
          detail={`${institutions.length - withTaxId} operan sin NIT propio`}
          icon="file-text"
          tone="amber"
        />
        <SummaryCard
          label="Tipos institucionales"
          value={INSTITUTION_TYPES.length}
          detail="Catálogo canónico y pastoral configurable"
          icon="layers"
        />
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por nombre, código canónico, NIT, tipo, diócesis, dirección o responsable..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", "Activo", "Pendiente", "Suspendido"]}
          secondaryFilter={typeFilter}
          onSecondaryFilterChange={setTypeFilter}
          secondaryOptions={["Todos", ...INSTITUTION_TYPES]}
          secondaryAriaLabel="Filtrar por tipo de institución"
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer demo"
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No se encontraron instituciones"
            description="Ajusta el filtro de tipo institucional o registra una nueva entidad eclesial."
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
                  <th>Institución</th>
                  <th>Tipo y jurisdicción</th>
                  <th>Identificación (Tributaria / Canónica)</th>
                  <th>Organización y responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => {
                  const org = organizations.find((o) => o.id === inst.organizationId);
                  const isSelected = selectedInst?.id === inst.id;
                  const taxLabel = inst.taxIdNumber
                    ? `${inst.taxIdType ?? "NIT"} ${inst.taxIdNumber}`
                    : "Sin NIT propio (Opcional)";

                  return (
                    <tr
                      key={inst.id}
                      onClick={() => setSelectedId(inst.id)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--blue-50)" : undefined,
                      }}
                    >
                      <td>
                        <strong className="row-title">{inst.name}</strong>
                        <span className="row-sub">
                          {inst.id} · {inst.shortName ?? inst.name}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{inst.institutionType ?? "Parroquia"}</strong>
                        <span className="row-sub">
                          {inst.jurisdictionDiocese ?? "Jurisdicción en registro"}
                        </span>
                      </td>
                      <td>
                        <strong className="row-title">{taxLabel}</strong>
                        <span className="row-sub">
                          Canónica: {inst.canonicalId || "No registrada"}
                        </span>
                      </td>
                      <td>
                        <span className="row-title">
                          {org?.name ?? inst.organization ?? "Entidad independiente"}
                        </span>
                        <span className="row-sub">
                          Autoridad: {inst.responsibleAuthority ?? inst.owner ?? "Sin asignar"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={inst.status} />
                      </td>
                      <td>
                        <TableRowActions>
                          <TableActionIconButton
                            kind="view"
                            label="Ver ficha"
                            onClick={() => setSelectedId(inst.id)}
                          />
                          <TableActionIconButton
                            kind="edit"
                            label="Editar"
                            onClick={() => openEdit(inst)}
                          />
                          <TableActionIconButton
                            kind="delete"
                            label="Eliminar"
                            onClick={() => setDeletingInst(inst)}
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
            Mostrando {filtered.length} de {institutions.length} instituciones (Datos demostrativos
            locales)
          </span>
          <span>
            Selecciona una institución para inspeccionar su Ficha Maestra completa (Secciones A–F)
          </span>
        </div>
      </div>

      {selectedInst && (
        <article className="master-sheet" aria-label={`Ficha maestra de ${selectedInst.name}`}>
          <header className="master-sheet-header">
            <div className="master-sheet-identity">
              <div className="master-sheet-badges">
                <span className="code-badge">{selectedInst.id}</span>
                <span className="code-badge">{selectedInst.institutionType ?? "Parroquia"}</span>
                {selectedInst.canonicalId && (
                  <span className="code-badge">{selectedInst.canonicalId}</span>
                )}
                <StatusBadge status={selectedInst.status} />
              </div>
              <h2 className="master-sheet-title">{selectedInst.name}</h2>
              <p className="master-sheet-subtitle">
                Nombre corto: <strong>{selectedInst.shortName ?? selectedInst.name}</strong> ·{" "}
                Organización:{" "}
                <strong>
                  {associatedOrg?.name ??
                    selectedInst.organization ??
                    "Entidad eclesial independiente"}
                </strong>{" "}
                ·{" "}
                {[selectedInst.municipality, selectedInst.department, selectedInst.country]
                  .filter(Boolean)
                  .join(", ") || selectedInst.address}
              </p>
            </div>
            <div className="master-sheet-actions">
              {associatedOrg && (
                <Link to="/organizaciones" className="button-ghost">
                  <SaasIcon name="building" size={15} />
                  Ver organización
                </Link>
              )}
              <button
                className="button-primary"
                type="button"
                onClick={() => openEdit(selectedInst)}
              >
                <SaasIcon name="settings" size={15} />
                Editar ficha maestra
              </button>
            </div>
          </header>

          <div className="master-summary-strip">
            <div className="master-summary-item">
              <span>Identificación Tributaria (Opcional)</span>
              <strong>
                {selectedInst.taxIdNumber
                  ? `${selectedInst.taxIdType ?? "NIT"} ${selectedInst.taxIdNumber}`
                  : "Sin NIT propio"}
              </strong>
              <small>
                {selectedInst.taxIdNumber
                  ? "Contribuyente / Personería propia"
                  : "Opera bajo personería de su organización o exenta"}
              </small>
            </div>
            <div className="master-summary-item">
              <span>Identificación Canónica</span>
              <strong>{selectedInst.canonicalId || "En trámite canónico"}</strong>
              <small>
                {selectedInst.ecclesiasticalRegistry || "No sustituye identificación tributaria"}
              </small>
            </div>
            <div className="master-summary-item">
              <span>Gobierno Eclesial</span>
              <strong>
                {selectedInst.responsibleAuthority || selectedInst.owner || "No asignado"}
              </strong>
              <small>Jurisdicción: {selectedInst.jurisdictionDiocese || "Diócesis local"}</small>
            </div>
            <div className="master-summary-item">
              <span>Organización Administradora</span>
              <strong>
                {associatedOrg?.name ??
                  selectedInst.organization ??
                  "Comunidad / Entidad independiente"}
              </strong>
              <small>{institutionLicenses.length} licencia(s) asignada(s) a la sede</small>
            </div>
          </div>

          <nav
            className="master-tabs-bar"
            aria-label="Secciones de la ficha maestra de institución"
          >
            {(
              [
                ["all", "Ficha completa (A–F)"],
                ["general", "A. Información general"],
                ["identificacion", "B. Identificación"],
                ["eclesial", "C. Información eclesial"],
                ["ubicacion", "D. Ubicación"],
                ["contactos", "E. Contactos y responsables"],
                ["relaciones", "F. Relaciones canónicas y licencias"],
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
                    <span className="code-badge">{selectedInst.id}</span>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field span-2">
                      <span>Nombre oficial de la institución</span>
                      <strong>{selectedInst.name}</strong>
                    </div>
                    <div className="master-field">
                      <span>Nombre corto / abreviado</span>
                      <strong>{selectedInst.shortName || selectedInst.name}</strong>
                    </div>
                    <div className="master-field">
                      <span>Tipo de institución</span>
                      <strong>{selectedInst.institutionType ?? "Parroquia"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Estado institucional</span>
                      <div>
                        <StatusBadge status={selectedInst.status} />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "identificacion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>B. Identificación tributaria y canónica</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Tipo de identificación tributaria</span>
                      <strong>
                        {selectedInst.taxIdType ||
                          (selectedInst.taxIdNumber ? "NIT" : "Sin NIT propio (Opcional)")}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Número de identificación tributaria</span>
                      <strong>
                        {selectedInst.taxIdNumber ||
                          "No requiere / Opera bajo NIT de organización matriz"}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Identificación canónica o eclesiástica</span>
                      <strong>{selectedInst.canonicalId || "No registrada"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Registro eclesiástico / Decreto</span>
                      <strong>{selectedInst.ecclesiasticalRegistry || "No registrado"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "eclesial") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>C. Información eclesial y jurisdicción</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Fecha de fundación o erección canónica</span>
                      <strong>{selectedInst.foundationDate || "No registrada"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Autoridad responsable</span>
                      <strong>
                        {selectedInst.responsibleAuthority || selectedInst.owner || "No registrada"}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Diócesis de jurisdicción</span>
                      <strong>{selectedInst.jurisdictionDiocese || "No especificada"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Organización asociada</span>
                      <strong>
                        {associatedOrg
                          ? `${associatedOrg.name} (${associatedOrg.id})`
                          : "Comunidad / Entidad independiente"}
                      </strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Institución matriz o superior (cuando corresponda)</span>
                      <strong>
                        {parentInst
                          ? `${parentInst.name} (${parentInst.id})`
                          : "Sin institución superior directa"}
                      </strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "ubicacion") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>D. Ubicación geográfica</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>País</span>
                      <strong>{selectedInst.country || "Colombia"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Departamento</span>
                      <strong>{selectedInst.department || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Municipio</span>
                      <strong>{selectedInst.municipality || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Código postal</span>
                      <strong>{selectedInst.postalCode || "No registrado"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Dirección de la sede</span>
                      <strong>{selectedInst.address}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "contactos") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>E. Contactos y responsables</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Correo institucional</span>
                      <strong>{selectedInst.email || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Teléfono de despacho</span>
                      <strong>{selectedInst.phone || "No registrado"}</strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Sitio web</span>
                      <strong>{selectedInst.website || "No registrado"}</strong>
                    </div>
                    <div className="master-field">
                      <span>Responsable institucional</span>
                      <strong>
                        {selectedInst.owner || selectedInst.responsibleAuthority || "No asignado"}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Responsable administrativo</span>
                      <strong>{selectedInst.adminManager || "No asignado"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "relaciones") && (
                <section className="master-section-card">
                  <div className="master-section-header">
                    <h4>F. Relaciones institucionales y canónicas</h4>
                  </div>
                  <div className="master-field-grid">
                    <div className="master-field">
                      <span>Organización propietaria o administradora</span>
                      <strong>
                        {associatedOrg
                          ? `${associatedOrg.name} (${associatedOrg.id})`
                          : "Entidad independiente"}
                      </strong>
                    </div>
                    <div className="master-field">
                      <span>Cliente contratante vinculado</span>
                      <strong>
                        {associatedClient
                          ? `${associatedClient.name} (${associatedClient.id})`
                          : selectedInst.clientId}
                      </strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Relaciones canónicas y pastorales</span>
                      <strong>
                        {selectedInst.canonicalRelationships ||
                          "Adscripción ordinaria dentro de la jurisdicción eclesiástica"}
                      </strong>
                    </div>
                    <div className="master-field span-2">
                      <span>Instituciones dependientes ({dependentInstitutions.length})</span>
                      <strong>
                        {dependentInstitutions.length > 0
                          ? dependentInstitutions.map((i) => `${i.name} (${i.id})`).join(", ")
                          : "Sin parroquias o sedes filiales dependientes"}
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
                      Vínculos activos en plataforma
                    </span>
                    <div className="master-relation-list">
                      {associatedOrg && (
                        <Link to="/organizaciones" className="master-relation-item">
                          <div>
                            <strong className="row-title">
                              Organización: {associatedOrg.name} ({associatedOrg.id})
                            </strong>
                            <span className="row-sub">
                              Tipo: {associatedOrg.type} · Plan: {associatedOrg.plan}
                            </span>
                          </div>
                          <StatusBadge status={associatedOrg.status} />
                        </Link>
                      )}
                      {institutionLicenses.map((license) => (
                        <Link key={license.id} to="/suscripciones" className="master-relation-item">
                          <div>
                            <strong className="row-title">Licencia asignada: {license.id}</strong>
                            <span className="row-sub">
                              Suscripción {license.subscriptionId} · Límite {license.userLimit}{" "}
                              usuarios
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
          sheetLabel="Ficha Maestra · Instituciones"
          entityName={
            editingInst ? editingInst.name : draft.name.trim() || "Nueva institución eclesial"
          }
          recordCode={draft.id}
          operation={editingInst ? "edit" : "create"}
          errorMessage={formError}
          submitLabel="Guardar cambios"
          onClose={() => setModalOpen(false)}
          onSubmit={saveInstitution}
        >
          <MasterFormSection
            step="A"
            title="Información general"
            description="Nombre oficial, denominación corta, tipo institucional y estado operativo."
          >
            <label className="form-field">
              <span>Código institucional</span>
              <input
                value={draft.id}
                disabled={Boolean(editingInst)}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              />
              <small>Identificador único de la institución en el ecosistema.</small>
            </label>
            <label className="form-field">
              <span>Tipo de institución</span>
              <select
                value={draft.institutionType}
                onChange={(e) => setDraft({ ...draft, institutionType: e.target.value })}
              >
                {INSTITUTION_TYPES.map((type) => (
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
                placeholder="Ej. Parroquia Santa María del Valle"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Nombre corto</span>
              <input
                value={draft.shortName}
                placeholder="Ej. Parr. Santa María"
                onChange={(e) => setDraft({ ...draft, shortName: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Estado institucional</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as DemoStatus })}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Identificación jurídica y tributaria"
            description="Identificación tributaria opcional (no todas las instituciones requieren NIT) e identificación canónica independiente."
          >
            <label className="form-field">
              <span>Tipo de identificación tributaria</span>
              <select
                value={draft.taxIdType}
                onChange={(e) => setDraft({ ...draft, taxIdType: e.target.value })}
              >
                <option value="NIT">NIT propio</option>
                <option value="Sin NIT propio">
                  Sin NIT propio (Opera bajo organización o exenta)
                </option>
                <option value="ID extranjero">Identificación fiscal extranjera</option>
              </select>
            </label>
            {draft.taxIdType !== "Sin NIT propio" ? (
              <label className="form-field">
                <span>Número de identificación tributaria (Opcional)</span>
                <input
                  value={draft.taxIdNumber}
                  placeholder="Ej. 800194310-9"
                  onChange={(e) => setDraft({ ...draft, taxIdNumber: e.target.value })}
                />
              </label>
            ) : (
              <label className="form-field">
                <span>Número de identificación tributaria</span>
                <input value="No requiere NIT propio para registrarse" disabled />
              </label>
            )}
            <label className="form-field">
              <span>Identificación canónica o eclesiástica</span>
              <input
                value={draft.canonicalId}
                placeholder="Ej. CAN-PAR-014-SMV"
                onChange={(e) => setDraft({ ...draft, canonicalId: e.target.value })}
              />
              <small>La identificación canónica no sustituye la tributaria.</small>
            </label>
            <label className="form-field">
              <span>Registro eclesiástico / Decreto</span>
              <input
                value={draft.ecclesiasticalRegistry}
                placeholder="Ej. Libro II de Erecciones, Folio 42"
                onChange={(e) => setDraft({ ...draft, ecclesiasticalRegistry: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="C"
            title="Ubicación"
            description="Localización territorial y dirección física de la sede institucional."
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
                placeholder="Ej. Valle del Cauca"
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Municipio / Ciudad</span>
              <input
                value={draft.municipality}
                placeholder="Ej. Cali"
                onChange={(e) => setDraft({ ...draft, municipality: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Código postal</span>
              <input
                value={draft.postalCode}
                placeholder="Ej. 760001"
                onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })}
              />
            </label>
            <label className="form-field span-2">
              <span>Dirección física *</span>
              <input
                value={draft.address}
                placeholder="Ej. Cra. 14 # 8-22, Barrio San Pedro"
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="D"
            title="Responsables y contactos"
            description="Autoridades eclesiales, administradores y canales oficiales de contacto."
          >
            <label className="form-field">
              <span>Autoridad responsable (Párroco, Obispo, Superiora, Rector)</span>
              <input
                value={draft.responsibleAuthority}
                placeholder="Ej. Pbro. Andrés Felipe Lozada"
                onChange={(e) => setDraft({ ...draft, responsibleAuthority: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Responsable institucional</span>
              <input
                value={draft.owner}
                placeholder="Ej. Pbro. Andrés Felipe Lozada"
                onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Responsable administrativo</span>
              <input
                value={draft.adminManager}
                placeholder="Ej. Clara Inés Gómez"
                onChange={(e) => setDraft({ ...draft, adminManager: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Correo institucional</span>
              <input
                type="email"
                value={draft.email}
                placeholder="despacho@parroquia.org"
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Teléfono de despacho</span>
              <input
                value={draft.phone}
                placeholder="(602) 388 1240"
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Sitio web institucional</span>
              <input
                value={draft.website}
                placeholder="https://parroquia.org"
                onChange={(e) => setDraft({ ...draft, website: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="E"
            title="Relaciones institucionales"
            description="Vinculación con la organización administradora, institución superior y relaciones canónicas."
          >
            <label className="form-field">
              <span>Organización propietaria o administradora</span>
              <select
                value={draft.organizationId}
                onChange={(e) => setDraft({ ...draft, organizationId: e.target.value })}
              >
                <option value="">
                  Sin organización matriz (Comunidad / Convento independiente)
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Institución matriz o superior (opcional)</span>
              <select
                value={draft.parentInstitutionId}
                onChange={(e) => setDraft({ ...draft, parentInstitutionId: e.target.value })}
              >
                <option value="">Sin institución superior directa</option>
                {institutions
                  .filter((inst) => inst.id !== draft.id)
                  .map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.id})
                    </option>
                  ))}
              </select>
            </label>
            <label className="form-field span-2">
              <span>Relaciones canónicas y adscripción pastoral</span>
              <input
                value={draft.canonicalRelationships}
                placeholder="Ej. Parroquia adscrita a la Vicaría Foránea del Valle"
                onChange={(e) => setDraft({ ...draft, canonicalRelationships: e.target.value })}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="F"
            title="Información administrativa y eclesial"
            description="Datos históricos de fundación o erección canónica y jurisdicción eclesiástica."
          >
            <label className="form-field">
              <span>Fecha de fundación o erección canónica</span>
              <input
                type="date"
                value={draft.foundationDate}
                onChange={(e) => setDraft({ ...draft, foundationDate: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Diócesis de jurisdicción</span>
              <input
                value={draft.jurisdictionDiocese}
                placeholder="Ej. Diócesis de San Gabriel"
                onChange={(e) => setDraft({ ...draft, jurisdictionDiocese: e.target.value })}
              />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {deletingInst && (
        <ModalDialog
          title="Eliminar institución"
          description={`¿Confirmas eliminar “${deletingInst.name}” (${deletingInst.id}) de esta demostración local?`}
          onClose={() => setDeletingInst(null)}
        >
          <div className="modal-actions">
            <button type="button" className="button-muted" onClick={() => setDeletingInst(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="button-primary danger-button"
              onClick={() => {
                removeInstitution(deletingInst.id);
                setDeletingInst(null);
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
