import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A&amp;O Diocesano</p>
          <h1>Dashboard</h1>
          <p>Base independiente para gestión y acompañamiento diocesano.</p>
        </div>
        <span className="demo-badge">Base independiente</span>
      </header>
      <section className="notice" aria-label="Límites de la aplicación">
        Esta aplicación no consulta A&amp;O ERP ni accede a información de parroquias. Cualquier
        vínculo o intercambio requerirá autorización y alcance explícitos.
      </section>
      <section className="panel">
        <h2>Alcance funcional pendiente</h2>
        <p>
          Las rutas y funciones diocesanas se definirán en una fase posterior. La pantalla «Gestión
          diocesana y supervisión» permanece en A&amp;O ERP mientras se revisa la propuesta de
          distribución; no se copia ni se divide en este scaffold.
        </p>
      </section>
    </div>
  );
}
