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

export type EntityStatus = DemoStatus | "En revisión" | "Activo";
export type DateFields = { createdAt: string; updatedAt: string };

export type Client = DateFields & {
  id: string;
  name: string;
  kind: string;
  country: string;
  status: EntityStatus;
  owner: string;
};

export type Organization = DateFields &
  LegacyOrganization & {
    clientId: string;
    institutionIds: string[];
    userIds: string[];
  };

export type Institution = DateFields &
  SaaSRecord & {
    organizationId: string;
    clientId: string;
    address: string;
  };

export type Contact = DateFields & {
  id: string;
  clientId: string;
  institutionId?: string;
  name: string;
  email: string;
  phone?: string;
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
};
export type Module = DateFields & {
  id: string;
  applicationId: string;
  name: string;
  featureIds: string[];
  status: EntityStatus;
};
export type Feature = DateFields & {
  id: string;
  moduleId: string;
  name: string;
  status: EntityStatus;
};

export type CommercialPlan = DateFields &
  SaaSRecord & { moduleIds: string[]; userLimit: number; institutionLimit: number };
export type Contract = DateFields & {
  id: string;
  clientId: string;
  planId: string;
  status: EntityStatus;
  startsAt: string;
  endsAt: string;
};
export type Subscription = DateFields & {
  id: string;
  contractId: string;
  clientId: string;
  applicationIds: string[];
  status: EntityStatus;
  renewalAt: string;
};
export type License = DateFields & {
  id: string;
  subscriptionId: string;
  institutionId?: string;
  status: EntityStatus;
  userLimit: number;
  moduleIds: string[];
};
export type Entitlement = DateFields & {
  id: string;
  licenseId: string;
  moduleId: string;
  enabled: boolean;
};
export type UsageLimit = DateFields & {
  id: string;
  licenseId: string;
  resource: string;
  maximum: number;
  used: number;
};
export type Invoice = DateFields & {
  id: string;
  clientId: string;
  contractId: string;
  amount: number;
  dueAt: string;
  status: EntityStatus;
};
export type Payment = DateFields & {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  status: EntityStatus;
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
const findByName = (items: SaaSRecord[], name: string) =>
  items.find((item) => byName(item.name) === byName(name));
const sectionRows = (path: string) =>
  ecosystemSections.find((section) => section.path === path)?.records ?? [];

const clientRows = sectionRows("clientes");
const clients: Client[] = clientRows.map((row) => ({
  ...dates(),
  id: row.id,
  name: row.name,
  kind: row.detail,
  country: row.context,
  status: row.status,
  owner: row.owner,
}));

const clientFor = (name: string) =>
  clients.find((client) => byName(client.name) === byName(name))?.id ?? clients[0]?.id ?? "CLI-001";
const organizationFor = (name: string) =>
  legacyOrganizations.find((organization) => byName(organization.name) === byName(name));

const organizations: Organization[] = legacyOrganizations.map((organization) => ({
  ...organization,
  ...dates(),
  clientId: clientFor(organization.name),
  institutionIds: [],
  userIds: [],
}));

const institutions: Institution[] = legacyInstitutions.map((institution) => {
  const organization = organizationFor(institution.organization ?? "");
  return {
    ...institution,
    ...dates(),
    organizationId: organization?.id ?? "ORG-001",
    clientId: clientFor(institution.organization ?? ""),
    address: institution.detail,
  };
});

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
    name: "A&O ERP",
    description: "Operación parroquial y pastoral",
    moduleIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "APP-DIO",
    name: "A&O Diocesano",
    description: "Gobierno y acompañamiento diocesano",
    moduleIds: [],
    status: "Activo",
  },
];
const modules: Module[] = [
  {
    ...dates(),
    id: "MOD-DOC",
    applicationId: "APP-ERP",
    name: "Gestión documental",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-COM",
    applicationId: "APP-ERP",
    name: "Comunidad y pastoral",
    featureIds: [],
    status: "Activo",
  },
  {
    ...dates(),
    id: "MOD-FIN",
    applicationId: "APP-ERP",
    name: "Finanzas y recursos",
    featureIds: [],
    status: "Activo",
  },
];
const features: Feature[] = modules.flatMap((module) => [
  {
    ...dates(),
    id: `${module.id}-CORE`,
    moduleId: module.id,
    name: `${module.name} · operaciones`,
    status: "Activo" as const,
  },
]);
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

