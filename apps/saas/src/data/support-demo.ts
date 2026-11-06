export type SupportArea =
  | "mesa-ayuda"
  | "asistencia-contextual"
  | "diagnostico-postgresql"
  | "diagnostico-documental"
  | "logs-trazabilidad"
  | "sesiones-asistencia"
  | "base-conocimientos"
  | "asistente-inteligente"
  | "indicadores-soporte";

export type SupportRecord = {
  id: string;
  title: string;
  detail: string;
  context: string;
  status: "Abierto" | "En diagnóstico" | "En espera" | "Resuelto" | "Programado" | "Demostrativo";
  owner: string;
};

export const supportAreaConfig: Record<
  SupportArea,
  { title: string; description: string; createLabel: string }
> = {
  "mesa-ayuda": {
    title: "Mesa de ayuda",
    description: "Bandeja de tickets, prioridades, responsables, conversaciones y SLA.",
    createLabel: "Nuevo ticket demo",
  },
  "asistencia-contextual": {
    title: "Asistencia contextual",
    description: "Relaciona aplicación, institución, usuario, módulo y operación del caso.",
    createLabel: "Nueva asistencia demo",
  },
  "diagnostico-postgresql": {
    title: "Diagnóstico PostgreSQL",
    description:
      "Consulta errores SQLSTATE, permisos, RLS y consultas lentas sin exponer credenciales.",
    createLabel: "Registrar diagnóstico demo",
  },
  "diagnostico-documental": {
    title: "Diagnóstico documental",
    description: "Revisa archivos, versiones, OCR, almacenamiento y errores de procesamiento.",
    createLabel: "Registrar revisión demo",
  },
  "logs-trazabilidad": {
    title: "Logs y trazabilidad",
    description: "Filtra eventos por aplicación, institución, severidad y fecha con correlación.",
    createLabel: "Registrar evento demo",
  },
  "sesiones-asistencia": {
    title: "Sesiones de asistencia autorizada",
    description: "Controla solicitudes, alcance, técnico, expiración, revocación y auditoría.",
    createLabel: "Solicitar sesión demo",
  },
  "base-conocimientos": {
    title: "Base de conocimientos",
    description: "Problemas frecuentes, procedimientos, manuales e incidentes conocidos.",
    createLabel: "Nueva solución demo",
  },
  "asistente-inteligente": {
    title: "Asistente inteligente",
    description:
      "Interfaz preparada para clasificar tickets y recomendar soluciones sin ejecutar cambios.",
    createLabel: "Nueva consulta demo",
  },
  "indicadores-soporte": {
    title: "Indicadores de soporte",
    description: "Tickets, tiempos de respuesta, resolución, SLA y distribución por aplicación.",
    createLabel: "Nuevo reporte demo",
  },
};

const row = (
  id: string,
  title: string,
  detail: string,
  context: string,
  status: SupportRecord["status"],
  owner: string,
): SupportRecord => ({ id, title, detail, context, status, owner });

export const supportRecords: Record<SupportArea, SupportRecord[]> = {
  "mesa-ayuda": [
    row(
      "TCK-2026-118",
      "No carga el repositorio documental",
      "Prioridad alta · SLA 4 h",
      "A&O ERP · Santa María",
      "En diagnóstico",
      "Ana López",
    ),
    row(
      "TCK-2026-121",
      "Consulta sobre módulos contratados",
      "Prioridad normal · SLA 24 h",
      "A&O SaaS · San Gabriel",
      "Abierto",
      "Mesa de ayuda",
    ),
    row(
      "TCK-2026-114",
      "Error de calendario",
      "Resuelto · sin datos privados",
      "A&O ERP · San José",
      "Resuelto",
      "Carlos Beltrán",
    ),
  ],
  "asistencia-contextual": [
    row(
      "CTX-118",
      "Ruta documental identificada",
      "A&O ERP › Gestión documental › Repositorio",
      "TCK-2026-118",
      "En diagnóstico",
      "Ana López",
    ),
    row(
      "CTX-121",
      "Módulo de licencias",
      "A&O SaaS › Suscripciones y licencias",
      "TCK-2026-121",
      "Abierto",
      "Mesa de ayuda",
    ),
  ],
  "diagnostico-postgresql": [
    row(
      "SQL-2026-044",
      "SQLSTATE demo 23503",
      "Restricción de clave foránea · sin conexión real",
      "TCK-2026-118",
      "En diagnóstico",
      "Plataforma",
    ),
    row(
      "RLS-2026-009",
      "Política RLS pendiente de revisión",
      "No se muestran consultas ni credenciales",
      "A&O ERP",
      "En espera",
      "Seguridad",
    ),
  ],
  "diagnostico-documental": [
    row(
      "DOC-ERR-018",
      "Cola OCR sin motor conectado",
      "Documento original · derivado no generado",
      "A&O ERP · Gestión documental",
      "En espera",
      "Archivo técnico",
    ),
    row(
      "DOC-ERR-021",
      "Descarga restringida",
      "Metadatos visibles · contenido protegido",
      "TCK-2026-118",
      "Resuelto",
      "Seguridad documental",
    ),
  ],
  "logs-trazabilidad": [
    row(
      "LOG-2026-884",
      "Cambio de módulo contratado",
      "Correlation ID corr-demo-884 · info",
      "A&O SaaS",
      "Demostrativo",
      "Auditoría",
    ),
    row(
      "LOG-2026-881",
      "Acceso consultado",
      "Correlation ID corr-demo-881 · warning",
      "A&O ERP",
      "Demostrativo",
      "Seguridad",
    ),
  ],
  "sesiones-asistencia": [
    row(
      "SES-2026-014",
      "Diagnóstico técnico limitado",
      "Expira en 45 min · sin información privada",
      "TCK-2026-118",
      "En diagnóstico",
      "Ana López",
    ),
    row(
      "SES-2026-009",
      "Asistencia contextual revocada",
      "Acceso limitado · auditoría completa",
      "TCK-2026-114",
      "Resuelto",
      "Carlos Beltrán",
    ),
  ],
  "base-conocimientos": [
    row(
      "KB-001",
      "Revisar estado de conexión documental",
      "Procedimiento de verificación sin Paperless",
      "Gestión documental",
      "Resuelto",
      "Documentación A&O",
    ),
    row(
      "KB-014",
      "Interpretar error de permisos",
      "Guía para diferenciar Auth y RLS",
      "Seguridad",
      "Demostrativo",
      "Plataforma",
    ),
  ],
  "asistente-inteligente": [
    row(
      "AI-2026-003",
      "Clasificar tickets documentales",
      "Recomendación de categoría · sin ejecución",
      "TCK-2026-118",
      "Demostrativo",
      "Asistente IA",
    ),
    row(
      "AI-2026-002",
      "Encontrar incidencias similares",
      "Sugerencia basada en datos demo",
      "Base de conocimientos",
      "Programado",
      "Asistente IA",
    ),
  ],
  "indicadores-soporte": [
    row(
      "KPI-2026-11",
      "Cumplimiento de SLA",
      "92% · datos demo del periodo",
      "Todas las aplicaciones",
      "Demostrativo",
      "Analítica",
    ),
    row(
      "KPI-2026-10",
      "Tiempo medio de resolución",
      "8 h 24 min · datos demo",
      "Mesa de ayuda",
      "Demostrativo",
      "Analítica",
    ),
  ],
};
