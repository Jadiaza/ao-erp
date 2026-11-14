import {
  institutions as legacyInstitutions,
  organizations as legacyOrganizations,
  plans as legacyPlans,
  roles as legacyRoles,
  users as legacyUsers,
  type DemoStatus,
  type Organization as LegacyOrganization,
  type SaaSRecord,
} from "./demo";
import { ecosystemSections, type EcosystemRecord } from "./ecosystem-demo";
import { supportRecords, type SupportArea, type SupportRecord } from "./support-demo";

export type EntityStatus =
  | DemoStatus
  | "En revisión"
  | "Activo"
  | "Borrador"
  | "Vencido"
  | "Cancelado"
  | "Terminado"
  | "Inactivo"
  | "Anulada"
  | "Operativo"
  | "Fallido";
export type DateFields = { createdAt: string; updatedAt: string };

export const PROVISIONING_STATUSES = [
  "Pendiente",
  "En validación",
  "Validado",
  "En aprovisionamiento",
  "Configurando",
  "Activando servicios",
  "Operativo",
  "Suspendido",
  "Fallido",
  "Cancelado",
] as const;
export type ProvisioningStatus = (typeof PROVISIONING_STATUSES)[number];

export const PROVISIONING_STAGE_CODES = [
  "commercial_validation",
  "org_initial_config",
  "institutional_structure",
  "environment_allocation",
  "module_activation",
] as const;
export type ProvisioningStageCode = (typeof PROVISIONING_STAGE_CODES)[number];

export const BILLING_PERIODS = [
  "Mensual",
  "Trimestral",
  "Semestral",
  "Anual",
  "Personalizada",
] as const;

export const CURRENCIES = ["COP", "USD", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const PORTFOLIO_STATUSES = ["Al día", "Por vencer", "En mora", "Pagada", "Anulada"] as const;
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];

export const COMMERCIAL_STATUSES = [
  "Borrador",
  "Pendiente",
  "Activo",
  "En revisión",
  "Suspendido",
  "Vencido",
  "Cancelado",
  "Terminado",
] as const;

export const PRODUCT_CATEGORIES = [
  "ERP Eclesial y Parroquial",
  "Gobierno Diocesano y Curia",
  "Gestión Documental y Archivo",
  "Educación y Pastoral Social",
  "Complemento Cloud",
] as const;

export const PRODUCT_AVAILABILITY = [
  "Disponible general (GA)",
  "Bajo contrato institucional",
  "Piloto controlado",
  "Retirado",
] as const;

export const CLIENT_TYPES = [
  "Persona jurídica",
  "Persona natural",
  "Entidad eclesial contratante",
] as const;

export const IDENTIFICATION_TYPES = [
  "NIT",
  "CC",
  "CE",
  "Pasaporte",
  "Personería canónica",
  "ID extranjero",
] as const;

export const TAX_REGIMES = [
  "Régimen Tributario Especial (ESAL)",
  "No responsable de IVA / Entidad eclesial",
  "Régimen Ordinario",
  "Régimen Simple (RST)",
  "Persona Natural No Responsable",
] as const;

export const ORGANIZATION_TYPES = [
  "Diócesis",
  "Arquidiócesis",
  "Provincia religiosa",
  "Congregación",
  "Comunidad religiosa",
  "Fundación",
  "Asociación",
  "Institución educativa",
  "Organización eclesial",
  "Otra organización",
] as const;

export const INSTITUTION_TYPES = [
  "Arquidiócesis",
  "Diócesis",
  "Parroquia",
  "Cuasiparroquia",
  "Santuario",
  "Seminario",
  "Congregación religiosa",
  "Convento",
  "Monasterio",
  "Comunidad religiosa",
  "Colegio",
  "Fundación",
  "Centro pastoral",
  "Otra institución eclesial",
] as const;

export type Client = DateFields & {
  id: string;
  name: string;
  kind: string;
  country: string;
  status: EntityStatus;
  owner: string;
  // A. Información general
  clientType?: string | undefined;
  legalName?: string | undefined;
  tradeName?: string | undefined;
  // B. Identificación
  idType?: string | undefined;
  idNumber?: string | undefined;
  verificationDigit?: string | undefined;
  taxResponsibilities?: string | undefined;
  taxRegime?: string | undefined;
  economicActivity?: string | undefined;
  // C. Información de contacto
  email?: string | undefined;
  phone?: string | undefined;
  mobile?: string | undefined;
  website?: string | undefined;
  // D. Información jurídica
  legalRepresentative?: string | undefined;
  representativeId?: string | undefined;
  representationType?: string | undefined;
  // E. Ubicación
  department?: string | undefined;
  municipality?: string | undefined;
  postalCode?: string | undefined;
  address?: string | undefined;
  addressComplement?: string | undefined;
  // F. Información comercial
  joinedAt?: string | undefined;
  commercialContact?: string | undefined;
  commercialStatus?: string | undefined;
};

export type Organization = DateFields &
  LegacyOrganization & {
    clientId: string;
    institutionIds: string[];
    userIds: string[];
    // A. Información general
    shortName?: string | undefined;
    legalNature?: string | undefined;
    // B. Identificación
    idType?: string | undefined;
    idNumber?: string | undefined;
    taxId?: string | undefined;
    legalRegistry?: string | undefined;
    // C. Ubicación
    country?: string | undefined;
    department?: string | undefined;
    municipality?: string | undefined;
    address?: string | undefined;
    postalCode?: string | undefined;
    // D. Responsables
    adminManager?: string | undefined;
    financeManager?: string | undefined;
    techManager?: string | undefined;
    // E. Relaciones
    parentOrganizationId?: string | undefined;
    dependentOrganizationIds?: string[] | undefined;
    // F. Administración
    registeredAt?: string | undefined;
    operationalStatus?: string | undefined;
    contractedServices?: string[] | undefined;
    licenseIds?: string[] | undefined;
  };

export type Institution = DateFields &
  SaaSRecord & {
    organizationId: string;
    clientId: string;
    address: string;
    // A. Información general
    shortName?: string | undefined;
    institutionType?: string | undefined;
    // B. Identificación (tributaria opcional + canónica independiente)
    taxIdType?: string | undefined;
    taxIdNumber?: string | undefined;
    canonicalId?: string | undefined;
    ecclesiasticalRegistry?: string | undefined;
    // C. Información eclesial
    foundationDate?: string | undefined;
    responsibleAuthority?: string | undefined;
    jurisdictionDiocese?: string | undefined;
    parentInstitutionId?: string | undefined;
    // D. Ubicación
    country?: string | undefined;
    department?: string | undefined;
    municipality?: string | undefined;
    postalCode?: string | undefined;
    // E. Contactos
    email?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    adminManager?: string | undefined;
    // F. Relaciones
    dependentInstitutionIds?: string[] | undefined;
    relatedInstitutionIds?: string[] | undefined;
    canonicalRelationships?: string | undefined;
  };

export type Contact = DateFields & {
  id: string;
  clientId: string;
  organizationId?: string | undefined;
  institutionId?: string | undefined;
  name: string;
  role?: string | undefined;
  email: string;
  phone?: string | undefined;
  status: EntityStatus;
};

export type User = DateFields &
  SaaSRecord & {
    clientId?: string;
    institutionIds: string[];
    membershipIds: string[];
  };

export type Membership = DateFields & {
  id: string;
  userId: string;
  institutionId: string;
  roleIds: string[];
  status: EntityStatus;
};

export type Role = DateFields & SaaSRecord & { permissionIds: string[]; scope: string };
export type Permission = DateFields & {
  id: string;
  name: string;
  resource: string;
  action: string;
};

export type Application = DateFields & {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  status: EntityStatus;
  code?: string | undefined;
  category?: string | undefined;
  commercialVersion?: string | undefined;
  commercialAvailability?: string | undefined;
  targetEntities?: string[] | undefined;
};

export type Module = DateFields & {
  id: string;
  applicationId: string;
  name: string;
  featureIds: string[];
  status: EntityStatus;
  code?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  requiredModuleIds?: string[] | undefined;
  commercialAvailability?: string | undefined;
};

export type Feature = DateFields & {
  id: string;
  moduleId: string;
  name: string;
  status: EntityStatus;
  code?: string | undefined;
  description?: string | undefined;
  commercialAvailability?: string | undefined;
};

export type ContractedPlanSnapshot = {
  planId: string;
  planCode: string;
  planName: string;
  planVersion: number;
  applicationId: string;
  price: number;
  currency: string;
  billingPeriod: string;
  userLimit: number;
  institutionLimit: number;
  storageLimitGb: number;
  moduleIds: string[];
  capturedAt: string;
};

