export type ParishReportSection = { id: string; title: string; area: string; progress: number; status: "Completa" | "En revisión" | "Pendiente"; summary: string; owner: string; updated: string };
export const parishReportSections: ParishReportSection[] = [
  { id: "identity", title: "Identificación institucional", area: "Institucional", progress: 100, status: "Completa", summary: `${parishDemo.officialName} · ${parishDemo.jurisdictionName} · ${parishDemo.period}.`, owner: parishDemoPeople.secretary.role, updated: "28 oct. 2026 · demo" },
  { id: "pastoral", title: "Memoria pastoral", area: "Pastoral", progress: 82, status: "En revisión", summary: "Objetivos, actividades, programas, grupos, evangelización, formación y acción social.", owner: "Coordinación pastoral", updated: "30 oct. 2026" },
  { id: "sacraments", title: "Vida sacramental", area: "Pastoral", progress: 68, status: "En revisión", summary: "Resumen agregado de celebraciones sacramentales y referencias documentales.", owner: "Secretaría sacramental", updated: "29 oct. 2026" },
  { id: "administration", title: "Gestión administrativa", area: "Administrativa", progress: 54, status: "Pendiente", summary: "Organización, recursos humanos, gestión documental y actividades administrativas.", owner: "Administración", updated: "24 oct. 2026" },
  { id: "economy", title: "Gestión económica", area: "Económica", progress: 42, status: "Pendiente", summary: "Ingresos, egresos, ejecución presupuestal, estados y soportes de muestra.", owner: "Tesorería", updated: "25 oct. 2026" },
  { id: "assets", title: "Patrimonio", area: "Institucional", progress: 76, status: "En revisión", summary: "Inventario, inmuebles, mantenimiento y situación patrimonial resumida.", owner: "Responsable de patrimonio", updated: "27 oct. 2026" },
  { id: "annexes", title: "Anexos y seguimiento", area: "Cierre", progress: 25, status: "Pendiente", summary: "Evidencias, documentos adjuntos, observaciones y constancia de presentación.", owner: "Párroco administrador", updated: "21 oct. 2026" },
];

export type DioceseParish = { id: string; name: string; vicarage: string; pastor: string; report: string; updated: string; commitments: number; note: string };
export const dioceseParishes: DioceseParish[] = [
  { id: parishDemo.id, name: parishDemo.officialName, vicarage: "Referencia territorial ficticia", pastor: parishDemoPeople.pastor.name, report: "En elaboración", updated: "30 oct. 2026 · demo", commitments: 1, note: "Estado agregado de muestra; el vínculo ilustrativo no concede acceso a registros parroquiales." },
  { id: "PAR-021", name: "San José Obrero", vicarage: "Norte", pastor: "P. Mateo Ríos", report: "En elaboración", updated: "28 oct. 2026", commitments: 2, note: "Seguimiento solicitado sobre calendario pastoral." },
  { id: "PAR-008", name: "Nuestra Señora del Encuentro", vicarage: "Sur", pastor: "P. Gabriel Ocampo", report: "Pendiente", updated: "—", commitments: 1, note: "Recordatorio de presentación previsto para noviembre." },
  { id: "PAR-032", name: "San Lucas Evangelista", vicarage: "Centro", pastor: "P. Julián Pardo", report: "Recibido", updated: "26 oct. 2026", commitments: 0, note: "Informe recibido; revisión institucional en curso." },
  { id: "PAR-017", name: "Santa Clara de Asís", vicarage: "Oriente", pastor: "Hna. Elena Duarte", report: "Con observaciones", updated: "29 oct. 2026", commitments: 3, note: "Falta completar el apartado de seguimiento y anexos." },
];

export type EventRecurrence = "Única" | "Semanal" | "Quincenal" | "Mensual";
export type InstitutionalEvent = {
  id: string;
  date: string;
  iso: string;
  time: string;
  endTime?: string | undefined;
  title: string;
  type: string;
  place: string;
  facilityId?: string | undefined;
  responsible: string;
  responsiblePersonId?: string | undefined;
  participants: string;
  reminder: string;
  recurrence?: EventRecurrence | undefined;
  organizationId?: string | undefined;
  campusId?: string | undefined;
};
export type AttendanceRecord = {
  id: string;
  eventId: string;
  personId?: string | undefined;
  groupId?: string | undefined;
  personOrGroup: string;
  scope: "Persona" | "Grupo" | "Actividad";
  present: boolean;
  note?: string | undefined;
  organizationId?: string | undefined;
  campusId?: string | undefined;
  dateISO?: string | undefined;
};

