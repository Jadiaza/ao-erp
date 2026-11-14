import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { appModules } from "@/data/navigation";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("registers the Dashboard and 27 parish modules at their configured paths", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(appModules).toHaveLength(29);
    for (const module of appModules) {
      const matches = router.matchRoutes(module.path);
      expect(matches.at(-1)?.routeId, module.path).not.toBe(rootRouteId);
    }
  });

  it("keeps transition routes directly addressable without listing them in parish navigation", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const transitionPaths = ["/app/administracion-plataforma", "/app/gestion-diocesana"];

    for (const path of transitionPaths) {
      expect(
        appModules.some((module) => module.path === path),
        path,
      ).toBe(false);
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId, path).not.toBe(rootRouteId);
    }
  });
});
