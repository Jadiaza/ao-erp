import type {
  CommercialPlan,
  Contract,
  ContractedPlanSnapshot,
  ContractModificationEntry,
  Entitlement,
  EntityStatus,
  Invoice,
  License,
  Module,
  Payment,
  PortfolioStatus,
  UsageLimit,
} from "./saas-domain";
import { repositories } from "./saas-repository";

export type CapacityMetric = {
  resource: string;
  unit: string;
  contracted: number;
  exceptionExtra: number;
  effectiveMaximum: number;
  used: number;
  remaining: number;
  utilizationPercent: number;
  isExceeded: boolean;
};

export type AuthorizedExceptionDetail = {
  licenseId: string;
  description: string;
  reason: string;
  approvedBy: string;
  expiresAt: string;
  isExpired: boolean;
};

export type OrganizationLicensingSummary = {
  organizationId: string;
  organizationName: string;
  clientId: string;
  institutionIdFilter?: string | undefined;
  isAuthorized: boolean;
  licenseStatus: string;
  activeLicenseIds: string[];
  expiredLicenseIds: string[];
  suspendedLicenseIds: string[];
  canceledLicenseIds: string[];
  organizationalLicenseIds: string[];
  institutionalLicenseIds: string[];
  enabledApplicationIds: string[];
  enabledModuleIds: string[];
  enabledFeatureIds: string[];
  authorizedExceptions: string[];
  exceptionDetails: AuthorizedExceptionDetail[];
  capacities: {
    users: CapacityMetric;
    institutions: CapacityMetric;
    storageGb: CapacityMetric;
    modules: CapacityMetric;
  };
};

function isModuleOperative(mod: Module | undefined): boolean {
  if (!mod) return false;
  if (
    mod.status === "Suspendido" ||
    mod.status === "Inactivo" ||
    mod.status === "Cancelado" ||
    mod.status === "Terminado" ||
    mod.commercialAvailability === "Retirado"
  ) {
    return false;
  }
  return true;
}

/**
 * Resuelve recursivamente las dependencias entre módulos para garantizar que ningún módulo
 * quede habilitado sin sus módulos base requeridos, y bloquea módulos cuyas dependencias
 * base se encuentren deshabilitadas o retiradas.
 */
export function resolveModuleDependencies(
  selectedModuleIds: string[],
  allModules: Module[] = repositories.modules.list(),
): {
  resolvedModuleIds: string[];
  addedDependencyIds: string[];
  disabledModuleIds: string[];
  blockedByDisabledDependency: Array<{ moduleId: string; disabledDependencyId: string }>;
} {
  const candidateSet = new Set<string>(selectedModuleIds);
  const added: string[] = [];

  let changed = true;
  while (changed) {
    changed = false;
    for (const moduleId of Array.from(candidateSet)) {
      const mod = allModules.find((item) => item.id === moduleId);
      for (const reqId of mod?.requiredModuleIds ?? []) {
        if (!candidateSet.has(reqId)) {
          candidateSet.add(reqId);
          added.push(reqId);
          changed = true;
        }
      }
    }
  }

  const disabledModuleIds: string[] = [];
  const blockedByDisabledDependency: Array<{
    moduleId: string;
    disabledDependencyId: string;
  }> = [];

  for (const modId of Array.from(candidateSet)) {
    const mod = allModules.find((item) => item.id === modId);
    if (!isModuleOperative(mod)) {
      disabledModuleIds.push(modId);
    }
  }

  // Verificar si algún módulo candidato depende directa o transitivamente de un módulo deshabilitado
  const hasDisabledDependency = (modId: string, visited = new Set<string>()): string | null => {
    if (visited.has(modId)) return null;
    visited.add(modId);
    const mod = allModules.find((item) => item.id === modId);
    if (!isModuleOperative(mod)) return modId;
    for (const reqId of mod?.requiredModuleIds ?? []) {
      const reqMod = allModules.find((item) => item.id === reqId);
      if (!isModuleOperative(reqMod)) {
        return reqId;
      }
      const transitive = hasDisabledDependency(reqId, visited);
      if (transitive) return transitive;
    }
    return null;
  };

  const validResolved: string[] = [];
  for (const modId of Array.from(candidateSet)) {
    const mod = allModules.find((item) => item.id === modId);
    if (!isModuleOperative(mod)) continue;
    const disabledDep = hasDisabledDependency(modId);
    if (disabledDep) {
      blockedByDisabledDependency.push({
        moduleId: modId,
        disabledDependencyId: disabledDep,
      });
      continue;
    }
    validResolved.push(modId);
  }

  const validAdded = added.filter((id) => validResolved.includes(id));

  return {
    resolvedModuleIds: validResolved,
    addedDependencyIds: validAdded,
    disabledModuleIds,
    blockedByDisabledDependency,
  };
}

/**
 * Crea una copia inmutable (snapshot congelado) de las condiciones comerciales de un plan
 * en el momento de celebrar un contrato, evitando que cambios futuros al plan
 * alteren retroactivamente contratos ya firmados.
 */
export function createPlanSnapshot(plan: CommercialPlan): ContractedPlanSnapshot {
  const frozenModules = Object.freeze([...plan.moduleIds]) as unknown as string[];
  return Object.freeze({
    planId: plan.id,
    planCode: plan.code ?? plan.id,
    planName: plan.name,
    planVersion: plan.version ?? 1,
    applicationId: plan.applicationId ?? "APP-ERP",
    price: plan.price ?? 0,
    currency: plan.currency ?? "COP",
    billingPeriod: plan.billingPeriod ?? "Mensual",
    userLimit: plan.userLimit,
    institutionLimit: plan.institutionLimit,
    storageLimitGb: plan.storageLimitGb ?? 25,
    moduleIds: frozenModules,
    capturedAt: new Date().toISOString(),
  });
}

/**
 * Guarda o actualiza un plan comercial incrementando su versión cuando cambian condiciones
 * tarifarias, moneda, periodicidad, módulos o capacidades, sin alterar los snapshots de contratos existentes.
 */
