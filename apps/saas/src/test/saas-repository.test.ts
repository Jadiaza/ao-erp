import { beforeEach, describe, expect, it } from "vitest";
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
});
