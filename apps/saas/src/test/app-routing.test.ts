import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

describe("A&O SaaS routes", () => {
  it("registers its own dashboard at /", () => {
    const router = createRouter({ routeTree });
    expect(router.matchRoutes("/").at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("registers the master record routes for clientes, organizaciones e instituciones", () => {
    const router = createRouter({ routeTree });
    expect(router.matchRoutes("/clientes").at(-1)?.routeId).toBe("/clientes");
    expect(router.matchRoutes("/organizaciones").at(-1)?.routeId).toBe("/organizaciones");
    expect(router.matchRoutes("/instituciones").at(-1)?.routeId).toBe("/instituciones");
  });
});
