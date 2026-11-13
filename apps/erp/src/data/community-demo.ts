import type { RecordStatus } from "@/data/demo-types";
import { parishDemo } from "@/data/parish-demo";

export type MembershipStatus = "Miembro activo" | "En proceso" | "Visitante" | "Inactivo" | "Trasladado";

export type FamilyRelation = {
  familyId: string;
  familyName: string;
  relationship: string;
};

export type ParticipationRecord = {
  id: string;
  date: string;
  type: "Culto" | "Ministerio" | "Grupo" | "Evento" | "Visita" | "FormaciÃƒÂ¯Ã‚Â¿Ã‚Â½n";
  detail: string;
  campusId?: string;
};

export type CongregationalBaptism = {
  id: string;
  date: string;
  practice: "Por inmersión" | "Por aspersión" | "Afirmación de fe" | "Otra práctica";
  place: string;
  officiant: string;
  notes?: string;
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
  organizationId?: string;
  campusId?: string;
  familyId: string;
  familyName: string;
  relationship: string;
  pastoral: string[];
  status: RecordStatus;
  membershipStatus: MembershipStatus;
  memberSince?: string;
  personType: "Miembro" | "Visitante";
  firstVisitDate?: string;
  updatedAt: string;
  sacraments: string[];
  participationHistory?: ParticipationRecord[];
  congregationalBaptisms?: CongregationalBaptism[];
  notes?: string;
};

