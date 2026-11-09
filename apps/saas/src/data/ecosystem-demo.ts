export type EcosystemStatus =
  | "Activo"
  | "Pendiente"
  | "En revisión"
  | "Suspendido"
  | "Borrador"
  | "Vencido"
  | "Cancelado"
  | "Terminado"
  | "Inactivo"
  | "Anulada"
  | "Operativo"
  | "Fallido";

export type EcosystemRecord = {
  id: string;
  name: string;
  detail: string;
  context: string;
  status: EcosystemStatus;
  owner: string;
};

export type EcosystemSection = {
  path: string;
  title: string;
  description: string;
  group: string;
  createLabel: string;
  records: EcosystemRecord[];
};

const record = (
  id: string,
  name: string,
  detail: string,
  context: string,
  status: EcosystemStatus,
  owner: string,
): EcosystemRecord => ({ id, name, detail, context, status, owner });

export const ecosystemSections: EcosystemSection[] = [
  {
    path: "clientes",
    title: "Clientes comerciales",
    description: "Relaciones comerciales que pueden contratar servicios para varias instituciones.",
    group: "Gestión comercial",
    createLabel: "Nuevo cliente",
    records: [
      record(
        "CLI-001",
        "Diócesis de San Gabriel",
        "Cuenta institucional principal",
        "Bogotá · Colombia",
        "Activo",
        "José Alberto Díaz",
      ),
      record(
        "CLI-002",
        "Fundación Camino y Vida",
        "Cliente institucional",
        "Cundinamarca · Colombia",
        "En revisión",
        "Laura Méndez",
      ),
      record(
        "CLI-003",
        "Red parroquial del Norte",
        "Cliente multiinstitución",
        "Boyacá · Colombia",
        "Pendiente",
        "María Torres",
      ),
    ],
  },
  {
    path: "productos-servicios",
    title: "Productos y servicios",
    description: "Catálogo central de aplicaciones, módulos, ediciones, versiones y tarifas.",
    group: "Productos y servicios",
    createLabel: "Nuevo producto",
    records: [
      record(
        "APP-ERP",
        "A&O ERP",
        "Operación parroquial y pastoral",
        "Aplicación",
        "Activo",
        "Producto A&O",
      ),
      record(
        "APP-DIO",
        "A&O Diocesano",
        "Gobierno y acompañamiento diocesano",
        "Aplicación",
        "Activo",
        "Producto A&O",
      ),
      record(
        "MOD-DOC",
        "Gestión documental",
        "Archivo y trazabilidad institucional",
        "Módulo ERP",
        "Activo",
        "Producto A&O",
      ),
    ],
  },
  {
    path: "suscripciones",
    title: "Suscripciones y licencias",
    description: "Derechos de uso derivados de planes y contratos, con límites y renovaciones.",
    group: "Suscripciones y licencias",
    createLabel: "Nueva suscripción",
    records: [
      record(
        "SUB-2026-014",
        "Plan Ecosistema · San Gabriel",
        "12 meses · 46 usuarios",
        "Diócesis de San Gabriel",
        "Activo",
        "Administración A&O",
      ),
      record(
        "LIC-2026-021",
        "Licencia Parroquial",
        "10 usuarios · 12 módulos",
        "Santa María del Camino",
        "Activo",
        "Administración A&O",
      ),
      record(
        "SUB-2026-031",
        "Renovación Institucional",
        "Pendiente de aprobación",
        "Fundación Camino y Vida",
        "Pendiente",
        "Comercial A&O",
      ),
    ],
  },
  {
    path: "facturacion-cartera",
    title: "Facturación y cartera",
    description: "Vista demostrativa de facturas, pagos, saldos, vencimientos y conciliación.",
    group: "Facturación y cartera",
    createLabel: "Registrar factura demo",
    records: [
      record(
        "FAC-2026-084",
        "Factura de noviembre",
        "COP 4.800.000 · vencimiento 30 nov.",
        "Diócesis de San Gabriel",
        "Pendiente",
        "Facturación A&O",
      ),
      record(
        "PAG-2026-071",
        "Pago recibido",
        "COP 1.250.000 · conciliación demo",
        "Santa María del Camino",
        "Activo",
        "Tesorería A&O",
      ),
      record(
        "CAR-2026-018",
        "Saldo en seguimiento",
        "COP 680.000 · cartera corriente",
        "Fundación Camino y Vida",
        "En revisión",
        "Cartera A&O",
      ),
    ],
  },
  {
    path: "identidad-seguridad",
    title: "Identidad y seguridad",
    description: "Usuarios globales, membresías, sesiones, dispositivos y políticas de seguridad.",
    group: "Identidad y seguridad",
    createLabel: "Agregar membresía",
    records: [
      record(
        "MEM-001",
        "José Alberto Díaz",
        "Administrador de plataforma",
        "A&O Technologies",
        "Activo",
        "Seguridad",
      ),
      record(
        "MEM-014",
        "María Fernanda Torres",
        "Administradora institucional",
        "Santa María del Camino",
        "Activo",
        "Seguridad",
      ),
      record(
        "SES-021",
        "Sesión pendiente de revisión",
        "Chrome · Bogotá · 06 nov.",
        "Fundación Camino y Vida",
        "En revisión",
        "Seguridad",
      ),
    ],
  },
  {
    path: "aprovisionamiento",
    title: "Aprovisionamiento",
    description:
      "Alta de instituciones, configuración inicial, asignación de aplicaciones e invitaciones.",
    group: "Aprovisionamiento",
    createLabel: "Iniciar aprovisionamiento",
    records: [
      record(
        "PROV-014",
        "Alta parroquia Santa María",
        "Paso 3 de 5 · módulos seleccionados",
        "Nueva institución",
        "En revisión",
        "Onboarding A&O",
      ),
      record(
        "PROV-021",
        "Configuración San José Obrero",
        "Invitación del administrador enviada",
        "Parroquia cliente",
        "Pendiente",
        "Onboarding A&O",
      ),
    ],
  },
  {
    path: "soporte",
    title: "Centro de soporte y asistencia técnica",
    description: "Mesa transversal para tickets, diagnóstico, conocimiento, sesiones y SLA.",
    group: "Soporte y asistencia",
    createLabel: "Nuevo ticket",
    records: [
      record(
        "TCK-2026-118",
        "No carga el repositorio documental",
        "Prioridad alta · diagnóstico",
        "A&O ERP · Santa María",
        "En revisión",
        "Ana López",
      ),
      record(
        "TCK-2026-121",
        "Consulta sobre módulos contratados",
        "Prioridad normal · cliente",
        "A&O SaaS · San Gabriel",
        "Pendiente",
        "Mesa de ayuda",
      ),
      record(
        "TCK-2026-114",
        "Error de calendario",
        "Resuelto · sin acceso a datos sensibles",
        "A&O ERP · San José",
        "Activo",
        "Carlos Beltrán",
      ),
    ],
  },
  {
    path: "infraestructura",
    title: "Infraestructura y monitoreo",
    description:
      "Estado ilustrativo de aplicaciones, servicios, almacenamiento, backups y despliegues.",
    group: "Infraestructura",
    createLabel: "Registrar alerta demo",
    records: [
      record(
        "SVC-ERP",
        "A&O ERP",
        "Operativo · última verificación 09:42",
        "Aplicación",
        "Activo",
        "Monitoreo",
      ),
      record(
        "SVC-DIO",
        "A&O Diocesano",
        "Operativo · última verificación 09:40",
        "Aplicación",
        "Activo",
        "Monitoreo",
      ),
      record(
        "ALT-2026-07",
        "Almacenamiento documental",
        "Capacidad de muestra 68%",
        "Infraestructura",
        "En revisión",
        "Monitoreo",
      ),
    ],
  },
  {
    path: "auditoria-cumplimiento",
    title: "Auditoría y cumplimiento",
    description: "Actividad administrativa, accesos, cambios de permisos, licencias y soporte.",
    group: "Auditoría y cumplimiento",
    createLabel: "Registrar evento demo",
    records: [
      record(
        "AUD-2026-884",
        "Cambio de módulo contratado",
        "Módulo documental habilitado",
        "Fundación Camino y Vida",
        "Activo",
        "José Alberto Díaz",
      ),
      record(
        "AUD-2026-881",
        "Acceso consultado",
        "Sesión técnica sin datos privados",
        "A&O ERP",
        "Activo",
        "Ana López",
      ),
      record(
        "AUD-2026-876",
        "Permiso pendiente de revisión",
        "Rol institucional modificado",
        "Santa María del Camino",
        "En revisión",
        "Seguridad",
      ),
    ],
  },
  {
    path: "analitica-reportes",
    title: "Analítica y reportes",
    description: "Indicadores demostrativos de crecimiento, suscripciones, consumo y soporte.",
    group: "Analítica y reportes",
    createLabel: "Crear reporte demo",
    records: [
      record(
        "REP-001",
        "Crecimiento de instituciones",
        "+12% · últimos 6 meses",
        "Comercial",
        "Activo",
        "Analítica",
      ),
      record(
        "REP-002",
        "Uso de módulos por plan",
        "Comparativo de catálogo",
        "Producto",
        "Activo",
        "Analítica",
      ),
      record(
        "REP-003",
        "Cumplimiento de SLA",
        "92% · periodo actual",
        "Soporte",
        "En revisión",
        "Analítica",
      ),
    ],
  },
];

export function getEcosystemSection(path: string) {
  return ecosystemSections.find((section) => section.path === path);
}
