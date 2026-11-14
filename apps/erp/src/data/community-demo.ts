import type { RecordStatus } from "@/data/demo-types";
import { parishDemo } from "@/data/parish-demo";

export type FamilyEntity = {
  id: string;
  name: string;
  address: string;
  sector: string;
  organizationId: string;
  campusId: string;
  notes?: string | undefined;
};

export const christianFamilies: FamilyEntity[] = [
  { id: "FAM-CRI-01", name: "Familia de muestra A", address: "Dirección congregacional 101", sector: "Centro", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", notes: "Núcleo familiar integrado en Sede Principal" },
  { id: "FAM-CRI-02", name: "Familia de muestra B", address: "Dirección congregacional 103", sector: "Sur", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", notes: "Familia con participación en Acción Social" },
  { id: "FAM-CRI-03", name: "Familia de muestra C", address: "Dirección congregacional 104", sector: "Oriente", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL", notes: "Seguimiento de primer contacto" },
  { id: "FAM-CRI-04", name: "Familia de muestra D", address: "Dirección congregacional 105", sector: "Centro", organizationId: "ORG-DEMO-001", campusId: "SEDE-SECUNDARIA", notes: "Núcleo vinculado a Sede Secundaria" },
];

export const catholicFamilies: FamilyEntity[] = [
  { id: "FAM-DEMO-01", name: "Familia de muestra A", address: "Dirección de ejemplo 101", sector: "Centro", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "FAM-DEMO-02", name: "Familia de muestra B", address: "Dirección de ejemplo 204", sector: "La Esperanza", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
];

export type MembershipStatus = "Miembro activo" | "En proceso" | "Visitante" | "Inactivo" | "Trasladado";

export type FamilyRelation = {
  familyId: string;
  familyName: string;
  relationship: string;
};

export type ParticipationRecord = {
  id: string;
  date: string;
  type: "Culto" | "Ministerio" | "Grupo" | "Evento" | "Visita" | "Formación";
  detail: string;
  campusId?: string | undefined;
};

export type CongregationalBaptism = {
  id: string;
  date: string;
  practice: "Por inmersión" | "Por aspersión" | "Afirmación de fe" | "Otra práctica";
  place: string;
  officiant: string;
  notes?: string | undefined;
};

export type ParishionerDemo = {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  sector: string;
  parish: string;
  organizationId?: string | undefined;
  campusId?: string | undefined;
  familyId: string;
  familyName: string;
  relationship: string;
  pastoral: string[];
  status: RecordStatus;
  membershipStatus: MembershipStatus;
  memberSince?: string | undefined;
  personType: "Miembro" | "Visitante";
  firstVisitDate?: string | undefined;
  updatedAt: string;
  sacraments: string[];
  participationHistory?: ParticipationRecord[] | undefined;
  congregationalBaptisms?: CongregationalBaptism[] | undefined;
  notes?: string | undefined;
};

/** Datos demostrativos exclusivos del perfil católico parroquial. */
export const parishioners: ParishionerDemo[] = [
  {
    id: "FEL-DEMO-001",
    name: "Persona de muestra 01",
    age: 42,
    email: "persona01@example.test",
    phone: "+57 300 000 0101 · dato ficticio",
    address: "Dirección de ejemplo 101",
    sector: "Centro",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-01",
    familyName: "Familia de muestra A",
    relationship: "Responsable familiar · demo",
    pastoral: ["Coro parroquial · muestra", "Voluntariado · muestra"],
    status: "active",
    membershipStatus: "Miembro activo",
    personType: "Miembro",
    updatedAt: "30 oct. 2026 · demo",
    sacraments: ["Bautismo · referencia ficticia", "Confirmación · referencia ficticia"],
  },
  {
    id: "FEL-DEMO-002",
    name: "Persona de muestra 02",
    age: 39,
    email: "persona02@example.test",
    phone: "+57 300 000 0102 · dato ficticio",
    address: "Dirección de ejemplo 101",
    sector: "Centro",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-01",
    familyName: "Familia de muestra A",
    relationship: "Cónyuge · demo",
    pastoral: ["Voluntariado · muestra"],
    status: "active",
    membershipStatus: "Miembro activo",
    personType: "Miembro",
    updatedAt: "28 oct. 2026 · demo",
    sacraments: [
      "Bautismo · referencia ficticia",
      "Confirmación · referencia ficticia",
      "Matrimonio · referencia ficticia",
    ],
  },
  {
    id: "FEL-DEMO-003",
    name: "Persona de muestra 03",
    age: 16,
    email: "persona03@example.test",
    phone: "+57 300 000 0103 · dato ficticio",
    address: "Dirección de ejemplo 101",
    sector: "Centro",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-01",
    familyName: "Familia de muestra A",
    relationship: "Integrante familiar · demo",
    pastoral: ["Catequesis juvenil · muestra"],
    status: "pending",
    membershipStatus: "En proceso",
    personType: "Miembro",
    updatedAt: "26 oct. 2026 · demo",
    sacraments: ["Bautismo · referencia ficticia", "Primera comunión · referencia ficticia"],
  },
  {
    id: "FEL-DEMO-004",
    name: "Persona de muestra 04",
    age: 67,
    email: "persona04@example.test",
    phone: "+57 300 000 0104 · dato ficticio",
    address: "Dirección de ejemplo 204",
    sector: "La Esperanza",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-02",
    familyName: "Familia de muestra B",
    relationship: "Responsable familiar · demo",
    pastoral: ["Ministerio litúrgico · muestra"],
    status: "active",
    membershipStatus: "Miembro activo",
    personType: "Miembro",
    updatedAt: "23 oct. 2026 · demo",
    sacraments: [
      "Bautismo · referencia ficticia",
      "Confirmación · referencia ficticia",
      "Matrimonio · referencia ficticia",
    ],
  },
  {
    id: "FEL-DEMO-005",
    name: "Persona de muestra 05",
    age: 29,
    email: "persona05@example.test",
    phone: "+57 300 000 0105 · dato ficticio",
    address: "Dirección de ejemplo 204",
    sector: "La Esperanza",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-02",
    familyName: "Familia de muestra B",
    relationship: "Integrante familiar · demo",
    pastoral: ["Acción social · muestra"],
    status: "inactive",
    membershipStatus: "Inactivo",
    personType: "Miembro",
    updatedAt: "17 oct. 2026 · demo",
    sacraments: ["Bautismo · referencia ficticia"],
  },
];

/** Datos demostrativos exclusivos del paquete A&O Cristiano (congregaciones). */
export const christianMembers: ParishionerDemo[] = [
  {
    id: "MBR-DEMO-001",
    name: "Miembro de muestra 01",
    age: 42,
    email: "miembro01@congregacion.test",
    phone: "+57 300 000 0101 · dato ficticio",
    address: "Dirección congregacional 101",
    sector: "Centro",
    parish: "Congregación demo · Sede Principal",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-CRI-01",
    familyName: "Familia de muestra A",
    relationship: "Responsable familiar · demo",
    pastoral: ["Ministerio de Alabanza", "Equipo de bienvenida"],
    status: "active",
    membershipStatus: "Miembro activo",
    memberSince: "12 mar. 2021",
    personType: "Miembro",
    updatedAt: "30 oct. 2026 · demo",
    sacraments: [],
    participationHistory: [
      { id: "PH-001-1", date: "27 oct. 2026", type: "Culto", detail: "Asistencia culto dominical · sede principal", campusId: "SEDE-PRINCIPAL" },
      { id: "PH-001-2", date: "20 oct. 2026", type: "Ministerio", detail: "Servicio en equipo de alabanza", campusId: "SEDE-PRINCIPAL" },
    ],
    congregationalBaptisms: [
      { id: "BAP-001", date: "15 abr. 2019", practice: "Por inmersión", place: "Auditorio congregacional · demo", officiant: "Pastor responsable · demo" },
    ],
  },
  {
    id: "MBR-DEMO-002",
    name: "Miembro de muestra 02",
    age: 38,
    email: "miembro02@congregacion.test",
    phone: "+57 300 000 0102 · dato ficticio",
    address: "Dirección congregacional 102",
    sector: "Norte",
    parish: "Congregación demo · Sede Principal",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-CRI-01",
    familyName: "Familia de muestra A",
    relationship: "Integrante familiar · demo",
    pastoral: ["Célula Norte"],
    status: "active",
    membershipStatus: "Miembro activo",
    memberSince: "03 jun. 2022",
    personType: "Miembro",
    updatedAt: "28 oct. 2026 · demo",
    sacraments: [],
    participationHistory: [
      { id: "PH-002-1", date: "27 oct. 2026", type: "Culto", detail: "Asistencia culto dominical", campusId: "SEDE-PRINCIPAL" },
      { id: "PH-002-2", date: "22 oct. 2026", type: "Grupo", detail: "Célula familiar Norte", campusId: "SEDE-PRINCIPAL" },
    ],
    congregationalBaptisms: [
      { id: "BAP-002", date: "10 nov. 2022", practice: "Afirmación de fe", place: "Sede principal · demo", officiant: "Pastor asociado · demo" },
    ],
  },
  {
    id: "MBR-DEMO-003",
    name: "Miembro de muestra 03",
    age: 67,
    email: "miembro03@congregacion.test",
    phone: "+57 300 000 0103 · dato ficticio",
    address: "Dirección congregacional 103",
    sector: "Sur",
    parish: "Congregación demo · Sede Principal",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-CRI-02",
    familyName: "Familia de muestra B",
    relationship: "Responsable familiar · demo",
    pastoral: ["Departamento de Acción Social"],
    status: "active",
    membershipStatus: "Miembro activo",
    memberSince: "08 ene. 2015",
    personType: "Miembro",
    updatedAt: "26 oct. 2026 · demo",
    sacraments: [],
    participationHistory: [
      { id: "PH-003-1", date: "25 oct. 2026", type: "Visita", detail: "Visita de acompañamiento comunitario", campusId: "SEDE-PRINCIPAL" },
    ],
  },
  {
    id: "VIS-DEMO-004",
    name: "Visitante de muestra 04",
    age: 24,
    email: "visitante04@congregacion.test",
    phone: "+57 300 000 0104 · dato ficticio",
    address: "Dirección congregacional 104",
    sector: "Oriente",
    parish: "Congregación demo · Sede Principal",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-CRI-03",
    familyName: "Familia de muestra C",
    relationship: "Integrante familiar · demo",
    pastoral: ["Ministerio Juvenil"],
    status: "pending",
    membershipStatus: "Visitante",
    personType: "Visitante",
    firstVisitDate: "13 oct. 2026",
    updatedAt: "22 oct. 2026 · demo",
    sacraments: [],
    participationHistory: [
      { id: "PH-004-1", date: "20 oct. 2026", type: "Culto", detail: "Primera visita · culto dominical", campusId: "SEDE-PRINCIPAL" },
      { id: "PH-004-2", date: "27 oct. 2026", type: "Evento", detail: "Reunión de jóvenes", campusId: "SEDE-PRINCIPAL" },
    ],
  },
  {
    id: "MBR-DEMO-005",
    name: "Miembro de muestra 05",
    age: 51,
    email: "miembro05@congregacion.test",
    phone: "+57 300 000 0105 · dato ficticio",
    address: "Dirección congregacional 105",
    sector: "Centro",
    parish: "Congregación demo · Sede Secundaria",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-SECUNDARIA",
    familyId: "FAM-CRI-04",
    familyName: "Familia de muestra D",
    relationship: "Responsable familiar · demo",
    pastoral: ["Equipo de Ujieres y Bienvenida"],
    status: "active",
    membershipStatus: "En proceso",
    memberSince: "01 sep. 2026",
    personType: "Miembro",
    updatedAt: "19 oct. 2026 · demo",
    sacraments: [],
    participationHistory: [
      { id: "PH-005-1", date: "27 oct. 2026", type: "Culto", detail: "Servicio de bienvenida", campusId: "SEDE-SECUNDARIA" },
    ],
  },
  {
    id: "MBR-DEMO-006",
    name: "Miembro de muestra 06",
    age: 33,
    email: "miembro06@congregacion.test",
    phone: "+57 300 000 0106 · dato ficticio",
    address: "Dirección congregacional 106",
    sector: "Occidente",
    parish: "Congregación demo · Sede Secundaria",
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-SECUNDARIA",
    familyId: "FAM-CRI-02",
    familyName: "Familia de muestra B",
    relationship: "Integrante familiar · demo",
    pastoral: ["Formación bíblica"],
    status: "inactive",
    membershipStatus: "Inactivo",
    memberSince: "10 feb. 2020",
    personType: "Miembro",
    updatedAt: "10 oct. 2026 · demo",
    sacraments: [],
    participationHistory: [
      { id: "PH-006-1", date: "02 sep. 2026", type: "Grupo", detail: "Última participación registrada", campusId: "SEDE-SECUNDARIA" },
    ],
  },
];

export type SacramentalRequestDemo = {
  id: string;
  sacrament: SacramentKind;
  person: string;
  submitted: string;
  responsible: string;
  preparation: string;
  status: RecordStatus;
  nextStep: string;
};

export type SacramentKind = "Bautismo" | "Primera comunión" | "Confirmación" | "Matrimonio" | "Unción de los enfermos";

export const sacramentTypes: { kind: SacramentKind; description: string; fields: string[]; requirements: string[] }[] = [
  { kind: "Bautismo", description: "Proceso de preparación y coordinación con la familia.", fields: ["Nombre del niño o persona", "Padres y padrinos", "Fecha solicitada", "Parroquia de referencia"], requirements: ["Identidad de referencia", "Disponibilidad de padrinos", "Encuentro formativo"] },
  { kind: "Primera comunión", description: "Itinerario de preparación y participación formativa.", fields: ["Participante", "Grupo o catequista", "Etapa formativa", "Contacto familiar"], requirements: ["Itinerario activo", "Registro de participación", "Encuentros de preparación"] },
  { kind: "Confirmación", description: "Acompañamiento, madurez formativa y coordinación litúrgica.", fields: ["Confirmando", "Padrino o acompañante", "Comunidad de referencia", "Proceso formativo"], requirements: ["Proceso formativo", "Acompañamiento asignado", "Documentación de referencia"] },
  { kind: "Matrimonio", description: "Proceso de preparación, entrevistas y coordinación de la celebración.", fields: ["Contrayentes", "Contacto principal", "Fecha tentativa", "Lugar de celebración"], requirements: ["Encuentros de preparación", "Revisión documental", "Coordinación de celebración"] },
  { kind: "Unción de los enfermos", description: "Atención pastoral y coordinación reservada con la familia.", fields: ["Persona atendida", "Contacto familiar", "Lugar de atención", "Disponibilidad"], requirements: ["Solicitud pastoral", "Coordinación con el equipo", "Información mínima necesaria"] },
];

export const sacramentalRequests: SacramentalRequestDemo[] = [
  { id: "SOL-SAC-001", sacrament: "Bautismo", person: "Referencia familiar · muestra", submitted: "28 oct. 2026", responsible: "Equipo de acogida", preparation: "Encuentro inicial realizado", status: "active", nextStep: "Confirmar fecha de celebración" },
  { id: "SOL-SAC-002", sacrament: "Primera comunión", person: "Participante de catequesis · muestra", submitted: "25 oct. 2026", responsible: "Coordinación formativa", preparation: "Itinerario en desarrollo", status: "active", nextStep: "Revisar asistencia del ciclo" },
  { id: "SOL-SAC-003", sacrament: "Matrimonio", person: "Pareja de muestra", submitted: "20 oct. 2026", responsible: "Acompañamiento pastoral", preparation: "Encuentros de preparación", status: "pending", nextStep: "Agendar entrevista de seguimiento" },
  { id: "SOL-SAC-004", sacrament: "Confirmación", person: "Joven de muestra", submitted: "18 oct. 2026", responsible: "Animación juvenil", preparation: "Proceso formativo avanzado", status: "approved", nextStep: "Preparar celebración comunitaria" },
];

export type SacramentalEntryDemo = {
  id: string;
  book: "Bautismos" | "Confirmaciones" | "Matrimonios" | "Defunciones";
  entry: string;
  folio: string;
  date: string;
  dateISO: string;
  subject: string;
  celebrant: string;
  reference: string;
  note: string;
};

export const sacramentalEntries: SacramentalEntryDemo[] = [
  { id: "LIB-001", book: "Bautismos", entry: "Partida 084", folio: "Tomo DEMO-12 / Folio 24", date: "12 abr. 2026", dateISO: "2026-04-12", subject: "Persona registrada · muestra", celebrant: "Ministro celebrante · muestra", reference: "Certificado DEMO-001", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-002", book: "Confirmaciones", entry: "Partida 031", folio: "Tomo DEMO-07 / Folio 11", date: "05 may. 2026", dateISO: "2026-05-05", subject: "Persona registrada · muestra", celebrant: "Ministro celebrante · muestra", reference: "Certificado DEMO-014", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-003", book: "Matrimonios", entry: "Partida 019", folio: "Tomo DEMO-04 / Folio 08", date: "21 jun. 2026", dateISO: "2026-06-21", subject: "Pareja registrada · muestra", celebrant: "Ministro celebrante · muestra", reference: "Certificado DEMO-021", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-004", book: "Bautismos", entry: "Partida 085", folio: "Tomo DEMO-12 / Folio 25", date: "02 ago. 2026", dateISO: "2026-08-02", subject: "Persona registrada · muestra", celebrant: "Ministro celebrante · muestra", reference: "Certificado DEMO-033", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-005", book: "Defunciones", entry: "Partida 012", folio: "Tomo DEMO-03 / Folio 05", date: "18 sep. 2026", dateISO: "2026-09-18", subject: "Persona registrada · muestra", celebrant: "Ministro celebrante · muestra", reference: "Constancia DEMO-009", note: "Asiento ficticio para consulta documental." },
];

export type DocumentRequestDemo = {
  id: string;
  kind: string;
  subject: string;
  requester: string;
  requested: string;
  status: RecordStatus;
  recordVerified: boolean;
  delivered?: string;
};

export const documentRequests: DocumentRequestDemo[] = [
  { id: "DOC-REQ-001", kind: "Certificado de bautismo", subject: "Persona de muestra · referencia", requester: "Solicitante de muestra", requested: "29 oct. 2026", status: "pending", recordVerified: true },
  { id: "DOC-REQ-002", kind: "Certificado de confirmación", subject: "Persona de muestra · referencia", requester: "Solicitante de muestra", requested: "27 oct. 2026", status: "active", recordVerified: true },
  { id: "DOC-REQ-003", kind: "Constancia parroquial", subject: "Persona de muestra · referencia", requester: "Solicitante de muestra", requested: "24 oct. 2026", status: "approved", recordVerified: true, delivered: "30 oct. 2026 · muestra" },
  { id: "DOC-REQ-004", kind: "Certificado de matrimonio", subject: "Pareja de muestra · referencia", requester: "Solicitante de muestra", requested: "21 oct. 2026", status: "pending", recordVerified: false },
];