export type ContractModificationEntry = {
  date: string;
  action: string;
  summary: string;
  author: string;
  previousPlanId?: string | undefined;
  previousPlanVersion?: number | undefined;
  newPlanId?: string | undefined;
  newPlanVersion?: number | undefined;
  previousAmount?: number | undefined;
  newAmount?: number | undefined;
  previousEndsAt?: string | undefined;
  newEndsAt?: string | undefined;
};

export type CommercialPlan = DateFields &
  SaaSRecord & {
    moduleIds: string[];
    userLimit: number;
    institutionLimit: number;
    code?: string | undefined;
    applicationId?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    currency?: string | undefined;
    billingPeriod?: string | undefined;
    storageLimitGb?: number | undefined;
    version?: number | undefined;
    conditions?: string | undefined;
    coverage?: string | undefined;
  };

export type Contract = DateFields & {
  id: string;
  clientId: string;
  planId: string;
  status: EntityStatus;
  startsAt: string;
  endsAt: string;
  organizationId?: string | undefined;
  applicationId?: string | undefined;
  contractedAt?: string | undefined;
  billingPeriod?: string | undefined;
  contractedAmount?: number | undefined;
  discountAmount?: number | undefined;
  currency?: string | undefined;
  specialConditions?: string | undefined;
  autoRenew?: boolean | undefined;
  planSnapshot?: ContractedPlanSnapshot | undefined;
  modificationHistory?: ContractModificationEntry[] | undefined;
};

export type Subscription = DateFields & {
  id: string;
  contractId: string;
  clientId: string;
  applicationIds: string[];
  status: EntityStatus;
  renewalAt: string;
  organizationId?: string | undefined;
  startsAt?: string | undefined;
  endsAt?: string | undefined;
  billingPeriod?: string | undefined;
  autoRenew?: boolean | undefined;
  notes?: string | undefined;
};

export type License = DateFields & {
  id: string;
  subscriptionId: string;
  institutionId?: string | undefined;
  status: EntityStatus;
  userLimit: number;
  moduleIds: string[];
  contractId?: string | undefined;
  organizationId?: string | undefined;
  applicationId?: string | undefined;
  featureIds?: string[] | undefined;
  startsAt?: string | undefined;
  expiresAt?: string | undefined;
  institutionLimit?: number | undefined;
  storageLimitGb?: number | undefined;
  authorizedExceptions?: string | undefined;
  exceptionReason?: string | undefined;
  exceptionApprovedBy?: string | undefined;
  exceptionExpiresAt?: string | undefined;
  scopeType?: "Organizacional" | "Institucional" | undefined;
};

export type Entitlement = DateFields & {
  id: string;
  licenseId: string;
  moduleId: string;
  enabled: boolean;
  featureIds?: string[] | undefined;
  notes?: string | undefined;
};

export type UsageLimit = DateFields & {
  id: string;
  licenseId: string;
  resource: string;
  maximum: number;
  used: number;
  unit?: string | undefined;
  exceptionExtra?: number | undefined;
  exceptionReason?: string | undefined;
  exceptionApprovedBy?: string | undefined;
  exceptionExpiresAt?: string | undefined;
};

export type InvoiceConceptItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Invoice = DateFields & {
  id: string;
  clientId: string;
  contractId: string;
  amount: number;
  dueAt: string;
  status: EntityStatus;
  currency?: string | undefined;
  organizationId?: string | undefined;
  subscriptionId?: string | undefined;
  issuedAt?: string | undefined;
  concepts?: InvoiceConceptItem[] | undefined;
  subtotalAmount?: number | undefined;
  taxAmount?: number | undefined;
  discountAmount?: number | undefined;
  paidAmount?: number | undefined;
  balanceDue?: number | undefined;
  portfolioStatus?: "Al día" | "Por vencer" | "En mora" | "Pagada" | "Anulada" | undefined;
  billingTypeNote?: string | undefined;
};

export type Payment = DateFields & {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  status: EntityStatus;
  currency?: string | undefined;
  method?: string | undefined;
  reference?: string | undefined;
  notes?: string | undefined;
  reversedAt?: string | undefined;
  reversalReason?: string | undefined;
};
export type Ticket = DateFields & {
  id: string;
  institutionId?: string;
  applicationId?: string;
  moduleId?: string;
  title: string;
  priority: "Crítica" | "Alta" | "Media" | "Baja";
  status: "Abierto" | "En diagnóstico" | "En espera" | "Resuelto" | "Cerrado";
  owner: string;
};
export type PlatformSettings = {
  theme: string;
  density: string;
  scope: string;
  organization: string;
  enabledModuleIds: string[];
};

export type ProvisioningStageResult = {
  stageCode: ProvisioningStageCode;
  stageName: string;
  operationId: string;
  status: "Pendiente" | "Completado" | "Fallido" | "Omitido";
  executedAt?: string | undefined;
  executedBy?: string | undefined;
  detail: string;
  errorMessage?: string | undefined;
  attempts: number;
};

export type ProvisioningHistoryEntry = {
  id: string;
  timestamp: string;
  fromStatus: ProvisioningStatus | "Creación";
  toStatus: ProvisioningStatus;
  actor: string;
  result: "Exitoso" | "Fallido" | "Advertencia";
  notes: string;
  operationId: string;
};

export type OrganizationInitialConfig = {
  legalName: string;
  displayName: string;
  taxId?: string | undefined;
  organizationType: string;
  country: string;
  department: string;
  municipality: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  ecclesiasticalStructureNotes: string;
  authorizedInstitutionIds: string[];
};

export type ProvisioningRequest = DateFields & {
  id: string;
  idempotencyKey: string;
  clientId: string;
  organizationId: string;
  contractId: string;
  subscriptionId: string;
  licenseId: string;
  applicationId: string;
  planId: string;
  status: ProvisioningStatus;
  requestedBy: string;
  environmentId?: string | undefined;
  requestedModuleIds: string[];
  activatedModuleIds: string[];
  activatedFeatureIds: string[];
  initialConfig: OrganizationInitialConfig;
  stages: ProvisioningStageResult[];
  history: ProvisioningHistoryEntry[];
  lastError?: string | undefined;
  retryCount: number;
};

export type TenantEnvironmentModuleConfig = {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  enabled: boolean;
  installedVersion: string;
  compatibleWithProduct: boolean;
  configSummary: string;
  activatedAt: string;
};

export type TenantEnvironmentOperationEntry = {
  id: string;
  date: string;
  action: string;
  actor: string;
  detail: string;
  result: "Exitoso" | "Fallido" | "Advertencia";
};

export type TenantEnvironment = DateFields & {
  id: string;
  organizationId: string;
  clientId: string;
  contractId: string;
  subscriptionId: string;
  licenseId: string;
  applicationId: string;
  provisioningRequestId: string;
  status:
    "Operativo" | "En configuración" | "En mantenimiento" | "Suspendido" | "Terminado" | "Fallido";
  availabilityStatus:
    | "Disponible"
    | "Mantenimiento programado"
    | "Suspendido comercialmente"
    | "Suspendido administrativamente"
    | "Baja lógica / Conservación"
    | "Degradado";
  isolationModel: "Instancia lógica multi-tenant en infraestructura compartida";
  installedProductVersion: string;
  availableProductVersion?: string | undefined;
  updateStatus:
    "Actualizado" | "Actualización disponible" | "En mantenimiento" | "Incidencia de actualización";
  moduleConfigurations: TenantEnvironmentModuleConfig[];
  regionalConfig: {
    timezone: string;
    locale: string;
    currency: string;
    country: string;
    department: string;
    municipality: string;
  };
  dataRetentionPolicy: string;
  operationHistory: TenantEnvironmentOperationEntry[];
};

export type InfrastructureIncident = DateFields & {
  id: string;
  environmentId: string;
  organizationId: string;
  applicationId: string;
  kind:
    | "Incidencia de actualización"
    | "Mantenimiento programado"
    | "Incidencia de entorno"
    | "Alerta de capacidad";
  severity: "Alta" | "Media" | "Baja";
  title: string;
  detail: string;
  targetVersion?: string | undefined;
  scheduledWindow?: string | undefined;
  status: "Abierta" | "En curso" | "Resuelta";
  reportedBy: string;
};

