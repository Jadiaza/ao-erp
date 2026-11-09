import {
  evaluateOrganizationLicensing,
  resolveModuleDependencies,
  validateOrganizationCapacity,
  type OrganizationLicensingSummary,
} from "./commercial-service";
import type {
  Application,
  Client,
  CommercialPlan,
  Contract,
  InfrastructureIncident,
  License,
  Organization,
  OrganizationInitialConfig,
  ProvisioningHistoryEntry,
  ProvisioningRequest,
  ProvisioningStageCode,
  ProvisioningStageResult,
  ProvisioningStatus,
  Subscription,
  TenantEnvironment,
  TenantEnvironmentModuleConfig,
} from "./saas-domain";
import { repositories } from "./saas-repository";

/**
 * Interfaz de adaptador para el aislamiento lógico multi-tenant y futura conexión
 * con infraestructura real (PostgreSQL + RLS + Storage privado) sin crear servidores ficticios.
 */
export interface TenantInfrastructureAdapter {
  readonly adapterName: string;
  allocateLogicalNamespace(
    organizationId: string,
    applicationId: string,
  ): {
    logicalNamespace: string;
    isolationModel: "Instancia lógica multi-tenant en infraestructura compartida";
  };
}

export const defaultLogicalMultiTenantAdapter: TenantInfrastructureAdapter = {
  adapterName: "A&O Multi-Tenant Logical Isolation Adapter v1",
  allocateLogicalNamespace(organizationId: string, applicationId: string) {
    return {
      logicalNamespace: `tenant:${organizationId.toLowerCase()}:${applicationId.toLowerCase()}`,
      isolationModel: "Instancia lógica multi-tenant en infraestructura compartida",
    };
  },
};

export type CommercialReadinessResult =
  | {
      ok: true;
      client: Client;
      organization: Organization;
      contract: Contract;
      subscription: Subscription;
      license: License;
      application: Application;
      plan: CommercialPlan;
      licensingSummary: OrganizationLicensingSummary;
      authorizedModuleIds: string[];
      authorizedFeatureIds: string[];
    }
  | {
      ok: false;
      error: string;
      failedCheck:
        | "client"
        | "organization"
        | "contract"
        | "subscription"
        | "application"
        | "plan"
        | "license"
        | "modules"
        | "capacity";
    };

const ALLOWED_PROVISIONING_TRANSITIONS: Record<ProvisioningStatus, ProvisioningStatus[]> = {
  Pendiente: ["En validación", "Cancelado", "Fallido"],
  "En validación": ["Validado", "Fallido", "Cancelado"],
  Validado: ["En aprovisionamiento", "Suspendido", "Fallido", "Cancelado"],
  "En aprovisionamiento": ["Configurando", "Fallido", "Suspendido", "Cancelado"],
  Configurando: ["Activando servicios", "Fallido", "Suspendido", "Cancelado"],
  "Activando servicios": ["Operativo", "Fallido", "Suspendido", "Cancelado"],
  Operativo: ["Suspendido", "Configurando", "Cancelado"],
  Suspendido: ["En validación", "Validado", "Operativo", "Cancelado"],
  Fallido: [
    "En validación",
    "Validado",
    "En aprovisionamiento",
    "Configurando",
    "Activando servicios",
    "Cancelado",
  ],
  Cancelado: [],
};

export function buildDefaultStages(requestId: string): ProvisioningStageResult[] {
  return [
    {
      stageCode: "commercial_validation",
      stageName: "1. Validación comercial y de licenciamiento",
      operationId: `OP-${requestId}-STG-1`,
      status: "Pendiente",
      detail: "Pendiente de verificar cliente, contrato, suscripción, licencia y capacidades.",
      attempts: 0,
    },
    {
      stageCode: "org_initial_config",
      stageName: "2. Configuración regional e institucional de la organización",
      operationId: `OP-${requestId}-STG-2`,
      status: "Pendiente",
      detail: "Pendiente de aplicar identidad jurídica, moneda, zona horaria y preferencias.",
      attempts: 0,
    },
    {
      stageCode: "institutional_structure",
      stageName: "3. Preparación de estructura y relaciones eclesiales",
      operationId: `OP-${requestId}-STG-3`,
      status: "Pendiente",
      detail: "Pendiente de validar vínculos institucionales autorizados.",
      attempts: 0,
    },
    {
      stageCode: "environment_allocation",
      stageName: "4. Asignación de entorno lógico multi-tenant",
      operationId: `OP-${requestId}-STG-4`,
      status: "Pendiente",
      detail: "Pendiente de preparar instancia lógica en infraestructura compartida.",
      attempts: 0,
    },
    {
      stageCode: "module_activation",
      stageName: "5. Resolución de dependencias y activación de módulos",
      operationId: `OP-${requestId}-STG-5`,
      status: "Pendiente",
      detail: "Pendiente de activar productos y módulos incluidos en la licencia.",
      attempts: 0,
    },
  ];
}

/**
 * 5. Validación comercial previa:
 * Verifica en la capa de servicio (sin confiar en el frontend) que la organización beneficiaria
 * cuente con cliente activo, contrato vigente aprobado, suscripción válida, producto, plan,
 * licencia activa, módulos autorizados con dependencias operativas y capacidades disponibles.
 */
