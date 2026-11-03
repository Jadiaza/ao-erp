import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

describe("A&O SaaS routes", () => {
  it("registers its own dashboard at /", () => {
    const router = createRouter({ routeTree });
    expect(router.matchRoutes("/").at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