export type SaasDomainState = {
  version: 1;
  clients: Client[];
  organizations: Organization[];
  institutions: Institution[];
  contacts: Contact[];
  users: User[];
  memberships: Membership[];
  roles: Role[];
  permissions: Permission[];
  applications: Application[];
  modules: Module[];
  features: Feature[];
  plans: CommercialPlan[];
  contracts: Contract[];
  subscriptions: Subscription[];
  licenses: License[];
  entitlements: Entitlement[];
  usageLimits: UsageLimit[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: Ticket[];
  provisioningRequests: ProvisioningRequest[];
  environments: TenantEnvironment[];
  infrastructureIncidents: InfrastructureIncident[];
  settings: PlatformSettings;
  moduleRecords: Record<string, EcosystemRecord[]>;
  supportRecords: Record<SupportArea, SupportRecord[]>;
};

const now = "2026-11-06T00:00:00.000Z";
const dates = (): DateFields => ({ createdAt: now, updatedAt: now });
const byName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const sectionRows = (path: string) =>
  ecosystemSections.find((section) => section.path === path)?.records ?? [];

const clientEnrichment: Record<string, Partial<Client>> = {
  "CLI-001": {
    clientType: "Entidad eclesial contratante",
    legalName: "Diócesis de San Gabriel",
    tradeName: "Curia Diocesana de San Gabriel",
    idType: "NIT",
    idNumber: "890980142",
    verificationDigit: "4",
    taxResponsibilities: "O-48 No responsable de IVA · Entidad de Derecho Público Eclesiástico",
    taxRegime: "No responsable de IVA / Entidad eclesial",
    economicActivity: "9491 · Actividades de organizaciones religiosas",
    email: "cancilleria@diocesissangabriel.demo.org",
    phone: "(604) 412 8800",
    mobile: "+57 310 445 9100",
    website: "https://diocesissangabriel.demo.org",
    legalRepresentative: "Mons. Alberto Restrepo Giraldo",
    representativeId: "CC 70.114.220",
    representationType: "Obispo Diocesano · Representante legal canónico",
    department: "Antioquia",
    municipality: "Medellín",
    postalCode: "050012",
    address: "Calle 54 # 48-20, Centro Episcopal",
    addressComplement: "Piso 3, Oficina de Ecónomo Diocesano",
    joinedAt: "2026-01-10",
    commercialContact: "Pbro. Javier Morales (Ecónomo)",
    commercialStatus: "Contrato anual vigente",
  },
  "CLI-002": {
    clientType: "Entidad eclesial contratante",
    legalName: "Parroquia Santa María del Valle",
    tradeName: "Parroquia Santa María",
    idType: "NIT",
    idNumber: "800194310",
    verificationDigit: "9",
    taxResponsibilities: "O-48 No responsable de IVA · Parroquia canónicamente erigida",
    taxRegime: "No responsable de IVA / Entidad eclesial",
    economicActivity: "9491 · Actividades de organizaciones religiosas",
    email: "despacho@santamariadelvalle.demo.org",
    phone: "(602) 388 1240",
    mobile: "+57 315 802 3311",
    website: "https://santamariadelvalle.demo.org",
    legalRepresentative: "Pbro. Andrés Felipe Lozada",
    representativeId: "CC 16.784.510",
    representationType: "Párroco y Representante Legal",
    department: "Valle del Cauca",
    municipality: "Cali",
    postalCode: "760001",
    address: "Cra. 14 # 8-22, Barrio San Pedro",
    addressComplement: "Casa Cural · Despacho Parroquial",
    joinedAt: "2026-02-15",
    commercialContact: "Clara Inés Gómez (Secretaria Parroquial)",
    commercialStatus: "Suscripción directa activa",
  },
  "CLI-003": {
    clientType: "Persona jurídica",
    legalName: "Fundación Social y Educativa Camino y Vida",
    tradeName: "Fundación Camino y Vida",
    idType: "NIT",
    idNumber: "900412785",
    verificationDigit: "1",
    taxResponsibilities: "O-04 Régimen Tributario Especial · Retenedor en la fuente",
    taxRegime: "Régimen Tributario Especial (ESAL)",
    economicActivity: "8890 · Otras actividades de asistencia social sin alojamiento",
    email: "direccion@caminoyvida.demo.org",
    phone: "(601) 620 4410",
    mobile: "+57 320 914 2208",
    website: "https://caminoyvida.demo.org",
    legalRepresentative: "Dra. Elena María Vargas Pardo",
    representativeId: "CC 52.318.904",
    representationType: "Directora Ejecutiva · Representante Legal Principal",
    department: "Cundinamarca",
    municipality: "Bogotá D.C.",
    postalCode: "110221",
    address: "Av. Central 41-09, Chapinero",
    addressComplement: "Edificio Pastoral Social, Oficina 402",
    joinedAt: "2026-03-01",
    commercialContact: "Carlos Eduardo Niño (Director Financiero)",
    commercialStatus: "En proceso de renovación contractual",
  },
};

const clientRows = sectionRows("clientes");
const clients: Client[] = clientRows.map((row) => ({
  ...dates(),
  id: row.id,
  name: row.name,
  kind: row.detail,
  country: row.context,
  status: row.status,
  owner: row.owner,
  ...clientEnrichment[row.id],
}));

const clientFor = (name: string) =>
  clients.find((client) => byName(client.name) === byName(name))?.id ?? clients[0]?.id ?? "CLI-001";
const organizationFor = (name: string) =>
  legacyOrganizations.find((organization) => byName(organization.name) === byName(name));

const organizationEnrichment: Record<string, Partial<Organization>> = {
  "ORG-001": {
    shortName: "Diócesis San Gabriel",
    legalNature: "Persona jurídica canónica pública (C.I.C. c. 373)",
    idType: "NIT",
    idNumber: "890980142-4",
    taxId: "890.980.142-4",
    legalRegistry: "Decreto Pontificio · Reconocimiento Concordatario Ley 20 de 1974",
    country: "Colombia",
    department: "Antioquia",
    municipality: "Medellín",
    address: "Calle 54 # 48-20, Curia Episcopal",
    postalCode: "050012",
    adminManager: "Pbro. Javier Morales (Ecónomo Diocesano)",
    financeManager: "Lucía Fernanda Ríos (Contadora General)",
    techManager: "Ing. Mauricio Ospina (Delegado TI)",
    registeredAt: "2026-01-12",
    operationalStatus: "En operación multiinstitucional",
    contractedServices: ["A&O ERP", "A&O Diocesano", "Gestión Documental", "Finanzas y Recursos"],
    licenseIds: ["LIC-SUB-2026-014"],
  },
  "ORG-002": {
    shortName: "Parr. Santa María",
    legalNature: "Parroquia erigida canónicamente (C.I.C. c. 515)",
    idType: "NIT",
    idNumber: "800194310-9",
    taxId: "800.194.310-9",
    legalRegistry: "Decreto Episcopal N.º 048 de 1988 · Cancillería Diocesana",
    country: "Colombia",
    department: "Valle del Cauca",
    municipality: "Cali",
    address: "Cra. 14 # 8-22, Barrio San Pedro",
    postalCode: "760001",
    adminManager: "Pbro. Andrés Felipe Lozada (Párroco)",
    financeManager: "Clara Inés Gómez (Tesorería Parroquial)",
    techManager: "Soporte A&O Cloud",
    registeredAt: "2026-02-18",
    operationalStatus: "En operación parroquial",
    contractedServices: ["A&O ERP", "Comunidad y Pastoral", "Gestión Documental"],
    licenseIds: ["LIC-SUB-2026-019"],
  },
  "ORG-003": {
    shortName: "Fund. Camino y Vida",
    legalNature: "Entidad Sin Ánimo de Lucro (ESAL) · Fundación de origen eclesial",
    idType: "NIT",
    idNumber: "900412785-1",
    taxId: "900.412.785-1",
    legalRegistry: "Personería Jurídica Mayoría / Cámara de Comercio N.º S0034912",
    country: "Colombia",
    department: "Cundinamarca",
    municipality: "Bogotá D.C.",
    address: "Av. Central 41-09, Chapinero",
    postalCode: "110221",
    adminManager: "Dra. Elena María Vargas Pardo",
    financeManager: "Carlos Eduardo Niño",
    techManager: "Camilo Andrés Duarte (Sistemas)",
    registeredAt: "2026-03-04",
    operationalStatus: "Implementación y migración de sedes",
    contractedServices: ["A&O ERP", "Finanzas y Recursos", "Comunidad y Pastoral"],
    licenseIds: ["LIC-SUB-2026-022"],
  },
};

const organizations: Organization[] = legacyOrganizations.map((organization) => ({
  ...organization,
  ...dates(),
  clientId: clientFor(organization.name),
  institutionIds: [],
  userIds: [],
  ...organizationEnrichment[organization.id],
}));

const institutionEnrichment: Record<string, Partial<Institution>> = {
  "INS-014": {
    shortName: "Parr. Santa María del Valle",
    institutionType: "Parroquia",
    taxIdType: "NIT",
    taxIdNumber: "800194310-9",
    canonicalId: "CAN-PAR-014-SMV",
    ecclesiasticalRegistry: "Libro II de Erecciones Parroquiales, Folio 42",
    foundationDate: "1988-05-13",
    responsibleAuthority: "Pbro. Andrés Felipe Lozada (Párroco)",
    jurisdictionDiocese: "Diócesis de San Gabriel",
    country: "Colombia",
    department: "Valle del Cauca",
    municipality: "Cali",
    postalCode: "760001",
    email: "despacho@santamariadelvalle.demo.org",
    phone: "(602) 388 1240",
    website: "https://santamariadelvalle.demo.org",
    adminManager: "Clara Inés Gómez (Administradora Parroquial)",
    canonicalRelationships: "Parroquia adscrita a la Vicaría Foránea del Valle",
  },
  "INS-021": {
    shortName: "Curia San Gabriel",
    institutionType: "Diócesis",
    taxIdType: "NIT",
    taxIdNumber: "890980142-4",
    canonicalId: "CAN-CUR-001-SGB",
    ecclesiasticalRegistry: "Bula Pontificia · Erección Canónica Diocesana",
    foundationDate: "1962-10-11",
    responsibleAuthority: "Mons. Alberto Restrepo Giraldo (Obispo Diocesano)",
    jurisdictionDiocese: "Diócesis de San Gabriel",
    country: "Colombia",
    department: "Antioquia",
    municipality: "Medellín",
    postalCode: "050012",
    email: "cancilleria@diocesissangabriel.demo.org",
    phone: "(604) 412 8800",
    website: "https://diocesissangabriel.demo.org",
    adminManager: "Pbro. Javier Morales (Ecónomo Diocesano)",
    dependentInstitutionIds: ["INS-014"],
    canonicalRelationships: "Gobierno pastoral, cancillería y tribunal eclesiástico diocesano",
  },
  "INS-033": {
    shortName: "Centro Camino y Vida",
    institutionType: "Centro pastoral",
    taxIdType: "Sin NIT propio",
    taxIdNumber: "",
    canonicalId: "CAN-PAS-033-CCV",
    ecclesiasticalRegistry: "Acta de Fundación Pastoral Social N.º 19-2010",
    foundationDate: "2010-08-24",
    responsibleAuthority: "Dra. Elena María Vargas Pardo (Directora)",
    jurisdictionDiocese: "Arquidiócesis Primada (Jurisdicción territorial)",
    country: "Colombia",
    department: "Cundinamarca",
    municipality: "Bogotá D.C.",
    postalCode: "110221",
    email: "centro@caminoyvida.demo.org",
    phone: "(601) 620 4410",
    website: "https://caminoyvida.demo.org/centro-pastoral",
    adminManager: "Carlos Eduardo Niño (Coordinador Administrativo)",
    canonicalRelationships:
      "Obra apostólica vinculada a Fundación Camino y Vida (opera bajo NIT de la fundación)",
  },
};

const institutions: Institution[] = legacyInstitutions.map((institution) => {
  const organization = organizationFor(institution.organization ?? "");
  return {
    ...institution,
    ...dates(),
    organizationId: organization?.id ?? "ORG-001",
    clientId: clientFor(institution.organization ?? ""),
    address: institution.detail,
    ...institutionEnrichment[institution.id],
  };
});

const contacts: Contact[] = [
  {
    ...dates(),
    id: "CNT-001",
    clientId: "CLI-001",
    organizationId: "ORG-001",
    institutionId: "INS-021",
    name: "Pbro. Javier Morales",
    role: "Ecónomo Diocesano · Contacto comercial",
    email: "economato@diocesissangabriel.demo.org",
    phone: "+57 310 445 9100",
    status: "Activo",
  },
  {
    ...dates(),
    id: "CNT-002",
    clientId: "CLI-001",
    organizationId: "ORG-001",
    institutionId: "INS-021",
    name: "Ing. Mauricio Ospina",
    role: "Delegado Tecnológico y Seguridad",
    email: "ti@diocesissangabriel.demo.org",
    phone: "+57 311 609 4412",
    status: "Activo",
  },
  {
    ...dates(),
    id: "CNT-003",
    clientId: "CLI-002",
    organizationId: "ORG-002",
    institutionId: "INS-014",
    name: "Clara Inés Gómez",
    role: "Administración y Despacho Parroquial",
    email: "despacho@santamariadelvalle.demo.org",
    phone: "+57 315 802 3311",
    status: "Activo",
  },
  {
    ...dates(),
    id: "CNT-004",
    clientId: "CLI-003",
    organizationId: "ORG-003",
    institutionId: "INS-033",
    name: "Carlos Eduardo Niño",
    role: "Director Financiero y Contratación",
    email: "finanzas@caminoyvida.demo.org",
    phone: "+57 320 914 2208",
    status: "Activo",
  },
];

const users: User[] = legacyUsers.map((user) => ({
  ...user,
  ...dates(),
  clientId: clientFor(user.organization ?? ""),
  institutionIds: [],
  membershipIds: [],
}));

const roles: Role[] = legacyRoles.map((role) => ({
  ...role,
  ...dates(),
  permissionIds: [],
  scope: role.role ?? "Institucional",
}));

const applications: Application[] = [
  {
    ...dates(),
    id: "APP-ERP",
    code: "PROD-AO-ERP",
    name: "A&O ERP",
    description:
      "Plataforma integral de operación parroquial, sacramental, pastoral, administrativa, contable y documental para instituciones eclesiales.",
    category: "ERP Eclesial y Parroquial",
    commercialVersion: "2026.2 Enterprise",
    commercialAvailability: "Disponible general (GA)",
    targetEntities: [
      "Parroquia",
      "Cuasiparroquia",
      "Santuario",
      "Seminario",
      "Convento",
      "Monasterio",
      "Comunidad religiosa",
      "Colegio",
      "Fundación",
    ],
    moduleIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "APP-DIO",
    code: "PROD-AO-DIO",
    name: "A&O Diocesano",
    description:
      "Consola de gobierno episcopal, cancillería, economato consolidado, clero y supervisión de parroquias e instituciones adscritas.",
    category: "Gobierno Diocesano y Curia",
    commercialVersion: "2026.1 Curia",
    commercialAvailability: "Bajo contrato institucional",
    targetEntities: ["Arquidiócesis", "Diócesis", "Provincia religiosa", "Congregación"],
    moduleIds: [],
    status: "Activo",
  },
];

const modules: Module[] = [
  {
    ...dates(),
    id: "MOD-CORE",
    code: "ERP-CORE",
    applicationId: "APP-ERP",
    name: "Núcleo institucional y administración base",
    description:
      "Identidad institucional, sedes, configuración regional, usuarios/permisos y trazabilidad base compartida sin dependencia confesional.",
    category: "Plataforma Base",
    requiredModuleIds: [],
    commercialAvailability: "Incluido en base",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-COM",
    code: "ERP-COM",
    applicationId: "APP-ERP",
    name: "Comunidad y pastoral",
    description:
      "Directorio de feligreses, familias, grupos apostólicos, catequesis, agenda parroquial y comunicaciones.",
    category: "Pastoral y Comunidad",
    requiredModuleIds: ["MOD-CORE"],
    commercialAvailability: "Incluido en base",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-SAC",
    code: "ERP-SAC",
    applicationId: "APP-ERP",
    name: "Sacramentos y partidas",
    description:
      "Libros parroquiales canónicos, bautismos, confirmaciones, matrimonios, notas marginales y emisión de certificados.",
    category: "Cancillería y Despacho",
    requiredModuleIds: ["MOD-COM"],
    commercialAvailability: "Incluido en base",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-DOC",
    code: "ERP-DOC",
    applicationId: "APP-ERP",
    name: "Gestión documental",
    description:
      "Archivo institucional digital, expedientes, correspondencia oficial y conservación documental.",
    category: "Archivo y Cumplimiento",
    requiredModuleIds: ["MOD-CORE"],
    commercialAvailability: "Incluido en base",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-FIN",
    code: "ERP-FIN",
    applicationId: "APP-ERP",
    name: "Finanzas y recursos",
    description:
      "Tesorería, ingresos, ofrendas, contabilidad institucional, presupuestos, activos fijos y reportes.",
    category: "Administración y Economato",
    requiredModuleIds: ["MOD-CORE"],
    commercialAvailability: "Incluido en base",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-GOB",
    code: "DIO-GOB",
    applicationId: "APP-DIO",
    name: "Gobierno y consolidación diocesana",
    description:
      "Supervisión de parroquias, decretos episcopales, clero, aportes diocesanos y consolidación financiera de la curia.",
    category: "Gobierno Diocesano",
    requiredModuleIds: ["MOD-COM", "MOD-DOC", "MOD-FIN"],
    commercialAvailability: "Bajo contrato institucional",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-COM",
    code: "ERP-CRI-COM",
    applicationId: "APP-ERP",
    name: "A&O Cristiano · Miembros y comunidad",
    description:
      "Registro de miembros, familias y relaciones, visitantes, contacto, membresía, ingreso, participación y bautismos según prácticas de la congregación.",
    category: "Paquete A&O Cristiano",
    requiredModuleIds: ["MOD-CORE"],
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-GRP",
    code: "ERP-CRI-GRP",
    applicationId: "APP-ERP",
    name: "A&O Cristiano · Ministerios y grupos",
    description:
      "Ministerios, departamentos, células, grupos pequeños, líderes, integrantes, equipos de servicio, asignaciones, historial y organización.",
    category: "Paquete A&O Cristiano",
    requiredModuleIds: ["MOD-CRI-COM"],
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-CUL",
    code: "ERP-CRI-CUL",
    applicationId: "APP-ERP",
    name: "A&O Cristiano · Cultos, eventos y asistencia",
    description:
      "Programación de cultos, reuniones y actividades, calendario, responsables, asistencia por persona/grupo/actividad, historial e informes básicos.",
    category: "Paquete A&O Cristiano",
    requiredModuleIds: ["MOD-CRI-COM"],
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-ADM",
    code: "ERP-CRI-ADM",
    applicationId: "APP-ERP",
    name: "A&O Cristiano · Administración, finanzas y documentos",
    description:
      "Adaptación congregacional para diezmos/ofrendas/donaciones/egresos/caja-bancos/presupuestos/informes, sedes, responsables, actas, correspondencia, inventarios, activos y tareas.",
    category: "Paquete A&O Cristiano",
    requiredModuleIds: ["MOD-FIN", "MOD-DOC"],
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-PAS",
    code: "ERP-CRI-PAS",
    applicationId: "APP-ERP",
    name: "A&O Cristiano · Acompañamiento pastoral",
    description:
      "Visitas, seguimiento a nuevos miembros, consejería, acompañamiento familiar, peticiones de oración, compromisos y actuaciones autorizadas con acceso restringido.",
    category: "Paquete A&O Cristiano",
    requiredModuleIds: ["MOD-CRI-COM"],
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    featureIds: [],
    status: "Activo",
  },
];

const features: Feature[] = [
  {
    ...dates(),
    id: "MOD-CORE-CORE",
    code: "FT-CORE-INSTITUCION",
    moduleId: "MOD-CORE",
    name: "Núcleo institucional · identidad, sedes, configuración y usuarios",
    description: "Operación institucional base, sedes, responsables, configuración regional y control interno.",
    commercialAvailability: "Disponible general (GA)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-COM-CORE",
    code: "FT-FELIGRESES",
    moduleId: "MOD-COM",
    name: "Comunidad y pastoral · censo de feligreses y familias",
    description: "Ficha de feligreses, núcleos familiares, grupos pastorales y catequesis.",
    commercialAvailability: "Disponible general (GA)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-COM-AGENDA",
    code: "FT-AGENDA",
    moduleId: "MOD-COM",
    name: "Comunidad y pastoral · agenda litúrgica yenciones",
    description: "Programación de eucaristías, intenciones y celebraciones comunitarias.",
    commercialAvailability: "Disponible general (GA)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-SAC-CORE",
    code: "FT-LIBROS",
    moduleId: "MOD-SAC",
    name: "Sacramentos y partidas · libros canónicos y certificados",
    description: "Inscripción de partidas sacramentales, folios y expedición de certificados.",
    commercialAvailability: "Disponible general (GA)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-DOC-CORE",
    code: "FT-ARCHIVO",
    moduleId: "MOD-DOC",
    name: "Gestión documental · operaciones y archivo digital",
    description: "Radicación, clasificación documental, decretos y expedientes.",
    commercialAvailability: "Disponible general (GA)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-FIN-CORE",
    code: "FT-TESORERIA",
    moduleId: "MOD-FIN",
    name: "Finanzas y recursos · operaciones contables y presupuestos",
    description: "Recibos de caja, egresos, asientos contables, presupuestos y bienes.",
    commercialAvailability: "Disponible general (GA)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-GOB-CORE",
    code: "FT-CURIA",
    moduleId: "MOD-GOB",
    name: "Gobierno diocesano · vigilancia canónica y economato",
    description: "Consolidación de informes parroquiales, clero y cancillería.",
    commercialAvailability: "Bajo contrato institucional",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-COM-CORE",
    code: "FT-CRI-MIEMBROS",
    moduleId: "MOD-CRI-COM",
    name: "A&O Cristiano · miembros, familias, visitantes y participación",
    description:
      "Registro de miembros y visitantes, contacto, familias/relaciones, membresía, ingreso, historial de participación y bautismos congregacionales.",
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-GRP-CORE",
    code: "FT-CRI-MINISTERIOS",
    moduleId: "MOD-CRI-GRP",
    name: "A&O Cristiano · ministerios, grupos, células y equipos",
    description:
      "Ministerios, departamentos, células, grupos pequeños, líderes, integrantes, equipos de servicio, asignaciones, historial y organización.",
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-CUL-CORE",
    code: "FT-CRI-CULTOS",
    moduleId: "MOD-CRI-CUL",
    name: "A&O Cristiano · cultos, eventos, calendario y asistencia",
    description:
      "Programación de cultos, reuniones y actividades, calendario, responsables, asistencia por persona/grupo/actividad, historial e informes básicos.",
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-ADM-CORE",
    code: "FT-CRI-ADM-FIN-DOC",
    moduleId: "MOD-CRI-ADM",
    name: "A&O Cristiano · administración, finanzas congregacionales y documentos",
    description:
      "Diezmos, ofrendas, donaciones, egresos, caja/bancos, presupuestos, informes, sedes, responsables, actas, correspondencia, inventarios, activos y tareas.",
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-CRI-PAS-CORE",
    code: "FT-CRI-ACOMPANAMIENTO",
    moduleId: "MOD-CRI-PAS",
    name: "A&O Cristiano · acompañamiento pastoral confidencial",
    description:
      "Visitas, seguimiento a nuevos miembros, consejería, acompañamiento familiar, peticiones de oración, compromisos y actuaciones autorizadas con acceso restringido.",
    commercialAvailability: "Paquete A&O Cristiano (suscripción)",
    status: "Activo",
  },
];

modules.forEach(
  (module) =>
    (module.featureIds = features
      .filter((feature) => feature.moduleId === module.id)
      .map((feature) => feature.id)),
);
applications.forEach(
  (application) =>
    (application.moduleIds = modules
      .filter((module) => module.applicationId === application.id)
      .map((module) => module.id)),
);

const planEnrichment: Record<
  string,
  {
    code: string;
    applicationId: string;
    price: number;
    currency: string;
    billingPeriod: string;
    storageLimitGb: number;
    moduleIds: string[];
    conditions: string;
  }
> = {
  Parroquial: {
    code: "PLN-PAR-2026",
    applicationId: "APP-ERP",
    price: 290000,
    currency: "COP",
    billingPeriod: "Mensual",
    storageLimitGb: 25,
    moduleIds: ["MOD-CORE", "MOD-COM", "MOD-SAC", "MOD-DOC", "MOD-FIN"],
    conditions:
      "Licencia para una sede parroquial o santuario, hasta 10 usuarios concurrentes y 25 GB de archivo.",
  },
  Institucional: {
    code: "PLN-INS-2026",
    applicationId: "APP-ERP",
    price: 980000,
    currency: "COP",
    billingPeriod: "Mensual",
    storageLimitGb: 150,
    moduleIds: ["MOD-CORE", "MOD-COM", "MOD-SAC", "MOD-DOC", "MOD-FIN"],
    conditions:
      "Cobertura para congregaciones, fundaciones o colegios con hasta 10 sedes y 30 usuarios.",
  },
  Diocesano: {
    code: "PLN-DIO-2026",
    applicationId: "APP-DIO",
    price: 4800000,
    currency: "COP",
    billingPeriod: "Mensual",
    storageLimitGb: 1000,
    moduleIds: ["MOD-CORE", "MOD-COM", "MOD-SAC", "MOD-DOC", "MOD-FIN", "MOD-GOB"],
    conditions:
      "Cobertura multiinstitucional para diócesis, arquidiócesis o provincias religiosas con curia y parroquias.",
  },
  "Cristiano Esencial": {
    code: "PLN-CRI-ESS-2026",
    applicationId: "APP-ERP",
    price: 320000,
    currency: "COP",
    billingPeriod: "Mensual",
    storageLimitGb: 30,
    moduleIds: ["MOD-CORE", "MOD-CRI-COM", "MOD-CRI-GRP", "MOD-CRI-CUL", "MOD-CRI-ADM", "MOD-CRI-PAS", "MOD-FIN", "MOD-DOC"],
    conditions:
      "Paquete A&O Cristiano para congregaciones independientes o sedes: miembros, ministerios, cultos/eventos, finanzas congregacionales, administración documental y acompañamiento pastoral. No incluye sacramentos católicos, libros sacramentales, gestión parroquial/diocesana, liturgia ni catequesis sacramental católica.",
  },
};

const planRows = legacyPlans;
const extraChristianPlans: CommercialPlan[] = [
  {
    ...dates(),
    id: "PLN-CRI",
    code: "PLN-CRI-ESS-2026",
    name: "Cristiano Esencial",
    detail: "Paquete congregacional para miembros, ministerios, cultos, finanzas, administración y acompañamiento pastoral.",
    description:
      "Suscripción A&O Cristiano para congregaciones: activa módulos cristianos y reutiliza finanzas/gestión documental genéricas sin habilitar sacramentos católicos, libros sacramentales, gestión parroquial/diocesana, liturgia católica ni catequesis sacramental. Paquete funcional A&O Cristiano.",
    coverage: "1 congregación/sede · 15 usuarios · 30 GB · módulos cristianos y genéricos",
    owner: "Comercial SaaS",
    status: "Activo",
    applicationId: "APP-ERP",
    price: 320000,
    currency: "COP",
    billingPeriod: "Mensual",
    storageLimitGb: 30,
    version: 1,
    conditions:
      "Activable por suscripción/entitlements en A&O ERP. Compatible con módulos genéricos contratados y combinable con módulos católicos solo cuando el plan/contrato los incluya explícitamente. La desactivación bloquea acceso sin eliminar datos.",
    moduleIds: ["MOD-CORE", "MOD-CRI-COM", "MOD-CRI-GRP", "MOD-CRI-CUL", "MOD-CRI-ADM", "MOD-CRI-PAS", "MOD-FIN", "MOD-DOC"],
    userLimit: 15,
    institutionLimit: 3,
  },
];

const plans: CommercialPlan[] = [
  ...planRows.map((plan) => {
    const enriched = planEnrichment[plan.name] ?? planEnrichment["Parroquial"]!;
    return {
      ...plan,
      ...dates(),
      code: enriched.code,
      applicationId: enriched.applicationId,
      description: plan.detail,
      price: enriched.price,
      currency: enriched.currency,
      billingPeriod: enriched.billingPeriod,
      storageLimitGb: enriched.storageLimitGb,
      version: 1,
      conditions: enriched.conditions,
      moduleIds: enriched.moduleIds,
      userLimit: plan.name === "Parroquial" ? 10 : plan.name === "Institucional" ? 30 : 999,
      institutionLimit: plan.name === "Parroquial" ? 1 : plan.name === "Institucional" ? 10 : 999,
    };
  }),
  ...extraChristianPlans,
];

const contractRows = sectionRows("suscripciones");
const contracts: Contract[] = contractRows.map((row, index) => {
  const resolvedClientId = clientFor(
    row.context
      .replace("Plan Ecosistema · ", "")
      .replace("Santa María del Camino", "Parroquia Santa María del Valle")
      .replace("Renovación Institucional", "Fundación Camino y Vida"),
  );
  const resolvedOrg =
    organizations.find((org) => org.clientId === resolvedClientId) ??
    organizations[index] ??
    organizations[0];
  const assignedPlan = plans[index % plans.length] ?? plans[0]!;
  const discount = index === 0 ? 0 : index === 1 ? 30000 : 80000;
  const contractedAmount = Math.max((assignedPlan.price ?? 290000) - discount, 0);

  return {
    ...dates(),
    id: `CON-${row.id}`,
    clientId: resolvedClientId,
    organizationId: resolvedOrg?.id ?? "ORG-001",
    applicationId: assignedPlan.applicationId ?? "APP-ERP",
    planId: assignedPlan.id,
    status: row.status,
    contractedAt: "2025-12-15",
    startsAt: "2026-01-01",
    endsAt: "2026-12-31",
    billingPeriod: assignedPlan.billingPeriod ?? "Mensual",
    contractedAmount,
    discountAmount: discount,
    currency: assignedPlan.currency ?? "COP",
    specialConditions:
      index === 0
        ? "Acuerdo marco diocesano con soporte prioritario y acompañamiento de cancillería."
        : "Condiciones estándar de suscripción institucional A&O.",
    autoRenew: index !== 2,
    planSnapshot: {
      planId: assignedPlan.id,
      planCode: assignedPlan.code ?? assignedPlan.id,
      planName: assignedPlan.name,
      planVersion: assignedPlan.version ?? 1,
      applicationId: assignedPlan.applicationId ?? "APP-ERP",
      price: assignedPlan.price ?? 290000,
      currency: assignedPlan.currency ?? "COP",
      billingPeriod: assignedPlan.billingPeriod ?? "Mensual",
      userLimit: assignedPlan.userLimit,
      institutionLimit: assignedPlan.institutionLimit,
      storageLimitGb: assignedPlan.storageLimitGb ?? 25,
      moduleIds: [...assignedPlan.moduleIds],
      capturedAt: "2025-12-15T00:00:00.000Z",
    },
    modificationHistory: [
      {
        date: "2025-12-15",
        action: "Celebración de contrato",
        summary: `Contrato inicial suscrito bajo plan ${assignedPlan.name} (v${assignedPlan.version ?? 1}).`,
        author: row.owner,
      },
    ],
  };
});

const subscriptions: Subscription[] = contractRows.map((row, index) => {
  const contract = contracts[index] ?? contracts[0]!;
  return {
    ...dates(),
    id: row.id,
    contractId: contract.id,
    clientId: contract.clientId,
    organizationId: contract.organizationId ?? "ORG-001",
    applicationIds: contract.applicationId === "APP-DIO" ? ["APP-ERP", "APP-DIO"] : ["APP-ERP"],
    status: row.status,
    startsAt: contract.startsAt,
    endsAt: contract.endsAt,
    renewalAt: "2027-01-01",
    billingPeriod: contract.billingPeriod ?? "Mensual",
    autoRenew: contract.autoRenew ?? true,
    notes: `${row.name} · ${row.detail}`,
  };
});

const licenses: License[] = subscriptions.map((subscription, index) => {
  const contract = contracts.find((item) => item.id === subscription.contractId) ?? contracts[0]!;
  const assignedPlan =
    plans.find((item) => item.id === contract.planId) ?? plans[index % plans.length]!;
  const institution =
    institutions.find((inst) => inst.organizationId === subscription.organizationId) ??
    institutions[index % institutions.length];
  const enabledModules = contract.planSnapshot?.moduleIds ?? assignedPlan.moduleIds;
  const enabledFeatures = features
    .filter((feature) => enabledModules.includes(feature.moduleId))
    .map((feature) => feature.id);

  return {
    ...dates(),
    id: `LIC-${subscription.id}`,
    subscriptionId: subscription.id,
    contractId: contract.id,
    organizationId: subscription.organizationId ?? "ORG-001",
    institutionId: index === 0 ? undefined : (institution?.id ?? "INS-014"),
    scopeType: index === 0 ? "Organizacional" : "Institucional",
    applicationId: contract.applicationId ?? "APP-ERP",
    status: subscription.status,
    startsAt: subscription.startsAt ?? "2026-01-01",
    expiresAt: subscription.endsAt ?? "2026-12-31",
    userLimit: contract.planSnapshot?.userLimit ?? assignedPlan.userLimit,
    institutionLimit: contract.planSnapshot?.institutionLimit ?? assignedPlan.institutionLimit,
    storageLimitGb: contract.planSnapshot?.storageLimitGb ?? assignedPlan.storageLimitGb ?? 25,
    moduleIds: enabledModules,
    featureIds: enabledFeatures,
    authorizedExceptions:
      index === 0
        ? "+5 usuarios adicionales autorizados para comisión de archivo diocesano"
        : "Sin excepciones activas",
    exceptionReason:
      index === 0 ? "Digitalización histórica de libros parroquiales en cancillería" : undefined,
    exceptionApprovedBy: index === 0 ? "Dirección Comercial A&O" : undefined,
    exceptionExpiresAt: index === 0 ? "2027-06-30" : undefined,
  };
});

const entitlements: Entitlement[] = licenses.flatMap((license) =>
  license.moduleIds.map((moduleId) => ({
    ...dates(),
    id: `ENT-${license.id}-${moduleId}`,
    licenseId: license.id,
    moduleId,
    enabled: true,
    featureIds: features
      .filter((feature) => feature.moduleId === moduleId)
      .map((feature) => feature.id),
    notes: "Habilitado por condiciones de licencia activa",
  })),
);

const usageLimits: UsageLimit[] = licenses.flatMap((license, index) => [
  {
    ...dates(),
    id: `LIM-${license.id}-USR`,
    licenseId: license.id,
    resource: "usuarios",
    unit: "usuarios",
    maximum: license.userLimit,
    used: index === 0 ? 18 : index === 1 ? 6 : 4,
    exceptionExtra: index === 0 ? 5 : 0,
    exceptionReason: license.exceptionReason,
    exceptionApprovedBy: license.exceptionApprovedBy,
    exceptionExpiresAt: license.exceptionExpiresAt,
  },
  {
    ...dates(),
    id: `LIM-${license.id}-INS`,
    licenseId: license.id,
    resource: "instituciones",
    unit: "instituciones",
    maximum: license.institutionLimit ?? 1,
    used: index === 0 ? 2 : 1,
    exceptionExtra: 0,
  },
  {
    ...dates(),
    id: `LIM-${license.id}-STO`,
    licenseId: license.id,
    resource: "almacenamiento",
    unit: "GB",
    maximum: license.storageLimitGb ?? 25,
    used: index === 0 ? 142 : index === 1 ? 9 : 14,
    exceptionExtra: 0,
  },
  {
    ...dates(),
    id: `LIM-${license.id}-MOD`,
    licenseId: license.id,
    resource: "módulos",
    unit: "módulos",
    maximum: license.moduleIds.length,
    used: license.moduleIds.length,
    exceptionExtra: 0,
  },
]);

const invoices: Invoice[] = sectionRows("facturacion-cartera")
  .filter((row) => row.id.startsWith("FAC"))
  .map((row) => {
    const resolvedClientId = clientFor(
      row.context.replace("Diocesis de San Gabriel", "Diócesis de San Gabriel"),
    );
    const resolvedContract =
      contracts.find((contract) => contract.clientId === resolvedClientId) ?? contracts[0]!;
    const resolvedSub =
      subscriptions.find((sub) => sub.contractId === resolvedContract.id) ?? subscriptions[0]!;
    const subtotal = 4800000;
    const discount = 0;
    const tax = 0;
    const total = subtotal - discount + tax;
    const paid = 1250000;

    return {
      ...dates(),
      id: row.id,
      clientId: resolvedClientId,
      organizationId: resolvedContract.organizationId ?? "ORG-001",
      contractId: resolvedContract.id,
      subscriptionId: resolvedSub.id,
      issuedAt: "2026-11-01",
      dueAt: "2026-11-30",
      subtotalAmount: subtotal,
      discountAmount: discount,
      taxAmount: tax,
      amount: total,
      paidAmount: paid,
      balanceDue: total - paid,
      portfolioStatus: "Por vencer",
      billingTypeNote:
        "Documento comercial interno de suscripción SaaS · No equivale a factura electrónica DIAN",
      concepts: [
        {
          description: "Suscripción Plan Diocesano · Cobertura Curia y Parroquias (Noviembre 2026)",
          quantity: 1,
          unitPrice: 4800000,
          total: 4800000,
        },
      ],
      status: row.status,
    };
  });

const payments: Payment[] = [
  {
    ...dates(),
    id: "PAG-2026-071",
    invoiceId: invoices[0]?.id ?? "FAC-2026-084",
    amount: 1250000,
    paidAt: "2026-11-04",
    method: "Transferencia bancaria",
    reference: "TRX-BANCOL-994812",
    notes: "Abono parcial conciliado por Tesorería Diocesana",
    status: "Activo",
  },
];
const tickets: Ticket[] = supportRecords["mesa-ayuda"].map((ticket, index) => ({
  ...dates(),
  id: ticket.id,
  institutionId: institutions[index % institutions.length]?.id ?? "INS-014",
  applicationId: index === 1 ? "APP-ERP" : "APP-ERP",
  moduleId: index === 0 ? "MOD-DOC" : "MOD-COM",
  title: ticket.title,
  priority: index < 2 ? "Alta" : "Media",
  status:
    ticket.status === "Abierto"
      ? "Abierto"
      : ticket.status === "En diagnóstico"
        ? "En diagnóstico"
        : "Resuelto",
  owner: ticket.owner,
}));

institutions.forEach((institution) =>
  organizations
    .find((organization) => organization.id === institution.organizationId)
    ?.institutionIds.push(institution.id),
);
users.forEach((user) =>
  organizations
    .find((organization) => organization.clientId === user.clientId)
    ?.userIds.push(user.id),
);

const firstCon = contracts[0]!;
const firstSub = subscriptions[0]!;
const firstLic = licenses[0]!;
const firstOrg = organizations.find((o) => o.id === firstCon.organizationId) ?? organizations[0]!;

const secondCon = contracts[1] ?? contracts[0]!;
const secondSub = subscriptions[1] ?? subscriptions[0]!;
const secondLic = licenses[1] ?? licenses[0]!;
const secondOrg =
  organizations.find((o) => o.id === secondCon.organizationId) ??
  organizations[1] ??
  organizations[0]!;

const provisioningRequests: ProvisioningRequest[] = [
  {
    ...dates(),
    id: "PROV-001",
    idempotencyKey: `IDEMP-${firstOrg.id}-${firstCon.id}-${firstCon.applicationId ?? "APP-ERP"}`,
    clientId: firstCon.clientId,
    organizationId: firstOrg.id,
    contractId: firstCon.id,
    subscriptionId: firstSub.id,
    licenseId: firstLic.id,
    applicationId: firstCon.applicationId ?? "APP-ERP",
    planId: firstCon.planId,
    status: "Operativo",
    requestedBy: "Dirección de Onboarding A&O",
    environmentId: `ENV-${firstOrg.id}-${firstCon.applicationId ?? "APP-ERP"}`,
    requestedModuleIds: [...firstLic.moduleIds],
    activatedModuleIds: [...firstLic.moduleIds],
    activatedFeatureIds: [...(firstLic.featureIds ?? [])],
    initialConfig: {
      legalName: firstOrg.name,
      displayName: firstOrg.shortName ?? firstOrg.name,
      taxId: firstOrg.taxId ?? "860.009.124-1",
      organizationType: firstOrg.type,
      country: firstOrg.country ?? "Colombia",
      department: firstOrg.department ?? "Cundinamarca",
      municipality: firstOrg.municipality ?? "Bogotá D.C.",
      address: firstOrg.address ?? "Carrera 7 # 10-20, Palacio Arzobispal",
      contactEmail: "cancilleria@sangabriel.org.co",
      contactPhone: "+57 (601) 350 9000",
      timezone: "America/Bogota",
      locale: "es-CO",
      currency: firstCon.currency ?? "COP",
      dateFormat: "DD/MM/YYYY",
      ecclesiasticalStructureNotes:
        "Gobierno diocesano con curia central y parroquias adscritas bajo autonomía pastoral y contabilidad consolidable.",
      authorizedInstitutionIds: [...firstOrg.institutionIds],
    },
    stages: [
      {
        stageCode: "commercial_validation",
        stageName: "1. Validación comercial y de licenciamiento",
        operationId: "OP-PROV-001-STG-1",
        status: "Completado",
        executedAt: "2026-01-02T09:00:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: `Contrato ${firstCon.id} y licencia ${firstLic.id} validados satisfactoriamente.`,
        attempts: 1,
      },
      {
        stageCode: "org_initial_config",
        stageName: "2. Configuración regional e institucional de la organización",
        operationId: "OP-PROV-001-STG-2",
        status: "Completado",
        executedAt: "2026-01-02T09:05:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: "Identidad jurídica, moneda COP, zona America/Bogota y preferencias aplicadas.",
        attempts: 1,
      },
      {
        stageCode: "institutional_structure",
        stageName: "3. Preparación de estructura y relaciones eclesiales",
        operationId: "OP-PROV-001-STG-3",
        status: "Completado",
        executedAt: "2026-01-02T09:10:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: `${firstOrg.institutionIds.length} institución(es) autorizada(s) vinculada(s) sin crear entidades no validadas.`,
        attempts: 1,
      },
      {
        stageCode: "environment_allocation",
        stageName: "4. Asignación de entorno lógico multi-tenant",
        operationId: "OP-PROV-001-STG-4",
        status: "Completado",
        executedAt: "2026-01-02T09:15:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: `Entorno lógico ENV-${firstOrg.id}-${firstCon.applicationId ?? "APP-ERP"} aprovisionado en infraestructura compartida.`,
        attempts: 1,
      },
      {
        stageCode: "module_activation",
        stageName: "5. Resolución de dependencias y activación de módulos",
        operationId: "OP-PROV-001-STG-5",
        status: "Completado",
        executedAt: "2026-01-02T09:20:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: `${firstLic.moduleIds.length} módulos contratados activados conforme a entitlements vigentes.`,
        attempts: 1,
      },
    ],
    history: [
      {
        id: "HIST-PROV-001-3",
        timestamp: "2026-01-02T09:20:00.000Z",
        fromStatus: "Activando servicios",
        toStatus: "Operativo",
        actor: "Motor de Aprovisionamiento",
        result: "Exitoso",
        notes: "Entorno lógico habilitado y módulos contratados en estado Operativo.",
        operationId: "OP-PROV-001-FINAL",
      },
      {
        id: "HIST-PROV-001-2",
        timestamp: "2026-01-02T09:00:00.000Z",
        fromStatus: "Pendiente",
        toStatus: "Validado",
        actor: "Motor de Aprovisionamiento",
        result: "Exitoso",
        notes: "Verificación comercial y de capacidades superada.",
        operationId: "OP-PROV-001-VAL",
      },
      {
        id: "HIST-PROV-001-1",
        timestamp: "2026-01-02T08:45:00.000Z",
        fromStatus: "Creación",
        toStatus: "Pendiente",
        actor: "Dirección de Onboarding A&O",
        result: "Exitoso",
        notes: `Solicitud originada desde contrato aprobado ${firstCon.id}.`,
        operationId: "OP-PROV-001-INIT",
      },
    ],
    retryCount: 0,
  },
  {
    ...dates(),
    id: "PROV-002",
    idempotencyKey: `IDEMP-${secondOrg.id}-${secondCon.id}-${secondCon.applicationId ?? "APP-ERP"}`,
    clientId: secondCon.clientId,
    organizationId: secondOrg.id,
    contractId: secondCon.id,
    subscriptionId: secondSub.id,
    licenseId: secondLic.id,
    applicationId: secondCon.applicationId ?? "APP-ERP",
    planId: secondCon.planId,
    status: "Fallido",
    requestedBy: "Dirección de Onboarding A&O",
    requestedModuleIds: [...secondLic.moduleIds],
    activatedModuleIds: [],
    activatedFeatureIds: [],
    initialConfig: {
      legalName: secondOrg.name,
      displayName: secondOrg.shortName ?? secondOrg.name,
      taxId: secondOrg.taxId ?? "900.412.889-5",
      organizationType: secondOrg.type,
      country: secondOrg.country ?? "Colombia",
      department: secondOrg.department ?? "Antioquia",
      municipality: secondOrg.municipality ?? "Medellín",
      address: secondOrg.address ?? "Calle 50 # 43-12",
      contactEmail: "administracion@congregacion.org.co",
      contactPhone: "+57 (604) 412 8800",
      timezone: "America/Bogota",
      locale: "es-CO",
      currency: secondCon.currency ?? "COP",
      dateFormat: "DD/MM/YYYY",
      ecclesiasticalStructureNotes:
        "Congregación religiosa con casas y colegios autónomos vinculados a la provincia.",
      authorizedInstitutionIds: [...secondOrg.institutionIds],
    },
    stages: [
      {
        stageCode: "commercial_validation",
        stageName: "1. Validación comercial y de licenciamiento",
        operationId: "OP-PROV-002-STG-1",
        status: "Completado",
        executedAt: "2026-11-05T14:00:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: `Contrato ${secondCon.id} y licencia ${secondLic.id} verificados.`,
        attempts: 1,
      },
      {
        stageCode: "org_initial_config",
        stageName: "2. Configuración regional e institucional de la organización",
        operationId: "OP-PROV-002-STG-2",
        status: "Completado",
        executedAt: "2026-11-05T14:04:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: "Parámetros regionales es-CO y zona horaria America/Bogota registrados.",
        attempts: 1,
      },
      {
        stageCode: "institutional_structure",
        stageName: "3. Preparación de estructura y relaciones eclesiales",
        operationId: "OP-PROV-002-STG-3",
        status: "Fallido",
        executedAt: "2026-11-05T14:08:00.000Z",
        executedBy: "Motor de Aprovisionamiento",
        detail: "Interrupción durante la validación de parámetros de sede principal.",
        errorMessage:
          "Tiempo de espera agotado al verificar metadatos de estructura institucional. Listo para reintento seguro.",
        attempts: 1,
      },
      {
        stageCode: "environment_allocation",
        stageName: "4. Asignación de entorno lógico multi-tenant",
        operationId: "OP-PROV-002-STG-4",
        status: "Pendiente",
        detail: "En espera de completar etapa previa.",
        attempts: 0,
      },
      {
        stageCode: "module_activation",
        stageName: "5. Resolución de dependencias y activación de módulos",
        operationId: "OP-PROV-002-STG-5",
        status: "Pendiente",
        detail: "En espera de asignación de entorno lógico.",
        attempts: 0,
      },
    ],
    history: [
      {
        id: "HIST-PROV-002-2",
        timestamp: "2026-11-05T14:08:00.000Z",
        fromStatus: "Configurando",
        toStatus: "Fallido",
        actor: "Motor de Aprovisionamiento",
        result: "Fallido",
        notes:
          "Fallo en etapa 3 (institutional_structure). Se conservan completadas las etapas 1 y 2 para reintento idempotente.",
        operationId: "OP-PROV-002-FAIL",
      },
      {
        id: "HIST-PROV-002-1",
        timestamp: "2026-11-05T13:55:00.000Z",
        fromStatus: "Creación",
        toStatus: "Pendiente",
        actor: "Dirección de Onboarding A&O",
        result: "Exitoso",
        notes: `Solicitud creada para ${secondOrg.name}.`,
        operationId: "OP-PROV-002-INIT",
      },
    ],
    lastError:
      "Etapa 3 (institutional_structure): Tiempo de espera agotado al verificar metadatos de estructura institucional. Listo para reintento seguro.",
    retryCount: 1,
  },
];

const environments: TenantEnvironment[] = [
  {
    ...dates(),
    id: `ENV-${firstOrg.id}-${firstCon.applicationId ?? "APP-ERP"}`,
    organizationId: firstOrg.id,
    clientId: firstCon.clientId,
    contractId: firstCon.id,
    subscriptionId: firstSub.id,
    licenseId: firstLic.id,
    applicationId: firstCon.applicationId ?? "APP-ERP",
    provisioningRequestId: "PROV-001",
    status: "Operativo",
    availabilityStatus: "Disponible",
    isolationModel: "Instancia lógica multi-tenant en infraestructura compartida",
    installedProductVersion: "2026.4.0",
    availableProductVersion: "2026.4.2",
    updateStatus: "Actualización disponible",
    moduleConfigurations: firstLic.moduleIds.map((modId) => {
      const mod = modules.find((m) => m.id === modId);
      return {
        moduleId: modId,
        moduleCode: mod?.code ?? modId,
        moduleName: mod?.name ?? modId,
        enabled: true,
        installedVersion: "2026.4.0",
        compatibleWithProduct: true,
        configSummary: "Configuración estándar multi-tenant activa",
        activatedAt: "2026-01-02",
      };
    }),
    regionalConfig: {
      timezone: "America/Bogota",
      locale: "es-CO",
      currency: firstCon.currency ?? "COP",
      country: firstOrg.country ?? "Colombia",
      department: firstOrg.department ?? "Cundinamarca",
      municipality: firstOrg.municipality ?? "Bogotá D.C.",
    },
    dataRetentionPolicy:
      "Conservación íntegra de libros sacramentales, contabilidad e historial auditable por mínimo 10 años; exportación garantizada ante terminación sin borrado físico automático.",
    operationHistory: [
      {
        id: "ENV-OP-001",
        date: "2026-01-02",
        action: "Aprovisionamiento inicial completado",
        actor: "Motor de Aprovisionamiento",
        detail: `Instancia lógica habilitada con ${firstLic.moduleIds.length} módulos contratados en versión 2026.4.0.`,
        result: "Exitoso",
      },
    ],
  },
];

const infrastructureIncidents: InfrastructureIncident[] = [
  {
    ...dates(),
    id: "INC-2026-001",
    environmentId: environments[0]!.id,
    organizationId: firstOrg.id,
    applicationId: firstCon.applicationId ?? "APP-ERP",
    kind: "Mantenimiento programado",
    severity: "Baja",
    title: "Actualización menor disponible a versión de software 2026.4.2",
    detail:
      "Parche lógico de validación de actas sacramentales e informes diocesanos compatible con el esquema actual.",
    targetVersion: "2026.4.2",
    scheduledWindow: "Domingo 02:00 - 03:00 America/Bogota",
    status: "Abierta",
    reportedBy: "Gobierno de Versiones A&O",
  },
];

export const initialSaasState: SaasDomainState = {
  version: 1,
  clients,
  organizations,
  institutions,
  contacts,
  users,
  memberships: [],
  roles,
  permissions: [],
  applications,
  modules,
  features,
  plans,
  contracts,
  subscriptions,
  licenses,
  entitlements,
  usageLimits,
  invoices,
  payments,
  tickets,
  provisioningRequests,
  environments,
  infrastructureIncidents,
  settings: {
    theme: "institutional",
    density: "comfortable",
    scope: "global",
    organization: "",
    enabledModuleIds: [
      "MOD-CORE",
      "MOD-COM",
      "MOD-SAC",
      "MOD-FIN",
      "MOD-DOC",
      "MOD-GOB",
      "MOD-CRI-COM",
      "MOD-CRI-GRP",
      "MOD-CRI-CUL",
      "MOD-CRI-ADM",
      "MOD-CRI-PAS",
    ],
  },
  moduleRecords: Object.fromEntries(
    ecosystemSections.map((section) => [section.path, section.records]),
  ),
  supportRecords,
};
