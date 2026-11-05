import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileImage, ScanLine } from "lucide-react";

export const Route = createFileRoute("/digitalizacion")({ component: Digitization });

function Digitization() {
  return <div className="page"><header className="page-heading"><div><p className="eyebrow">CAPTURA Y PROCESAMIENTO</p><h1>Centro de digitalización</h1><p>Controla lotes, capturas, procesamiento OCR y validación de calidad.</p></div><button className="primary-button"><ScanLine size={16}/> Crear lote</button></header><section className="metrics-grid compact"><article className="metric-card"><span>Lotes abiertos</span><strong>6</strong><small>En proceso</small></article><article className="metric-card"><span>Páginas capturadas</span><strong>2.840</strong><small>Dato ilustrativo</small></article><article className="metric-card"><span>Por validar</span><strong>94</strong><small>Control de calidad</small></article></section><section className="panel placeholder-panel"><span className="large-icon"><FileImage size={30}/></span><h2>Flujo de digitalización</h2><p>La gestión incluirá lotes, perfiles de captura, páginas, recto y verso, imágenes maestras, derivados PDF/A, OCR y revisión humana.</p><div className="workflow-steps"><span>1. Captura</span><span>2. Procesamiento OCR</span><span>3. Control de calidad</span><span>4. Indexación</span><span>5. Incorporación</span></div><small><CheckCircle2 size={13}/> Originales y derivados deberán conservarse vinculados, con integridad verificable.</small></section></div>;
}
