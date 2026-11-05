import { createFileRoute } from "@tanstack/react-router";
import { Activity, Archive, ArrowDownToLine, ArrowUpRight, BookOpen, FileCheck2, Files, ScanLine, ShieldCheck, Upload } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

const metrics = [
  { label: "Documentos registrados", value: "12.486", detail: "En el archivo institucional", icon: Files },
  { label: "Expedientes activos", value: "384", detail: "Con organización archivística", icon: Archive },
  { label: "Pendientes de revisión", value: "27", detail: "Requieren control de calidad", icon: FileCheck2 },
  { label: "Lotes en procesamiento", value: "6", detail: "Digitalización y OCR", icon: ScanLine }
];

const recentItems = [
  { title: "Libro de bautismos", subtitle: "Parroquia · Fondo sacramental", code: "FSA-001-1928", status: "Digitalizado", tone: "success", date: "Hoy · 10:42" },
  { title: "Acta de reunión del consejo", subtitle: "Administración · Serie actas", code: "ADM-004-2024", status: "En revisión", tone: "warning", date: "Hoy · 09:18" },
  { title: "Libro de matrimonios", subtitle: "Parroquia · Fondo sacramental", code: "FSA-003-1956", status: "Indexado", tone: "info", date: "Ayer · 16:30" },
  { title: "Correspondencia recibida", subtitle: "Gobierno · Serie correspondencia", code: "GOB-021-2025", status: "Pendiente", tone: "neutral", date: "Ayer · 14:05" }
];

function Dashboard() {
  return (
    <div className="page">
      <header className="page-heading">
        <div><p className="eyebrow">PANEL INSTITUCIONAL</p><h1>Dashboard</h1><p>Panorama general de la gestión y conservación del archivo.</p></div>
        <button className="primary-button"><Upload size={16} /> Nuevo ingreso</button>
      </header>

      <section className="welcome-panel">
        <div><span className="welcome-kicker">ARCHIVO INSTITUCIONAL</span><h2>La memoria de nuestra institución, organizada y protegida.</h2><p>Administra documentos, expedientes, libros y procesos archivísticos desde un solo espacio.</p></div>
        <div className="welcome-art" aria-hidden="true"><Archive size={112} strokeWidth={1} /><BookOpen className="art-book" size={54} strokeWidth={1.1} /></div>
      </section>

      <section className="metrics-grid" aria-label="Indicadores del archivo">
        {metrics.map(({ label, value, detail, icon: Icon }) => <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={19} /></span></div><strong>{value}</strong><small>{detail}</small></article>)}
      </section>

      <div className="content-grid">
        <section className="panel recent-panel">
          <div className="section-heading"><div><h2>Actividad documental reciente</h2><p>Últimos movimientos registrados en el archivo</p></div><button className="text-button">Ver todos <ArrowUpRight size={15} /></button></div>
          <div className="table-scroll"><table><thead><tr><th>DOCUMENTO</th><th>IDENTIFICADOR</th><th>ESTADO</th><th>ACTUALIZACIÓN</th></tr></thead><tbody>{recentItems.map((item) => <tr key={item.code}><td><strong>{item.title}</strong><small>{item.subtitle}</small></td><td className="code-cell">{item.code}</td><td><span className={`status status-${item.tone}`}>{item.status}</span></td><td className="date-cell">{item.date}</td></tr>)}</tbody></table></div>
        </section>
        <aside className="right-column">
          <section className="panel quick-panel"><div className="section-heading"><div><h2>Accesos rápidos</h2><p>Tareas frecuentes</p></div></div><div className="quick-actions"><button><span><Upload size={18} /></span><strong>Registrar ingreso</strong><small>Incorporar nuevos documentos</small></button><button><span><ScanLine size={18} /></span><strong>Procesar digitalización</strong><small>Gestionar lotes y capturas</small></button><button><span><ArrowDownToLine size={18} /></span><strong>Consultar documentos</strong><small>Buscar en el archivo institucional</small></button></div></section>
          <section className="preservation-card"><div className="preservation-icon"><ShieldCheck size={20} /></div><div><strong>Integridad documental</strong><p>La preservación requiere originales protegidos, control de versiones y trazabilidad de las intervenciones.</p></div><span className="preservation-indicator"><Activity size={16} /></span></section>
        </aside>
      </div>
      <p className="demo-disclaimer">Datos e indicadores ilustrativos. Esta primera incorporación es una base de interfaz; todavía no está conectada a servicios ni almacena documentos reales.</p>
    </div>
  );
}
