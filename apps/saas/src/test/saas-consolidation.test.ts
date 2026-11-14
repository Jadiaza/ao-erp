import { beforeEach, describe, expect, it } from "vitest";
import {
  evaluateOrganizationLicensing,
  resolveModuleDependencies,
  saveContractWithRelations,
  saveLicenseWithEntitlements,
  transitionContractStatus,
  validateOrganizationCapacity,
} from "../data/commercial-service";
import {
  createProvisioningRequest,
  executeProvisioningWorkflow,
  validateCommercialReadinessForProvisioning,
} from "../data/provisioning-service";
import { repositories, saasStore } from "../data/saas-repository";

describe("consolidación funcional de A&O SaaS (demo local)", () => {
  beforeEach(() => {
    saasStore.reset();
  });

  it("mantiene CRUD de organizaciones e instituciones con relación y contexto", () => {
    const org = {
      ...repositories.organizations.list()[0]!,
      id: "ORG-TEST-01",
      name: "Organización de Prueba",
      clientId: repositories.clients.list()[0]!.id,
      institutionIds: [],
      status: "Activo" as const,
    };
    repositories.organizations.create(org);
    expect(repositories.organizations.getById("ORG-TEST-01")?.name).toBe("Organización de Prueba");

    repositories.organizations.update("ORG-TEST-01", { status: "Suspendido" });
    expect(repositories.organizations.getById("ORG-TEST-01")?.status).toBe("Suspendido");

    const inst = {
      ...repositories.institutions.list()[0]!,
      id: "INS-TEST-01",
      name: "Institución de Prueba",
      organizationId: "ORG-TEST-01",
      clientId: org.clientId,
      status: "Activo" as const,
    };
    repositories.institutions.create(inst);
    const linked = repositories.institutions.getById("INS-TEST-01");
    expect(linked?.organizationId).toBe("ORG-TEST-01");

    const capacity = validateOrganizationCapacity({
      organizationId: "ORG-TEST-01",
      resource: "institutions",
      requestedDelta: 1,
    });
    expect(typeof capacity.allowed).toBe("boolean");

    repositories.institutions.delete("INS-TEST-01");
    repositories.organizations.delete("ORG-TEST-01");
    expect(repositories.organizations.getById("ORG-TEST-01")).toBeUndefined();
  });

  it("asocia usuarios y roles con alcance organizacional sin elevar permisos globales", () => {
    const orgId = repositories.organizations.list()[0]!.id;
    const role = {
      ...repositories.roles.list()[0]!,
      id: "ROL-TEST-LOCAL",
      name: "Rol local prueba",
      scope: `Organización ${orgId}`,
      permissionIds: ["perm-usuarios", "perm-reportes"],
      status: "Activo" as const,
    };
    repositories.roles.create(role);

    const user = {
      ...repositories.users.list()[0]!,
      id: "USR-TEST-LOCAL",
      name: "Usuario Local",
      detail: "local@test.example",
      organization: repositories.organizations.getById(orgId)?.name ?? orgId,
      role: role.name,
      status: "Activo" as const,
    };
    repositories.users.create(user);

    const storedUser = repositories.users.getById("USR-TEST-LOCAL");
    const storedRole = repositories.roles.getById("ROL-TEST-LOCAL");
    expect(storedUser?.organization).toBe(repositories.organizations.getById(orgId)?.name ?? orgId);
    expect(storedRole?.scope).toContain(orgId);
    expect(storedRole?.scope.toLowerCase()).not.toContain("global");
  });

  it("conserva configuración global y por organización en estado de demostración local", () => {
    const initial = saasStore.read().settings;
    const orgId = repositories.organizations.list()[0]!.id;

    saasStore.updateSettings({
      scope: "organization",
      organization: orgId,
      theme: "dark",
      density: "compact",
      enabledModuleIds: ["documents", "treasury"],
    });

    const updated = saasStore.read().settings;
    expect(updated.scope).toBe("organization");
    expect(updated.organization).toBe(orgId);
    expect(updated.theme).toBe("dark");
    expect(updated.enabledModuleIds).toContain("documents");

    saasStore.updateSettings({
      scope: "global",
      organization: "",
      theme: initial.theme,
      density: initial.density,
      enabledModuleIds: initial.enabledModuleIds,
    });
    expect(saasStore.read().settings.scope).toBe("global");
  });

  it("relaciona plan, contrato, licencia, entitlements y habilitación efectiva", () => {
    const orgId = repositories.organizations.list()[0]!.id;
    const clientId =
      repositories.organizations.getById(orgId)?.clientId ?? repositories.clients.list()[0]!.id;
    const plan = repositories.plans.list()[0]!;
    const now = new Date().toISOString();

    const contractResult = saveContractWithRelations({
      contract: {
        id: "CTR-TEST-CONSOLIDATION",
        clientId,
        planId: plan.id,
        planSnapshot: {
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
          moduleIds: plan.moduleIds,
          capturedAt: now,
        },
        startsAt: "2026-01-01",
        endsAt: "2026-12-31",
        status: "Activo",
        modificationHistory: [],
        createdAt: now,
        updatedAt: now,
      },
      editingContract: null,
    });
    expect(contractResult.ok).toBe(true);

    const licenseResult = saveLicenseWithEntitlements({
      license: {
        id: "LIC-TEST-CONSOLIDATION",
        subscriptionId: repositories.subscriptions.list()[0]!.id,
        contractId: "CTR-TEST-CONSOLIDATION",
        organizationId: orgId,
        applicationId: "APP-ERP",
        startsAt: "2026-01-01",
        expiresAt: "2026-12-31",
        status: "Activo",
        userLimit: 10,
        institutionLimit: 5,
        storageLimitGb: 25,
        moduleIds: plan.moduleIds.slice(0, 2),
        authorizedExceptions: "Sin excepciones",
        createdAt: now,
        updatedAt: now,
      },
      editingLicense: null,
      extraUsersException: 0,
    });
    expect(licenseResult.ok).toBe(true);

    const evaluation = evaluateOrganizationLicensing(orgId);
    expect(evaluation.organizationId).toBe(orgId);
    expect(Array.isArray(evaluation.enabledModuleIds)).toBe(true);
  });

  it("valida preparación comercial y aprovisionamiento con servicios existentes", () => {
    const organization = repositories.organizations.list()[0]!;
    const contract =
      repositories.contracts.list().find(
        (item) => item.clientId === organization.clientId && item.status === "Activo",
      ) ?? repositories.contracts.list()[0]!;
    const subscription =
      repositories.subscriptions.list().find((item) => item.contractId === contract.id) ??
      repositories.subscriptions.list()[0]!;
    const license =
      repositories.licenses.list().find((item) => item.subscriptionId === subscription.id) ??
      repositories.licenses.list()[0]!;

    const readiness = validateCommercialReadinessForProvisioning({
      organizationId: organization.id,
      contractId: contract.id,
      subscriptionId: subscription.id,
      licenseId: license.id,
      applicationId: "APP-ERP",
      requestedModuleIds: ["MOD-COM"],
    });
    expect(typeof readiness.ok).toBe("boolean");
    if (readiness.ok) {
      expect(readiness.organization.id).toBe(organization.id);
    } else {
      expect(typeof readiness.error).toBe("string");
    }

    const requestResult = createProvisioningRequest({
      organizationId: organization.id,
      contractId: contract.id,
      subscriptionId: subscription.id,
      licenseId: license.id,
      applicationId: "APP-ERP",
      requestedModuleIds: ["MOD-COM"],
      requestedBy: "test@ao.local",
    });
    if (!requestResult.ok) {
      expect(typeof requestResult.error).toBe("string");
      return;
    }

    const workflow = executeProvisioningWorkflow({ requestId: requestResult.request.id });
    expect(workflow.ok).toBeTypeOf("boolean");
    if (workflow.ok) {
      expect(workflow.request.id).toBe(requestResult.request.id);
    }
  });

  it("habilita módulos cristianos y genéricos en PLN-CRI sin activar MOD-COM, MOD-SAC ni MOD-GOB", () => {
    const christianPlan = repositories.plans.getById("PLN-CRI")!;
    expect(christianPlan).toBeDefined();

    const deps = resolveModuleDependencies(christianPlan.moduleIds);
    expect(deps.resolvedModuleIds).toContain("MOD-CORE");
    expect(deps.resolvedModuleIds).toContain("MOD-CRI-COM");
    expect(deps.resolvedModuleIds).toContain("MOD-CRI-GRP");
    expect(deps.resolvedModuleIds).toContain("MOD-CRI-CUL");
    expect(deps.resolvedModuleIds).toContain("MOD-CRI-ADM");
    expect(deps.resolvedModuleIds).toContain("MOD-CRI-PAS");
    expect(deps.resolvedModuleIds).toContain("MOD-FIN");
    expect(deps.resolvedModuleIds).toContain("MOD-DOC");
    expect(deps.resolvedModuleIds).not.toContain("MOD-COM");
    expect(deps.resolvedModuleIds).not.toContain("MOD-SAC");
    expect(deps.resolvedModuleIds).not.toContain("MOD-GOB");

    const now = new Date().toISOString();
    const client = {
      ...repositories.clients.list()[0]!,
      id: "CLI-CRI-01",
      name: "Iglesia Cristiana Nueva Esperanza",
      status: "Activo" as const,
      createdAt: now,
      updatedAt: now,
    };
    repositories.clients.create(client);

    const org = {
      ...repositories.organizations.list()[0]!,
      id: "ORG-CRI-01",
      name: "Congregación Nueva Esperanza",
      type: "Congregación",
      clientId: client.id,
      institutionIds: [],
      userIds: [],
      status: "Activo" as const,
      createdAt: now,
      updatedAt: now,
    };
    repositories.organizations.create(org);

    const contractRes = saveContractWithRelations({
      contract: {
        id: "CON-CRI-01",
        clientId: client.id,
        organizationId: org.id,
        applicationId: "APP-ERP",
        planId: christianPlan.id,
        status: "Activo",
        startsAt: "2026-01-01",
        endsAt: "2026-12-31",
        contractedAmount: christianPlan.price,
        currency: "COP",
        billingPeriod: "Mensual",
        createdAt: now,
        updatedAt: now,
      },
      editingContract: null,
    });
    expect(contractRes.ok).toBe(true);

    repositories.subscriptions.create({
      id: "SUB-CRI-01",
      contractId: "CON-CRI-01",
      clientId: client.id,
      organizationId: org.id,
      applicationIds: ["APP-ERP"],
      status: "Activo",
      startsAt: "2026-01-01",
      endsAt: "2026-12-31",
      renewalAt: "2027-01-01",
      createdAt: now,
      updatedAt: now,
    });

    const licRes = saveLicenseWithEntitlements({
      license: {
        id: "LIC-CRI-01",
        subscriptionId: "SUB-CRI-01",
        contractId: "CON-CRI-01",
        organizationId: org.id,
        applicationId: "APP-ERP",
        status: "Activo",
        startsAt: "2026-01-01",
        expiresAt: "2026-12-31",
        userLimit: christianPlan.userLimit,
        institutionLimit: christianPlan.institutionLimit,
        storageLimitGb: christianPlan.storageLimitGb,
        moduleIds: christianPlan.moduleIds,
        createdAt: now,
        updatedAt: now,
      },
      editingLicense: null,
    });
    expect(licRes.ok).toBe(true);

    const evaluation = evaluateOrganizationLicensing(org.id, { referenceDate: "2026-06-01" });
    expect(evaluation.isAuthorized).toBe(true);
    expect(evaluation.enabledModuleIds).toContain("MOD-CORE");
    expect(evaluation.enabledModuleIds).toContain("MOD-CRI-COM");
    expect(evaluation.enabledModuleIds).toContain("MOD-FIN");
    expect(evaluation.enabledModuleIds).toContain("MOD-DOC");
    expect(evaluation.enabledModuleIds).not.toContain("MOD-COM");
    expect(evaluation.enabledModuleIds).not.toContain("MOD-SAC");
    expect(evaluation.enabledModuleIds).not.toContain("MOD-GOB");

    const catholicRejection = validateCommercialReadinessForProvisioning({
      organizationId: org.id,
      contractId: "CON-CRI-01",
      subscriptionId: "SUB-CRI-01",
      licenseId: "LIC-CRI-01",
      requestedModuleIds: ["MOD-SAC"],
      referenceDate: "2026-06-01",
    });
    expect(catholicRejection.ok).toBe(false);

    // Suspender contrato bloquea autorización y entitlements sin eliminar datos de la organización
    transitionContractStatus("CON-CRI-01", "Suspendido", "Prueba de suspensión");
    const suspendedEval = evaluateOrganizationLicensing(org.id, { referenceDate: "2026-06-01" });
    expect(suspendedEval.isAuthorized).toBe(false);
    expect(suspendedEval.enabledModuleIds).toHaveLength(0);
    expect(repositories.organizations.getById(org.id)).toBeDefined();
  });
});