export function saveCommercialPlan(
  payload: CommercialPlan,
  editingPlan?: CommercialPlan | null,
): CommercialPlan {
  const { resolvedModuleIds } = resolveModuleDependencies(payload.moduleIds);
  const conditionsChanged =
    editingPlan &&
    (editingPlan.price !== payload.price ||
      editingPlan.currency !== payload.currency ||
      editingPlan.billingPeriod !== payload.billingPeriod ||
      editingPlan.userLimit !== payload.userLimit ||
      editingPlan.institutionLimit !== payload.institutionLimit ||
      editingPlan.storageLimitGb !== payload.storageLimitGb ||
      JSON.stringify(editingPlan.moduleIds) !== JSON.stringify(resolvedModuleIds));

  const nextVersion = editingPlan
    ? conditionsChanged
      ? (editingPlan.version ?? 1) + 1
      : (editingPlan.version ?? 1)
    : (payload.version ?? 1);

  const normalized: CommercialPlan = {
    ...payload,
    moduleIds: [...resolvedModuleIds],
    version: nextVersion,
    updatedAt: new Date().toISOString(),
  };

  if (editingPlan) {
    repositories.plans.update(editingPlan.id, normalized);
  } else {
    repositories.plans.create(normalized);
  }
  return normalized;
}

/**
 * Valida las relaciones comerciales y guarda un contrato preservando el snapshot del plan
 * y el historial de modificaciones auditable.
 * Impide modificar silenciosamente condiciones originales de contratos ya celebrados
 * a menos que se autorice explícitamente una novación/cambio de plan o renovación.
 */
export function saveContractWithRelations(input: {
  contract: Contract;
  editingContract?: Contract | null | undefined;
  preserveExistingSnapshot?: boolean | undefined;
  allowCommercialNovation?: boolean | undefined;
  isRenewal?: boolean | undefined;
  author?: string | undefined;
  changeSummary?: string | undefined;
}): { ok: true; contract: Contract } | { ok: false; error: string } {
  const {
    contract,
    editingContract,
    preserveExistingSnapshot = true,
    allowCommercialNovation = false,
    isRenewal = false,
    author = "Dirección Comercial",
    changeSummary,
  } = input;

  const client = repositories.clients.getById(contract.clientId);
  if (!client) {
    return { ok: false, error: "El cliente contratante seleccionado no existe en el repositorio." };
  }

  const organization = contract.organizationId
    ? repositories.organizations.getById(contract.organizationId)
    : undefined;
  if (contract.organizationId && !organization) {
    return { ok: false, error: "La organización beneficiaria seleccionada no existe." };
  }
  if (organization && organization.clientId !== contract.clientId) {
    return {
      ok: false,
      error: `Aislamiento multi-tenant: la organización ${organization.id} pertenece al cliente ${organization.clientId} y no puede vincularse a un contrato del cliente ${contract.clientId}.`,
    };
  }

  const plan = repositories.plans.getById(contract.planId);
  if (!plan) {
    return { ok: false, error: "El plan comercial seleccionado no existe." };
  }

  if (contract.endsAt < contract.startsAt) {
    return {
      ok: false,
      error: "La fecha de vencimiento del contrato no puede ser anterior a la fecha de inicio.",
    };
  }

  // Protección de inmutabilidad en contratos ya celebrados (fuera de estado Borrador / Pendiente)
  const isAlreadyCelebrated =
    editingContract !== undefined &&
    editingContract !== null &&
    editingContract.status !== "Borrador" &&
    editingContract.status !== "Pendiente";

  if (isAlreadyCelebrated && editingContract) {
    const planChanged = editingContract.planId !== contract.planId;
    const amountChanged =
      editingContract.contractedAmount !== undefined &&
      contract.contractedAmount !== undefined &&
      editingContract.contractedAmount !== contract.contractedAmount;
    const currencyChanged =
      editingContract.currency !== undefined &&
      contract.currency !== undefined &&
      editingContract.currency !== contract.currency;
    const periodChanged =
      editingContract.billingPeriod !== undefined &&
      contract.billingPeriod !== undefined &&
      editingContract.billingPeriod !== contract.billingPeriod;
    const startsAtChanged = editingContract.startsAt !== contract.startsAt;

    if (
      (planChanged || amountChanged || currencyChanged || periodChanged || startsAtChanged) &&
      !allowCommercialNovation &&
      !isRenewal
    ) {
      return {
        ok: false,
        error:
          "Inmutabilidad contractual: no se pueden modificar silenciosamente las condiciones económicas, plan, moneda, periodicidad o fecha de inicio de un contrato ya celebrado sin registrar una novación comercial o renovación explícita.",
      };
    }
  }

  const isPlanNovation =
    Boolean(editingContract) &&
    (editingContract!.planId !== contract.planId || !preserveExistingSnapshot);

  // Si el contrato ya existía y no hay novación de plan, se preserva intacto su snapshot original congelado
  const shouldKeepSnapshot =
    editingContract &&
    preserveExistingSnapshot &&
    editingContract.planId === contract.planId &&
    editingContract.planSnapshot !== undefined;

  const snapshot: ContractedPlanSnapshot = shouldKeepSnapshot
    ? Object.freeze({
        ...editingContract.planSnapshot!,
        moduleIds: Object.freeze([
          ...editingContract.planSnapshot!.moduleIds,
        ]) as unknown as string[],
      })
    : createPlanSnapshot(plan);

  const today = new Date().toISOString().slice(0, 10);
  const previousHistory = editingContract?.modificationHistory ?? [];

  let actionLabel = "Celebración de contrato";
  if (editingContract) {
    if (isRenewal || editingContract.endsAt !== contract.endsAt) {
      actionLabel = isPlanNovation
        ? "Renovación y cambio de plan (Novación)"
        : "Renovación contractual";
    } else if (isPlanNovation || allowCommercialNovation) {
      actionLabel = "Novación / Cambio de condiciones comerciales";
    } else {
      actionLabel = "Actualización administrativa";
    }
  }

  const nextHistoryEntry: ContractModificationEntry = {
    date: today,
    action: actionLabel,
    summary:
      changeSummary ??
      (editingContract
        ? isPlanNovation
          ? `Cambio de plan de ${editingContract.planSnapshot?.planName ?? editingContract.planId} (v${editingContract.planSnapshot?.planVersion ?? 1}) a ${snapshot.planName} (v${snapshot.planVersion}).`
          : `Actualización sobre contrato (${contract.status}) preservando snapshot v${snapshot.planVersion}.`
        : `Contrato suscrito con plan ${snapshot.planName} v${snapshot.planVersion} por ${snapshot.currency} ${(contract.contractedAmount ?? snapshot.price).toLocaleString("es-CO")}.`),
    author,
    previousPlanId: editingContract?.planId,
    previousPlanVersion: editingContract?.planSnapshot?.planVersion,
    newPlanId: snapshot.planId,
    newPlanVersion: snapshot.planVersion,
    previousAmount: editingContract?.contractedAmount,
    newAmount: contract.contractedAmount ?? snapshot.price,
    previousEndsAt: editingContract?.endsAt,
    newEndsAt: contract.endsAt,
  };

  const savedContract: Contract = {
    ...contract,
    planSnapshot: snapshot,
    modificationHistory: [nextHistoryEntry, ...previousHistory],
    updatedAt: new Date().toISOString(),
  };

  if (editingContract) {
    repositories.contracts.update(editingContract.id, savedContract);
  } else {
    repositories.contracts.create(savedContract);
  }

  return { ok: true, contract: savedContract };
}

