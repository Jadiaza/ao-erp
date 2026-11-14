import { parishDemo, parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

export type InstitutionalSite = {
  id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  organizationId?: string;
  campusId?: string;
};
export type InstitutionalResponsible = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "inactive";
  organizationId?: string;
  campusId?: string;
};
export type InstitutionalDepartment = {
  id: string;
  name: string;
  siteId: string;
  responsibleId: string;
  status: "active" | "inactive";
  organizationId?: string;
};

export type MeetingMinute = {
  id: string;
  code: string;
  date: string;
  meetingType: string;
  title: string;
  attendees: string[];
  responsible: string;
  agreements: string[];
  commitments: string[];
  status: "Borrador" | "Aprobada" | "Archivada";
  organizationId: string;
  campusId: string;
};

export type CorrespondenceItem = {
  id: string;
  radicado: string;
  direction: "Recibida" | "Enviada";
  date: string;
  sender: string;
  recipient: string;
  subject: string;
  responsible: string;
  status: "Registrada" | "En seguimiento" | "Respondida" | "Archivada";
  notes?: string | undefined;
  organizationId: string;
  campusId: string;
};

export type AdminTask = {
  id: string;
  title: string;
  responsible: string;
  dueDate: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Pendiente" | "En progreso" | "Completada";
  relatedRef?: string | undefined;
  organizationId: string;
  campusId: string;
};

export const institutionalSites: InstitutionalSite[] = [
  {
    id: "SED-DEMO-01",
    name: parishDemoSites.temple.name,
    address: parishDemoSites.temple.location,
    status: "active",
  },
  {
    id: "SED-DEMO-02",
    name: parishDemoSites.pastoralCenter.name,
    address: parishDemoSites.pastoralCenter.location,
    status: "active",
  },
];

export const institutionalResponsibles: InstitutionalResponsible[] = [
  {
    id: "RES-DEMO-01",
    name: parishDemoPeople.secretary.name,
    role: parishDemoPeople.secretary.role,
    email: "secretaria@example.test",
    status: "active",
  },
  {
    id: "RES-DEMO-02",
    name: parishDemoPeople.administrator.name,
    role: parishDemoPeople.administrator.role,
    email: "administracion@example.test",
    status: "active",
  },
  {
    id: "RES-DEMO-03",
    name: parishDemoPeople.pastoral.name,
    role: parishDemoPeople.pastoral.role,
    email: "pastoral@example.test",
    status: "active",
  },
];

export const institutionalDepartments: InstitutionalDepartment[] = [
  {
    id: "DEP-DEMO-01",
    name: "Secretaría parroquial",
    siteId: institutionalSites[0]!.id,
    responsibleId: institutionalResponsibles[0]!.id,
    status: "active",
  },
  {
    id: "DEP-DEMO-02",
    name: "Administración",
    siteId: institutionalSites[1]!.id,
    responsibleId: institutionalResponsibles[1]!.id,
    status: "active",
  },
  {
    id: "DEP-DEMO-03",
    name: "Pastoral y formación",
    siteId: institutionalSites[1]!.id,
    responsibleId: institutionalResponsibles[2]!.id,
    status: "active",
  },
];

export const christianSites: InstitutionalSite[] = [
  { id: "SEDE-PRINCIPAL", name: "Sede Principal · Auditorio Central", address: "Calle 45 # 18-20", status: "active", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "SEDE-SECUNDARIA", name: "Sede Secundaria · Campus Norte", address: "Carrera 12 # 90-14", status: "active", organizationId: "ORG-DEMO-001", campusId: "SEDE-SECUNDARIA" },
];

export const christianResponsibles: InstitutionalResponsible[] = [
  { id: "RES-CRI-01", name: "Pastor responsable · demo", role: "Dirección pastoral", email: "pastor@congregacion.test", status: "active", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "RES-CRI-02", name: "Coordinación administrativa · demo", role: "Administración y tesorería", email: "admin@congregacion.test", status: "active", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "RES-CRI-03", name: "Líder de sede · demo", role: "Coordinación Sede Secundaria", email: "norte@congregacion.test", status: "active", organizationId: "ORG-DEMO-001", campusId: "SEDE-SECUNDARIA" },
];

