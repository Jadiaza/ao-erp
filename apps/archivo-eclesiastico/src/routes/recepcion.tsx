import { createFileRoute } from "@tanstack/react-router";
import { Inbox, PackagePlus, Upload } from "lucide-react";

export const Route = createFileRoute("/recepcion")({ component: Reception });

function Reception() {
  return <div className="page"><header className="page-heading"><div><p className="eyebrow">INGRESO DOCUMENTAL</p><h1>Recepción documental</h1><p>Registra ingresos físicos o digitales y conserva la trazabilidad desde su recepción.</p></div><button className="primary-button"><PackagePlus size={16}/> Nuevo ingreso</button></header><section className="metrics-grid compact"><article className="metric-card"><span>Por clasificar</span><strong>18</strong><small>Ingresos pendientes</small></article><article className="metric-card"><span>En digitalización</span><strong>6</strong><small>Lotes abiertos</small></article><article className="metric-card"><span>Incorporados</span><strong>142</strong><small>Este mes · muestra</small></article></section><section className="panel placeholder-panel"><span className="large-icon"><Inbox size={30}/></span><h2>Bandeja de recepción</h2><p>Aquí se administrarán ingresos individuales y masivos, documentación física o digital, unidades recibidas, responsables y destino archivístico.</p><div className="feature-pills"><span><Upload size={14}/> Ingreso digital</span><span>Registro físico</span><span>Ingreso masivo</span><span>Control de recepción</span></div><small>Interfaz inicial · sin persistencia</small></section></div>;
}