export function detectScheduleConflict(
  events: InstitutionalEvent[],
  candidate: Pick<InstitutionalEvent, "id" | "iso" | "time" | "endTime" | "place" | "facilityId" | "organizationId">,
): InstitutionalEvent | undefined {
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const candStart = toMinutes(candidate.time || "00:00");
  const candEnd = candidate.endTime ? toMinutes(candidate.endTime) : candStart + 90;

  return events.find((existing) => {
    if (existing.id === candidate.id) return false;
    if (candidate.organizationId && existing.organizationId && existing.organizationId !== candidate.organizationId) {
      return false;
    }
    if (existing.iso !== candidate.iso) return false;
    const sameSpace =
      (candidate.facilityId && existing.facilityId && existing.facilityId === candidate.facilityId) ||
      existing.place.trim().toLowerCase() === candidate.place.trim().toLowerCase();
    if (!sameSpace) return false;
    const exStart = toMinutes(existing.time || "00:00");
    const exEnd = existing.endTime ? toMinutes(existing.endTime) : exStart + 90;
    return candStart < exEnd && candEnd > exStart;
  });
}
export const institutionalEvents: InstitutionalEvent[] = [
  { id: "EV-101", date: "4 nov. 2026", iso: "2026-11-04", time: "09:00", title: "Consejo pastoral parroquial · muestra", type: "Reunión", place: parishDemoSites.parishOffice.name, responsible: parishDemoPeople.pastor.name, participants: "Responsables de muestra", reminder: "Un día antes", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-102", date: "6 nov. 2026", iso: "2026-11-06", time: "18:30", title: "Encuentro comunitario de oración · muestra", type: "Actividad comunitaria", place: parishDemoSites.temple.name, responsible: "Equipo litúrgico de muestra", participants: "Comunidad parroquial · demo", reminder: "Dos horas antes", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-103", date: "12 nov. 2026", iso: "2026-11-12", time: "14:00", title: "Jornada de formación parroquial · muestra", type: "Formación", place: parishDemoSites.pastoralCenter.name, responsible: parishDemoPeople.pastoral.name, participants: "Agentes pastorales de muestra", reminder: "Un día antes", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-104", date: "18 nov. 2026", iso: "2026-11-18", time: "10:00", title: "Revisión administrativa · muestra", type: "Seguimiento", place: parishDemoSites.parishOffice.name, responsible: parishDemoPeople.administrator.name, participants: "Equipo responsable de muestra", reminder: "La mañana del evento", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-105", date: "24 nov. 2026", iso: "2026-11-24", time: "16:00", title: "Encuentro de comunidades · muestra", type: "Evento", place: parishDemoSites.hall.name, responsible: parishDemoPeople.pastoral.name, participants: "Representantes de grupos de muestra", reminder: "Un día antes", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
];

export const christianEvents: InstitutionalEvent[] = [
  { id: "EV-CRI-101", date: "4 nov. 2026", iso: "2026-11-04", time: "19:00", endTime: "20:30", title: "Reunión de líderes y ministerios", type: "Reunión", place: "Salón de ministerios y jóvenes", facilityId: "ESP-CRI-02", responsible: "Pastor principal · demo", participants: "Líderes de ministerios", reminder: "Un día antes", recurrence: "Mensual", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-CRI-102", date: "6 nov. 2026", iso: "2026-11-06", time: "19:30", endTime: "21:00", title: "Culto de oración y adoración", type: "Culto", place: "Auditorio congregacional", facilityId: "ESP-CRI-01", responsible: "Ministerio de Alabanza", participants: "Toda la congregación", reminder: "Dos horas antes", recurrence: "Semanal", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-CRI-103", date: "8 nov. 2026", iso: "2026-11-08", time: "10:00", endTime: "12:00", title: "Culto dominical general", type: "Culto", place: "Auditorio congregacional", facilityId: "ESP-CRI-01", responsible: "Miembro de muestra 01", responsiblePersonId: "MBR-DEMO-001", participants: "Miembros y visitantes", reminder: "Un día antes", recurrence: "Semanal", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-CRI-104", date: "12 nov. 2026", iso: "2026-11-12", time: "19:00", endTime: "20:30", title: "Encuentro de Célula Norte", type: "Célula", place: "Casa anfitriona Sector Norte", responsible: "Responsable de célula B", participants: "Célula Norte", reminder: "Un día antes", recurrence: "Semanal", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "EV-CRI-105", date: "15 nov. 2026", iso: "2026-11-15", time: "10:30", endTime: "12:00", title: "Culto sede secundaria", type: "Culto", place: "Auditorio Sede Secundaria", facilityId: "ESP-CRI-04", responsible: "Miembro de muestra 05", responsiblePersonId: "MBR-DEMO-005", participants: "Congregación sede secundaria", reminder: "Un día antes", recurrence: "Semanal", organizationId: "ORG-DEMO-001", campusId: "SEDE-SECUNDARIA" },
];

export type Facility = {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: string;
  condition: string;
  responsible: string;
  nextMaintenance: string;
  note: string;
  organizationId?: string;
  campusId?: string;
};
export const facilities: Facility[] = [
  { id: parishDemoSites.temple.id, name: parishDemoSites.temple.name, type: parishDemoSites.temple.kind, location: parishDemoSites.temple.location, capacity: "420 personas · capacidad de muestra", condition: "Bueno", responsible: parishDemoPeople.administrator.name, nextMaintenance: "Ene. 2027 · muestra", note: "Ficha demostrativa; revisión preventiva ilustrativa." },
  { id: parishDemoSites.hall.id, name: parishDemoSites.hall.name, type: parishDemoSites.hall.kind, location: parishDemoSites.hall.location, capacity: "85 personas · capacidad de muestra", condition: "Bueno", responsible: parishDemoPeople.pastoral.name, nextMaintenance: "Dic. 2026 · muestra", note: "Capacidad y mantenimiento ficticios." },
  { id: parishDemoSites.rectory.id, name: parishDemoSites.rectory.kind === "Casa cural" ? parishDemoSites.rectory.name : parishDemoSites.rectory.name, type: parishDemoSites.rectory.kind, location: parishDemoSites.rectory.location, capacity: "Uso interno · muestra", condition: "Requiere revisión", responsible: parishDemoPeople.administrator.name, nextMaintenance: "Nov. 2026 · muestra", note: "Inspección ilustrativa de cubierta." },
  { id: parishDemoSites.pastoralCenter.id, name: parishDemoSites.pastoralCenter.name, type: parishDemoSites.pastoralCenter.kind, location: parishDemoSites.pastoralCenter.location, capacity: "60 personas · capacidad de muestra", condition: "Bueno", responsible: parishDemoPeople.pastoral.name, nextMaintenance: "Feb. 2027 · muestra", note: "Sin novedades en esta ficha ficticia." },
  { id: parishDemoSites.parishOffice.id, name: parishDemoSites.parishOffice.name, type: parishDemoSites.parishOffice.kind, location: parishDemoSites.parishOffice.location, capacity: "Atención administrativa · muestra", condition: "Bueno", responsible: parishDemoPeople.secretary.name, nextMaintenance: "Mar. 2027 · muestra", note: "Mantenimiento ilustrativo." },
];

export const christianFacilities: Facility[] = [
  { id: "ESP-CRI-01", name: "Auditorio congregacional", type: "Auditorio principal", location: "Sede Principal", capacity: "450 personas · demo", condition: "Bueno", responsible: "Coordinación operativa · demo", nextMaintenance: "Ene. 2027 · muestra", note: "Espacio principal para cultos generales.", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "ESP-CRI-02", name: "Salón de ministerios y jóvenes", type: "Salón múltiple", location: "Sede Principal", capacity: "90 personas · demo", condition: "Bueno", responsible: "Enlace pastoral C", nextMaintenance: "Dic. 2026 · muestra", note: "Reuniones juveniles y formación.", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "ESP-CRI-03", name: "Oficina administrativa y pastoral", type: "Oficina", location: "Sede Principal", capacity: "Atención y consejería · demo", condition: "Bueno", responsible: "Administración · demo", nextMaintenance: "Mar. 2027 · muestra", note: "Atención administrativa y citas pastorales.", organizationId: "ORG-DEMO-001", campusId: "SEDE-PRINCIPAL" },
  { id: "ESP-CRI-04", name: "Auditorio Sede Secundaria", type: "Sede alterna", location: "Sede Secundaria", capacity: "160 personas · demo", condition: "Bueno", responsible: "Líder de sede · demo", nextMaintenance: "Feb. 2027 · muestra", note: "Cultos y reuniones de sede alterna.", organizationId: "ORG-DEMO-001", campusId: "SEDE-SECUNDARIA" },
];
import { parishDemo, parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

