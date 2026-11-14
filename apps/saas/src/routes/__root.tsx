import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import styles from "../styles.css?url";
import { AppTopbar } from "../components/app-topbar";
import {
  FloatingLauncherButton,
  MobileBottomNav,
  ModuleLauncher,
} from "../components/module-launcher";
import { SaasBrandLogo } from "../components/saas-brand-logo";
import { SaasIcon, type SaasIconName } from "../components/saas-icons";
import {
  canAccessRoute,
  getAccessibleGroupLinks,
  hasModuleAccess,
  SAAS_NAV_MODULES,
} from "../data/navigation";
import { validateModuleRouteAccess } from "../server-functions/module-access";
import { useSettings } from "../data/saas-repository";
import { AuthProvider, useAuth } from "../auth/auth-context";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "A&O SAAS" },
      { name: "description", content: "Administración comercial y técnica del ecosistema A&O." },
      { name: "theme-color", content: "#0c3670" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "A&O SAAS" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: styles },
    ],
  }),
  shellComponent: RootShell,
  component: RootWithAuth,
  notFoundComponent: NotFound,
});

function RootWithAuth() {
  return (
    <AuthProvider>
      <RootComponent />
    </AuthProvider>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="institutional" data-density="comfortable">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function isRouteActive(pathname: string, target: string): boolean {
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, session } = useAuth();
  const settings = useSettings();
  const [systemDark, setSystemDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [serverRouteDenied, setServerRouteDenied] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    platform: true,
    commercial: true,
    control: true,
  });

  const isLoginPage = pathname === "/login";
  const clientRouteAllowed = !isAuthenticated || canAccessRoute(session, pathname);

  useEffect(() => {
    setLauncherOpen(false);
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isLoginPage || !session) {
      setServerRouteDenied(false);
      return;
    }
    let cancelled = false;
    setServerRouteDenied(false);
    validateModuleRouteAccess({
      data: {
        pathname,
        roles: session.roles ?? [],
        permissions: session.permissions ?? [],
      },
    })
      .then((res) => {
        if (!cancelled && !res.allowed) {
          setServerRouteDenied(true);
        }
      })
      .catch(() => {
        /* Mantener validación local si no hay runtime de servidor disponible. */
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoginPage, pathname, session]);

  useEffect(() => {
    // Protección de rutas privadas: Si no está autenticado y no está en /login, redirigir
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      navigate({ to: "/login" as never });
    }
    // Si ya está autenticado e intenta ir a /login, redirigir al dashboard
    if (!isLoading && isAuthenticated && isLoginPage) {
      navigate({ to: "/" as never });
    }
  }, [isLoading, isAuthenticated, isLoginPage, navigate]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ao-saas:navigation-groups");
      if (saved) setExpandedGroups(JSON.parse(saved) as typeof expandedGroups);
      const savedCollapsed = window.localStorage.getItem("ao-saas:sidebar-collapsed");
      if (savedCollapsed !== null) setSidebarCollapsed(savedCollapsed === "true");
    } catch {
      /* Mantener los grupos abiertos. */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("ao-saas:navigation-groups", JSON.stringify(expandedGroups));
    } catch {
      /* Ignorar si el navegador restringe localStorage. */
    }
  }, [expandedGroups]);

  useEffect(() => {
    try {
      window.localStorage.setItem("ao-saas:sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      /* Ignorar si el navegador restringe localStorage. */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const resolvedTheme =
    settings.theme === "system"
      ? systemDark
        ? "dark"
        : "light"
      : settings.theme || "institutional";
  const resolvedDensity = settings.density || "comfortable";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.setAttribute("data-density", resolvedDensity);
  }, [resolvedTheme, resolvedDensity]);

  const toggleGroup = (group: keyof typeof expandedGroups) =>
    setExpandedGroups((current) => ({ ...current, [group]: !current[group] }));

  const toggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) setSidebarOpen((open) => !open);
    else setSidebarCollapsed((current) => !current);
  };

  const platformLinks = getAccessibleGroupLinks(session, "platform").map(
    (item) => [item.to, item.label, item.icon] as [string, string, SaasIconName],
  );
  const commercialLinks = getAccessibleGroupLinks(session, "commercial").map(
    (item) => [item.to, item.label, item.icon] as [string, string, SaasIconName],
  );
  const controlLinks = getAccessibleGroupLinks(session, "control").map(
    (item) => [item.to, item.label, item.icon] as [string, string, SaasIconName],
  );
  const configModule = SAAS_NAV_MODULES.find((item) => item.id === "configuracion");
  const canAccessConfig = !session || !configModule || hasModuleAccess(session, configModule);

  // Si estamos en la página de login, renderizamos directamente sin barra lateral ni topbar
  if (isLoginPage) {
    return <Outlet />;
  }

  // Si aún está cargando la verificación de sesión en rutas privadas, mostramos un loader sutil
  if (isLoading && !isAuthenticated) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--canvas)" }}>
        <div style={{ textAlign: "center" }}>
          <SaasBrandLogo subtitle="Verificando sesión..." />
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme={resolvedTheme}
      data-density={resolvedDensity}
      className={`app-shell${sidebarOpen ? " sidebar-is-open" : ""}${sidebarCollapsed ? " sidebar-is-collapsed" : ""}`}
    >
      <aside className="sidebar">
        <div className="brand">
          <Link to="/" className="brand-home-link" aria-label="Ir al Dashboard de A&O SaaS">
            <SaasBrandLogo collapsed={sidebarCollapsed} subtitle="Consola del Ecosistema" />
          </Link>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            title={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            <SaasIcon name={sidebarCollapsed ? "chevron-right" : "chevron-left"} size={16} />
          </button>
        </div>
        <nav aria-label="Navegación principal" onClick={() => setSidebarOpen(false)}>
          <div className="nav-primary-list">
            <SidebarNavLink to="/" label="Dashboard" icon="dashboard" pathname={pathname} />
            {canAccessConfig && (
              <SidebarNavLink
                to="/configuracion"
                label="Configuración"
                icon="settings"
                pathname={pathname}
              />
            )}
          </div>
          {platformLinks.length > 0 && (
            <NavGroup
              title="TENANTS Y GOBIERNO"
              links={platformLinks}
              expanded={expandedGroups.platform || sidebarCollapsed}
              onToggle={() => toggleGroup("platform")}
              pathname={pathname}
            />
          )}
          {commercialLinks.length > 0 && (
            <NavGroup
              title="ECOSISTEMA COMERCIAL"
              links={commercialLinks}
              expanded={expandedGroups.commercial || sidebarCollapsed}
              onToggle={() => toggleGroup("commercial")}
              pathname={pathname}
            />
          )}
          {controlLinks.length > 0 && (
            <NavGroup
              title="CONTROL Y SOPORTE"
              links={controlLinks}
              expanded={expandedGroups.control || sidebarCollapsed}
              onToggle={() => toggleGroup("control")}
              pathname={pathname}
            />
          )}
        </nav>
        <div className="sidebar-operator">
          <span className="operator-avatar">AO</span>
          <span>
            <strong>A&amp;O TECHNOLOGIES</strong>
            <small>Administrador del ecosistema</small>
          </span>
          <em>v1.0.0-demo</em>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="workspace">
        <AppTopbar onMenuToggle={toggleMenu} pathname={pathname} />
        {clientRouteAllowed && !serverRouteDenied ? (
          <Outlet />
        ) : (
          <section className="page">
            <div className="panel ao-restricted-panel" role="alert">
              <span className="ao-restricted-icon" aria-hidden="true">
                <SaasIcon name="lock" size={24} />
              </span>
              <h1>Acceso restringido</h1>
              <p>
                Tu rol o permisos asignados no autorizan el acceso directo a esta ruta ({pathname}
                ).
              </p>
              <Link to="/" className="button-primary">
                <SaasIcon name="arrow-left" size={15} />
                Volver al Dashboard
              </Link>
            </div>
          </section>
        )}
      </main>
      {!launcherOpen && (
        <FloatingLauncherButton
          open={launcherOpen}
          onToggle={() => setLauncherOpen((current) => !current)}
        />
      )}
      <ModuleLauncher
        open={launcherOpen}
        onClose={() => setLauncherOpen(false)}
        pathname={pathname}
      />
      <MobileBottomNav
        pathname={pathname}
        launcherOpen={launcherOpen}
        onOpenLauncher={() => setLauncherOpen(true)}
        onCloseLauncher={() => setLauncherOpen(false)}
      />
    </div>
  );
}