/**
 * Transiciona el estado de un contrato sin eliminarlo destructivamente del historial comercial
 * y sincroniza automáticamente el estado de las suscripciones y licencias vinculadas.
 */
export function transitionContractStatus(
  contractId: string,
  nextStatus: EntityStatus,
  reason: string,
  author = "Gobierno Comercial",
): Contract | undefined {
  const existing = repositories.contracts.getById(contractId);
  if (!existing) return undefined;
  const today = new Date().toISOString().slice(0, 10);
  const history = existing.modificationHistory ?? [];

  const updated = repositories.contracts.update(contractId, {
    status: nextStatus,
    modificationHistory: [
      {
        date: today,
        action: `Cambio de estado a ${nextStatus}`,
        summary: reason,
        author,
        previousPlanId: existing.planId,
        previousPlanVersion: existing.planSnapshot?.planVersion,
        newPlanId: existing.planId,
        newPlanVersion: existing.planSnapshot?.planVersion,
        previousAmount: existing.contractedAmount,
        newAmount: existing.contractedAmount,
      },
      ...history,
    ],
  });

  // Sincronizar suscripciones y licencias dependientes cuando el contrato pasa a un estado inactivo/suspendido
  if (
    nextStatus === "Suspendido" ||
    nextStatus === "Cancelado" ||
    nextStatus === "Terminado" ||
    nextStatus === "Vencido" ||
    nextStatus === "Activo"
  ) {
    const linkedSubs = repositories.subscriptions
      .list()
      .filter((sub) => sub.contractId === contractId);
    for (const sub of linkedSubs) {
      repositories.subscriptions.update(sub.id, { status: nextStatus });
      const linkedLics = repositories.licenses
        .list()
        .filter((lic) => lic.subscriptionId === sub.id || lic.contractId === contractId);
      for (const lic of linkedLics) {
        repositories.licenses.update(lic.id, { status: nextStatus });
        const licEntitlements = repositories.entitlements
          .list()
          .filter((ent) => ent.licenseId === lic.id);
        for (const ent of licEntitlements) {
          repositories.entitlements.update(ent.id, { enabled: nextStatus === "Activo" });
        }
      }
    }
  }

  return updated;
}

/**
 * Crea o actualiza una licencia validando aislamiento multi-tenant, dependencias de módulos
 * y excepciones autorizadas (con motivo, responsable y vigencia), sincronizando entitlements y usage limits.
 */