export const parishioners: ParishionerDemo[] = [
  {
    id: "FEL-DEMO-001",
    name: "Persona de muestra 01",
    age: 42,
    email: "persona01@example.test",
    phone: "+57 300 000 0101 ÃƒÂ¯Ã‚Â¿Ã‚Â½ dato ficticio",
    address: "DirecciÃƒÂ¯Ã‚Â¿Ã‚Â½n de ejemplo 101",
    sector: "Centro",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-01",
    familyName: "Familia de muestra A",
    relationship: "Responsable familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    pastoral: ["Coro parroquial ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", "Voluntariado ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra"],
    status: "active",
    membershipStatus: "Miembro activo",
    memberSince: "12 mar. 2021",
    personType: "Miembro",
    updatedAt: "30 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    sacraments: ["Bautismo ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia", "ConfirmaciÃƒÂ¯Ã‚Â¿Ã‚Â½n ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia"],
    participationHistory: [
      { id: "PH-001-1", date: "27 oct. 2026", type: "Culto", detail: "Asistencia culto dominical ÃƒÂ¯Ã‚Â¿Ã‚Â½ sede principal" },
      { id: "PH-001-2", date: "20 oct. 2026", type: "Ministerio", detail: "Servicio en equipo de alabanza" },
    ],
    congregationalBaptisms: [
      { id: "BAP-001", date: "15 abr. 2019", practice: "Por inmersión", place: "Auditorio congregacional ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo", officiant: "Pastor responsable ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo" },
    ],
  },
  {
    id: "FEL-DEMO-002",
    name: "Persona de muestra 02",
    age: 38,
    email: "persona02@example.test",
    phone: "+57 300 000 0102 ÃƒÂ¯Ã‚Â¿Ã‚Â½ dato ficticio",
    address: "DirecciÃƒÂ¯Ã‚Â¿Ã‚Â½n de ejemplo 102",
    sector: "Norte",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-01",
    familyName: "Familia de muestra A",
    relationship: "Integrante familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    pastoral: ["Catequesis ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra"],
    status: "active",
    membershipStatus: "Miembro activo",
    memberSince: "03 jun. 2022",
    personType: "Miembro",
    updatedAt: "28 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    sacraments: ["Bautismo ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia", "Matrimonio ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia"],
    participationHistory: [
      { id: "PH-002-1", date: "27 oct. 2026", type: "Culto", detail: "Asistencia culto dominical" },
      { id: "PH-002-2", date: "22 oct. 2026", type: "Grupo", detail: "CÃƒÂ¯Ã‚Â¿Ã‚Â½lula familiar Norte" },
    ],
  },
  {
    id: "FEL-DEMO-003",
    name: "Persona de muestra 03",
    age: 67,
    email: "persona03@example.test",
    phone: "+57 300 000 0103 ÃƒÂ¯Ã‚Â¿Ã‚Â½ dato ficticio",
    address: "DirecciÃƒÂ¯Ã‚Â¿Ã‚Â½n de ejemplo 103",
    sector: "Sur",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-02",
    familyName: "Familia de muestra B",
    relationship: "Responsable familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    pastoral: ["Visita comunitaria ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra"],
    status: "active",
    membershipStatus: "Miembro activo",
    memberSince: "08 ene. 2015",
    personType: "Miembro",
    updatedAt: "26 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    sacraments: ["Bautismo ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia", "Primera comuniÃƒÂ¯Ã‚Â¿Ã‚Â½n ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia", "Matrimonio ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia"],
    participationHistory: [{ id: "PH-003-1", date: "25 oct. 2026", type: "Visita", detail: "Visita de acompaÃƒÂ¯Ã‚Â¿Ã‚Â½amiento comunitario" }],
  },
  {
    id: "FEL-DEMO-004",
    name: "Persona de muestra 04",
    age: 24,
    email: "persona04@example.test",
    phone: "+57 300 000 0104 ÃƒÂ¯Ã‚Â¿Ã‚Â½ dato ficticio",
    address: "DirecciÃƒÂ¯Ã‚Â¿Ã‚Â½n de ejemplo 104",
    sector: "Oriente",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-03",
    familyName: "Familia de muestra C",
    relationship: "Integrante familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    pastoral: ["JÃƒÂ¯Ã‚Â¿Ã‚Â½venes ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra"],
    status: "pending",
    membershipStatus: "Visitante",
    personType: "Visitante",
    firstVisitDate: "13 oct. 2026",
    updatedAt: "22 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    sacraments: ["Bautismo ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia"],
    participationHistory: [
      { id: "PH-004-1", date: "20 oct. 2026", type: "Culto", detail: "Primera visita ÃƒÂ¯Ã‚Â¿Ã‚Â½ culto dominical" },
      { id: "PH-004-2", date: "27 oct. 2026", type: "Evento", detail: "ReuniÃƒÂ¯Ã‚Â¿Ã‚Â½n de jÃƒÂ¯Ã‚Â¿Ã‚Â½venes" },
    ],
  },
  {
    id: "FEL-DEMO-005",
    name: "Persona de muestra 05",
    age: 51,
    email: "persona05@example.test",
    phone: "+57 300 000 0105 ÃƒÂ¯Ã‚Â¿Ã‚Â½ dato ficticio",
    address: "DirecciÃƒÂ¯Ã‚Â¿Ã‚Â½n de ejemplo 105",
    sector: "Centro",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-PRINCIPAL",
    familyId: "FAM-DEMO-04",
    familyName: "Familia de muestra D",
    relationship: "Responsable familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    pastoral: ["Servicio litÃƒÂ¯Ã‚Â¿Ã‚Â½rgico ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra"],
    status: "active",
    membershipStatus: "En proceso",
    memberSince: "01 sep. 2026",
    personType: "Miembro",
    updatedAt: "19 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    sacraments: ["Bautismo ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia", "ConfirmaciÃƒÂ¯Ã‚Â¿Ã‚Â½n ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia"],
    participationHistory: [{ id: "PH-005-1", date: "27 oct. 2026", type: "Culto", detail: "Servicio de bienvenida" }],
  },
  {
    id: "FEL-DEMO-006",
    name: "Persona de muestra 06",
    age: 33,
    email: "persona06@example.test",
    phone: "+57 300 000 0106 ÃƒÂ¯Ã‚Â¿Ã‚Â½ dato ficticio",
    address: "DirecciÃƒÂ¯Ã‚Â¿Ã‚Â½n de ejemplo 106",
    sector: "Occidente",
    parish: parishDemo.officialName,
    organizationId: "ORG-DEMO-001",
    campusId: "SEDE-SECUNDARIA",
    familyId: "FAM-DEMO-02",
    familyName: "Familia de muestra B",
    relationship: "Integrante familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    pastoral: ["AcompaÃƒÂ¯Ã‚Â¿Ã‚Â½amiento ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra"],
    status: "inactive",
    membershipStatus: "Inactivo",
    memberSince: "10 feb. 2020",
    personType: "Miembro",
    updatedAt: "10 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ demo",
    sacraments: ["Bautismo ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia ficticia"],
    participationHistory: [{ id: "PH-006-1", date: "02 sep. 2026", type: "Grupo", detail: "ÃƒÂ¯Ã‚Â¿Ã‚Â½ltima participaciÃƒÂ¯Ã‚Â¿Ã‚Â½n registrada" }],
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

export type SacramentKind = "Bautismo" | "Primera comuniÃƒÂ¯Ã‚Â¿Ã‚Â½n" | "ConfirmaciÃƒÂ¯Ã‚Â¿Ã‚Â½n" | "Matrimonio" | "UnciÃƒÂ¯Ã‚Â¿Ã‚Â½n de los enfermos";

export const sacramentTypes: { kind: SacramentKind; description: string; fields: string[]; requirements: string[] }[] = [
  { kind: "Bautismo", description: "Proceso de preparaciÃƒÂ¯Ã‚Â¿Ã‚Â½n y coordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n con la familia.", fields: ["Nombre del niÃƒÂ¯Ã‚Â¿Ã‚Â½o o persona", "Padres y padrinos", "Fecha solicitada", "Parroquia de referencia"], requirements: ["Identidad de referencia", "Disponibilidad de padrinos", "Encuentro formativo"] },
  { kind: "Primera comuniÃƒÂ¯Ã‚Â¿Ã‚Â½n", description: "Itinerario de preparaciÃƒÂ¯Ã‚Â¿Ã‚Â½n y participaciÃƒÂ¯Ã‚Â¿Ã‚Â½n formativa.", fields: ["Participante", "Grupo o catequista", "Etapa formativa", "Contacto familiar"], requirements: ["Itinerario activo", "Registro de participaciÃƒÂ¯Ã‚Â¿Ã‚Â½n", "Encuentros de preparaciÃƒÂ¯Ã‚Â¿Ã‚Â½n"] },
  { kind: "ConfirmaciÃƒÂ¯Ã‚Â¿Ã‚Â½n", description: "AcompaÃƒÂ¯Ã‚Â¿Ã‚Â½amiento, madurez formativa y coordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n litÃƒÂ¯Ã‚Â¿Ã‚Â½rgica.", fields: ["Confirmando", "Padrino o acompaÃƒÂ¯Ã‚Â¿Ã‚Â½ante", "Comunidad de referencia", "Proceso formativo"], requirements: ["Proceso formativo", "AcompaÃƒÂ¯Ã‚Â¿Ã‚Â½amiento asignado", "DocumentaciÃƒÂ¯Ã‚Â¿Ã‚Â½n de referencia"] },
  { kind: "Matrimonio", description: "Proceso de preparaciÃƒÂ¯Ã‚Â¿Ã‚Â½n, entrevistas y coordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n de la celebraciÃƒÂ¯Ã‚Â¿Ã‚Â½n.", fields: ["Contrayentes", "Contacto principal", "Fecha tentativa", "Lugar de celebraciÃƒÂ¯Ã‚Â¿Ã‚Â½n"], requirements: ["Encuentros de preparaciÃƒÂ¯Ã‚Â¿Ã‚Â½n", "RevisiÃƒÂ¯Ã‚Â¿Ã‚Â½n documental", "CoordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n de celebraciÃƒÂ¯Ã‚Â¿Ã‚Â½n"] },
  { kind: "UnciÃƒÂ¯Ã‚Â¿Ã‚Â½n de los enfermos", description: "AtenciÃƒÂ¯Ã‚Â¿Ã‚Â½n pastoral y coordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n reservada con la familia.", fields: ["Persona atendida", "Contacto familiar", "Lugar de atenciÃƒÂ¯Ã‚Â¿Ã‚Â½n", "Disponibilidad"], requirements: ["Solicitud pastoral", "CoordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n con el equipo", "InformaciÃƒÂ¯Ã‚Â¿Ã‚Â½n mÃƒÂ¯Ã‚Â¿Ã‚Â½nima necesaria"] },
];

export const sacramentalRequests: SacramentalRequestDemo[] = [
  { id: "SOL-SAC-001", sacrament: "Bautismo", person: "Referencia familiar ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", submitted: "28 oct. 2026", responsible: "Equipo de acogida", preparation: "Encuentro inicial realizado", status: "active", nextStep: "Confirmar fecha de celebraciÃƒÂ¯Ã‚Â¿Ã‚Â½n" },
  { id: "SOL-SAC-002", sacrament: "Primera comuniÃƒÂ¯Ã‚Â¿Ã‚Â½n", person: "Participante de catequesis ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", submitted: "25 oct. 2026", responsible: "CoordinaciÃƒÂ¯Ã‚Â¿Ã‚Â½n formativa", preparation: "Itinerario en desarrollo", status: "active", nextStep: "Revisar asistencia del ciclo" },
  { id: "SOL-SAC-003", sacrament: "Matrimonio", person: "Pareja de muestra", submitted: "20 oct. 2026", responsible: "AcompaÃƒÂ¯Ã‚Â¿Ã‚Â½amiento pastoral", preparation: "Encuentros de preparaciÃƒÂ¯Ã‚Â¿Ã‚Â½n", status: "pending", nextStep: "Agendar entrevista de seguimiento" },
  { id: "SOL-SAC-004", sacrament: "ConfirmaciÃƒÂ¯Ã‚Â¿Ã‚Â½n", person: "Joven de muestra", submitted: "18 oct. 2026", responsible: "AnimaciÃƒÂ¯Ã‚Â¿Ã‚Â½n juvenil", preparation: "Proceso formativo avanzado", status: "approved", nextStep: "Preparar celebraciÃƒÂ¯Ã‚Â¿Ã‚Â½n comunitaria" },
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
  { id: "LIB-001", book: "Bautismos", entry: "Partida 084", folio: "Tomo DEMO-12 / Folio 24", date: "12 abr. 2026", dateISO: "2026-04-12", subject: "Persona registrada ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", celebrant: "Ministro celebrante ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", reference: "Certificado DEMO-001", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-002", book: "Confirmaciones", entry: "Partida 031", folio: "Tomo DEMO-07 / Folio 11", date: "05 may. 2026", dateISO: "2026-05-05", subject: "Persona registrada ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", celebrant: "Ministro celebrante ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", reference: "Certificado DEMO-014", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-003", book: "Matrimonios", entry: "Partida 019", folio: "Tomo DEMO-04 / Folio 08", date: "21 jun. 2026", dateISO: "2026-06-21", subject: "Pareja registrada ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", celebrant: "Ministro celebrante ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", reference: "Certificado DEMO-021", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-004", book: "Bautismos", entry: "Partida 085", folio: "Tomo DEMO-12 / Folio 25", date: "02 ago. 2026", dateISO: "2026-08-02", subject: "Persona registrada ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", celebrant: "Ministro celebrante ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", reference: "Certificado DEMO-033", note: "Asiento ficticio para consulta documental." },
  { id: "LIB-005", book: "Defunciones", entry: "Partida 012", folio: "Tomo DEMO-03 / Folio 05", date: "18 sep. 2026", dateISO: "2026-09-18", subject: "Persona registrada ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", celebrant: "Ministro celebrante ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra", reference: "Constancia DEMO-009", note: "Asiento ficticio para consulta documental." },
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
  { id: "DOC-REQ-001", kind: "Certificado de bautismo", subject: "Persona de muestra ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia", requester: "Solicitante de muestra", requested: "29 oct. 2026", status: "pending", recordVerified: true },
  { id: "DOC-REQ-002", kind: "Certificado de confirmaciÃƒÂ¯Ã‚Â¿Ã‚Â½n", subject: "Persona de muestra ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia", requester: "Solicitante de muestra", requested: "27 oct. 2026", status: "active", recordVerified: true },
  { id: "DOC-REQ-003", kind: "Constancia parroquial", subject: "Persona de muestra ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia", requester: "Solicitante de muestra", requested: "24 oct. 2026", status: "approved", recordVerified: true, delivered: "30 oct. 2026 ÃƒÂ¯Ã‚Â¿Ã‚Â½ muestra" },
  { id: "DOC-REQ-004", kind: "Certificado de matrimonio", subject: "Pareja de muestra ÃƒÂ¯Ã‚Â¿Ã‚Â½ referencia", requester: "Solicitante de muestra", requested: "21 oct. 2026", status: "pending", recordVerified: false },
];
