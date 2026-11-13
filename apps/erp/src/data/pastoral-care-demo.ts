import type { RecordStatus } from "@/data/demo-types";

export type PastoralCareType =
  | "Visita pastoral"
  | "Seguimiento a nuevo miembro"
  | "Consejería"
  | "Acompañamiento familiar"
  | "Petición de oración"
  | "Compromiso pastoral";

export type PastoralCareRecord = {
  id: string;
  organizationId: string;
  campusId: string;
  type: PastoralCareType;
  person: string;
  family?: string;
  responsible: string;
  date: string;
  status: RecordStatus | "Abierto" | "En seguimiento" | "Cerrado";
  summary: string;
  confidentialNotes: string;
  commitments: string[];
  authorizedRoles: string[];
  history: { id: string; date: string; action: string; actor: string }[];
  accessLog: { id: string; at: string; actor: string; action: "view" | "create" | "update"; role: string }[];
};

export const pastoralCareRecords: PastoralCareRecord[] = [
  {
    id: "AP-001",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    type: "Seguimiento a nuevo miembro",
    person: "Persona de muestra 04",
    responsible: "Líder de integración · demo",
    date: "2026-10-24",
    status: "En seguimiento",
    summary: "Seguimiento inicial tras primera visita y participación en grupo de jóvenes.",
    confidentialNotes: "Nota confidencial demostrativa: conversación pastoral registrada solo para personal autorizado.",
    commitments: ["Llamada de acompañamiento", "Invitación a grupo pequeño", "Oración en equipo pastoral"],
    authorizedRoles: ["pastor_principal", "lider_pastoral", "consejero_autorizado"],
    history: [
      { id: "APH-1", date: "2026-10-20", action: "Primer contacto registrado", actor: "Equipo de bienvenida" },
      { id: "APH-2", date: "2026-10-24", action: "Seguimiento y compromiso acordado", actor: "Líder de integración · demo" },
    ],
    accessLog: [{ id: "APL-1", at: "2026-10-24T10:00:00", actor: "Sistema demo", action: "create", role: "lider_pastoral" }],
  },
  {
    id: "AP-002",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    type: "Visita pastoral",
    person: "Familia de muestra B",
    family: "Familia de muestra B",
    responsible: "Pastor responsable · demo",
    date: "2026-10-22",
    status: "Cerrado",
    summary: "Visita de acompañamiento familiar coordinada con el ministerio de cuidado.",
    confidentialNotes: "Detalle confidencial demostrativo de la visita. No debe mostrarse a roles no autorizados ni en informes generales.",
    commitments: ["Seguimiento en 30 días", "Apoyo comunitario coordinado"],
    authorizedRoles: ["pastor_principal", "lider_pastoral"],
    history: [{ id: "APH-3", date: "2026-10-22", action: "Visita realizada y cierre del caso", actor: "Pastor responsable · demo" }],
    accessLog: [{ id: "APL-2", at: "2026-10-22T16:30:00", actor: "Sistema demo", action: "create", role: "pastor_principal" }],
  },
  {
    id: "AP-003",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-SECUNDARIA",
    type: "Petición de oración",
    person: "Persona de muestra 06",
    responsible: "Equipo de intercesión · demo",
    date: "2026-10-28",
    status: "Abierto",
    summary: "Petición recibida y asignada para acompañamiento en oración.",
    confidentialNotes: "Motivo pastoral sensible demostrativo. Visible solo para autorizados.",
    commitments: ["Oración semanal", "Contacto de seguimiento"],
    authorizedRoles: ["pastor_principal", "lider_pastoral", "consejero_autorizado"],
    history: [{ id: "APH-4", date: "2026-10-28", action: "Petición registrada y asignada", actor: "Equipo de intercesión · demo" }],
    accessLog: [{ id: "APL-3", at: "2026-10-28T09:15:00", actor: "Sistema demo", action: "create", role: "lider_pastoral" }],
  },
  {
    id: "AP-004",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    type: "Consejería",
    person: "Persona de muestra 05",
    responsible: "Consejero autorizado · demo",
    date: "2026-10-26",
    status: "En seguimiento",
    summary: "Proceso de consejería con acuerdos de acompañamiento.",
    confidentialNotes: "Contenido de consejería estrictamente confidencial (demo). No exponer en informes generales ni a IA sin autorización expresa.",
    commitments: ["Sesión de seguimiento", "Plan de acompañamiento"],
    authorizedRoles: ["pastor_principal", "consejero_autorizado"],
    history: [{ id: "APH-5", date: "2026-10-26", action: "Sesión inicial y acuerdos", actor: "Consejero autorizado · demo" }],
    accessLog: [{ id: "APL-4", at: "2026-10-26T14:00:00", actor: "Sistema demo", action: "create", role: "consejero_autorizado" }],
  },
];