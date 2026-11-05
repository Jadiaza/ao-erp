import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import styles from "../styles.css?url";

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

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A&amp;O</span>
          <span>SaaS</span>
        </div>
        <nav aria-label="Navegación principal">
          <Link to="/" aria-current={pathname === "/" ? "page" : undefined} className={pathname === "/" ? "nav-link active" : "nav-link"}>
            Dashboard
          </Link>
          <Link to="/configuracion" aria-current={pathname === "/configuracion" ? "page" : undefined} className={pathname === "/configuracion" ? "nav-link active" : "nav-link"}>
            Configuración
          </Link>
        </nav>
        <p className="sidebar-note">Administración del ecosistema</p>
      </aside>
      <main className="workspace">
        <Outlet />
      </main>
    </div>
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
