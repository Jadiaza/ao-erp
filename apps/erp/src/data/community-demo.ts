import type { RecordStatus } from "@/data/demo-types";
import { parishDemo } from "@/data/parish-demo";

export type ParishionerDemo = {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  sector: string;
  parish: string;
  familyId: string;
  familyName: string;
  relationship: string;
  pastoral: string[];
  status: RecordStatus;
  updatedAt: string;
  sacraments: string[];
};

export const parishioners: ParishionerDemo[] = [
  { id: "FEL-DEMO-001", name: "Persona de muestra 01", age: 42, email: "persona01@example.test", phone: "+57 300 000 0101 · dato ficticio", address: "Dirección de ejemplo 101", sector: "Centro", parish: parishDemo.officialName, familyId: "FAM-DEMO-01", familyName: "Familia de muestra A", relationship: "Responsable familiar · demo", pastoral: ["Coro parroquial · muestra", "Voluntariado · muestra"], status: "active", updatedAt: "30 oct. 2026 · demo", sacraments: ["Bautismo · referencia ficticia", "Confirmación · referencia ficticia"] },
  { id: "FEL-DEMO-002", name: "Persona de muestra 02", age: 39, email: "persona02@example.test", phone: "+57 300 000 0102 · dato ficticio", address: "Dirección de ejemplo 101", sector: "Centro", parish: parishDemo.officialName, familyId: "FAM-DEMO-01", familyName: "Familia de muestra A", relationship: "Cónyuge · demo", pastoral: ["Voluntariado · muestra"], status: "active", updatedAt: "28 oct. 2026 · demo", sacraments: ["Bautismo · referencia ficticia", "Confirmación · referencia ficticia", "Matrimonio · referencia ficticia"] },
  { id: "FEL-DEMO-003", name: "Persona de muestra 03", age: 16, email: "persona03@example.test", phone: "+57 300 000 0103 · dato ficticio", address: "Dirección de ejemplo 101", sector: "Centro", parish: parishDemo.officialName, familyId: "FAM-DEMO-01", familyName: "Familia de muestra A", relationship: "Integrante familiar · demo", pastoral: ["Catequesis juvenil · muestra"], status: "pending", updatedAt: "26 oct. 2026 · demo", sacraments: ["Bautismo · referencia ficticia", "Primera comunión · referencia ficticia"] },
  { id: "FEL-DEMO-004", name: "Persona de muestra 04", age: 67, email: "persona04@example.test", phone: "+57 300 000 0104 · dato ficticio", address: "Dirección de ejemplo 204", sector: "La Esperanza", parish: parishDemo.officialName, familyId: "FAM-DEMO-02", familyName: "Familia de muestra B", relationship: "Responsable familiar · demo", pastoral: ["Ministerio litúrgico · muestra"], status: "active", updatedAt: "23 oct. 2026 · demo", sacraments: ["Bautismo · referencia ficticia", "Confirmación · referencia ficticia", "Matrimonio · referencia ficticia"] },
  { id: "FEL-DEMO-005", name: "Persona de muestra 05", age: 29, email: "persona05@example.test", phone: "+57 300 000 0105 · dato ficticio", address: "Dirección de ejemplo 204", sector: "La Esperanza", parish: parishDemo.officialName, familyId: "FAM-DEMO-02", familyName: "Familia de muestra B", relationship: "Integrante familiar · demo", pastoral: ["Acción social · muestra"], status: "inactive", updatedAt: "17 oct. 2026 · demo", sacraments: ["Bautismo · referencia ficticia"] },
];

export type SacramentKind = "Bautismo" | "Confirmación" | "Primera comunión" | "Matrimonio" | "Unción de los enfermos" | "Reconciliación";
export type SacramentalRequestDemo = { id: string; sacrament: SacramentKind; person: string; submitted: string; responsible: string; preparation: string; status: RecordStatus; nextStep: string };

export const sacramentalRequests: SacramentalRequestDemo[] = [
  { id: "SOL-SAC-DEMO-014", sacrament: "Bautismo", person: "Persona de muestra 06", submitted: "30 oct. 2026", responsible: "Equipo de acogida", preparation: "Encuentro inicial", status: "pending", nextStep: "Revisar documentos aportados" },
  { id: "SOL-SAC-DEMO-013", sacrament: "Primera comunión", person: "Persona de muestra 03", submitted: "28 oct. 2026", responsible: "Catequista de muestra", preparation: "Proceso formativo", status: "active", nextStep: "Confirmar asistencia al encuentro" },
  { id: "SOL-SAC-DEMO-012", sacrament: "Matrimonio", person: "Pareja de muestra 02", submitted: "25 oct. 2026", responsible: "Equipo prematrimonial", preparation: "Acompañamiento inicial", status: "pending", nextStep: "Agendar entrevista pastoral" },
  { id: "SOL-SAC-DEMO-011", sacrament: "Confirmación", person: "Persona de muestra 07", submitted: "22 oct. 2026", responsible: "Coordinación catequética", preparation: "En curso", status: "approved", nextStep: "Revisar fecha propuesta" },
  { id: "SOL-SAC-DEMO-010", sacrament: "Unción de los enfermos", person: "Referencia pastoral reservada", submitted: "21 oct. 2026", responsible: "Equipo pastoral", preparation: "Acompañamiento confidencial", status: "active", nextStep: "Coordinar contacto pastoral reservado" },
  { id: "SOL-SAC-DEMO-009", sacrament: "Reconciliación", person: "Consulta pastoral reservada", submitted: "20 oct. 2026", responsible: "Ministro asignado", preparation: "Atención pastoral", status: "pending", nextStep: "Coordinar disponibilidad" },
];