const planRows = legacyPlans;
const plans: CommercialPlan[] = planRows.map((plan) => ({
  ...plan,
  ...dates(),
  moduleIds: modules.map((module) => module.id),
  userLimit: plan.name === "Parroquial" ? 10 : plan.name === "Institucional" ? 30 : 999,
  institutionLimit: plan.name === "Parroquial" ? 1 : plan.name === "Institucional" ? 10 : 999,
}));
const contractRows = sectionRows("suscripciones");
const contracts: Contract[] = contractRows.map((row, index) => ({
  ...dates(),
  id: `CON-${row.id}`,
  clientId: clientFor(
    row.context
      .replace("Plan Ecosistema · ", "")
      .replace("Renovación Institucional", "Fundación Camino y Vida"),
  ),
  planId: plans[index % plans.length]?.id ?? "PLAN-01",
  status: row.status,
  startsAt: "2026-01-01",
  endsAt: "2026-12-31",
}));
const subscriptions: Subscription[] = contractRows.map((row, index) => ({
  ...dates(),
  id: row.id,
  contractId: contracts[index]?.id ?? "CON-SUB-2026-014",
  clientId: contracts[index]?.clientId ?? "CLI-001",
  applicationIds: applications.map((application) => application.id),
  status: row.status,
  renewalAt: "2027-01-01",
}));
const licenses: License[] = subscriptions.map((subscription, index) => ({
  ...dates(),
  id: `LIC-${subscription.id}`,
  subscriptionId: subscription.id,
  institutionId: institutions[index % institutions.length]?.id ?? "INS-014",
  status: subscription.status,
  userLimit: plans[index % plans.length]?.userLimit ?? 10,
  moduleIds: modules.map((module) => module.id),
}));
const entitlements: Entitlement[] = licenses.flatMap((license) =>
  license.moduleIds.map((moduleId) => ({
    ...dates(),
    id: `ENT-${license.id}-${moduleId}`,
    licenseId: license.id,
    moduleId,
    enabled: true,
  })),
);
const usageLimits: UsageLimit[] = licenses.map((license) => ({
  ...dates(),
  id: `LIM-${license.id}`,
  licenseId: license.id,
  resource: "usuarios",
  maximum: license.userLimit,
  used: 3,
}));
const invoices: Invoice[] = sectionRows("facturacion-cartera")
  .filter((row) => row.id.startsWith("FAC"))
  .map((row) => ({
    ...dates(),
    id: row.id,
    clientId: clientFor(row.context.replace("Diocesis de San Gabriel", "Diócesis de San Gabriel")),
    contractId: contracts[0]?.id ?? "CON-SUB-2026-014",
    amount: 4800000,
    dueAt: "2026-11-30",
    status: row.status,
  }));
const payments: Payment[] = [
  {
    ...dates(),
    id: "PAG-2026-071",
    invoiceId: invoices[0]?.id ?? "FAC-2026-084",
    amount: 1250000,
    paidAt: "2026-11-04",
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

export const initialSaasState: SaasDomainState = {
  version: 1,
  clients,
  organizations,
  institutions,
  contacts: [],
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
  settings: {
    theme: "institutional",
    density: "comfortable",
    scope: "global",
    organization: "",
    enabledModuleIds: [
      "parishioners",
      "sacraments",
      "certificates",
      "catechesis",
      "pastoral-action",
      "liturgy",
      "treasury",
      "accounting",
      "budgets",
      "assets",
      "governance",
      "documents",
      "reports",
      "agenda",
      "portal",
      "communications",
    ],
  },
  moduleRecords: Object.fromEntries(
    ecosystemSections.map((section) => [section.path, section.records]),
  ),
  supportRecords,
};
