import { createRouter, rootRouteId } from "@tanstack/react-router";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AoErpBrandLogo } from "../components/ao-erp-brand-logo";
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

  it("registers the official /login route", () => {
    const router = createRouter({ routeTree });
    expect(router.matchRoutes("/login").at(-1)?.routeId).toBe("/login");
  });

  it("renders AoErpBrandLogo in header (light/outlined/divider) and card (dark/centered/no-badge) variants", () => {
    const headerHtml = renderToStaticMarkup(
      createElement(AoErpBrandLogo, {
        variant: "light",
        brandSuffix: "SAAS",
        badgeLabel: "Consola",
        appBadgeVariant: "outlined",
        showDivider: true,
        showSubtitle: true,
        subtitleText: "CONSOLA DEL ECOSISTEMA",
      }),
    );
    expect(headerHtml).toContain("A&amp;O");
    expect(headerHtml).toContain("SAAS");
    expect(headerHtml).toContain("CONSOLA DEL ECOSISTEMA");
    expect(headerHtml).toContain("Consola");

    const cardHtml = renderToStaticMarkup(
      createElement(AoErpBrandLogo, {
        variant: "dark",
        brandSuffix: "SAAS",
        align: "center",
        showAppBadge: false,
        showSubtitle: true,
        subtitleText: "CONSOLA DEL ECOSISTEMA",
      }),
    );
    expect(cardHtml).toContain("A&amp;O");
    expect(cardHtml).toContain("SAAS");
    expect(cardHtml).toContain("CONSOLA DEL ECOSISTEMA");
    expect(cardHtml).not.toContain("Consola</span>");
  });
});
