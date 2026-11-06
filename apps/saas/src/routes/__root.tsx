import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import styles from "../styles.css?url";
import { AppTopbar } from "../components/app-topbar";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "A&O SaaS" },
      { name: "description", content: "Administración comercial y técnica del ecosistema A&O." },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
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

const platformLinks: Array<[string, string]> = [
  ["/organizaciones", "Organizaciones"],
  ["/instituciones", "Instituciones"],
  ["/usuarios", "Usuarios"],
  ["/roles-permisos", "Roles y permisos"],
  ["/planes-licencias", "Planes y licencias"],
];
const commercialLinks: Array<[string, string]> = [
  ["/clientes", "Clientes"],
  ["/productos-servicios", "Productos y servicios"],
  ["/suscripciones", "Suscripciones y licencias"],
  ["/facturacion-cartera", "Facturación y cartera"],
];
const controlLinks: Array<[string, string]> = [
  ["/identidad-seguridad", "Identidad y seguridad"],
  ["/aprovisionamiento", "Aprovisionamiento"],
  ["/soporte", "Soporte y asistencia"],
  ["/infraestructura", "Infraestructura"],
  ["/auditoria-cumplimiento", "Auditoría y cumplimiento"],
  ["/analitica-reportes", "Analítica y reportes"],
];

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    platform: true,
    commercial: true,
    control: true,
  });
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ao-saas:navigation-groups");
      if (saved) setExpandedGroups(JSON.parse(saved) as typeof expandedGroups);
    } catch {
      /* Mantener los grupos abiertos. */
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem("ao-saas:navigation-groups", JSON.stringify(expandedGroups));
  }, [expandedGroups]);
  const toggleGroup = (group: keyof typeof expandedGroups) =>
    setExpandedGroups((current) => ({ ...current, [group]: !current[group] }));
  const toggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 620) setSidebarOpen(true);
    else setSidebarCollapsed((current) => !current);
  };
  return (
    <div
      className={`app-shell${sidebarOpen ? " sidebar-is-open" : ""}${sidebarCollapsed ? " sidebar-is-collapsed" : ""}`}
    >
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A&amp;O</span>
          <span className="brand-copy">
            <strong>A&amp;O SaaS</strong>
            <small>Consola del Ecosistema</small>
          </span>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label="Contraer menú"
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            ‹
          </button>
        </div>
        <nav aria-label="Navegación principal" onClick={() => setSidebarOpen(false)}>
          <Link
            to="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={pathname === "/" ? "nav-link active" : "nav-link"}
            title="Dashboard"
          >
            Dashboard
          </Link>
          <Link
            to="/configuracion"
            aria-current={pathname === "/configuracion" ? "page" : undefined}
            className={pathname === "/configuracion" ? "nav-link active" : "nav-link"}
            title="Configuración"
          >
            Configuración
          </Link>
          <NavGroup
            title="OPERACIÓN DE PLATAFORMA"
            links={platformLinks}
            expanded={expandedGroups.platform}
            onToggle={() => toggleGroup("platform")}
            pathname={pathname}
          />
          <NavGroup
            title="ECOSISTEMA COMERCIAL"
            links={commercialLinks}
            expanded={expandedGroups.commercial}
            onToggle={() => toggleGroup("commercial")}
            pathname={pathname}
          />
          <NavGroup
            title="OPERACIÓN Y CONTROL"
            links={controlLinks}
            expanded={expandedGroups.control}
            onToggle={() => toggleGroup("control")}
            pathname={pathname}
          />
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
        <AppTopbar onMenuToggle={toggleMenu} />
        <Outlet />
      </main>
    </div>
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
  links: Array<[string, string]>;
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  return (
    <section className="nav-group">
      <button className="nav-caption" type="button" aria-expanded={expanded} onClick={onToggle}>
        <span>{title}</span>
        <b>{expanded ? "⌃" : "⌄"}</b>
      </button>
      {expanded && (
        <div>
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to as never}
              className={pathname === to ? "nav-link active" : "nav-link"}
              title={label}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function NotFound() {
  return (
    <section className="panel">
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al Dashboard</Link>
    </section>
  );
}
