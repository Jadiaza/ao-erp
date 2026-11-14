import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/auth-context";
import { FloatingLauncherButton, ModuleLauncher } from "../components/module-launcher";
import { type AuthSession } from "../data/auth-service";
import {
  canAccessRoute,
  getAccessibleLauncherModules,
  hasModuleAccess,
  SAAS_NAV_MODULES,
} from "../data/navigation";
import { routeTree } from "@/routeTree.gen";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function buildSession(overrides?: Partial<AuthSession>): AuthSession {
  return {
    token: "test-token",
    user: {
      id: "USR-TEST",
      name: "Usuario Prueba",
      email: "prueba@aoerp.local",
      status: "Activo",
    },
    organization: {
      id: "ORG-001",
      name: "Diócesis de San Gabriel",
      plan: "Ecosistema",
      status: "Activo",
      isAuthorized: true,
      licenseStatus: "Activo",
    },
    institution: {
      id: "INS-014",
      name: "Parroquia Santa María del Camino",
    },
    roles: ["Administrador de plataforma"],
    permissions: ["dashboard:read", "settings:manage", "users:read", "system:access"],
    expiresAt: Date.now() + 3600_000,
    status: "authenticated",
    isDemoUser: false,
    requiresPasswordChange: false,
    ...overrides,
  };
}

