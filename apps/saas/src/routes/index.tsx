import { createFileRoute, Link } from "@tanstack/react-router";
import { organizations, institutions, users, plans } from "../data/demo";

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
      <section className="summary-grid" aria-label="Indicadores de plataforma">
        <article className="panel summary-card">
          <small>Organizaciones</small>
          <strong>{organizations.length}</strong>
          <span>Clientes de muestra</span>
        </article>
        <article className="panel summary-card">
          <small>Instituciones</small>
          <strong>{institutions.length}</strong>
          <span>Sedes y entidades vinculadas</span>
        </article>
        <article className="panel summary-card">
          <small>Usuarios</small>
          <strong>{users.length}</strong>
          <span>Directorio global ficticio</span>
        </article>
        <article className="panel summary-card">
          <small>Planes activos</small>
          <strong>{plans.length}</strong>
          <span>Oferta demostrativa</span>
        </article>
      </section>
      <section className="scope-grid" aria-label="Accesos de la consola">
        <article className="panel">
          <h2>Operación de plataforma</h2>
          <p>
            Administra organizaciones, instituciones, usuarios, roles, permisos y licencias del
            ecosistema.
          </p>
          <Link className="card-link" to="/organizaciones">
            Abrir organizaciones →
          </Link>
        </article>
        <article className="panel">
          <h2>Catálogo de módulos</h2>
          <p>
            Define la disponibilidad de funcionalidades por plan u organización desde la
            configuración central.
          </p>
          <Link className="card-link" to="/configuracion">
            Abrir configuración →
          </Link>
        </article>
        <article className="panel">
          <h2>Estado de demostración</h2>
          <p>
            Todos los registros son locales y ficticios. No hay autenticación, facturación ni
            persistencia de servidor.
          </p>
          <span className="status status-activo">Operativo · demo</span>
        </article>
      </section>
    </div>
  );
}
