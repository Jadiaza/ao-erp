import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A&amp;O SaaS</p>
          <h1>Dashboard</h1>
          <p>Administración comercial y técnica del ecosistema de productos A&amp;O.</p>
        </div>
        <span className="demo-badge">Base independiente</span>
      </header>
      <section className="notice" aria-label="Alcance de esta base">
        Esta aplicación tiene su propio punto de entrada, navegación, rutas, estilos y pruebas. Este
        scaffold no ejecuta operaciones comerciales ni servicios reales.
      </section>
      <section className="scope-grid" aria-label="Áreas de producto previstas">
        <article className="panel">
          <h2>Organizaciones</h2>
          <p>Alcance previsto para la administración del ecosistema. Módulo aún no implementado.</p>
        </article>
        <article className="panel">
          <h2>Planes y licencias</h2>
          <p>
            Alcance previsto para la gestión comercial. No se realizan altas ni cambios de licencia.
          </p>
        </article>
        <article className="panel">
          <h2>Servicios</h2>
          <p>
            Alcance previsto para la administración técnica. No hay conexiones ni operaciones
            activas.
          </p>
        </article>
      </section>
    </div>
  );
}