export const sacramentTypes: { kind: SacramentKind; description: string; requirements: string[]; fields: string[] }[] = [
  { kind: "Bautismo", description: "Acogida familiar, preparación de padres y padrinos, y coordinación celebrativa.", requirements: ["Identificación del solicitante", "Datos de padres y padrinos", "Constancia de preparación"], fields: ["Nombre de padres", "Padrinos propuestos", "Fecha de nacimiento", "Preferencia de celebración"] },
  { kind: "Confirmación", description: "Seguimiento de formación, padrino o madrina y disponibilidad de celebración.", requirements: ["Constancia de bautismo", "Seguimiento catequético", "Datos de padrino o madrina"], fields: ["Grupo de formación", "Catequista responsable", "Padrino o madrina", "Asistencia formativa"] },
  { kind: "Primera comunión", description: "Acompañamiento de la preparación catequética y coordinación con la familia.", requirements: ["Registro de bautismo", "Proceso de catequesis", "Participación familiar"], fields: ["Grupo de catequesis", "Catequista", "Año de inicio", "Encuentros completados"] },
  { kind: "Matrimonio", description: "Acompañamiento prematrimonial, revisión de requisitos y agenda pastoral.", requirements: ["Documentos de identidad", "Partidas sacramentales requeridas", "Proceso prematrimonial"], fields: ["Integrantes de la pareja", "Fecha propuesta", "Responsable de acompañamiento", "Comunidad de referencia"] },
  { kind: "Unción de los enfermos", description: "Coordinación pastoral respetuosa y reservada según la solicitud recibida.", requirements: ["Contacto de referencia", "Preferencia de acompañamiento", "Lugar de visita (si aplica)"], fields: ["Contacto de referencia", "Franja de disponibilidad", "Lugar de visita", "Nota pastoral reservada"] },
  { kind: "Reconciliación", description: "Organización de horarios de atención pastoral; no se solicitan detalles personales.", requirements: ["Disponibilidad de atención", "Preferencia de contacto (opcional)"], fields: ["Franja horaria preferida", "Modalidad de atención", "Comunidad de referencia"] },
];

export type SacramentalEntryDemo = { id: string; book: "Bautismos" | "Confirmaciones" | "Matrimonios" | "Defunciones"; entry: string; date: string; dateISO: string; subject: string; celebrant: string; reference: string; note: string; folio: string };
export const sacramentalEntries: SacramentalEntryDemo[] = [
  { id: "LIB-DEMO-001", book: "Bautismos", entry: "Tomo DEMO-12 · Partida 084", date: "14 sep. 2026", dateISO: "2026-09-14", subject: "Persona de muestra 08", celebrant: "Celebrante de muestra A", reference: "Folio demostrativo 32", note: "Referencia de ejemplo; asiento de muestra.", folio: "084" },
  { id: "LIB-DEMO-002", book: "Bautismos", entry: "Tomo DEMO-12 · Partida 083", date: "08 sep. 2026", dateISO: "2026-09-08", subject: "Persona de muestra 09", celebrant: "Celebrante de muestra B", reference: "Folio demostrativo 31", note: "Observación documental ficticia.", folio: "083" },
  { id: "LIB-DEMO-003", book: "Confirmaciones", entry: "Tomo DEMO-05 · Partida 026", date: "21 ago. 2026", dateISO: "2026-08-21", subject: "Persona de muestra 10", celebrant: "Celebrante de muestra C", reference: "Folio demostrativo 14", note: "Asiento de ejemplo para consulta.", folio: "026" },
  { id: "LIB-DEMO-004", book: "Matrimonios", entry: "Tomo DEMO-03 · Partida 011", date: "06 jun. 2026", dateISO: "2026-06-06", subject: "Pareja de muestra 03", celebrant: "Celebrante de muestra A", reference: "Folio demostrativo 08", note: "Referencia cruzada ficticia.", folio: "011" },
  { id: "LIB-DEMO-005", book: "Defunciones", entry: "Tomo DEMO-02 · Partida 009", date: "19 may. 2026", dateISO: "2026-05-19", subject: "Persona de muestra 11", celebrant: "Celebrante de muestra D", reference: "Folio demostrativo 06", note: "Registro de ejemplo protegido.", folio: "009" },
];

export type DocumentRequestDemo = { id: string; kind: string; subject: string; requester: string; requested: string; delivered?: string; status: RecordStatus; recordVerified: boolean };
export const documentRequests: DocumentRequestDemo[] = [
  { id: "DOC-DEMO-021", kind: "Certificado de bautismo", subject: "Persona de muestra 08", requester: "Solicitante de muestra A", requested: "30 oct. 2026", status: "pending", recordVerified: true },
  { id: "DOC-DEMO-020", kind: "Certificado de confirmación", subject: "Persona de muestra 10", requester: "Solicitante de muestra B", requested: "29 oct. 2026", status: "active", recordVerified: true },
  { id: "DOC-DEMO-019", kind: "Certificado de matrimonio", subject: "Pareja de muestra 03", requester: "Solicitante de muestra C", requested: "27 oct. 2026", delivered: "29 oct. 2026", status: "approved", recordVerified: true },
  { id: "DOC-DEMO-018", kind: "Constancia parroquial", subject: "Referencia de muestra D", requester: "Solicitante de muestra D", requested: "25 oct. 2026", status: "pending", recordVerified: false },
];