describe("Lanzador de módulos y arquitectura responsive A&O SaaS", () => {
  it("vincula cada módulo del lanzador a una ruta real registrada en el router", () => {
    const router = createRouter({ routeTree });
    for (const module of SAAS_NAV_MODULES) {
      const matched = router.matchRoutes(module.to);
      const lastMatch = matched.at(-1);
      expect(lastMatch?.routeId).not.toBe(rootRouteId);
      expect(lastMatch?.routeId).toBe(module.to);
    }
  });

  it("permite acceso completo al rol Administrador de plataforma", () => {
    const adminSession = buildSession();
    const accessible = getAccessibleLauncherModules(adminSession);
    expect(accessible.length).toBe(
      SAAS_NAV_MODULES.filter((m) => m.showInLauncher !== false).length,
    );
  });

  it("filtra módulos según roles y permisos granulares", () => {
    const institutionalSession = buildSession({
      roles: ["Administrador institucional"],
      permissions: ["dashboard:read"],
    });
    const instModules = getAccessibleLauncherModules(institutionalSession).map((m) => m.id);
    expect(instModules).toContain("organizaciones");
    expect(instModules).toContain("instituciones");
    expect(instModules).toContain("configuracion");
    expect(instModules).not.toContain("infraestructura");
    expect(instModules).not.toContain("aprovisionamiento");

    const operatorSession = buildSession({
      roles: ["Usuario operativo"],
      permissions: ["dashboard:read", "support:read", "analytics:read"],
    });
    const opModules = getAccessibleLauncherModules(operatorSession).map((m) => m.id);
    expect(opModules).toEqual(["soporte", "analitica-reportes"]);

    const restrictedBilling = SAAS_NAV_MODULES.find((m) => m.id === "facturacion-cartera")!;
    expect(hasModuleAccess(operatorSession, restrictedBilling)).toBe(false);
    expect(getAccessibleLauncherModules(null)).toEqual([]);
  });

  it("renderiza el botón flotante de acceso rápido con atributos accesibles", () => {
    const html = renderToStaticMarkup(
      createElement(FloatingLauncherButton, { open: false, onToggle: () => {} }),
    );
    expect(html).toContain('aria-label="Abrir módulos"');
    expect(html).toContain('aria-controls="ao-module-launcher"');
    expect(html).toContain("ao-fab-launcher");
  });

  it("renderiza el lanzador con la cuadrícula de iconos cuando está abierto", () => {
    const adminSession = buildSession();
    const html = renderToStaticMarkup(
      createElement(AuthProvider, {
        initialSession: adminSession,
        children: createElement(ModuleLauncher, {
          open: true,
          onClose: () => {},
          pathname: "/",
        }),
      }),
    );
    expect(html).toContain("Aplicaciones y Módulos");
    expect(html).toContain("Accede a los módulos del ecosistema A&amp;O");
    expect(html).toContain("Organizaciones");
    expect(html).toContain("Diócesis, redes y gobiernos multi-tenant.");
    expect(html).toContain("Instituciones");
    expect(html).toContain("Facturación y cartera");
    expect(html).toContain("Configuración");
    expect(html).toContain("16 módulo(s) disponibles");
  });

  it("restringe la cuadrícula del lanzador en renderizado según permisos del usuario", () => {
    const operatorSession = buildSession({
      roles: ["Usuario operativo"],
      permissions: ["dashboard:read", "support:read", "analytics:read"],
    });
    const html = renderToStaticMarkup(
      createElement(AuthProvider, {
        initialSession: operatorSession,
        children: createElement(ModuleLauncher, {
          open: true,
          onClose: () => {},
          pathname: "/",
        }),
      }),
    );
    expect(html).toContain("Soporte y asistencia");
    expect(html).toContain("Analítica y reportes");
    expect(html).not.toContain("Facturación y cartera");
    expect(html).toContain("2 módulo(s) disponibles");
  });

  it("no renderiza el lanzador cuando está cerrado", () => {
    const html = renderToStaticMarkup(
      createElement(AuthProvider, {
        initialSession: buildSession(),
        children: createElement(ModuleLauncher, {
          open: false,
          onClose: () => {},
          pathname: "/",
        }),
      }),
    );
    expect(html).toBe("");
  });

  it("define una única arquitectura responsive para escritorio, tableta horizontal, tableta vertical, móvil y teléfonos estrechos con áreas seguras", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
    expect(css).toContain(".ao-fab-launcher");
    expect(css).toContain(".ao-launcher-dialog");
    expect(css).toContain("@media (min-width: 1025px)");
    expect(css).toContain("@media (max-width: 1024px)");
    expect(css).toContain("@media (max-width: 820px) and (min-width: 621px)");
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1023px)");
    expect(css).toContain("@container (max-width: 310px)");
    expect(css).toContain(".donut-center");
    expect(css).toContain("attr(data-label)");
    expect(css).toContain("@media (max-width: 1024px) and (max-height: 780px)");
    expect(css).toContain("@media (max-width: 1024px) and (max-height: 670px)");
    expect(css).toContain("@media (max-width: 380px)");
    expect(css).toContain("@media (min-width: 381px) and (max-width: 430px)");
    expect(css).toContain("@media (min-width: 431px) and (max-width: 700px)");
    expect(css).toContain("@media (min-width: 701px) and (max-width: 850px)");
    expect(css).toContain(".ao-bottom-nav");
    expect(css).toContain("100dvh");
    expect(css).toContain("100vw");
    expect(css).toContain("env(safe-area-inset-top");
    expect(css).toContain("env(safe-area-inset-bottom");
    expect(css).toContain("overflow-x: clip");
  });

  it("protege rutas directas según permisos del usuario autenticado", () => {
    const operatorSession = buildSession({
      roles: ["Usuario operativo"],
      permissions: ["dashboard:read", "support:read", "analytics:read"],
    });
    expect(canAccessRoute(operatorSession, "/")).toBe(true);
    expect(canAccessRoute(operatorSession, "/soporte")).toBe(true);
    expect(canAccessRoute(operatorSession, "/soporte/mesa-ayuda")).toBe(true);
    expect(canAccessRoute(operatorSession, "/analitica-reportes")).toBe(true);
    expect(canAccessRoute(operatorSession, "/infraestructura")).toBe(false);
    expect(canAccessRoute(operatorSession, "/facturacion-cartera")).toBe(false);
    expect(canAccessRoute(operatorSession, "/aprovisionamiento")).toBe(false);
    expect(canAccessRoute(null, "/infraestructura")).toBe(false);
    expect(canAccessRoute(null, "/login")).toBe(true);
  });

  it("configura manifiesto PWA standalone, iconos de instalación y service worker", () => {
    const manifestPath = resolve(process.cwd(), "public/manifest.webmanifest");
    const swPath = resolve(process.cwd(), "public/sw.js");
    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(swPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      short_name: string;
      name: string;
      display: string;
      start_url: string;
      scope: string;
      theme_color: string;
      background_color: string;
      icons: Array<{ src: string; sizes: string; purpose?: string }>;
    };
    expect(manifest.short_name).toBe("A&O SAAS");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.theme_color).toBe("#0c3670");
    expect(manifest.background_color).toBe("#082347");
    expect(manifest.icons.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(manifest.icons.some((icon) => icon.sizes === "512x512")).toBe(true);
    expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);

    expect(existsSync(resolve(process.cwd(), "public/icons/icon-192.png"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/icons/icon-512.png"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/icons/icon-maskable-512.png"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/icons/apple-touch-icon.png"))).toBe(true);

    const sw = readFileSync(swPath, "utf8");
    expect(sw).toContain('addEventListener("install"');
    expect(sw).toContain('addEventListener("activate"');
    expect(sw).toContain('addEventListener("fetch"');
  });
});
