import type { RecordStatus } from "@/data/demo-types";
import { parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

export type FormationProgram = {
  id: string;
  name: string;
  stage: string;
  duration: string;
  groups: number;
  participants: number;
  lead: string;
  progress: number;
  status: RecordStatus;
  itinerary: string[];
  materials: string[];
};
export type FormationGroup = {
  id: string;
  name: string;
  stage: string;
  programId: string;
  catechist: string;
  schedule: string;
  participants: number;
  attendance: number;
  status: RecordStatus;
};
export type FormationParticipant = {
  id: string;
  name: string;
  groupId: string;
  guardian: string;
  attendance: number;
  progress: string;
  nextEncounter: string;
  status: RecordStatus;
};

export const formationPrograms: FormationProgram[] = [
  {
    id: "FOR-DEMO-01",
    name: "Iniciación cristiana · etapa inicial",
    stage: "Infancia",
    duration: "10 meses",
    groups: 4,
    participants: 62,
    lead: "Coordinación formativa A",
    progress: 68,
    status: "active",
    itinerary: ["Acogida y comunidad", "Relato bíblico", "Vida celebrativa", "Servicio y misión"],
    materials: ["Guía de encuentros 01", "Cuaderno de actividades", "Lecturas para el hogar"],
  },
  {
    id: "FOR-DEMO-02",
    name: "Preparación para la Confirmación",
    stage: "Juventud",
    duration: "8 meses",
    groups: 3,
    participants: 48,
    lead: "Coordinación formativa B",
    progress: 54,
    status: "active",
    itinerary: [
      "Identidad y pertenencia",
      "Espíritu y comunidad",
      "Discernimiento",
      "Compromiso misionero",
    ],
    materials: ["Itinerario juvenil", "Guía para acompañantes", "Recursos audiovisuales"],
  },
  {
    id: "FOR-DEMO-03",
    name: "Formación bíblica comunitaria",
    stage: "Adultos",
    duration: "12 encuentros",
    groups: 2,
    participants: 31,
    lead: "Equipo bíblico de muestra",
    progress: 82,
    status: "approved",
    itinerary: ["Lectura contextual", "Géneros bíblicos", "Palabra y vida", "Lectura comunitaria"],
    materials: ["Cuaderno bíblico", "Mapa de lectura", "Fichas para grupos"],
  },
];
export const formationGroups: FormationGroup[] = [
  {
    id: "CAT-DEMO-11",
    name: "Semillas · sábado",
    stage: "Iniciación · infancia",
    programId: "FOR-DEMO-01",
    catechist: "Catequista de muestra 01",
    schedule: "Sábados · 9:00 a. m.",
    participants: 18,
    attendance: 91,
    status: "active",
  },
  {
    id: "CAT-DEMO-12",
    name: "Camino · domingo",
    stage: "Confirmación · juventud",
    programId: "FOR-DEMO-02",
    catechist: "Catequista de muestra 02",
    schedule: "Domingos · 10:30 a. m.",
    participants: 16,
    attendance: 84,
    status: "active",
  },
  {
    id: "CAT-DEMO-13",
    name: "Lectura en comunidad",
    stage: "Formación bíblica · adultos",
    programId: "FOR-DEMO-03",
    catechist: "Acompañante de muestra 03",
    schedule: "Miércoles · 6:00 p. m.",
    participants: 15,
    attendance: 88,
    status: "active",
  },
  {
    id: "CAT-DEMO-14",
    name: "Primeros pasos",
    stage: "Iniciación · infancia",
    programId: "FOR-DEMO-01",
    catechist: "Catequista de muestra 04",
    schedule: "Viernes · 4:00 p. m.",
    participants: 14,
    attendance: 79,
    status: "pending",
  },
];
export const formationParticipants: FormationParticipant[] = [
  {
    id: "PAR-FOR-01",
    name: "Participante de muestra 01",
    groupId: "CAT-DEMO-11",
    guardian: "Acudiente de muestra A",
    attendance: 92,
    progress: "Etapa 3 de 4",
    nextEncounter: "7 nov. 2026",
    status: "active",
  },
  {
    id: "PAR-FOR-02",
    name: "Participante de muestra 02",
    groupId: "CAT-DEMO-11",
    guardian: "Acudiente de muestra B",
    attendance: 86,
    progress: "Etapa 3 de 4",
    nextEncounter: "7 nov. 2026",
    status: "active",
  },
  {
    id: "PAR-FOR-03",
    name: "Participante de muestra 03",
    groupId: "CAT-DEMO-12",
    guardian: "Contacto familiar de muestra",
    attendance: 78,
    progress: "Etapa 2 de 4",
    nextEncounter: "8 nov. 2026",
    status: "pending",
  },
  {
    id: "PAR-FOR-04",
    name: "Participante de muestra 04",
    groupId: "CAT-DEMO-13",
    guardian: "No aplica",
    attendance: 100,
    progress: "Etapa 4 de 4",
    nextEncounter: "11 nov. 2026",
    status: "approved",
  },
];

export type ParishGroupDemo = {
  id: string;
  name: string;
  kind:
    | "Grupo parroquial"
    | "Movimiento"
    | "Comunidad"
    | "Ministerio litúrgico"
    | "Asociación"
    | "Apostolado";
  coordinator: string;
  members: number;
  schedule: string;
  nextActivity: string;
  participation: number;
  status: RecordStatus;
  purpose: string;
  activities: string[];
};
export const parishGroups: ParishGroupDemo[] = [
  {
    id: "GRP-DEMO-01",
    name: "Coro de la Esperanza",
    kind: "Ministerio litúrgico",
    coordinator: "Coordinación musical A",
    members: 22,
    schedule: "Jueves · 6:30 p. m.",
    nextActivity: "Ensayo comunitario · 5 nov.",
    participation: 91,
    status: "active",
    purpose: "Servicio musical en las celebraciones comunitarias.",
    activities: ["Ensayo semanal", "Preparación de repertorio", "Servicio dominical"],
  },
  {
    id: "GRP-DEMO-02",
    name: "Comunidad Emaús",
    kind: "Comunidad",
    coordinator: "Responsable de comunidad B",
    members: 16,
    schedule: "Martes · 7:00 p. m.",
    nextActivity: "Encuentro fraterno · 10 nov.",
    participation: 86,
    status: "active",
    purpose: "Espacio comunitario de encuentro, oración y servicio.",
    activities: ["Encuentro semanal", "Lectura comunitaria", "Visita solidaria"],
  },
  {
    id: "GRP-DEMO-03",
    name: "Movimiento Sembradores",
    kind: "Movimiento",
    coordinator: "Enlace pastoral C",
    members: 31,
    schedule: "Sábados · 3:00 p. m.",
    nextActivity: "Jornada formativa · 7 nov.",
    participation: 79,
    status: "active",
    purpose: "Acompañamiento juvenil y compromiso comunitario.",
    activities: ["Formación juvenil", "Campamento de servicio", "Encuentro mensual"],
  },
  {
    id: "GRP-DEMO-04",
    name: "Equipo de lectores",
    kind: "Ministerio litúrgico",
    coordinator: "Coordinación litúrgica D",
    members: 14,
    schedule: "Primer lunes · 6:00 p. m.",
    nextActivity: "Preparación dominical · 8 nov.",
    participation: 94,
    status: "active",
    purpose: "Preparación y servicio de la proclamación de la Palabra.",
    activities: ["Rota de servicio", "Lectio preparatoria", "Taller de proclamación"],
  },
  {
    id: "GRP-DEMO-05",
    name: "Asociación Manos Abiertas",
    kind: "Asociación",
    coordinator: "Coordinación de servicio E",
    members: 19,
    schedule: "Miércoles · 5:00 p. m.",
    nextActivity: "Organización de donaciones · 11 nov.",
    participation: 72,
    status: "pending",
    purpose: "Organización de apoyo solidario y acompañamiento a familias.",
    activities: ["Clasificación de aportes", "Acompañamiento familiar", "Jornada comunitaria"],
  },
];

export type PastoralProject = {
  id: string;
  name: string;
  area: "Pastoral" | "Acción social";
  lead: string;
  participants: number;
  volunteers: number;
  budget: string;
  progress: number;
  status: RecordStatus;
  goal: string;
  activities: string[];
  evidence: string[];
  outcome: string;
};
export const pastoralProjects: PastoralProject[] = [
  {
    id: "PRO-DEMO-01",
    name: "Escucha y acompañamiento comunitario",
    area: "Pastoral",
    lead: "Equipo de acompañamiento A",
    participants: 36,
    volunteers: 8,
    budget: "$ 1.200.000",
    progress: 72,
    status: "active",
    goal: "Ofrecer espacios de escucha, orientación pastoral y encuentro comunitario.",
    activities: [
      "Círculos de escucha",
      "Encuentros de acompañamiento",
      "Derivación responsable a redes de apoyo",
    ],
    evidence: ["Bitácora agregada", "Calendario de encuentros", "Informe narrativo"],
    outcome: "36 participaciones registradas en los encuentros.",
  },
  {
    id: "PRO-DEMO-02",
    name: "Mesa solidaria parroquial",
    area: "Acción social",
    lead: "Equipo social de muestra B",
    participants: 58,
    volunteers: 12,
    budget: "$ 3.850.000",
    progress: 63,
    status: "active",
    goal: "Acompañar a hogares en situación de vulnerabilidad con apoyo alimentario y orientación.",
    activities: [
      "Jornadas de entrega",
      "Orientación a hogares",
      "Articulación con redes comunitarias",
    ],
    evidence: ["Registro agregado de entregas", "Acta de jornada", "Seguimiento de recursos"],
    outcome: "42 hogares de referencia recibieron acompañamiento en el ciclo.",
  },
  {
    id: "PRO-DEMO-03",
    name: "Misión en los sectores",
    area: "Pastoral",
    lead: "Equipo misionero C",
    participants: 44,
    volunteers: 15,
    budget: "$ 980.000",
    progress: 88,
    status: "approved",
    goal: "Fortalecer la presencia pastoral y la participación comunitaria por sectores.",
    activities: ["Visitas comunitarias", "Encuentros de oración", "Jornada de servicio"],
    evidence: ["Mapa agregado de visitas", "Memoria de actividades"],
    outcome: "Se realizaron actividades en 6 sectores comunitarios.",
  },
  {
    id: "PRO-DEMO-04",
    name: "Red de cuidado y bienestar",
    area: "Acción social",
    lead: "Equipo de cuidado D",
    participants: 27,
    volunteers: 9,
    budget: "$ 2.100.000",
    progress: 41,
    status: "pending",
    goal: "Facilitar orientación y acompañamiento a personas mayores y cuidadores.",
    activities: [
      "Encuentro de cuidadores",
      "Orientación comunitaria",
      "Red de llamadas solidarias",
    ],
    evidence: ["Guía informativa", "Resumen de encuentros"],
    outcome: "Actividad piloto en fase de organización.",
  },
];

export type LiturgicalService = { role: string; people: string[] };
export type LiturgicalCelebration = {
  id: string;
  title: string;
  kind: string;
  date: string;
  dateISO: string;
  time: string;
  place: string;
  priest: string;
  intention: string;
  services: LiturgicalService[];
  preparation: string;
  status: RecordStatus;
};
export const liturgicalCelebrations: LiturgicalCelebration[] = [
  {
    id: "LIT-DEMO-01",
    title: "Eucaristía dominical · muestra",
    kind: "Eucaristía · agenda ficticia",
    date: "1 nov. 2026",
    dateISO: "2026-11-01",
    time: "8:00 a. m.",
    place: parishDemoSites.temple.name,
    priest: parishDemoPeople.celebrantA.name,
    intention: "Texto litúrgico general · comunidad de muestra",
    services: [
      { role: "Lectores", people: ["Lector de muestra 01", "Lector de muestra 02"] },
      { role: "Salmista", people: ["Salmista de muestra A"] },
      { role: "Acólitos", people: ["Equipo de acólitos A"] },
    ],
    preparation: "Lecturas y equipos · referencia ficticia",
    status: "approved",
  },
  {
    id: "LIT-DEMO-02",
    title: "Celebración de la Palabra · muestra",
    kind: "Celebración litúrgica · agenda ficticia",
    date: "5 nov. 2026",
    dateISO: "2026-11-05",
    time: "6:00 p. m.",
    place: parishDemoSites.chapel.name,
    priest: parishDemoPeople.ministerB.name,
    intention: "Texto litúrgico general · encuentro comunitario de muestra",
    services: [
      { role: "Lectores", people: ["Equipo de lectores de muestra"] },
      { role: "Música", people: ["Coro de la Esperanza · muestra"] },
    ],
    preparation: "Guion de muestra",
    status: "active",
  },
  {
    id: "LIT-DEMO-03",
    title: "Eucaristía por la comunidad · muestra",
    kind: "Eucaristía · agenda ficticia",
    date: "8 nov. 2026",
    dateISO: "2026-11-08",
    time: "10:00 a. m.",
    place: parishDemoSites.temple.name,
    priest: parishDemoPeople.celebrantC.name,
    intention: "Texto litúrgico general · familias de muestra",
    services: [
      { role: "Lectores", people: ["Lector de muestra 03"] },
      { role: "Salmista", people: ["Salmista de muestra B"] },
      { role: "Ministros", people: ["Ministros de muestra"] },
    ],
    preparation: "Equipos de referencia ficticia",
    status: "pending",
  },
  {
    id: "LIT-DEMO-04",
    title: "Adoración comunitaria · muestra",
    kind: "Oración litúrgica · agenda ficticia",
    date: "12 nov. 2026",
    dateISO: "2026-11-12",
    time: "7:00 p. m.",
    place: parishDemoSites.chapel.name,
    priest: parishDemoPeople.celebrantA.name,
    intention: "Texto litúrgico general · oración comunitaria de muestra",
    services: [
      { role: "Música", people: ["Equipo de música de muestra B"] },
      { role: "Acogida", people: ["Equipo de acogida de muestra"] },
    ],
    preparation: "Espacio y guion de referencia",
    status: "pending",
  },
];

export type PastoralActivity = {
  id?: string;
  name: string;
  date: string;
  status: RecordStatus;
  progress?: number;
  responsibleId?: string;
  groupId?: string;
  observation?: string;
};
export type PastoralObjective = {
  id: string;
  line: string;
  objective: string;
  program: string;
  project: string;
  lead: string;
  responsibleId?: string;
  progress: number;
  target: string;
  indicator: string;
  activities: PastoralActivity[];
};
export const pastoralObjectives: PastoralObjective[] = [
  {
    id: "OBJ-DEMO-01",
    line: "Comunidad y participación",
    objective: "Fortalecer comunidades de encuentro y corresponsabilidad en los sectores.",
    program: "Programa Comunidades en camino",
    project: "Proyecto Encuentros sectoriales",
    lead: "Equipo pastoral A",
    progress: 74,
    target: "8 comunidades activas",
    indicator: "Comunidades con encuentros regulares",
    activities: [
      { name: "Mapa comunitario", date: "Oct. 2026", status: "approved" },
      { name: "Encuentros sectoriales", date: "Nov. 2026", status: "active" },
      { name: "Evaluación participativa", date: "Dic. 2026", status: "pending" },
    ],
  },
  {
    id: "OBJ-DEMO-02",
    line: "Formación y misión",
    objective: "Ampliar los procesos formativos y el servicio evangelizador de la comunidad.",
    program: "Programa Formación para la misión",
    project: "Proyecto Itinerarios de formación",
    lead: "Coordinación formativa B",
    progress: 58,
    target: "120 participantes",
    indicator: "Participantes que completan itinerarios",
    activities: [
      { name: "Diseño de itinerarios", date: "Sep. 2026", status: "approved" },
      { name: "Ciclo de formación", date: "Nov. 2026", status: "active" },
      { name: "Memoria formativa", date: "Ene. 2027", status: "pending" },
    ],
  },
  {
    id: "OBJ-DEMO-03",
    line: "Cuidado y servicio",
    objective: "Articular acciones de cuidado comunitario con redes solidarias locales.",
    program: "Programa Redes de cuidado",
    project: "Proyecto Alianzas para el servicio",
    lead: "Equipo social C",
    progress: 43,
    target: "4 acciones articuladas",
    indicator: "Acciones con seguimiento y evaluación",
    activities: [
      { name: "Identificación de redes", date: "Oct. 2026", status: "approved" },
      { name: "Jornadas de servicio", date: "Nov. 2026", status: "active" },
      { name: "Evaluación de ciclo", date: "Feb. 2027", status: "pending" },
    ],
  },
];