export function validateCommercialReadinessForProvisioning(input: {
  organizationId: string;
  contractId: string;
  subscriptionId?: string | undefined;
  licenseId?: string | undefined;
  applicationId?: string | undefined;
  requestedModuleIds?: string[] | undefined;
  referenceDate?: string | undefined;
}): CommercialReadinessResult {
  const {
    organizationId,
    contractId,
    subscriptionId,
    licenseId,
    applicationId,
    requestedModuleIds,
    referenceDate = new Date().toISOString().slice(0, 10),
  } = input;

  const organization = repositories.organizations.getById(organizationId);
  if (!organization) {
    return {
      ok: false,
      failedCheck: "organization",
      error: `La organización beneficiaria (${organizationId}) no existe en el repositorio.`,
    };
  }
  if (organization.status === "Suspendido") {
    return {
      ok: false,
      failedCheck: "organization",
      error: `La organización ${organization.name} presenta bloqueo administrativo (estado ${organization.status}).`,
    };
  }

  const client = repositories.clients.getById(organization.clientId);
  if (!client) {
    return {
      ok: false,
      failedCheck: "client",
      error: `El cliente contratante (${organization.clientId}) vinculado a la organización no existe.`,
    };
  }
  if (client.status === "Suspendido") {
    return {
      ok: false,
      failedCheck: "client",
      error: `El cliente contratante ${client.name} presenta bloqueo comercial (${client.status}).`,
    };
  }

  const contract = repositories.contracts.getById(contractId);
  if (!contract) {
    return {
      ok: false,
      failedCheck: "contract",
      error: `El contrato comercial (${contractId}) no existe.`,
    };
  }
  if (contract.clientId !== client.id) {
    return {
      ok: false,
      failedCheck: "contract",
      error: `Aislamiento multi-tenant: el contrato ${contract.id} pertenece al cliente ${contract.clientId}, no al cliente ${client.id} de la organización ${organization.name}.`,
    };
  }
  if (contract.organizationId && contract.organizationId !== organization.id) {
    return {
      ok: false,
      failedCheck: "contract",
      error: `Aislamiento multi-tenant: el contrato ${contract.id} está asignado a la organización ${contract.organizationId}, no a ${organization.id}.`,
    };
  }
  if (contract.status !== "Activo") {
    return {
      ok: false,
      failedCheck: "contract",
      error: `El contrato ${contract.id} no está aprobado y vigente (estado actual: ${contract.status}). No se permite aprovisionar ni activar servicios con contratos en estado ${contract.status}.`,
    };
  }
  if (contract.endsAt < referenceDate) {
    return {
      ok: false,
      failedCheck: "contract",
      error: `El contrato ${contract.id} se encuentra vencido desde ${contract.endsAt}.`,
    };
  }

  const allSubs = repositories.subscriptions.list();
  const subscription = subscriptionId
    ? allSubs.find((s) => s.id === subscriptionId)
    : allSubs.find((s) => s.contractId === contract.id);

  if (!subscription || subscription.contractId !== contract.id) {
    return {
      ok: false,
      failedCheck: "subscription",
      error: `No existe una suscripción válida vinculada al contrato ${contract.id}.`,
    };
  }
  if (subscription.status !== "Activo") {
    return {
      ok: false,
      failedCheck: "subscription",
      error: `La suscripción ${subscription.id} no se encuentra activa (estado actual: ${subscription.status}).`,
    };
  }

  const resolvedAppId =
    applicationId ??
    contract.applicationId ??
    contract.planSnapshot?.applicationId ??
    subscription.applicationIds[0] ??
    "APP-ERP";
  const application = repositories.applications.getById(resolvedAppId);
  if (!application || application.status !== "Activo") {
    return {
      ok: false,
      failedCheck: "application",
      error: `El producto contratado (${resolvedAppId}) no existe o no está disponible para aprovisionamiento.`,
    };
  }

  const plan = repositories.plans.getById(contract.planId);
  if (!plan) {
    return {
      ok: false,
      failedCheck: "plan",
      error: `El plan comercial (${contract.planId}) asociado al contrato no existe.`,
    };
  }

  const allLicenses = repositories.licenses.list();
  const license = licenseId
    ? allLicenses.find((l) => l.id === licenseId)
    : allLicenses.find(
        (l) =>
          (l.subscriptionId === subscription.id || l.contractId === contract.id) &&
          (!l.organizationId || l.organizationId === organization.id),
      );

  if (!license) {
    return {
      ok: false,
      failedCheck: "license",
      error: `La organización ${organization.name} no cuenta con una licencia asignada para la suscripción ${subscription.id}.`,
    };
  }
  if (license.organizationId && license.organizationId !== organization.id) {
    return {
      ok: false,
      failedCheck: "license",
      error: `Aislamiento multi-tenant: la licencia ${license.id} pertenece a otra organización (${license.organizationId}).`,
    };
  }

  // Evaluar autorización mediante el servicio centralizado de licenciamiento del Bloque 3
  const licensingSummary = evaluateOrganizationLicensing(organization.id, { referenceDate });
  if (!licensingSummary.isAuthorized) {
    return {
      ok: false,
      failedCheck: "license",
      error: `El motor central de licenciamiento denegó la autorización para ${organization.name} (estado de licencia: ${licensingSummary.licenseStatus}).`,
    };
  }

  const contractedModulesSet = new Set([
    ...(contract.planSnapshot?.moduleIds ?? plan.moduleIds),
    ...licensingSummary.enabledModuleIds,
  ]);

  const targetModules =
    requestedModuleIds && requestedModuleIds.length > 0
      ? requestedModuleIds
      : licensingSummary.enabledModuleIds;

  if (targetModules.length === 0) {
    return {
      ok: false,
      failedCheck: "modules",
      error: "No hay módulos habilitados por la licencia para aprovisionar el entorno.",
    };
  }

  // Verificar que no se solicite activar ningún módulo no contratado/no autorizado por la licencia
  const unauthorizedModules = targetModules.filter((modId) => !contractedModulesSet.has(modId));
  if (unauthorizedModules.length > 0) {
    return {
      ok: false,
      failedCheck: "modules",
      error: `Intento de activación no autorizada: el/los módulo(s) ${unauthorizedModules.join(", ")} no están incluidos en el contrato ni en la licencia activa de ${organization.name}.`,
    };
  }

  const depCheck = resolveModuleDependencies(targetModules);
  if (depCheck.blockedByDisabledDependency.length > 0) {
    const blocked = depCheck.blockedByDisabledDependency[0]!;
    return {
      ok: false,
      failedCheck: "modules",
      error: `No se puede aprovisionar el módulo ${blocked.moduleId} porque su módulo base requerido (${blocked.disabledDependencyId}) está deshabilitado.`,
    };
  }

  // Verificar que las dependencias auto-agregadas también estén cubiertas por la licencia
  const unlicensedDeps = depCheck.addedDependencyIds.filter(
    (depId) => !contractedModulesSet.has(depId),
  );
  if (unlicensedDeps.length > 0) {
    return {
      ok: false,
      failedCheck: "modules",
      error: `El módulo seleccionado requiere la dependencia base ${unlicensedDeps.join(", ")}, la cual no está contratada en la licencia actual.`,
    };
  }

  // Validar capacidades contratadas (usuarios, instituciones, almacenamiento)
  for (const resKey of ["users", "institutions", "storageGb"] as const) {
    const capValidation = validateOrganizationCapacity({
      organizationId: organization.id,
      resource: resKey,
      requestedDelta: 0,
      referenceDate,
    });
    if (!capValidation.allowed) {
      return {
        ok: false,
        failedCheck: "capacity",
        error: capValidation.reason ?? `Capacidad excedida en ${resKey}.`,
      };
    }
  }

  return {
    ok: true,
    client,
    organization,
    contract,
    subscription,
    license,
    application,
    plan,
    licensingSummary,
    authorizedModuleIds: depCheck.resolvedModuleIds,
    authorizedFeatureIds: licensingSummary.enabledFeatureIds,
  };
}

