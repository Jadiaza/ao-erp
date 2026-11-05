import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import styles from "../styles.css?url";

const navigation = [
  { to: "/", label: "Dashboard", icon: "⌂" },
  { to: "/recepcion", label: "Recepción documental", icon: "⇩" },
  { to: "/digitalizacion", label: "Centro de digitalización", icon: "▧" },
  { to: "/documentos", label: "Documentos", icon: "▤" },
  { to: "/clasificacion", label: "Clasificación archivística", icon: "▦" },
  { to: "/expedientes", label: "Expedientes y libros", icon: "▣" },
  { to: "/instrumentos", label: "Instrumentos archivísticos", icon: "☷" },
  { to: "/transferencias", label: "Transferencias", icon: "⇄" },
  { to: "/conservacion", label: "Conservación", icon: "◇" }
] as const;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "A&O Archivo Eclesiástico" },
      {
        name: "description",
        content: "Gestión archivística y preservación documental para instituciones eclesiásticas."
      }
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="A&O Archivo Eclesiástico, inicio">
          <span className="brand-mark">A&amp;O</span>
          <span className="brand-copy"><strong>Archivo</strong><small>ECLESIÁSTICO</small></span>
        </Link>
        <div className="institution-switch">
          <span className="institution-avatar">D</span>
          <span><strong>Institución de ejemplo</strong><small>Espacio institucional</small></span>
          <span className="switch-chevron">⌄</span>
        </div>
        <nav aria-label="Navegación principal" className="main-nav">
          <p className="nav-caption">GESTIÓN ARCHIVÍSTICA</p>
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? "page" : undefined}
              className={`nav-link ${pathname === item.to ? "active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="profile-avatar">AD</div>
          <span><strong>Administrador</strong><small>Perfil de demostración</small></span>
          <span className="profile-menu">•••</span>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div className="breadcrumbs"><span>Inicio</span><span>/</span><strong>{navigation.find((item) => item.to === pathname)?.label ?? "Archivo Eclesiástico"}</strong></div>
          <div className="topbar-actions"><span className="environment-label">ENTORNO DE DEMOSTRACIÓN</span><button className="icon-button" aria-label="Notificaciones">♧</button><button className="profile-chip" aria-label="Perfil administrador">AD</button></div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}

function NotFound() {
  return <section className="panel"><h1>Página no encontrada</h1><p>La sección solicitada no está disponible.</p><Link to="/">Volver al Dashboard</Link></section>;
}
