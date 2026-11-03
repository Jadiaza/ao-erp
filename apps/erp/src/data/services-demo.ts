import { parishDemoSites } from "@/data/parish-demo";
import { dioceseParishes } from "@/data/institutional-demo";
import { parishGroups } from "@/data/pastoral-demo";

export type ParishRequestDemo = { id: string; kind: string; created: string; status: "En revisión" | "Listo para recoger" | "Recibido"; step: number; note: string };
export const parishRequestsDemo: ParishRequestDemo[] = [
  { id: "SOL-2026-084", kind: "Certificado parroquial", created: "28 oct. 2026", status: "En revisión", step: 2, note: "La secretaría está revisando la solicitud de muestra." },
  { id: "SOL-2026-071", kind: "Constancia de participación", created: "16 oct. 2026", status: "Listo para recoger", step: 3, note: "Disponible en la oficina parroquial según este flujo ficticio." },
  { id: "SOL-2026-052", kind: "Orientación pastoral", created: "2 oct. 2026", status: "Recibido", step: 4, note: "Solicitud cerrada en la demostración." },
];

export const parishServicesDemo = [
  { title: "Solicitar un documento", description: "Consulta el estado de una solicitud dirigida a secretaría.", icon: "document" },
  { title: "Agenda comunitaria", description: "Conoce celebraciones, encuentros y actividades próximas.", icon: "calendar" },
  { title: "Orientación pastoral", description: "Encuentra canales de atención y acompañamiento.", icon: "heart" },
];

export const communityEventsDemo = [
  { date: "04 NOV", time: "18:30", title: "Encuentro de comunidad", place: parishDemoSites.hall.name, type: "Comunidad" },
  { date: "08 NOV", time: "10:00", title: "Celebración dominical", place: parishDemoSites.temple.name, type: "Celebración" },
  { date: "12 NOV", time: "16:00", title: "Jornada de servicio fraterno", place: parishDemoSites.pastoralCenter.name, type: "Acción comunitaria" },
];

export type CommunicationDemo = { id: string; title: string; kind: "Interna" | "Parroquial" | "Comunidad" | "Diocesana"; channel: string; audience: string; date: string; status: "Publicado" | "Programado" | "Borrador"; body: string };
export const communicationsDemo: CommunicationDemo[] = [
  { id: "COM-118", title: "Invitación a la jornada de servicio", kind: "Comunidad", channel: "Tablón y boletín", audience: "Comunidad parroquial", date: "12 nov. 2026", status: "Programado", body: "Te invitamos a participar en la jornada de servicio fraterno. Será un espacio para encontrarnos y colaborar con nuestra comunidad. Consulta los detalles en la oficina parroquial." },
  { id: "COM-117", title: "Reunión de coordinación pastoral", kind: "Interna", channel: "Panel interno", audience: "Equipos pastorales", date: "30 oct. 2026", status: "Publicado", body: "Recordamos la reunión de coordinación del próximo martes. Agradecemos confirmar la participación con su responsable de equipo." },
  { id: "COM-116", title: "Aviso de horario de secretaría", kind: "Parroquial", channel: "Boletín parroquial", audience: "Feligreses y visitantes", date: "27 oct. 2026", status: "Publicado", body: "Durante esta semana la secretaría atenderá en horario habitual. Para orientación, acércate al punto de información parroquial." },
  { id: "COM-115", title: "Circular de encuentro diocesano", kind: "Diocesana", channel: "Panel interno", audience: "Responsables institucionales", date: "18 oct. 2026", status: "Borrador", body: "La delegación invita al encuentro anual de responsables. Próximamente se compartirán detalles de inscripción y agenda." },
];

export const communicationTemplates = ["Aviso parroquial", "Invitación comunitaria", "Circular interna", "Campaña pastoral", "Comunicado diocesano"];

export type AssistantDemoCategory = "Administrativa" | "Pastoral" | "Contable" | "Documental" | "Uso del sistema";
export type AssistantDemoAnswer = { category: AssistantDemoCategory; answer: string; context: string };
export const assistantQuestionsDemo = [
  "¿Qué parroquias tienen pendiente presentar el informe anual?",
  "¿Cuál es el avance de ejecución presupuestal?",
  "¿Cuántos grupos parroquiales están registrados?",
  "¿Qué actividades pastorales están programadas?",
  "¿Cómo se consulta una partida sacramental?",
];
export const assistantAnswersDemo: Record<string, AssistantDemoAnswer> = {
  [assistantQuestionsDemo[0]!]: { category: "Administrativa", answer: `En el conjunto territorial ficticio hay ${dioceseParishes.filter((parish) => parish.report === "Pendiente").length} parroquia(s) con informe pendiente y ${dioceseParishes.filter((parish) => parish.report === "Con observaciones").length} con observaciones. El directorio muestra estados agregados de ejemplo y no concede acceso a información parroquial.`, context: "Ejemplo de respuesta institucional · datos de muestra del módulo Gestión diocesana." },
  [assistantQuestionsDemo[1]!]: { category: "Contable", answer: "La vista presupuestal de ejemplo muestra una ejecución global ilustrativa del 78%. Puedes abrir Presupuestos y revisar la comparación por área y periodo. El porcentaje no representa un cálculo financiero productivo.", context: "Módulo Presupuestos · valores ficticios sin conexión contable." },
  [assistantQuestionsDemo[2]!]: { category: "Pastoral", answer: `El directorio ficticio contiene ${parishGroups.length} grupos, movimientos y ministerios registrados en la parroquia de muestra. Puedes consultarlos en Grupos, movimientos y ministerios.`, context: "Resumen de muestra · módulo de comunidades y ministerios." },
  [assistantQuestionsDemo[3]!]: { category: "Pastoral", answer: "La agenda demostrativa incluye encuentros comunitarios, celebraciones y jornadas de servicio durante noviembre. Consulta Agenda e infraestructura o Liturgia y celebraciones para ver sus vistas respectivas.", context: "Agendas locales de demostración · no se consultaron calendarios externos." },
  [assistantQuestionsDemo[4]!]: { category: "Documental", answer: "Abre Libros sacramentales y busca el tipo de libro y la referencia de partida. El acceso a una partida requiere autorización y consulta justificada; esta demostración no expone registros personales.", context: "Instrucción de uso · el asistente no consulta partidas ni datos sacramentales." },
};