export const christianDepartments: InstitutionalDepartment[] = [
  { id: "DEP-CRI-01", name: "Administración y secretaría", siteId: "SEDE-PRINCIPAL", responsibleId: "RES-CRI-02", status: "active", organizationId: "ORG-DEMO-001" },
  { id: "DEP-CRI-02", name: "Ministerios y células", siteId: "SEDE-PRINCIPAL", responsibleId: "RES-CRI-01", status: "active", organizationId: "ORG-DEMO-001" },
  { id: "DEP-CRI-03", name: "Operación Sede Norte", siteId: "SEDE-SECUNDARIA", responsibleId: "RES-CRI-03", status: "active", organizationId: "ORG-DEMO-001" },
];

export const seedMeetingMinutes: MeetingMinute[] = [
  {
    id: "ACT-2026-01",
    code: "ACT-001-2026",
    date: "2026-10-25",
    meetingType: "Junta de liderazgo",
    title: "Planificación de cultos y presupuesto noviembre",
    attendees: ["Pastor responsable · demo", "Coordinación administrativa · demo", "Coordinación musical A"],
    responsible: "Coordinación administrativa · demo",
    agreements: ["Aprobar calendario de cultos de noviembre", "Asignar presupuesto para equipo audiovisual"],
    commitments: ["Revisar cotizaciones de sonido antes del 10 nov.", "Confirmar equipo de ujieres"],
    status: "Aprobada",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
  },
  {
    id: "ACT-2026-02",
    code: "ACT-002-2026",
    date: "2026-11-01",
    meetingType: "Reunión administrativa",
    title: "Seguimiento de inventario y sedes",
    attendees: ["Coordinación administrativa · demo", "Líder de sede · demo"],
    responsible: "Líder de sede · demo",
    agreements: ["Actualizar mobiliario en Sede Secundaria"],
    commitments: ["Registrar inventario actualizado"],
    status: "Borrador",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-SECUNDARIA",
  },
];

export const seedCorrespondence: CorrespondenceItem[] = [
  {
    id: "COR-2026-01",
    radicado: "RAD-E-041",
    direction: "Recibida",
    date: "2026-10-28",
    sender: "Alcaldía Local · Secretaría de Gobierno",
    recipient: "Administración congregacional",
    subject: "Confirmación de permiso para jornada solidaria comunitaria",
    responsible: "Coordinación administrativa · demo",
    status: "En seguimiento",
    notes: "Adjuntar póliza y cronograma de evento.",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
  },
  {
    id: "COR-2026-02",
    radicado: "RAD-S-019",
    direction: "Enviada",
    date: "2026-10-30",
    sender: "Dirección congregacional",
    recipient: "Red de Iglesias Locales",
    subject: "Carta de presentación de delegación de jóvenes",
    responsible: "Pastor responsable · demo",
    status: "Respondida",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
  },
];

export const seedAdminTasks: AdminTask[] = [
  {
    id: "TSK-2026-01",
    title: "Consolidar cierre financiero mensual de diezmos y ofrendas",
    responsible: "Coordinación administrativa · demo",
    dueDate: "2026-11-10",
    priority: "Alta",
    status: "En progreso",
    relatedRef: "ACT-001-2026",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
  },
  {
    id: "TSK-2026-02",
    title: "Responder oficio de jornada solidaria comunitaria",
    responsible: "Coordinación administrativa · demo",
    dueDate: "2026-10-30",
    priority: "Alta",
    status: "Pendiente",
    relatedRef: "RAD-E-041",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
  },
  {
    id: "TSK-2026-03",
    title: "Mantenimiento preventivo de proyector salón juvenil",
    responsible: "Líder de sede · demo",
    dueDate: "2026-11-18",
    priority: "Media",
    status: "Pendiente",
    relatedRef: "ACT-CRI-003",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-SECUNDARIA",
  },
];
