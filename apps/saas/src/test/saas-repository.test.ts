import { beforeEach, describe, expect, it } from "vitest";
import {
  calculateCommercialMetricsByCurrency,
  evaluateOrganizationLicensing,
  registerCommercialPayment,
  resolveModuleDependencies,
  reverseCommercialPayment,
  saveCommercialInvoice,
  saveCommercialPlan,
  saveContractWithRelations,
  saveLicenseWithEntitlements,
  transitionContractStatus,
  validateOrganizationCapacity,
} from "../data/commercial-service";
import {
  applyLogicalVersionUpdate,
  computeInfrastructureMetrics,
  createProvisioningRequest,
  executeProvisioningWorkflow,
  reactivateTenantEnvironment,
  retryProvisioningWorkflow,
  suspendTenantEnvironment,
  terminateTenantEnvironment,
  transitionProvisioningStatus,
  validateCommercialReadinessForProvisioning,
} from "../data/provisioning-service";
import { CLIENT_TYPES, INSTITUTION_TYPES, ORGANIZATION_TYPES } from "../data/saas-domain";
import { repositories, saasStore } from "../data/saas-repository";

describe("repositorio común de A&O SaaS", () => {
  beforeEach(() => {
    localStorage.clear();
    saasStore.reset();
  });

  it("inicializa relaciones demostrativas coherentes", () => {
    const plans = repositories.plans.list();
    const contracts = repositories.contracts.list();
    const subscriptions = repositories.subscriptions.list();
    const clients = new Set(repositories.clients.list().map((client) => client.id));

    expect(plans.length).toBeGreaterThan(0);
    expect(contracts.every((contract) => plans.some((plan) => plan.id === contract.planId))).toBe(
      true,
    );
    expect(
      subscriptions.every(
        (subscription) =>
          clients.has(subscription.clientId) &&
          contracts.some((contract) => contract.id === subscription.contractId),
      ),
    ).toBe(true);
  });

  it("dispone de fichas maestras enriquecidas para clientes, organizaciones e instituciones", () => {
    const clients = repositories.clients.list();
    const organizations = repositories.organizations.list();
    const institutions = repositories.institutions.list();
    const contacts = repositories.contacts.list();

    expect(CLIENT_TYPES.length).toBeGreaterThanOrEqual(3);
    expect(ORGANIZATION_TYPES.length).toBeGreaterThanOrEqual(10);
    expect(INSTITUTION_TYPES.length).toBeGreaterThanOrEqual(14);

    // 1. Clientes con identificación tributaria, ubicación y representante legal
    expect(clients[0]?.idType).toBe("NIT");
    expect(clients[0]?.idNumber).toBeDefined();
    expect(clients[0]?.legalRepresentative).toBeDefined();
    expect(contacts.some((contact) => contact.clientId === clients[0]?.id)).toBe(true);

    // 2. Organizaciones vinculadas a clientes y con responsables operativos
    expect(organizations.every((org) => clients.some((client) => client.id === org.clientId))).toBe(
      true,
    );
    expect(organizations[0]?.adminManager).toBeDefined();
    expect(organizations[0]?.legalNature).toBeDefined();

    // 3. Instituciones que distinguen identificación canónica de tributaria opcional
    expect(institutions.some((inst) => Boolean(inst.canonicalId))).toBe(true);
    expect(institutions.some((inst) => !inst.taxIdNumber)).toBe(true);
  });

  it("crea, consulta, actualiza y elimina entidades mediante el repositorio", () => {
    const repository = repositories.organizations;
    const template = repository.list()[0]!;
    const id = "ORG-TEST-001";

    repository.create({ ...template, id, name: "Organización de prueba" });
    expect(repository.getById(id)?.name).toBe("Organización de prueba");

    repository.update(id, { name: "Organización actualizada" });
    expect(repository.search("actualizada").some((row) => row.id === id)).toBe(true);

    expect(repository.delete(id)).toBe(true);
    expect(repository.getById(id)).toBeUndefined();
  });

  it("persiste el estado común en una única clave local", () => {
    repositories.clients.create({
      id: "CLI-TEST-001",
      name: "Cliente de prueba",
      kind: "Demo",
      country: "Colombia",
      status: "Activo",
      owner: "Pruebas",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const saved = localStorage.getItem("ao-saas:domain:v1");
    expect(saved).toContain("CLI-TEST-001");
    expect(saved).toContain('"version":1');
  });

  it("recupera los datos iniciales si el almacenamiento está corrupto", () => {
    localStorage.setItem("ao-saas:domain:v1", "{datos incompletos");
    saasStore.reload();

    expect(repositories.clients.list().length).toBeGreaterThan(0);
    expect(localStorage.getItem("ao-saas:domain:v1")).toBeNull();
  });

  it("resuelve automáticamente dependencias entre módulos del catálogo", () => {
    const modules = repositories.modules.list();
    // MOD-GOB depende de MOD-COM y MOD-DOC
    const resolved = resolveModuleDependencies(["MOD-GOB"], modules);
    expect(resolved.resolvedModuleIds).toContain("MOD-GOB");
    expect(resolved.resolvedModuleIds).toContain("MOD-COM");
    expect(resolved.resolvedModuleIds).toContain("MOD-DOC");
    expect(resolved.addedDependencyIds).toEqual(expect.arrayContaining(["MOD-COM", "MOD-DOC"]));
  });

  it("versiona planes comerciales sin alterar retroactivamente el snapshot de contratos ya celebrados", () => {
    const existingContract = repositories.contracts.list()[0]!;
    const originalPlan = repositories.plans.getById(existingContract.planId)!;
    const originalSnapshotPrice = existingContract.planSnapshot?.price;
    const originalSnapshotVersion = existingContract.planSnapshot?.planVersion;

    expect(originalSnapshotPrice).toBeDefined();
    expect(originalSnapshotVersion).toBe(1);

    // Editamos el plan comercial en el catálogo incrementando su tarifa y cupos
    const savedPlan = saveCommercialPlan(
      {
        ...originalPlan,
        price: 450000,
        userLimit: 25,
      },
      originalPlan,
    );

    expect(savedPlan.version).toBe(2);
    expect(savedPlan.price).toBe(450000);

    // El contrato celebrado previamente conserva intacto su planSnapshot congelado
    const contractAfterPlanChange = repositories.contracts.getById(existingContract.id)!;
    expect(contractAfterPlanChange.planSnapshot?.price).toBe(originalSnapshotPrice);
    expect(contractAfterPlanChange.planSnapshot?.planVersion).toBe(1);

    // Incluso si se actualiza una observación administrativa del contrato preservando su snapshot
    const updateRes = saveContractWithRelations({
      contract: {
        ...contractAfterPlanChange,
        specialConditions: "Anexo administrativo sin novación de tarifa.",
      },
      editingContract: contractAfterPlanChange,
      preserveExistingSnapshot: true,
    });
    expect(updateRes.ok).toBe(true);
    if (updateRes.ok) {
      expect(updateRes.contract.planSnapshot?.price).toBe(originalSnapshotPrice);
      expect(updateRes.contract.planSnapshot?.planVersion).toBe(1);
    }
  });

  it("ejecuta transiciones no destructivas de contratos con historial auditable", () => {
    const firstContract = repositories.contracts.list()[0]!;
    const updatedContract = transitionContractStatus(
      firstContract.id,
      "Suspendido",
      "Suspensión temporal por conciliación de cartera.",
      "Comité Financiero",
    );

    expect(updatedContract).toBeDefined();
    expect(updatedContract?.status).toBe("Suspendido");
    expect(updatedContract?.modificationHistory?.[0]?.action).toContain("Suspendido");
    expect(updatedContract?.modificationHistory?.[0]?.summary).toContain(
      "Suspensión temporal por conciliación de cartera.",
    );
  });

  it("evalúa de forma centralizada licencias, entitlements, límites contratados y excepciones por organización", () => {
    const existingLicense = repositories.licenses.list()[0]!;
    const targetOrgId = existingLicense.organizationId ?? "ORG-001";
    const saveLic = saveLicenseWithEntitlements({
      license: {
        ...existingLicense,
        organizationId: targetOrgId,
        userLimit: 100,
        institutionLimit: 25,
        storageLimitGb: 500,
        authorizedExceptions: "+15 usuarios adicionales por visita pastoral",
      },
      editingLicense: existingLicense,
      extraUsersException: 15,
    });

    expect(saveLic.ok).toBe(true);

    const evaluation = evaluateOrganizationLicensing(targetOrgId);
    expect(evaluation.isAuthorized).toBe(true);
    expect(evaluation.capacities.users.contracted).toBeGreaterThanOrEqual(100);
    expect(evaluation.capacities.users.exceptionExtra).toBeGreaterThanOrEqual(15);
    expect(evaluation.capacities.users.effectiveMaximum).toBeGreaterThanOrEqual(115);
    expect(evaluation.capacities.users.remaining).toBeGreaterThan(0);
    expect(evaluation.capacities.institutions.effectiveMaximum).toBeGreaterThanOrEqual(25);
    expect(evaluation.capacities.storageGb.effectiveMaximum).toBeGreaterThanOrEqual(500);
    expect(evaluation.enabledModuleIds).toContain("MOD-COM");
  });

  it("concilia pagos comerciales recalculando saldo pendiente y estado de cartera", () => {
    const pendingInvoice = repositories.invoices.list()[0]!;
    const initialBalance = pendingInvoice.balanceDue ?? pendingInvoice.amount;
    expect(initialBalance).toBeGreaterThan(0);

    const payResult = registerCommercialPayment({
      payment: {
        id: "PAG-TEST-999",
        invoiceId: pendingInvoice.id,
        amount: initialBalance,
        paidAt: "2026-11-09",
        status: "Activo",
        method: "Transferencia bancaria PSE",
        reference: "PSE-999111",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    expect(payResult.ok).toBe(true);
    if (payResult.ok) {
      expect(payResult.invoice.balanceDue).toBe(0);
      expect(payResult.invoice.status).toBe("Activo");
      expect(payResult.invoice.portfolioStatus).toBe("Pagada");
    }
  });

  it("impide modificar silenciosamente condiciones originales de un contrato celebrado y exige novación/renovación trazable", () => {
    const activeContract = repositories.contracts.list().find((c) => c.status === "Activo")!;
    const otherPlan = repositories.plans.list().find((p) => p.id !== activeContract.planId)!;

    // 1. Intento de alterar silenciosamente el valor pactado o plan sin autorizar novación
    const silentEdit = saveContractWithRelations({
      contract: {
        ...activeContract,
        contractedAmount: (activeContract.contractedAmount ?? 290000) + 150000,
      },
      editingContract: activeContract,
      allowCommercialNovation: false,
    });
    expect(silentEdit.ok).toBe(false);
    if (!silentEdit.ok) {
      expect(silentEdit.error).toContain("Inmutabilidad contractual");
    }

    // 2. Novación y renovación autorizada registra trazabilidad completa de plan y versión anterior/nueva
    const updatedPlan = saveCommercialPlan({ ...otherPlan, price: 1350000 }, otherPlan);
    const novationRes = saveContractWithRelations({
      contract: {
        ...activeContract,
        planId: updatedPlan.id,
        contractedAmount: 1350000,
        endsAt: "2027-12-31",
      },
      editingContract: activeContract,
      allowCommercialNovation: true,
      isRenewal: true,
      preserveExistingSnapshot: false,
      author: "Comité de Contratación",
      changeSummary: "Renovación anual con ascenso a plan superior.",
    });

    expect(novationRes.ok).toBe(true);
    if (novationRes.ok) {
      expect(Object.isFrozen(novationRes.contract.planSnapshot)).toBe(true);
      expect(novationRes.contract.planSnapshot?.planVersion).toBe(updatedPlan.version);
      const latestEntry = novationRes.contract.modificationHistory?.[0];
      expect(latestEntry?.action).toContain("Renovación");
      expect(latestEntry?.previousPlanId).toBe(activeContract.planId);
      expect(latestEntry?.newPlanId).toBe(updatedPlan.id);
      expect(latestEntry?.newPlanVersion).toBe(updatedPlan.version);
      expect(latestEntry?.previousEndsAt).toBe(activeContract.endsAt);
      expect(latestEntry?.newEndsAt).toBe("2027-12-31");
    }
  });

  it("bloquea la habilitación de módulos cuyas dependencias base están deshabilitadas o retiradas", () => {
    const allModules = repositories.modules
      .list()
      .map((m) => (m.id === "MOD-DOC" ? { ...m, status: "Suspendido" as const } : m));

    // MOD-GOB depende de MOD-COM y MOD-DOC; al estar MOD-DOC suspendido, MOD-GOB queda bloqueado
    const depResult = resolveModuleDependencies(["MOD-GOB", "MOD-COM"], allModules);
    expect(depResult.disabledModuleIds).toContain("MOD-DOC");
    expect(depResult.resolvedModuleIds).not.toContain("MOD-GOB");
    expect(depResult.resolvedModuleIds).toContain("MOD-COM");
    expect(depResult.blockedByDisabledDependency).toEqual([
      { moduleId: "MOD-GOB", disabledDependencyId: "MOD-DOC" },
    ]);

    // Persistimos MOD-DOC como Suspendido y verificamos que saveLicenseWithEntitlements rechace habilitar MOD-GOB
    repositories.modules.update("MOD-DOC", { status: "Suspendido" });
    const firstLicense = repositories.licenses.list()[0]!;
    const licResult = saveLicenseWithEntitlements({
      license: {
        ...firstLicense,
        moduleIds: ["MOD-GOB"],
      },
      editingLicense: firstLicense,
    });
    expect(licResult.ok).toBe(false);
    if (!licResult.ok) {
      expect(licResult.error).toContain("MOD-DOC");
    }
  });

  it("garantiza aislamiento multi-tenant entre organizaciones del mismo cliente, vigencias de licencias y excepciones", () => {
    const firstOrg = repositories.organizations.list()[0]!;
    // Creamos una segunda organización hermana perteneciente al MISMO cliente contratante
    repositories.organizations.create({
      ...firstOrg,
      id: "ORG-HERMANA-99",
      name: "Fundación Educativa Diocesana (Hermana)",
      clientId: firstOrg.clientId,
      institutionIds: [],
      userIds: [],
    });

    // ORG-HERMANA-99 no tiene licencias propias; no debe heredar indebidamente las de firstOrg aunque compartan clientId
    const siblingEval = evaluateOrganizationLicensing("ORG-HERMANA-99");
    expect(siblingEval.isAuthorized).toBe(false);
    expect(siblingEval.activeLicenseIds).toHaveLength(0);
    expect(siblingEval.enabledModuleIds).toHaveLength(0);
    expect(siblingEval.capacities.users.contracted).toBe(0);

    // Evaluamos firstOrg en una fecha futura posterior al vencimiento de la excepción (2027-06-30) pero dentro de licencia
    const firstLicense = repositories.licenses
      .list()
      .find((l) => l.organizationId === firstOrg.id)!;
    repositories.licenses.update(firstLicense.id, {
      expiresAt: "2028-12-31",
      exceptionExpiresAt: "2027-06-30",
    });

    const evalBeforeExp = evaluateOrganizationLicensing(firstOrg.id, {
      referenceDate: "2027-01-15",
    });
    const evalAfterExceptionExp = evaluateOrganizationLicensing(firstOrg.id, {
      referenceDate: "2027-09-01",
    });
    expect(evalBeforeExp.capacities.users.exceptionExtra).toBeGreaterThan(0);
    expect(evalAfterExceptionExp.capacities.users.exceptionExtra).toBe(0);

    // Si la fecha supera expiresAt de la licencia (2029-01-01), la licencia pasa a expiredLicenseIds y desautoriza
    const evalAfterLicenseExp = evaluateOrganizationLicensing(firstOrg.id, {
      referenceDate: "2029-01-01",
    });
    expect(evalAfterLicenseExp.isAuthorized).toBe(false);
    expect(evalAfterLicenseExp.expiredLicenseIds).toContain(firstLicense.id);
    expect(evalAfterLicenseExp.licenseStatus).toBe("Vencido");
  });

  it("valida activamente los límites de capacidad antes de permitir operaciones que excedan el cupo contratado", () => {
    const firstOrg = repositories.organizations.list()[0]!;
    const evalNow = evaluateOrganizationLicensing(firstOrg.id);
    const maxInstitutions = evalNow.capacities.institutions.effectiveMaximum;

    // Solicitar dentro del límite disponible es permitido
    const allowedCheck = validateOrganizationCapacity({
      organizationId: firstOrg.id,
      resource: "institutions",
      currentUsedOverride: maxInstitutions - 1,
      requestedDelta: 1,
    });
    expect(allowedCheck.allowed).toBe(true);

    // Solicitar por encima del máximo efectivo es bloqueado activamente
    const blockedCheck = validateOrganizationCapacity({
      organizationId: firstOrg.id,
      resource: "institutions",
      currentUsedOverride: maxInstitutions,
      requestedDelta: 1,
    });
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.reason).toContain("Límite de capacidad excedido");
  });

  it("controla pagos parciales, múltiples pagos, sobrepagos, mora, bloqueo de edición con pagos y reversión no destructiva", () => {
    const baseInvoice = repositories.invoices.list()[0]!;
    const now = new Date().toISOString();

    // 1. Creamos una factura comercial limpia por COP 1.000.000 (Subtotal 1.000.000 - Desc 100.000 + IVA 171.000 = 1.071.000)
    const createRes = saveCommercialInvoice({
      invoice: {
        ...baseInvoice,
        id: "FAC-AUDIT-01",
        concepts: [
          {
            description: "Suscripción anual ERP Eclesial",
            quantity: 1,
            unitPrice: 1000000,
            total: 1000000,
          },
        ],
        subtotalAmount: 1000000,
        discountAmount: 100000,
        taxAmount: 171000,
        amount: 1071000,
        paidAmount: 0,
        balanceDue: 1071000,
        dueAt: "2026-05-01",
        status: "Pendiente",
        createdAt: now,
        updatedAt: now,
      },
      referenceDate: "2026-04-10",
    });
    expect(createRes.ok).toBe(true);

    // 2. Primer pago parcial (COP 400.000) en fecha posterior al vencimiento -> Estado "En mora" con saldo 671.000
    const partialPay1 = registerCommercialPayment({
      payment: {
        id: "PAG-AUDIT-01",
        invoiceId: "FAC-AUDIT-01",
        amount: 400000,
        paidAt: "2026-05-15",
        status: "Activo",
        method: "PSE",
        createdAt: now,
        updatedAt: now,
      },
      referenceDate: "2026-05-15",
    });
    expect(partialPay1.ok).toBe(true);
    if (partialPay1.ok) {
      expect(partialPay1.invoice.paidAmount).toBe(400000);
      expect(partialPay1.invoice.balanceDue).toBe(671000);
      expect(partialPay1.invoice.portfolioStatus).toBe("En mora");
    }

    // 3. Intento de modificar económicamente la factura cuando ya tiene pagos aplicados -> Bloqueado
    const currentInv = repositories.invoices.getById("FAC-AUDIT-01")!;
    const illegalEdit = saveCommercialInvoice({
      invoice: {
        ...currentInv,
        discountAmount: 200000,
      },
      editingInvoice: currentInv,
    });
    expect(illegalEdit.ok).toBe(false);
    if (!illegalEdit.ok) {
      expect(illegalEdit.error).toContain("Integridad contable");
    }

    // 4. Intento de pago superior al saldo pendiente (Sobrepago de 700.000 sobre saldo de 671.000) -> Bloqueado
    const overPay = registerCommercialPayment({
      payment: {
        id: "PAG-AUDIT-OVER",
        invoiceId: "FAC-AUDIT-01",
        amount: 700000,
        paidAt: "2026-05-16",
        status: "Activo",
        method: "PSE",
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(overPay.ok).toBe(false);
    if (!overPay.ok) {
      expect(overPay.error).toContain("supera el saldo pendiente");
    }

    // 5. Segundo pago completando el saldo exacto (COP 671.000) -> Factura Pagada
    const partialPay2 = registerCommercialPayment({
      payment: {
        id: "PAG-AUDIT-02",
        invoiceId: "FAC-AUDIT-01",
        amount: 671000,
        paidAt: "2026-05-16",
        status: "Activo",
        method: "Transferencia",
        createdAt: now,
        updatedAt: now,
      },
      referenceDate: "2026-05-16",
    });
    expect(partialPay2.ok).toBe(true);
    if (partialPay2.ok) {
      expect(partialPay2.invoice.paidAmount).toBe(1071000);
      expect(partialPay2.invoice.balanceDue).toBe(0);
      expect(partialPay2.invoice.portfolioStatus).toBe("Pagada");
    }

    // 6. Reversión no destructiva del segundo pago -> El pago queda en estado Anulada y la factura vuelve a saldo 671.000
    const reversal = reverseCommercialPayment({
      paymentId: "PAG-AUDIT-02",
      reason: "Devolución bancaria ACH",
      referenceDate: "2026-05-17",
    });
    expect(reversal.ok).toBe(true);
    if (reversal.ok) {
      expect(reversal.payment.status).toBe("Anulada");
      expect(reversal.invoice.paidAmount).toBe(400000);
      expect(reversal.invoice.balanceDue).toBe(671000);
      expect(reversal.invoice.portfolioStatus).toBe("En mora");
    }
  });

  it("separa indicadores comerciales y MRR por divisa sin sumar COP, USD y EUR entre sí", () => {
    const firstContract = repositories.contracts.list()[0]!;
    const now = new Date().toISOString();

    // Agregamos un contrato activo en USD (Anual: USD 1.200 -> MRR USD 100) y uno suspendido en EUR
    repositories.contracts.create({
      ...firstContract,
      id: "CON-USD-01",
      currency: "USD",
      billingPeriod: "Anual",
      contractedAmount: 1200,
      status: "Activo",
      createdAt: now,
      updatedAt: now,
    });
    repositories.contracts.create({
      ...firstContract,
      id: "CON-EUR-SUSP",
      currency: "EUR",
      billingPeriod: "Mensual",
      contractedAmount: 500,
      status: "Suspendido",
      createdAt: now,
      updatedAt: now,
    });

    const metrics = calculateCommercialMetricsByCurrency();
    expect(metrics.mrrByCurrency["COP"]).toBeGreaterThan(0);
    expect(metrics.mrrByCurrency["USD"]).toBe(100);
    expect(metrics.mrrByCurrency["EUR"]).toBeUndefined();
    expect(metrics.excludedContractsCount).toBeGreaterThanOrEqual(1);
  });

  // =========================================================================
  // BLOQUE 4: PRUEBAS OBLIGATORIAS DE APROVISIONAMIENTO E INFRAESTRUCTURA
  // =========================================================================

  it("1. aprovisiona una organización con contrato y licencia vigentes creando su entorno lógico", () => {
    const secondCon = repositories.contracts.list()[1]!;
    const secondOrgId = secondCon.organizationId!;

    // Eliminamos solicitudes previas de secondOrgId para probar creación limpia + ejecución completa
    for (const req of repositories.provisioningRequests.list()) {
      if (req.organizationId === secondOrgId) {
        repositories.provisioningRequests.delete(req.id);
      }
    }

    const created = createProvisioningRequest({
      organizationId: secondOrgId,
      contractId: secondCon.id,
      requestedBy: "Ingeniería de Aprovisionamiento",
      referenceDate: "2026-11-06",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.request.status).toBe("Pendiente");

    // Impedir salto directo a Operativo sin completar etapas
    const premature = transitionProvisioningStatus({
      requestId: created.request.id,
      toStatus: "Operativo",
      notes: "Intento de salto directo sin ejecutar etapas",
    });
    expect(premature.ok).toBe(false);

    const executed = executeProvisioningWorkflow({
      requestId: created.request.id,
      actor: "Orquestador Multi-Tenant",
      referenceDate: "2026-11-06",
    });

    expect(executed.ok).toBe(true);
    if (executed.ok) {
      expect(executed.request.status).toBe("Operativo");
      expect(executed.request.stages.every((s) => s.status === "Completado")).toBe(true);
      expect(executed.environment.status).toBe("Operativo");
      expect(executed.environment.organizationId).toBe(secondOrgId);
      expect(executed.environment.isolationModel).toBe(
        "Instancia lógica multi-tenant en infraestructura compartida",
      );
    }
  });

  it("2. rechaza el aprovisionamiento de organizaciones sin autorización comercial vigente", () => {
    const secondCon = repositories.contracts.list()[1]!;
    const secondOrgId = secondCon.organizationId!;

    // Suspendemos el contrato y verificamos que la validación comercial rechace el aprovisionamiento
    transitionContractStatus(secondCon.id, "Suspendido", "Suspensión comercial de prueba");

    const readiness = validateCommercialReadinessForProvisioning({
      organizationId: secondOrgId,
      contractId: secondCon.id,
      referenceDate: "2026-11-06",
    });

    expect(readiness.ok).toBe(false);
    if (!readiness.ok) {
      expect(readiness.failedCheck).toBe("contract");
      expect(readiness.error).toContain("Suspendido");
    }
  });

  it("3. activa exclusivamente módulos contratados y rechaza módulos fuera del contrato", () => {
    const secondCon = repositories.contracts.list()[1]!;
    const secondOrgId = secondCon.organizationId!;

    // secondCon (Parroquial/Institucional) no incluye MOD-GOB
    const uncontractedCheck = validateCommercialReadinessForProvisioning({
      organizationId: secondOrgId,
      contractId: secondCon.id,
      requestedModuleIds: ["MOD-COM", "MOD-GOB"],
      referenceDate: "2026-11-06",
    });

    expect(uncontractedCheck.ok).toBe(false);
    if (!uncontractedCheck.ok) {
      expect(uncontractedCheck.failedCheck).toBe("modules");
      expect(uncontractedCheck.error).toContain("MOD-GOB");
    }
  });

  it("4. resuelve dependencias de módulos durante el aprovisionamiento y bloquea dependencias deshabilitadas", () => {
    const secondCon = repositories.contracts.list()[1]!;
    const secondOrgId = secondCon.organizationId!;

    // Al solicitar MOD-SAC, resuelve e incorpora automáticamente su dependencia base MOD-COM cubierta por la licencia
    const autoResolved = validateCommercialReadinessForProvisioning({
      organizationId: secondOrgId,
      contractId: secondCon.id,
      requestedModuleIds: ["MOD-SAC"],
      referenceDate: "2026-11-06",
    });
    expect(autoResolved.ok).toBe(true);
    if (autoResolved.ok) {
      expect(autoResolved.authorizedModuleIds).toContain("MOD-COM");
      expect(autoResolved.authorizedModuleIds).toContain("MOD-SAC");
    }

    // Pero si el módulo base MOD-COM se encuentra Suspendido en el catálogo, bloquea el aprovisionamiento de MOD-SAC
    repositories.modules.update("MOD-COM", { status: "Suspendido" });
    const blockedDepCheck = validateCommercialReadinessForProvisioning({
      organizationId: secondOrgId,
      contractId: secondCon.id,
      requestedModuleIds: ["MOD-SAC"],
      referenceDate: "2026-11-06",
    });

    expect(blockedDepCheck.ok).toBe(false);
    if (!blockedDepCheck.ok) {
      expect(blockedDepCheck.failedCheck).toBe("modules");
      expect(blockedDepCheck.error).toContain("MOD-COM");
    }
  });

  it("5. previene solicitudes duplicadas de aprovisionamiento por clave de idempotencia", () => {
    const firstCon = repositories.contracts.list()[0]!;
    const firstOrgId = firstCon.organizationId!;

    // firstOrgId ya cuenta con PROV-001 en estado Operativo para firstCon.id
    const duplicate = createProvisioningRequest({
      organizationId: firstOrgId,
      contractId: firstCon.id,
      applicationId: firstCon.applicationId ?? "APP-ERP",
      referenceDate: "2026-11-06",
    });

    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) {
      expect(duplicate.error).toContain("Prevención de duplicados");
      expect(duplicate.existingRequestId).toBe("PROV-001");
    }
  });

  it("6. permite reintentar operaciones fallidas hasta alcanzar el estado Operativo sin duplicar entorno", () => {
    // PROV-002 viene en estado Fallido en la etapa 3 (institutional_structure)
    const beforeRetry = repositories.provisioningRequests.getById("PROV-002")!;
    expect(beforeRetry.status).toBe("Fallido");

    const retried = retryProvisioningWorkflow({
      requestId: "PROV-002",
      actor: "Ingeniero de Confiabilidad SaaS",
      referenceDate: "2026-11-06",
    });

    expect(retried.ok).toBe(true);
    if (retried.ok) {
      expect(retried.request.status).toBe("Operativo");
      expect(retried.request.retryCount).toBeGreaterThanOrEqual(2);
      expect(retried.environment.organizationId).toBe(beforeRetry.organizationId);

      // Ejecutar nuevamente sobre el mismo request Operativo es idempotente y no crea otro entorno
      const envsBefore = repositories.environments.list().length;
      const secondRun = executeProvisioningWorkflow({
        requestId: "PROV-002",
        referenceDate: "2026-11-06",
      });
      expect(secondRun.ok).toBe(true);
      expect(repositories.environments.list().length).toBe(envsBefore);
    }
  });

  it("7. conserva las etapas previamente completadas cuando falla una etapa posterior", () => {
    const secondCon = repositories.contracts.list()[1]!;
    const secondOrgId = secondCon.organizationId!;

    for (const req of repositories.provisioningRequests.list()) {
      if (req.organizationId === secondOrgId) {
        repositories.provisioningRequests.delete(req.id);
      }
    }

    const created = createProvisioningRequest({
      organizationId: secondOrgId,
      contractId: secondCon.id,
      referenceDate: "2026-11-06",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    // Simulamos fallo en la etapa 4 (environment_allocation)
    const partial = executeProvisioningWorkflow({
      requestId: created.request.id,
      simulateFailureAtStage: "environment_allocation",
      simulatedErrorMessage: "Timeout simulado al reservar namespace multi-tenant",
      referenceDate: "2026-11-06",
    });

    expect(partial.ok).toBe(false);
    const saved = repositories.provisioningRequests.getById(created.request.id)!;
    expect(saved.status).toBe("Fallido");

    const stg1 = saved.stages.find((s) => s.stageCode === "commercial_validation")!;
    const stg2 = saved.stages.find((s) => s.stageCode === "org_initial_config")!;
    const stg3 = saved.stages.find((s) => s.stageCode === "institutional_structure")!;
    const stg4 = saved.stages.find((s) => s.stageCode === "environment_allocation")!;
    const stg5 = saved.stages.find((s) => s.stageCode === "module_activation")!;

    expect(stg1.status).toBe("Completado");
    expect(stg2.status).toBe("Completado");
    expect(stg3.status).toBe("Completado");
    expect(stg4.status).toBe("Fallido");
    expect(stg5.status).toBe("Pendiente");
  });

  it("8. suspende y reactiva un entorno lógico conservando datos y revalidando licencias", () => {
    const firstEnv = repositories.environments.list()[0]!;

    const suspended = suspendTenantEnvironment({
      environmentId: firstEnv.id,
      reason: "Ventana de auditoría diocesana solicitada por Ecónomo",
      suspensionType: "Administrativa",
      actor: "Operaciones SaaS",
    });

    expect(suspended.ok).toBe(true);
    if (suspended.ok) {
      expect(suspended.environment.status).toBe("Suspendido");
      expect(suspended.environment.availabilityStatus).toBe("Suspendido administrativamente");
      expect(suspended.environment.moduleConfigurations.length).toBeGreaterThan(0);
    }

    const reactivated = reactivateTenantEnvironment({
      environmentId: firstEnv.id,
      actor: "Operaciones SaaS",
      notes: "Auditoría completada con contrato y licencia activos",
      referenceDate: "2026-11-06",
    });

    expect(reactivated.ok).toBe(true);
    if (reactivated.ok) {
      expect(reactivated.environment.status).toBe("Operativo");
      expect(reactivated.environment.availabilityStatus).toBe("Disponible");
    }
  });

  it("9. garantiza aislamiento multi-tenant entre organizaciones impidiendo cruce de contratos o licencias", () => {
    const firstCon = repositories.contracts.list()[0]!;

    // ORG-002 no puede aprovisionarse usando un contrato asignado a ORG-001
    const crossTenant = validateCommercialReadinessForProvisioning({
      organizationId: "ORG-002",
      contractId: firstCon.id,
      referenceDate: "2026-11-06",
    });

    expect(crossTenant.ok).toBe(false);
    if (!crossTenant.ok) {
      expect(crossTenant.error).toContain("Aislamiento multi-tenant");
    }
  });

  it("10. preserva los registros históricos y políticas de retención al terminar un entorno o actualizar versión", () => {
    const firstEnv = repositories.environments.list()[0]!;

    // Primero probamos actualización lógica de versión de software sin alterar planVersion
    const versionUpdate = applyLogicalVersionUpdate({
      environmentId: firstEnv.id,
      targetProductVersion: "2026.4.2",
      actor: "Release Manager A&O",
      releaseNotes: "Actualización lógica a v2026.4.2",
    });
    expect(versionUpdate.ok).toBe(true);
    if (versionUpdate.ok) {
      expect(versionUpdate.environment.installedProductVersion).toBe("2026.4.2");
      expect(versionUpdate.environment.updateStatus).toBe("Actualizado");
    }

    const historyBefore = repositories.environments.getById(firstEnv.id)!.operationHistory.length;

    const terminated = terminateTenantEnvironment({
      environmentId: firstEnv.id,
      reason: "Cierre de ciclo contractual con conservación histórica",
      actor: "Dirección Legal A&O",
    });

    expect(terminated.ok).toBe(true);
    if (terminated.ok) {
      expect(terminated.environment.status).toBe("Terminado");
      expect(terminated.environment.availabilityStatus).toBe("Baja lógica / Conservación");
      expect(terminated.environment.operationHistory.length).toBeGreaterThan(historyBefore);
      expect(terminated.environment.dataRetentionPolicy).toContain("Conservación");
      // El registro sigue existiendo en el repositorio (sin borrado físico)
      expect(repositories.environments.getById(firstEnv.id)).toBeDefined();
    }
  });

  it("11. valida las capacidades contratadas antes de permitir el aprovisionamiento", () => {
    const firstCon = repositories.contracts.list()[0]!;
    const orgId = firstCon.organizationId!;

    // Reducimos el límite de usuarios en todas las licencias y usageLimits de la organización por debajo del uso actual
    for (const lic of repositories.licenses.list().filter((l) => l.organizationId === orgId)) {
      repositories.licenses.update(lic.id, {
        userLimit: 2,
        exceptionExpiresAt: "2020-01-01",
      });
    }
    for (const lim of repositories.usageLimits.list().filter((u) => u.resource === "usuarios")) {
      repositories.usageLimits.update(lim.id, { maximum: 2, used: 18, exceptionExtra: 0 });
    }

    const capacityCheck = validateCommercialReadinessForProvisioning({
      organizationId: orgId,
      contractId: firstCon.id,
      referenceDate: "2026-11-06",
    });

    expect(capacityCheck.ok).toBe(false);
    if (!capacityCheck.ok) {
      expect(capacityCheck.failedCheck).toBe("capacity");
    }
  });

  it("12. impide activaciones o reactivaciones después de la terminación contractual", () => {
    const firstEnv = repositories.environments.list()[0]!;
    const firstCon = repositories.contracts.list()[0]!;

    // Primero suspendemos el entorno
    suspendTenantEnvironment({
      environmentId: firstEnv.id,
      reason: "Suspensión previa a terminación contractual",
      suspensionType: "Comercial",
    });

    // Terminamos el contrato
    const terminatedContract = transitionContractStatus(
      firstCon.id,
      "Terminado",
      "Terminación definitiva del contrato",
    );
    expect(terminatedContract?.status).toBe("Terminado");

    // Intentar reactivar el entorno con el contrato Terminado debe fallar
    const reactivateAttempt = reactivateTenantEnvironment({
      environmentId: firstEnv.id,
      referenceDate: "2026-11-06",
    });
    expect(reactivateAttempt.ok).toBe(false);
    if (!reactivateAttempt.ok) {
      expect(reactivateAttempt.error).toContain("Terminado");
    }

    // Y los indicadores de infraestructura se calculan exclusivamente desde datos reales persistidos
    const infraMetrics = computeInfrastructureMetrics();
    expect(infraMetrics.totalEnvironmentsCount).toBeGreaterThanOrEqual(1);
    expect(infraMetrics.suspendedOrganizationsCount).toBeGreaterThanOrEqual(1);
  });
});