function SidebarNavLink({
  to,
  label,
  icon,
  pathname,
}: {
  to: string;
  label: string;
  icon: SaasIconName;
  pathname: string;
}) {
  const active = isRouteActive(pathname, to);
  return (
    <Link
      to={to as never}
      aria-current={active ? "page" : undefined}
      className={active ? "nav-link active" : "nav-link"}
      title={label}
    >
      <span className="nav-link-icon">
        <SaasIcon name={icon} size={17} />
      </span>
      <span className="nav-link-label">{label}</span>
    </Link>
  );
}

function NavGroup({
  title,
  links,
  expanded,
  onToggle,
  pathname,
}: {
  title: string;
  links: Array<[string, string, SaasIconName]>;
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  return (
    <section className="nav-group">
      <button className="nav-caption" type="button" aria-expanded={expanded} onClick={onToggle}>
        <span>{title}</span>
        <span className="nav-caption-chevron">
          <SaasIcon name={expanded ? "chevron-up" : "chevron-down"} size={13} />
        </span>
      </button>
      {expanded && (
        <div className="nav-group-items">
          {links.map(([to, label, icon]) => (
            <SidebarNavLink
              key={to}
              to={to}
              label={label}
              icon={icon}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NotFound() {
  return (
    <section className="panel" style={{ padding: "28px" }}>
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al Dashboard</Link>
    </section>
  );
}