/**
 * Crea una nueva solicitud de aprovisionamiento previniendo duplicados (idempotencia por organización + contrato + producto).
 */
export function createProvisioningRequest(input: {
  id?: string | undefined;
  organizationId: string;
  contractId: string;
  subscriptionId?: string | undefined;
  licenseId?: string | undefined;
  applicationId?: string | undefined;
  requestedModuleIds?: string[] | undefined;
  requestedBy?: string | undefined;
  initialConfig?: Partial<OrganizationInitialConfig> | undefined;
  referenceDate?: string | undefined;
}):
  | { ok: true; request: ProvisioningRequest }
  | { ok: false; error: string; existingRequestId?: string | undefined } {
  const {
    id,
    organizationId,
    contractId,
    subscriptionId,
    licenseId,
    applicationId,
    requestedModuleIds,
    requestedBy = "Dirección de Onboarding A&O",
    initialConfig,
    referenceDate,
  } = input;

  const readiness = validateCommercialReadinessForProvisioning({
    organizationId,
    contractId,
    subscriptionId,
    licenseId,
    applicationId,
    requestedModuleIds,
    referenceDate,
  });

  if (!readiness.ok) {
    return { ok: false, error: readiness.error };
  }

  const resolvedAppId = readiness.application.id;
  const idempotencyKey = `IDEMP-${organizationId}-${contractId}-${resolvedAppId}`;

  // Prevención de solicitudes duplicadas
  const existingDuplicate = repositories.provisioningRequests
    .list()
    .find((req) => req.idempotencyKey === idempotencyKey && req.status !== "Cancelado");

  if (existingDuplicate) {
    return {
      ok: false,
      error: `Prevención de duplicados: ya existe una solicitud de aprovisionamiento activa u operativa (${existingDuplicate.id} en estado ${existingDuplicate.status}) para la organización ${readiness.organization.name}, contrato ${contractId} y producto ${resolvedAppId}.`,
      existingRequestId: existingDuplicate.id,
    };
  }

  const now = new Date().toISOString();
  const nextId =
    id?.trim() ||
    `PROV-${String(repositories.provisioningRequests.list().length + 1).padStart(3, "0")}`;

  const org = readiness.organization;
  const orgInstitutions = repositories.institutions
    .list()
    .filter((inst) => inst.organizationId === org.id)
    .map((inst) => inst.id);

  const mergedConfig: OrganizationInitialConfig = {
    legalName: initialConfig?.legalName?.trim() || org.name,
    displayName: initialConfig?.displayName?.trim() || org.shortName || org.name,
    taxId: initialConfig?.taxId?.trim() || org.taxId || org.idNumber || undefined,
    organizationType: initialConfig?.organizationType || org.type,
    country: initialConfig?.country?.trim() || org.country || "Colombia",
    department: initialConfig?.department?.trim() || org.department || "Cundinamarca",
    municipality: initialConfig?.municipality?.trim() || org.municipality || "Bogotá D.C.",
    address: initialConfig?.address?.trim() || org.address || "Dirección institucional registrada",
    contactEmail:
      initialConfig?.contactEmail?.trim() ||
      readiness.client.email ||
      `contacto@${org.id.toLowerCase()}.org.co`,
    contactPhone:
      initialConfig?.contactPhone?.trim() || readiness.client.phone || "+57 (601) 300 0000",
    timezone: initialConfig?.timezone || "America/Bogota",
    locale: initialConfig?.locale || "es-CO",
    currency: initialConfig?.currency || readiness.contract.currency || "COP",
    dateFormat: initialConfig?.dateFormat || "DD/MM/YYYY",
    ecclesiasticalStructureNotes:
      initialConfig?.ecclesiasticalStructureNotes?.trim() ||
      `Estructura institucional para ${org.type} con ${orgInstitutions.length} entidad(es) vinculada(s) bajo su propio alcance de permisos.`,
    authorizedInstitutionIds: initialConfig?.authorizedInstitutionIds ?? orgInstitutions,
  };

  const newRequest: ProvisioningRequest = {
    id: nextId,
    idempotencyKey,
    clientId: readiness.client.id,
    organizationId: org.id,
    contractId: readiness.contract.id,
    subscriptionId: readiness.subscription.id,
    licenseId: readiness.license.id,
    applicationId: resolvedAppId,
    planId: readiness.plan.id,
    status: "Pendiente",
    requestedBy,
    requestedModuleIds: readiness.authorizedModuleIds,
    activatedModuleIds: [],
    activatedFeatureIds: [],
    initialConfig: mergedConfig,
    stages: buildDefaultStages(nextId),
    history: [
      {
        id: `HIST-${nextId}-1`,
        timestamp: now,
        fromStatus: "Creación",
        toStatus: "Pendiente",
        actor: requestedBy,
        result: "Exitoso",
        notes: `Solicitud creada tras verificar contrato ${readiness.contract.id} y licencia ${readiness.license.id}.`,
        operationId: `OP-${nextId}-INIT`,
      },
    ],
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  repositories.provisioningRequests.create(newRequest);
  return { ok: true, request: newRequest };
}

/**
 * 4. Ciclo de vida del aprovisionamiento:
 * Valida las transiciones permitidas e impide pasar directamente a "Operativo"
 * si no se han completado todas las etapas de verificación y activación requeridas.
 */
export function transitionProvisioningStatus(input: {
  requestId: string;
  toStatus: ProvisioningStatus;
  actor?: string | undefined;
  notes: string;
  result?: "Exitoso" | "Fallido" | "Advertencia" | undefined;
  operationId?: string | undefined;
}): { ok: true; request: ProvisioningRequest } | { ok: false; error: string } {
  const {
    requestId,
    toStatus,
    actor = "Motor de Aprovisionamiento",
    notes,
    result = "Exitoso",
    operationId,
  } = input;

  const existing = repositories.provisioningRequests.getById(requestId);
  if (!existing) {
    return { ok: false, error: `La solicitud de aprovisionamiento ${requestId} no existe.` };
  }

  if (existing.status === toStatus) {
    return { ok: true, request: existing };
  }

  const allowedTargets = ALLOWED_PROVISIONING_TRANSITIONS[existing.status] ?? [];
  if (!allowedTargets.includes(toStatus)) {
    return {
      ok: false,
      error: `Transición de estado inválida: una solicitud en estado "${existing.status}" no puede pasar directamente a "${toStatus}".`,
    };
  }

  if (toStatus === "Operativo") {
    const incompleteStages = existing.stages.filter((stg) => stg.status !== "Completado");
    if (incompleteStages.length > 0) {
      return {
        ok: false,
        error: `No se puede marcar la solicitud ${existing.id} como Operativo porque existen etapas obligatorias sin completar: ${incompleteStages.map((s) => s.stageName).join(", ")}.`,
      };
    }
  }

  const now = new Date().toISOString();
  const entry: ProvisioningHistoryEntry = {
    id: `HIST-${existing.id}-${existing.history.length + 1}`,
    timestamp: now,
    fromStatus: existing.status,
    toStatus,
    actor,
    result,
    notes,
    operationId: operationId ?? `OP-${existing.id}-TR-${existing.history.length + 1}`,
  };

  const updated = repositories.provisioningRequests.update(existing.id, {
    status: toStatus,
    history: [entry, ...existing.history],
    updatedAt: now,
  });

  return { ok: true, request: updated ?? existing };
}

/**
 * 8, 9 y 10. Ejecución automatizada, idempotente y reintentable del flujo de aprovisionamiento.
 * Conserva las etapas ya completadas, evita crear dos entornos para la misma organización+producto,
 * no duplica organizaciones ni repite activaciones de módulos, y detiene el proceso en estado
 * "Fallido" si cualquier etapa obligatoria falla.
 */
export function executeProvisioningWorkflow(input: {
  requestId: string;
  actor?: string | undefined;
  simulateFailureAtStage?: ProvisioningStageCode | undefined;
  simulatedErrorMessage?: string | undefined;
  referenceDate?: string | undefined;
}):
  | { ok: true; request: ProvisioningRequest; environment: TenantEnvironment }
  | { ok: false; error: string; request?: ProvisioningRequest | undefined } {
  const {
    requestId,
    actor = "Motor de Aprovisionamiento A&O",
    simulateFailureAtStage,
    simulatedErrorMessage = "Error simulado de aprovisionamiento en etapa controlada.",
    referenceDate = new Date().toISOString().slice(0, 10),
  } = input;

  const currentReq = repositories.provisioningRequests.getById(requestId);
  if (!currentReq) {
    return { ok: false, error: `La solicitud de aprovisionamiento ${requestId} no existe.` };
  }

  if (currentReq.status === "Cancelado") {
    return {
      ok: false,
      error: `La solicitud ${requestId} se encuentra Cancelada y no puede ejecutarse.`,
      request: currentReq,
    };
  }

  // Idempotencia: si ya está Operativo y tiene entorno creado, devuelve el entorno existente sin duplicar nada
  if (currentReq.status === "Operativo" && currentReq.environmentId) {
    const existingEnv = repositories.environments.getById(currentReq.environmentId);
    if (existingEnv) {
      return { ok: true, request: currentReq, environment: existingEnv };
    }
  }

  const stages = currentReq.stages.map((s) => ({ ...s }));
  const history = [...currentReq.history];
  let currentStatus: ProvisioningStatus = currentReq.status;

  const pushHistory = (
    toStatus: ProvisioningStatus,
    result: "Exitoso" | "Fallido" | "Advertencia",
    notes: string,
    opId: string,
  ) => {
    const now = new Date().toISOString();
    history.unshift({
      id: `HIST-${currentReq.id}-${history.length + 1}`,
      timestamp: now,
      fromStatus: currentStatus,
      toStatus,
      actor,
      result,
      notes,
      operationId: opId,
    });
    currentStatus = toStatus;
  };

  const failAtStage = (stage: ProvisioningStageResult, errorMsg: string) => {
    const now = new Date().toISOString();
    stage.status = "Fallido";
    stage.executedAt = now;
    stage.executedBy = actor;
    stage.errorMessage = errorMsg;
    stage.attempts += 1;

    pushHistory(
      "Fallido",
      "Fallido",
      `Fallo en ${stage.stageName}: ${errorMsg}`,
      stage.operationId,
    );

    const failedReq = repositories.provisioningRequests.update(currentReq.id, {
      status: "Fallido",
      stages,
      history,
      lastError: errorMsg,
      retryCount: currentReq.retryCount + (currentReq.status === "Fallido" ? 1 : 0),
      updatedAt: now,
    });
    return {
      ok: false as const,
      error: errorMsg,
      request: failedReq ?? currentReq,
    };
  };

  // ETAPA 1: Validación comercial previa
  const stage1 = stages.find((s) => s.stageCode === "commercial_validation")!;
  const readiness = validateCommercialReadinessForProvisioning({
    organizationId: currentReq.organizationId,
    contractId: currentReq.contractId,
    subscriptionId: currentReq.subscriptionId,
    licenseId: currentReq.licenseId,
    applicationId: currentReq.applicationId,
    requestedModuleIds: currentReq.requestedModuleIds,
    referenceDate,
  });

  if (stage1.status !== "Completado") {
    pushHistory(
      "En validación",
      "Exitoso",
      "Iniciando verificación comercial, contractual y de licencias.",
      `${stage1.operationId}-START`,
    );
    if (simulateFailureAtStage === "commercial_validation") {
      return failAtStage(stage1, simulatedErrorMessage);
    }
    if (!readiness.ok) {
      return failAtStage(stage1, readiness.error);
    }
    stage1.status = "Completado";
    stage1.executedAt = new Date().toISOString();
    stage1.executedBy = actor;
    stage1.errorMessage = undefined;
    stage1.attempts += 1;
    stage1.detail = `Contrato ${readiness.contract.id}, suscripción ${readiness.subscription.id} y licencia ${readiness.license.id} verificados (${readiness.authorizedModuleIds.length} módulos autorizados).`;
    pushHistory("Validado", "Exitoso", stage1.detail, stage1.operationId);
  } else if (!readiness.ok) {
    // Incluso en reintento posterior, verificar que el contrato no haya sido terminado/cancelado mientras tanto
    return failAtStage(stage1, readiness.error);
  }

  // ETAPA 2: Configuración inicial de la organización
  const stage2 = stages.find((s) => s.stageCode === "org_initial_config")!;
  if (stage2.status !== "Completado") {
    pushHistory(
      "En aprovisionamiento",
      "Exitoso",
      "Preparando configuración inicial e identidad de la organización.",
      `${stage2.operationId}-START`,
    );
    if (simulateFailureAtStage === "org_initial_config") {
      return failAtStage(stage2, simulatedErrorMessage);
    }
    const cfg = currentReq.initialConfig;
    if (!cfg.legalName.trim() || !cfg.country.trim() || !cfg.timezone.trim()) {
      return failAtStage(
        stage2,
        "Configuración inicial incompleta: razón social, país y zona horaria son obligatorios.",
      );
    }
    repositories.organizations.update(readiness.organization.id, {
      name: cfg.legalName.trim(),
      shortName: cfg.displayName.trim() || cfg.legalName.trim(),
      taxId: cfg.taxId,
      country: cfg.country,
      department: cfg.department,
      municipality: cfg.municipality,
      address: cfg.address,
      operationalStatus: "En aprovisionamiento",
    });

    stage2.status = "Completado";
    stage2.executedAt = new Date().toISOString();
    stage2.executedBy = actor;
    stage2.errorMessage = undefined;
    stage2.attempts += 1;
    stage2.detail = `Configuración regional (${cfg.locale} · ${cfg.timezone} · ${cfg.currency}) aplicada a ${cfg.displayName}.`;
    pushHistory("Configurando", "Exitoso", stage2.detail, stage2.operationId);
  }

  // ETAPA 3: Estructura institucional eclesial (sin crear instituciones no autorizadas)
  const stage3 = stages.find((s) => s.stageCode === "institutional_structure")!;
  if (stage3.status !== "Completado") {
    if (simulateFailureAtStage === "institutional_structure") {
      return failAtStage(stage3, simulatedErrorMessage);
    }
    const allInstitutions = repositories.institutions.list();
    for (const instId of currentReq.initialConfig.authorizedInstitutionIds) {
      const inst = allInstitutions.find((item) => item.id === instId);
      if (!inst) {
        return failAtStage(
          stage3,
          `La institución ${instId} indicada en la configuración no existe ni ha sido validada.`,
        );
      }
      if (inst.organizationId !== readiness.organization.id) {
        return failAtStage(
          stage3,
          `Aislamiento multi-tenant: la institución ${instId} pertenece a la organización ${inst.organizationId}, no a ${readiness.organization.id}.`,
        );
      }
    }

    stage3.status = "Completado";
    stage3.executedAt = new Date().toISOString();
    stage3.executedBy = actor;
    stage3.errorMessage = undefined;
    stage3.attempts += 1;
    stage3.detail = `Estructura institucional validada para ${readiness.organization.type} (${currentReq.initialConfig.authorizedInstitutionIds.length} entidades eclesiales vinculadas).`;
  }

  // ETAPA 4: Asignación idempotente de entorno lógico multi-tenant
  const stage4 = stages.find((s) => s.stageCode === "environment_allocation")!;
  const deterministicEnvId =
    currentReq.environmentId ?? `ENV-${readiness.organization.id}-${readiness.application.id}`;

  if (stage4.status !== "Completado") {
    if (simulateFailureAtStage === "environment_allocation") {
      return failAtStage(stage4, simulatedErrorMessage);
    }
    const allocation = defaultLogicalMultiTenantAdapter.allocateLogicalNamespace(
      readiness.organization.id,
      readiness.application.id,
    );

    stage4.status = "Completado";
    stage4.executedAt = new Date().toISOString();
    stage4.executedBy = actor;
    stage4.errorMessage = undefined;
    stage4.attempts += 1;
    stage4.detail = `Entorno lógico ${deterministicEnvId} (${allocation.logicalNamespace}) reservado bajo ${allocation.isolationModel}.`;
  }

  // ETAPA 5: Resolución de dependencias y activación exclusiva de módulos contratados
  const stage5 = stages.find((s) => s.stageCode === "module_activation")!;
  if (stage5.status !== "Completado") {
    pushHistory(
      "Activando servicios",
      "Exitoso",
      `Activando módulos autorizados para ${readiness.application.name}.`,
      `${stage5.operationId}-START`,
    );
    if (simulateFailureAtStage === "module_activation") {
      return failAtStage(stage5, simulatedErrorMessage);
    }

    stage5.status = "Completado";
    stage5.executedAt = new Date().toISOString();
    stage5.executedBy = actor;
    stage5.errorMessage = undefined;
    stage5.attempts += 1;
    stage5.detail = `${readiness.authorizedModuleIds.length} módulos contratados y sus dependencias activados (${readiness.authorizedModuleIds.join(", ")}).`;
  }

  // Consolidar Entorno Lógico Multi-Tenant de forma idempotente (actualiza si ya existía, crea si no)
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const allModules = repositories.modules.list();
  const productVersion = readiness.application.commercialVersion ?? "2026.4.0";

  const moduleConfigurations: TenantEnvironmentModuleConfig[] = readiness.authorizedModuleIds.map(
    (modId) => {
      const mod = allModules.find((m) => m.id === modId);
      return {
        moduleId: modId,
        moduleCode: mod?.code ?? modId,
        moduleName: mod?.name ?? modId,
        enabled: true,
        installedVersion: productVersion,
        compatibleWithProduct: true,
        configSummary: `Módulo habilitado bajo licencia ${readiness.license.id}`,
        activatedAt: today,
      };
    },
  );

  const existingEnv =
    repositories.environments.getById(deterministicEnvId) ??
    repositories.environments
      .list()
      .find(
        (env) =>
          env.organizationId === readiness.organization.id &&
          env.applicationId === readiness.application.id,
      );

  const envId = existingEnv?.id ?? deterministicEnvId;
  const envPayload: TenantEnvironment = {
    id: envId,
    organizationId: readiness.organization.id,
    clientId: readiness.client.id,
    contractId: readiness.contract.id,
    subscriptionId: readiness.subscription.id,
    licenseId: readiness.license.id,
    applicationId: readiness.application.id,
    provisioningRequestId: currentReq.id,
    status: "Operativo",
    availabilityStatus: "Disponible",
    isolationModel: "Instancia lógica multi-tenant en infraestructura compartida",
    installedProductVersion: existingEnv?.installedProductVersion ?? productVersion,
    availableProductVersion: existingEnv?.availableProductVersion,
    updateStatus: existingEnv?.updateStatus ?? "Actualizado",
    moduleConfigurations,
    regionalConfig: {
      timezone: currentReq.initialConfig.timezone,
      locale: currentReq.initialConfig.locale,
      currency: currentReq.initialConfig.currency,
      country: currentReq.initialConfig.country,
      department: currentReq.initialConfig.department,
      municipality: currentReq.initialConfig.municipality,
    },
    dataRetentionPolicy:
      existingEnv?.dataRetentionPolicy ??
      "Conservación íntegra de información institucional y libros canónicos/administrativos; exportación garantizada ante terminación sin borrado físico automático.",
    operationHistory: [
      {
        id: `ENV-OP-${Date.now()}`,
        date: today,
        action: existingEnv
          ? "Reconciliación idempotente de entorno y módulos"
          : "Aprovisionamiento inicial completado",
        actor,
        detail: `Entorno operativo en versión ${productVersion} con ${moduleConfigurations.length} módulos activos.`,
        result: "Exitoso",
      },
      ...(existingEnv?.operationHistory ?? []),
    ],
    createdAt: existingEnv?.createdAt ?? now,
    updatedAt: now,
  };

  if (existingEnv) {
    repositories.environments.update(existingEnv.id, envPayload);
  } else {
    repositories.environments.create(envPayload);
  }

  // Actualizar organización como Operativa con sus servicios contratados
  repositories.organizations.update(readiness.organization.id, {
    status: "Activo",
    operationalStatus: "Operativo",
    contractedServices: [
      readiness.application.name,
      ...moduleConfigurations.map((m) => m.moduleName),
    ],
  });

  pushHistory(
    "Operativo",
    "Exitoso",
    `Aprovisionamiento completado. Entorno lógico ${envId} en estado Operativo con ${readiness.authorizedModuleIds.length} módulos activos.`,
    `OP-${currentReq.id}-COMPLETE`,
  );

  const completedReq = repositories.provisioningRequests.update(currentReq.id, {
    status: "Operativo",
    environmentId: envId,
    activatedModuleIds: readiness.authorizedModuleIds,
    activatedFeatureIds: readiness.authorizedFeatureIds,
    stages,
    history,
    lastError: undefined,
    updatedAt: now,
  });

  return {
    ok: true,
    request: completedReq ?? currentReq,
    environment: envPayload,
  };
}

/**
 * Reintenta de forma controlada una solicitud fallida o parcialmente completada,
 * conservando todas las etapas que ya habían finalizado con éxito.
 */
export function retryProvisioningWorkflow(input: {
  requestId: string;
  actor?: string | undefined;
  referenceDate?: string | undefined;
}):
  | { ok: true; request: ProvisioningRequest; environment: TenantEnvironment }
  | { ok: false; error: string; request?: ProvisioningRequest | undefined } {
  const existing = repositories.provisioningRequests.getById(input.requestId);
  if (!existing) {
    return { ok: false, error: `La solicitud ${input.requestId} no existe.` };
  }
  repositories.provisioningRequests.update(existing.id, {
    retryCount: existing.retryCount + 1,
  });
  return executeProvisioningWorkflow({
    requestId: input.requestId,
    actor: input.actor ?? "Reintento Controlado A&O",
    referenceDate: input.referenceDate,
  });
}

/**
 * 11. Suspensión administrativa o comercial de un entorno lógico sin eliminar datos
 * ni destruir la configuración institucional.
 */
export function suspendTenantEnvironment(input: {
  environmentId: string;
  reason: string;
  suspensionType?: "Administrativa" | "Comercial" | undefined;
  actor?: string | undefined;
}): { ok: true; environment: TenantEnvironment } | { ok: false; error: string } {
  const {
    environmentId,
    reason,
    suspensionType = "Administrativa",
    actor = "Gobierno de Infraestructura",
  } = input;

  if (!reason.trim()) {
    return { ok: false, error: "Debe registrar el motivo de la suspensión del entorno." };
  }

  const env = repositories.environments.getById(environmentId);
  if (!env) {
    return { ok: false, error: `El entorno lógico ${environmentId} no existe.` };
  }
  if (env.status === "Terminado") {
    return {
      ok: false,
      error: `El entorno ${environmentId} se encuentra Terminado y no admite suspensión.`,
    };
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const updatedEnv = repositories.environments.update(env.id, {
    status: "Suspendido",
    availabilityStatus:
      suspensionType === "Comercial"
        ? "Suspendido comercialmente"
        : "Suspendido administrativamente",
    operationHistory: [
      {
        id: `ENV-OP-${Date.now()}`,
        date: today,
        action: `Suspensión ${suspensionType.toLowerCase()} de entorno`,
        actor,
        detail: `${reason.trim()} (Configuración institucional y datos preservados íntegramente).`,
        result: "Advertencia",
      },
      ...env.operationHistory,
    ],
    updatedAt: now,
  });

  if (env.provisioningRequestId) {
    const req = repositories.provisioningRequests.getById(env.provisioningRequestId);
    if (req && req.status !== "Cancelado") {
      repositories.provisioningRequests.update(req.id, {
        status: "Suspendido",
        history: [
          {
            id: `HIST-${req.id}-${req.history.length + 1}`,
            timestamp: now,
            fromStatus: req.status,
            toStatus: "Suspendido",
            actor,
            result: "Advertencia",
            notes: `Entorno suspendido (${suspensionType}): ${reason.trim()}`,
            operationId: `OP-${req.id}-SUSP`,
          },
          ...req.history,
        ],
        updatedAt: now,
      });
    }
  }

  repositories.organizations.update(env.organizationId, {
    operationalStatus: "Suspendido",
  });

  return { ok: true, environment: updatedEnv ?? env };
}

/**
 * 11. Reactivación autorizada de un entorno suspendido:
 * Vuelve a validar obligatoriamente las licencias y condiciones comerciales vigentes.
 * Impide reactivar si el contrato ha sido terminado, cancelado, suspendido o vencido.
 */
export function reactivateTenantEnvironment(input: {
  environmentId: string;
  actor?: string | undefined;
  notes?: string | undefined;
  referenceDate?: string | undefined;
}): { ok: true; environment: TenantEnvironment } | { ok: false; error: string } {
  const {
    environmentId,
    actor = "Gobierno de Infraestructura",
    notes = "Reactivación autorizada tras revalidación comercial.",
    referenceDate,
  } = input;

  const env = repositories.environments.getById(environmentId);
  if (!env) {
    return { ok: false, error: `El entorno lógico ${environmentId} no existe.` };
  }
  if (env.status === "Terminado") {
    return {
      ok: false,
      error: `El entorno ${environmentId} se encuentra Terminado por finalización contractual y no puede reactivarse sin un nuevo proceso de contratación.`,
    };
  }

  // Revalidar condiciones comerciales y licencias vigentes
  const readiness = validateCommercialReadinessForProvisioning({
    organizationId: env.organizationId,
    contractId: env.contractId,
    subscriptionId: env.subscriptionId,
    licenseId: env.licenseId,
    applicationId: env.applicationId,
    requestedModuleIds: env.moduleConfigurations.filter((m) => m.enabled).map((m) => m.moduleId),
    referenceDate,
  });

  if (!readiness.ok) {
    return {
      ok: false,
      error: `Reactivación rechazada por validación comercial: ${readiness.error}`,
    };
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const updatedEnv = repositories.environments.update(env.id, {
    status: "Operativo",
    availabilityStatus: "Disponible",
    operationHistory: [
      {
        id: `ENV-OP-${Date.now()}`,
        date: today,
        action: "Reactivación autorizada de entorno",
        actor,
        detail: `${notes} Contrato ${readiness.contract.id} y licencia ${readiness.license.id} revalidados.`,
        result: "Exitoso",
      },
      ...env.operationHistory,
    ],
    updatedAt: now,
  });

  if (env.provisioningRequestId) {
    const req = repositories.provisioningRequests.getById(env.provisioningRequestId);
    if (req) {
      repositories.provisioningRequests.update(req.id, {
        status: "Operativo",
        history: [
          {
            id: `HIST-${req.id}-${req.history.length + 1}`,
            timestamp: now,
            fromStatus: req.status,
            toStatus: "Operativo",
            actor,
            result: "Exitoso",
            notes,
            operationId: `OP-${req.id}-REACT`,
          },
          ...req.history,
        ],
        updatedAt: now,
      });
    }
  }

  repositories.organizations.update(env.organizationId, {
    status: "Activo",
    operationalStatus: "Operativo",
  });

  return { ok: true, environment: updatedEnv ?? env };
}

/**
 * 11. Terminación controlada del servicio (Baja lógica):
 * Deshabilita la operación activa pero conserva todos los registros históricos y aplica
 * la política de conservación y exportación de información institucional sin borrado físico.
 */
export function terminateTenantEnvironment(input: {
  environmentId: string;
  reason: string;
  actor?: string | undefined;
}): { ok: true; environment: TenantEnvironment } | { ok: false; error: string } {
  const { environmentId, reason, actor = "Gobierno Comercial y Técnico" } = input;
  if (!reason.trim()) {
    return { ok: false, error: "Debe indicar el motivo de terminación del entorno." };
  }

  const env = repositories.environments.getById(environmentId);
  if (!env) {
    return { ok: false, error: `El entorno lógico ${environmentId} no existe.` };
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const disabledModules = env.moduleConfigurations.map((m) => ({
    ...m,
    enabled: false,
    configSummary: "Deshabilitado por terminación de servicio (datos conservados para exportación)",
  }));

  const updatedEnv = repositories.environments.update(env.id, {
    status: "Terminado",
    availabilityStatus: "Baja lógica / Conservación",
    moduleConfigurations: disabledModules,
    operationHistory: [
      {
        id: `ENV-OP-${Date.now()}`,
        date: today,
        action: "Terminación de servicio y paso a custodia histórica",
        actor,
        detail: `${reason.trim()} · Sin borrado físico. Datos disponibles bajo política de conservación y exportación.`,
        result: "Advertencia",
      },
      ...env.operationHistory,
    ],
    updatedAt: now,
  });

  if (env.provisioningRequestId) {
    const req = repositories.provisioningRequests.getById(env.provisioningRequestId);
    if (req) {
      repositories.provisioningRequests.update(req.id, {
        status: "Cancelado",
        history: [
          {
            id: `HIST-${req.id}-${req.history.length + 1}`,
            timestamp: now,
            fromStatus: req.status,
            toStatus: "Cancelado",
            actor,
            result: "Advertencia",
            notes: `Servicio terminado con conservación histórica: ${reason.trim()}`,
            operationId: `OP-${req.id}-TERM`,
          },
          ...req.history,
        ],
        updatedAt: now,
      });
    }
  }

  return { ok: true, environment: updatedEnv ?? env };
}

/**
 * 12. Administración lógica de versiones de software (diferenciada de la versión del plan comercial).
 */
export function applyLogicalVersionUpdate(input: {
  environmentId: string;
  targetProductVersion: string;
  actor?: string | undefined;
  releaseNotes?: string | undefined;
}): { ok: true; environment: TenantEnvironment } | { ok: false; error: string } {
  const {
    environmentId,
    targetProductVersion,
    actor = "Gobierno de Versiones A&O",
    releaseNotes = "Actualización lógica de versión de producto y módulos compatibles.",
  } = input;

  if (!targetProductVersion.trim()) {
    return { ok: false, error: "Debe especificar la versión de software objetivo." };
  }

  const env = repositories.environments.getById(environmentId);
  if (!env) {
    return { ok: false, error: `El entorno ${environmentId} no existe.` };
  }
  if (env.status === "Terminado" || env.status === "Suspendido") {
    return {
      ok: false,
      error: `No se puede actualizar la versión de software de un entorno en estado ${env.status}.`,
    };
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const updatedModules = env.moduleConfigurations.map((m) => ({
    ...m,
    installedVersion: targetProductVersion.trim(),
    compatibleWithProduct: true,
  }));

  const updatedEnv = repositories.environments.update(env.id, {
    installedProductVersion: targetProductVersion.trim(),
    availableProductVersion: undefined,
    updateStatus: "Actualizado",
    moduleConfigurations: updatedModules,
    operationHistory: [
      {
        id: `ENV-OP-${Date.now()}`,
        date: today,
        action: `Actualización lógica de software a v${targetProductVersion.trim()}`,
        actor,
        detail: `${releaseNotes} (La versión del plan comercial contratado permanece inalterada).`,
        result: "Exitoso",
      },
      ...env.operationHistory,
    ],
    updatedAt: now,
  });

  // Resolver incidencias de actualización pendientes para esa versión en ese entorno
  const openUpdateIncidents = repositories.infrastructureIncidents
    .list()
    .filter(
      (inc) =>
        inc.environmentId === env.id &&
        inc.status !== "Resuelta" &&
        inc.targetVersion === targetProductVersion.trim(),
    );
  for (const inc of openUpdateIncidents) {
    repositories.infrastructureIncidents.update(inc.id, {
      status: "Resuelta",
      updatedAt: now,
    });
  }

  return { ok: true, environment: updatedEnv ?? env };
}

/**
 * 13. Cálculo de indicadores reales de aprovisionamiento e infraestructura desde datos persistidos.
 * Nunca inventa métricas de CPU, RAM, latencia o disponibilidad de servidores físicos.
 */
export function computeInfrastructureMetrics() {
  const organizations = repositories.organizations.list();
  const requests = repositories.provisioningRequests.list();
  const environments = repositories.environments.list();
  const incidents = repositories.infrastructureIncidents.list();

  const operativeEnvironments = environments.filter((env) => env.status === "Operativo");
  const provisionedOrgIds = new Set(operativeEnvironments.map((env) => env.organizationId));

  const pendingProvisionings = requests.filter((req) =>
    [
      "Pendiente",
      "En validación",
      "Validado",
      "En aprovisionamiento",
      "Configurando",
      "Activando servicios",
    ].includes(req.status),
  ).length;

  const failedProcesses = requests.filter((req) => req.status === "Fallido").length;

  const suspendedOrgIds = new Set([
    ...organizations
      .filter((org) => org.status === "Suspendido" || org.operationalStatus === "Suspendido")
      .map((org) => org.id),
    ...environments.filter((env) => env.status === "Suspendido").map((env) => env.organizationId),
  ]);

  const activeModulesCount = operativeEnvironments.reduce(
    (sum, env) => sum + env.moduleConfigurations.filter((m) => m.enabled).length,
    0,
  );

  const pendingUpdatesCount = environments.filter(
    (env) =>
      env.updateStatus === "Actualización disponible" ||
      env.updateStatus === "Incidencia de actualización" ||
      Boolean(
        env.availableProductVersion && env.availableProductVersion !== env.installedProductVersion,
      ),
  ).length;

  const openIncidentsCount = incidents.filter((inc) => inc.status !== "Resuelta").length;

  return {
    provisionedOrganizationsCount: provisionedOrgIds.size,
    operativeEnvironmentsCount: operativeEnvironments.length,
    pendingProvisioningsCount: pendingProvisionings,
    failedProcessesCount: failedProcesses,
    suspendedOrganizationsCount: suspendedOrgIds.size,
    activeModulesCount,
    pendingUpdatesCount,
    openIncidentsCount,
    totalEnvironmentsCount: environments.length,
    totalRequestsCount: requests.length,
  };
}