export function saveLicenseWithEntitlements(input: {
  license: License;
  editingLicense?: License | null | undefined;
  extraUsersException?: number | undefined;
  extraInstitutionsException?: number | undefined;
  extraStorageGbException?: number | undefined;
  exceptionReason?: string | undefined;
  exceptionApprovedBy?: string | undefined;
  exceptionExpiresAt?: string | undefined;
  usedUsers?: number | undefined;
  usedInstitutions?: number | undefined;
  usedStorageGb?: number | undefined;
}): { ok: true; license: License } | { ok: false; error: string } {
  const {
    license,
    editingLicense,
    extraUsersException = 0,
    extraInstitutionsException = 0,
    extraStorageGbException = 0,
    exceptionReason = license.exceptionReason,
    exceptionApprovedBy = license.exceptionApprovedBy,
    exceptionExpiresAt = license.exceptionExpiresAt,
    usedUsers = 3,
    usedInstitutions = 1,
    usedStorageGb = 10,
  } = input;

  const subscription = repositories.subscriptions.getById(license.subscriptionId);
  if (!subscription) {
    return { ok: false, error: "La suscripción vinculada a la licencia no existe." };
  }

  const resolvedOrgId = license.organizationId ?? subscription.organizationId ?? "ORG-001";
  if (subscription.organizationId && subscription.organizationId !== resolvedOrgId) {
    return {
      ok: false,
      error: `Aislamiento multi-tenant: la suscripción ${subscription.id} pertenece a la organización ${subscription.organizationId} y no puede asignarse a ${resolvedOrgId}.`,
    };
  }

  if (license.institutionId) {
    const inst = repositories.institutions.getById(license.institutionId);
    if (!inst) {
      return { ok: false, error: "La institución asignada a la licencia no existe." };
    }
    if (inst.organizationId !== resolvedOrgId) {
      return {
        ok: false,
        error: `Aislamiento multi-tenant: la institución ${inst.id} pertenece a la organización ${inst.organizationId}, no a ${resolvedOrgId}.`,
      };
    }
  }

  const hasAnyExtraException =
    extraUsersException > 0 || extraInstitutionsException > 0 || extraStorageGbException > 0;
  if (hasAnyExtraException) {
    const effReason =
      exceptionReason ??
      (license.authorizedExceptions && license.authorizedExceptions !== "Sin excepciones activas"
        ? license.authorizedExceptions
        : undefined);
    if (!effReason || !effReason.trim()) {
      return {
        ok: false,
        error: "Toda excepción de capacidad requiere especificar el motivo autorizado.",
      };
    }
  }

  const allModules = repositories.modules.list();
  const allFeatures = repositories.features.list();
  const depCheck = resolveModuleDependencies(license.moduleIds, allModules);
  if (depCheck.blockedByDisabledDependency.length > 0) {
    const firstBlocked = depCheck.blockedByDisabledDependency[0]!;
    return {
      ok: false,
      error: `El módulo ${firstBlocked.moduleId} no puede habilitarse porque su dependencia requerida (${firstBlocked.disabledDependencyId}) se encuentra deshabilitada o retirada.`,
    };
  }

  const resolvedModuleIds = depCheck.resolvedModuleIds;
  const authorizedFeatures =
    license.featureIds && license.featureIds.length > 0
      ? license.featureIds.filter((fId) => {
          const feat = allFeatures.find((item) => item.id === fId);
          return feat ? resolvedModuleIds.includes(feat.moduleId) : false;
        })
      : allFeatures
          .filter((feature) => resolvedModuleIds.includes(feature.moduleId))
          .map((feature) => feature.id);

  const now = new Date().toISOString();
  const normalizedReason =
    exceptionReason ??
    (hasAnyExtraException
      ? license.authorizedExceptions && license.authorizedExceptions !== "Sin excepciones activas"
        ? license.authorizedExceptions
        : "Excepción operativa autorizada"
      : undefined);
  const normalizedApprovedBy =
    exceptionApprovedBy ?? (hasAnyExtraException ? "Dirección Comercial A&O" : undefined);
  const normalizedExpiresAt =
    exceptionExpiresAt ?? (hasAnyExtraException ? (license.expiresAt ?? "2026-12-31") : undefined);

  const savedLicense: License = {
    ...license,
    organizationId: resolvedOrgId,
    contractId: license.contractId ?? subscription.contractId,
    scopeType: license.institutionId ? "Institucional" : "Organizacional",
    moduleIds: resolvedModuleIds,
    featureIds: authorizedFeatures,
    exceptionReason: normalizedReason,
    exceptionApprovedBy: normalizedApprovedBy,
    exceptionExpiresAt: normalizedExpiresAt,
    updatedAt: now,
  };

  if (editingLicense) {
    repositories.licenses.update(editingLicense.id, savedLicense);
  } else {
    repositories.licenses.create(savedLicense);
  }

  // Sincronizar Entitlements de esta licencia
  const otherEntitlements = repositories.entitlements
    .list()
    .filter((item) => item.licenseId !== savedLicense.id);
  const nextEntitlements: Entitlement[] = resolvedModuleIds.map((moduleId) => ({
    id: `ENT-${savedLicense.id}-${moduleId}`,
    licenseId: savedLicense.id,
    moduleId,
    enabled: savedLicense.status === "Activo",
    featureIds: allFeatures
      .filter((f) => f.moduleId === moduleId && authorizedFeatures.includes(f.id))
      .map((f) => f.id),
    notes: "Sincronizado por motor de licenciamiento",
    createdAt: now,
    updatedAt: now,
  }));
  repositories.entitlements.replace([...otherEntitlements, ...nextEntitlements]);

  // Sincronizar UsageLimits de esta licencia
  const otherLimits = repositories.usageLimits
    .list()
    .filter((item) => item.licenseId !== savedLicense.id);
  const nextLimits: UsageLimit[] = [
    {
      id: `LIM-${savedLicense.id}-USR`,
      licenseId: savedLicense.id,
      resource: "usuarios",
      unit: "usuarios",
      maximum: savedLicense.userLimit,
      used: usedUsers,
      exceptionExtra: extraUsersException,
      exceptionReason: normalizedReason,
      exceptionApprovedBy: normalizedApprovedBy,
      exceptionExpiresAt: normalizedExpiresAt,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `LIM-${savedLicense.id}-INS`,
      licenseId: savedLicense.id,
      resource: "instituciones",
      unit: "instituciones",
      maximum: savedLicense.institutionLimit ?? 1,
      used: usedInstitutions,
      exceptionExtra: extraInstitutionsException,
      exceptionReason: extraInstitutionsException > 0 ? normalizedReason : undefined,
      exceptionApprovedBy: extraInstitutionsException > 0 ? normalizedApprovedBy : undefined,
      exceptionExpiresAt: extraInstitutionsException > 0 ? normalizedExpiresAt : undefined,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `LIM-${savedLicense.id}-STO`,
      licenseId: savedLicense.id,
      resource: "almacenamiento",
      unit: "GB",
      maximum: savedLicense.storageLimitGb ?? 25,
      used: usedStorageGb,
      exceptionExtra: extraStorageGbException,
      exceptionReason: extraStorageGbException > 0 ? normalizedReason : undefined,
      exceptionApprovedBy: extraStorageGbException > 0 ? normalizedApprovedBy : undefined,
      exceptionExpiresAt: extraStorageGbException > 0 ? normalizedExpiresAt : undefined,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `LIM-${savedLicense.id}-MOD`,
      licenseId: savedLicense.id,
      resource: "módulos",
      unit: "módulos",
      maximum: resolvedModuleIds.length,
      used: resolvedModuleIds.length,
      exceptionExtra: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];
  repositories.usageLimits.replace([...otherLimits, ...nextLimits]);

  return { ok: true, license: savedLicense };
}

function buildCapacityMetric(
  resource: string,
  unit: string,
  contracted: number,
  exceptionExtra: number,
  used: number,
): CapacityMetric {
  const effectiveMaximum = Math.max(contracted + exceptionExtra, 0);
  const remaining = Math.max(effectiveMaximum - used, 0);
  const utilizationPercent =
    effectiveMaximum > 0 ? Math.min(Math.round((used / effectiveMaximum) * 100), 100) : 0;
  return {
    resource,
    unit,
    contracted,
    exceptionExtra,
    effectiveMaximum,
    used,
    remaining,
    utilizationPercent,
    isExceeded: used > effectiveMaximum,
  };
}

/**
 * Servicio centralizado de consulta de licenciamiento, entitlements y capacidades por organización
 * (y opcionalmente por institución específica) respetando el aislamiento multi-tenant estricto.
 */
export function evaluateOrganizationLicensing(
  organizationId: string,
  options?: {
    institutionId?: string | undefined;
    referenceDate?: string | undefined;
  },
): OrganizationLicensingSummary {
  const referenceDate = options?.referenceDate ?? new Date().toISOString().slice(0, 10);
  const institutionIdFilter = options?.institutionId;

  const org = repositories.organizations.getById(organizationId);
  const allLicenses = repositories.licenses.list();
  const allSubscriptions = repositories.subscriptions.list();
  const allContracts = repositories.contracts.list();
  const allInstitutions = repositories.institutions.list();
  const allUsers = repositories.users.list();
  const allUsageLimits = repositories.usageLimits.list();
  const allEntitlements = repositories.entitlements.list();
  const allModules = repositories.modules.list();
  const allFeatures = repositories.features.list();

  const orgInstitutionIds = new Set(
    allInstitutions.filter((inst) => inst.organizationId === organizationId).map((inst) => inst.id),
  );

  // Filtrado multi-tenant estricto por organización (NUNCA por clientId compartido entre organizaciones hermanas)
  const orgLicenses = allLicenses.filter((license) => {
    if (license.organizationId) {
      return license.organizationId === organizationId;
    }
    if (license.institutionId) {
      return orgInstitutionIds.has(license.institutionId);
    }
    const sub = allSubscriptions.find((item) => item.id === license.subscriptionId);
    return sub?.organizationId === organizationId;
  });

  // Si se consulta para una institución específica, se aplican las licencias organizacionales
  // más las licencias institucionales asignadas exclusivamente a esa institución.
  const tenantLicenses = institutionIdFilter
    ? orgLicenses.filter((lic) => !lic.institutionId || lic.institutionId === institutionIdFilter)
    : orgLicenses;

  const organizationalLicenseIds = tenantLicenses
    .filter((lic) => !lic.institutionId)
    .map((lic) => lic.id);
  const institutionalLicenseIds = tenantLicenses
    .filter((lic) => Boolean(lic.institutionId))
    .map((lic) => lic.id);

  const activeLicenses: License[] = [];
  const expiredLicenseIds: string[] = [];
  const suspendedLicenseIds: string[] = [];
  const canceledLicenseIds: string[] = [];

  for (const lic of tenantLicenses) {
    const sub = allSubscriptions.find((s) => s.id === lic.subscriptionId);
    const con = allContracts.find((c) => c.id === (lic.contractId ?? sub?.contractId));

    const isCanceled =
      lic.status === "Cancelado" ||
      lic.status === "Terminado" ||
      sub?.status === "Cancelado" ||
      sub?.status === "Terminado" ||
      con?.status === "Cancelado" ||
      con?.status === "Terminado";
    if (isCanceled) {
      canceledLicenseIds.push(lic.id);
      continue;
    }

    const isExpiredByDate = Boolean(lic.expiresAt && lic.expiresAt < referenceDate);
    const isExpiredStatus =
      lic.status === "Vencido" ||
      sub?.status === "Vencido" ||
      con?.status === "Vencido" ||
      isExpiredByDate;
    if (isExpiredStatus) {
      expiredLicenseIds.push(lic.id);
      continue;
    }

    const isSuspended =
      lic.status === "Suspendido" ||
      sub?.status === "Suspendido" ||
      con?.status === "Suspendido" ||
      lic.status === "Inactivo";
    if (isSuspended) {
      suspendedLicenseIds.push(lic.id);
      continue;
    }

    if (lic.status === "Activo") {
      activeLicenses.push(lic);
    }
  }

  const enabledApps = new Set<string>();
  const enabledModules = new Set<string>();
  const enabledFeatures = new Set<string>();
  const exceptions: string[] = [];
  const exceptionDetails: AuthorizedExceptionDetail[] = [];

  for (const lic of activeLicenses) {
    if (lic.applicationId) enabledApps.add(lic.applicationId);
    const sub = allSubscriptions.find((s) => s.id === lic.subscriptionId);
    for (const appId of sub?.applicationIds ?? []) enabledApps.add(appId);

    // Resolver dependencias operativas y verificar coherencia con Entitlements
    const { resolvedModuleIds } = resolveModuleDependencies(lic.moduleIds, allModules);
    const licEntitlements = allEntitlements.filter((ent) => ent.licenseId === lic.id);

    for (const modId of resolvedModuleIds) {
      const explicitEnt = licEntitlements.find((ent) => ent.moduleId === modId);
      if (explicitEnt && !explicitEnt.enabled) {
        continue;
      }
      const modObj = allModules.find((m) => m.id === modId);
      if (!isModuleOperative(modObj)) {
        continue;
      }
      enabledModules.add(modId);

      const allowedFeatureIds =
        explicitEnt?.featureIds && explicitEnt.featureIds.length > 0
          ? explicitEnt.featureIds
          : lic.featureIds && lic.featureIds.length > 0
            ? lic.featureIds
            : allFeatures.filter((f) => f.moduleId === modId).map((f) => f.id);

      for (const featId of allowedFeatureIds) {
        const featObj = allFeatures.find((f) => f.id === featId);
        if (featObj && featObj.moduleId === modId && featObj.status === "Activo") {
          enabledFeatures.add(featId);
        }
      }
    }

    if (lic.authorizedExceptions && lic.authorizedExceptions !== "Sin excepciones activas") {
      const expDate = lic.exceptionExpiresAt ?? lic.expiresAt ?? "2099-12-31";
      const isExp = expDate < referenceDate;
      exceptionDetails.push({
        licenseId: lic.id,
        description: lic.authorizedExceptions,
        reason: lic.exceptionReason ?? lic.authorizedExceptions,
        approvedBy: lic.exceptionApprovedBy ?? "Dirección Comercial A&O",
        expiresAt: expDate,
        isExpired: isExp,
      });
      if (!isExp) {
        exceptions.push(lic.authorizedExceptions);
      }
    }
  }

  // Para la capacidad efectiva solo suman las licencias activas (si no hay activas, contratado efectivo es 0)
  const activeLicenseIdSet = new Set(activeLicenses.map((l) => l.id));
  const limitsForActiveOrg = allUsageLimits.filter((lim) => activeLicenseIdSet.has(lim.licenseId));

  const isExceptionValid = (lim: UsageLimit): boolean => {
    if (!lim.exceptionExtra || lim.exceptionExtra <= 0) return false;
    const parentLic = activeLicenses.find((l) => l.id === lim.licenseId);
    const expDate = lim.exceptionExpiresAt ?? parentLic?.exceptionExpiresAt ?? parentLic?.expiresAt;
    if (expDate && expDate < referenceDate) {
      return false;
    }
    return true;
  };

  const sumLimit = (resource: string, fallbackContracted: number, fallbackUsed: number) => {
    const matching = limitsForActiveOrg.filter((lim) => lim.resource === resource);
    if (matching.length === 0) {
      return {
        contracted: activeLicenses.length > 0 ? fallbackContracted : 0,
        extra: 0,
        used: fallbackUsed,
      };
    }
    return {
      contracted: matching.reduce((sum, item) => sum + item.maximum, 0),
      extra: matching.reduce(
        (sum, item) => sum + (isExceptionValid(item) ? (item.exceptionExtra ?? 0) : 0),
        0,
      ),
      used: matching.reduce((sum, item) => sum + item.used, 0),
    };
  };

  const fallbackUsersContracted = activeLicenses.reduce((s, l) => s + l.userLimit, 0);
  const fallbackInstContracted = activeLicenses.reduce((s, l) => s + (l.institutionLimit ?? 1), 0);
  const fallbackStorageContracted = activeLicenses.reduce(
    (s, l) => s + (l.storageLimitGb ?? 25),
    0,
  );
  const realInstitutionsCount = orgInstitutionIds.size;
  const orgUserIds = new Set(org?.userIds ?? []);
  const realUsersCount =
    orgUserIds.size > 0
      ? orgUserIds.size
      : allUsers.filter((u) => u.institutionIds.some((instId) => orgInstitutionIds.has(instId)))
          .length;

  const userStats = sumLimit("usuarios", fallbackUsersContracted, realUsersCount);
  const instStats = sumLimit(
    "instituciones",
    fallbackInstContracted,
    Math.max(realInstitutionsCount, 1),
  );
  const storageStats = sumLimit("almacenamiento", fallbackStorageContracted, 10);

  const contractedModulesCount =
    activeLicenses.length > 0 ? new Set(activeLicenses.flatMap((l) => l.moduleIds)).size : 0;

  let resolvedStatus = "Sin licencia";
  if (activeLicenses.length > 0) {
    resolvedStatus = "Activo";
  } else if (expiredLicenseIds.length > 0) {
    resolvedStatus = "Vencido";
  } else if (suspendedLicenseIds.length > 0) {
    resolvedStatus = "Suspendido";
  } else if (canceledLicenseIds.length > 0) {
    resolvedStatus = "Cancelado";
  } else if (tenantLicenses[0]) {
    resolvedStatus = tenantLicenses[0].status;
  }

  return {
    organizationId,
    organizationName: org?.name ?? organizationId,
    clientId: org?.clientId ?? "",
    institutionIdFilter,
    isAuthorized: activeLicenses.length > 0,
    licenseStatus: resolvedStatus,
    activeLicenseIds: activeLicenses.map((l) => l.id),
    expiredLicenseIds,
    suspendedLicenseIds,
    canceledLicenseIds,
    organizationalLicenseIds,
    institutionalLicenseIds,
    enabledApplicationIds: Array.from(enabledApps),
    enabledModuleIds: Array.from(enabledModules),
    enabledFeatureIds: Array.from(enabledFeatures),
    authorizedExceptions: exceptions,
    exceptionDetails,
    capacities: {
      users: buildCapacityMetric(
        "Usuarios concurrentes",
        "usuarios",
        userStats.contracted,
        userStats.extra,
        userStats.used,
      ),
      institutions: buildCapacityMetric(
        "Instituciones habilitadas",
        "instituciones",
        instStats.contracted,
        instStats.extra,
        instStats.used,
      ),
      storageGb: buildCapacityMetric(
        "Almacenamiento documental",
        "GB",
        storageStats.contracted,
        storageStats.extra,
        storageStats.used,
      ),
      modules: buildCapacityMetric(
        "Módulos autorizados",
        "módulos",
        contractedModulesCount,
        0,
        enabledModules.size,
      ),
    },
  };
}

/**
 * Mecanismo activo de validación de capacidades antes de ejecutar operaciones que consuman
 * usuarios, instituciones, almacenamiento o habiliten módulos en una organización.
 */
export function validateOrganizationCapacity(input: {
  organizationId: string;
  resource: "users" | "institutions" | "storageGb" | "modules";
  requestedDelta?: number | undefined;
  requiredModuleId?: string | undefined;
  currentUsedOverride?: number | undefined;
  referenceDate?: string | undefined;
}): {
  allowed: boolean;
  reason?: string | undefined;
  metric: CapacityMetric;
  summary: OrganizationLicensingSummary;
} {
  const {
    organizationId,
    resource,
    requestedDelta = 1,
    requiredModuleId,
    currentUsedOverride,
    referenceDate,
  } = input;

  const summary = evaluateOrganizationLicensing(organizationId, { referenceDate });
  const metric = summary.capacities[resource];

  if (!summary.isAuthorized) {
    return {
      allowed: false,
      reason: `La organización ${summary.organizationName} no cuenta con una licencia activa vigente (estado actual: ${summary.licenseStatus}).`,
      metric,
      summary,
    };
  }

  if (requiredModuleId && !summary.enabledModuleIds.includes(requiredModuleId)) {
    return {
      allowed: false,
      reason: `El módulo ${requiredModuleId} no está habilitado dentro de los entitlements activos de la organización ${summary.organizationName}.`,
      metric,
      summary,
    };
  }

  const baseUsed = currentUsedOverride ?? metric.used;
  const projectedUsage = baseUsed + requestedDelta;
  if (projectedUsage > metric.effectiveMaximum) {
    return {
      allowed: false,
      reason: `Límite de capacidad excedido para ${metric.resource} en ${summary.organizationName}: uso proyectado ${projectedUsage} ${metric.unit} supera el máximo efectivo autorizado de ${metric.effectiveMaximum} ${metric.unit} (${metric.contracted} contratados + ${metric.exceptionExtra} por excepción).`,
      metric,
      summary,
    };
  }

  return {
    allowed: true,
    metric,
    summary,
  };
}

/**
 * Emite o actualiza una factura comercial validando consistencia matemática de subtotal,
 * descuentos, impuestos, total y saldo pendiente, e impidiendo alterar facturas anuladas
 * o modificar valores económicos de facturas que ya registran pagos aplicados.
 */
export function saveCommercialInvoice(input: {
  invoice: Invoice;
  editingInvoice?: Invoice | null | undefined;
  referenceDate?: string | undefined;
}): { ok: true; invoice: Invoice } | { ok: false; error: string } {
  const { invoice, editingInvoice, referenceDate = new Date().toISOString().slice(0, 10) } = input;

  if (editingInvoice && editingInvoice.status === "Anulada") {
    return {
      ok: false,
      error: "No se puede modificar una factura que se encuentra en estado Anulada.",
    };
  }

  const client = repositories.clients.getById(invoice.clientId);
  if (!client) {
    return { ok: false, error: "El cliente contratante de la factura no existe." };
  }

  const confirmedPayments = repositories.payments
    .list()
    .filter((p) => p.invoiceId === invoice.id && p.status === "Activo");
  const actualPaidAmount = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const existingPaid = Math.max(editingInvoice?.paidAmount ?? 0, actualPaidAmount);

  const conceptsSubtotal =
    invoice.concepts && invoice.concepts.length > 0
      ? invoice.concepts.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      : (invoice.subtotalAmount ?? invoice.amount);

  const discount = invoice.discountAmount ?? 0;
  if (discount < 0 || discount > conceptsSubtotal) {
    return {
      ok: false,
      error:
        "El descuento comercial no puede ser negativo ni superar el subtotal antes de impuestos.",
    };
  }

  const taxableBase = conceptsSubtotal - discount;
  const tax = invoice.taxAmount ?? 0;
  if (tax < 0) {
    return { ok: false, error: "El monto de impuestos no puede ser negativo." };
  }

  const computedTotal = taxableBase + tax;
  if (computedTotal <= 0) {
    return { ok: false, error: "El total de la factura comercial debe ser mayor a cero." };
  }

  // Si la factura ya tiene pagos registrados, bloquear alteración de sus valores económicos
  if (editingInvoice && existingPaid > 0) {
    const prevSubtotal = editingInvoice.subtotalAmount ?? editingInvoice.amount;
    const prevDiscount = editingInvoice.discountAmount ?? 0;
    const prevTax = editingInvoice.taxAmount ?? 0;
    const prevTotal = editingInvoice.amount;

    if (
      conceptsSubtotal !== prevSubtotal ||
      discount !== prevDiscount ||
      tax !== prevTax ||
      computedTotal !== prevTotal
    ) {
      return {
        ok: false,
        error: `Integridad contable: la factura ${editingInvoice.id} ya registra pagos aplicados por COP ${existingPaid.toLocaleString("es-CO")}; no se permite alterar su subtotal, descuentos, impuestos ni valor total.`,
      };
    }
  }

  const balanceDue = Math.max(computedTotal - existingPaid, 0);
  const isFullyPaid = balanceDue === 0;
  const isOverdue = !isFullyPaid && invoice.dueAt < referenceDate;

  let resolvedPortfolioStatus: PortfolioStatus = invoice.portfolioStatus ?? "Por vencer";
  if (isFullyPaid) {
    resolvedPortfolioStatus = "Pagada";
  } else if (isOverdue) {
    resolvedPortfolioStatus = "En mora";
  } else if (resolvedPortfolioStatus === "Pagada" || resolvedPortfolioStatus === "Anulada") {
    resolvedPortfolioStatus = "Por vencer";
  }

  const normalizedInvoice: Invoice = {
    ...invoice,
    subtotalAmount: conceptsSubtotal,
    discountAmount: discount,
    taxAmount: tax,
    amount: computedTotal,
    paidAmount: existingPaid,
    balanceDue,
    status: isFullyPaid ? "Activo" : "Pendiente",
    portfolioStatus: resolvedPortfolioStatus,
    updatedAt: new Date().toISOString(),
  };

  if (editingInvoice) {
    repositories.invoices.update(editingInvoice.id, normalizedInvoice);
  } else {
    repositories.invoices.create(normalizedInvoice);
  }

  return { ok: true, invoice: normalizedInvoice };
}

/**
 * Registra un pago comercial validando que no supere el saldo pendiente ni se aplique
 * a facturas anuladas o ya pagadas, y recalcula el saldo y estado de cartera (incluyendo mora).
 */
export function registerCommercialPayment(input: {
  payment: Payment;
  referenceDate?: string | undefined;
}): { ok: true; invoice: Invoice; payment: Payment } | { ok: false; error: string } {
  const { payment, referenceDate = new Date().toISOString().slice(0, 10) } = input;
  const invoice = repositories.invoices.getById(payment.invoiceId);
  if (!invoice) {
    return { ok: false, error: "La factura asociada al pago no existe." };
  }
  if (invoice.status === "Anulada" || invoice.portfolioStatus === "Anulada") {
    return { ok: false, error: "No se pueden registrar pagos sobre una factura anulada." };
  }
  if (payment.amount <= 0) {
    return { ok: false, error: "El monto del pago debe ser mayor a cero." };
  }

  const existingConfirmedPayments = repositories.payments
    .list()
    .filter((item) => item.invoiceId === invoice.id && item.status === "Activo");
  const alreadyPaid = existingConfirmedPayments.reduce((sum, item) => sum + item.amount, 0);
  const currentBalanceDue =
    invoice.balanceDue !== undefined
      ? invoice.balanceDue
      : Math.max(invoice.amount - alreadyPaid, 0);

  if (currentBalanceDue <= 0) {
    return {
      ok: false,
      error: `La factura ${invoice.id} ya se encuentra totalmente pagada (saldo pendiente 0).`,
    };
  }

  if (payment.amount > currentBalanceDue) {
    return {
      ok: false,
      error: `El monto del pago (${payment.amount.toLocaleString("es-CO")}) supera el saldo pendiente de la factura (${currentBalanceDue.toLocaleString("es-CO")}).`,
    };
  }

  repositories.payments.create(payment);

  const totalPaid = alreadyPaid + payment.amount;
  const balanceDue = Math.max(invoice.amount - totalPaid, 0);
  const isFullyPaid = balanceDue === 0;
  const isOverdue = !isFullyPaid && invoice.dueAt < referenceDate;

  const updatedInvoice = repositories.invoices.update(invoice.id, {
    paidAmount: totalPaid,
    balanceDue,
    status: isFullyPaid ? "Activo" : "Pendiente",
    portfolioStatus: isFullyPaid ? "Pagada" : isOverdue ? "En mora" : "Por vencer",
  });

  return {
    ok: true,
    invoice: updatedInvoice ?? invoice,
    payment,
  };
}

/**
 * Reversa de forma no destructiva un pago registrado (estado Anulada) y recalcula
 * el saldo pendiente y estado de cartera de la factura asociada.
 */
export function reverseCommercialPayment(input: {
  paymentId: string;
  reason: string;
  referenceDate?: string | undefined;
}): { ok: true; payment: Payment; invoice: Invoice } | { ok: false; error: string } {
  const { paymentId, reason, referenceDate = new Date().toISOString().slice(0, 10) } = input;
  if (!reason.trim()) {
    return { ok: false, error: "Debe indicar el motivo de reversión del pago." };
  }

  const payment = repositories.payments.getById(paymentId);
  if (!payment) {
    return { ok: false, error: "El pago que intenta reversar no existe." };
  }
  if (payment.status === "Anulada") {
    return { ok: false, error: "El pago ya se encuentra reversado (Anulada)." };
  }

  const invoice = repositories.invoices.getById(payment.invoiceId);
  if (!invoice) {
    return { ok: false, error: "La factura vinculada al pago no existe." };
  }

  const updatedPayment = repositories.payments.update(payment.id, {
    status: "Anulada",
    reversedAt: referenceDate,
    reversalReason: reason.trim(),
    notes: `${payment.notes ? `${payment.notes} · ` : ""}Reversado el ${referenceDate}: ${reason.trim()}`,
  });

  const remainingActivePayments = repositories.payments
    .list()
    .filter((item) => item.invoiceId === invoice.id && item.status === "Activo");
  const totalPaid = remainingActivePayments.reduce((sum, item) => sum + item.amount, 0);
  const balanceDue = Math.max(invoice.amount - totalPaid, 0);
  const isFullyPaid = balanceDue === 0;
  const isOverdue = !isFullyPaid && invoice.dueAt < referenceDate;

  const updatedInvoice = repositories.invoices.update(invoice.id, {
    paidAmount: totalPaid,
    balanceDue,
    status: isFullyPaid ? "Activo" : "Pendiente",
    portfolioStatus: isFullyPaid ? "Pagada" : isOverdue ? "En mora" : "Por vencer",
  });

  return {
    ok: true,
    payment: updatedPayment ?? payment,
    invoice: updatedInvoice ?? invoice,
  };
}

export type CurrencyBreakdown = Record<string, number>;

/**
 * Calcula MRR contratado, facturación pendiente (cartera) e ingresos recaudados
 * desglosados estrictamente por moneda (COP, USD, EUR) sin sumar divisas distintas.
 * Excluye del MRR contratos suspendidos, vencidos, cancelados, terminados, en borrador
 * o con periodicidad "Personalizada" no recurrente.
 */
export function calculateCommercialMetricsByCurrency(options?: {
  referenceDate?: string | undefined;
}): {
  mrrByCurrency: CurrencyBreakdown;
  pendingPortfolioByCurrency: CurrencyBreakdown;
  collectedRevenueByCurrency: CurrencyBreakdown;
  excludedContractsCount: number;
} {
  const referenceDate = options?.referenceDate;
  const contracts = repositories.contracts.list();
  const invoices = repositories.invoices.list();
  const payments = repositories.payments.list();

  const mrrByCurrency: CurrencyBreakdown = {};
  const pendingPortfolioByCurrency: CurrencyBreakdown = {};
  const collectedRevenueByCurrency: CurrencyBreakdown = {};
  let excludedContractsCount = 0;

  for (const contract of contracts) {
    const isExpiredByDate = Boolean(referenceDate && contract.endsAt < referenceDate);
    const period = contract.billingPeriod ?? contract.planSnapshot?.billingPeriod ?? "Mensual";
    const isRecurringActive =
      contract.status === "Activo" && !isExpiredByDate && period !== "Personalizada";

    if (!isRecurringActive) {
      excludedContractsCount += 1;
      continue;
    }

    const currency = contract.currency ?? contract.planSnapshot?.currency ?? "COP";
    const rawAmount = contract.contractedAmount ?? contract.planSnapshot?.price ?? 0;

    let monthlyNormalized = rawAmount;
    if (period === "Anual") monthlyNormalized = Math.round(rawAmount / 12);
    else if (period === "Semestral") monthlyNormalized = Math.round(rawAmount / 6);
    else if (period === "Trimestral") monthlyNormalized = Math.round(rawAmount / 3);

    mrrByCurrency[currency] = (mrrByCurrency[currency] ?? 0) + monthlyNormalized;
  }

  for (const invoice of invoices) {
    if (
      invoice.status === "Activo" ||
      invoice.status === "Anulada" ||
      invoice.portfolioStatus === "Pagada" ||
      invoice.portfolioStatus === "Anulada"
    ) {
      continue;
    }
    const contract = contracts.find((c) => c.id === invoice.contractId);
    const currency =
      invoice.currency ?? contract?.currency ?? contract?.planSnapshot?.currency ?? "COP";
    const pending = invoice.balanceDue ?? invoice.amount;
    if (pending > 0) {
      pendingPortfolioByCurrency[currency] = (pendingPortfolioByCurrency[currency] ?? 0) + pending;
    }
  }

  for (const payment of payments) {
    if (payment.status !== "Activo") continue;
    const invoice = invoices.find((i) => i.id === payment.invoiceId);
    const contract = contracts.find((c) => c.id === invoice?.contractId);
    const currency =
      payment.currency ??
      invoice?.currency ??
      contract?.currency ??
      contract?.planSnapshot?.currency ??
      "COP";
    collectedRevenueByCurrency[currency] =
      (collectedRevenueByCurrency[currency] ?? 0) + payment.amount;
  }

  return {
    mrrByCurrency,
    pendingPortfolioByCurrency,
    collectedRevenueByCurrency,
    excludedContractsCount,
  };
}
