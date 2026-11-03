import type { DemoDataset } from "@/data/demo-types";
import { parishDemo } from "@/data/parish-demo";

/** Fixture genérico legado, no consumido por las pantallas actuales. */
export const demoData: DemoDataset = {
  indicators: [
    { id: "members", label: "Feligreses de muestra", value: 5, caption: "Conjunto ficticio · no es un censo" },
    { id: "families", label: "Familias de muestra", value: 2, caption: "Referencias ficticias" },
    { id: "sacraments", label: "Referencias sacramentales", value: 5, caption: "No son partidas oficiales" },
    { id: "requests", label: "Solicitudes de ejemplo", value: 3, caption: "Sin recepción ni seguimiento real" },
  ],
  records: [
    { id: "REC-DEMO-001", title: "Referencia documental ficticia", description: parishDemo.officialName, status: "active", createdAt: "2026-10-28" },
    { id: "REC-DEMO-002", title: "Vista previa de documento · demo", description: "No representa certificado ni registro oficial", status: "pending", createdAt: "2026-10-27" },
    { id: "REC-DEMO-003", title: "Ficha de inventario · demo", description: "Sede ficticia de la parroquia de muestra", status: "approved", createdAt: "2026-10-24" },
  ],
  activities: [
    { id: "ACT-DEMO-01", title: "Referencia de muestra consultada", description: "Actividad ilustrativa, sin cambio persistente.", date: "02 nov. 2026 · demo", actor: "Secretaría de muestra A" },
    { id: "ACT-DEMO-02", title: "Solicitud ficticia visualizada", description: "No representa una solicitud real ni oficial.", date: "01 nov. 2026 · demo", actor: "Atención parroquial de muestra" },
    { id: "ACT-DEMO-03", title: "Informe de muestra revisado", description: "Actividad sintética del conjunto de ejemplo.", date: "28 oct. 2026 · demo", actor: "Administrador de muestra" },
  ],
  movements: [
    { id: "MOV-DEMO-01", date: "2026-10-30", description: "Ingreso ilustrativo de muestra", reference: "REF-DEMO-01", amount: 845000, direction: "income", status: "approved" },
    { id: "MOV-DEMO-02", date: "2026-10-29", description: "Egreso ilustrativo de muestra", reference: "REF-DEMO-02", amount: 326500, direction: "expense", status: "paid" },
    { id: "MOV-DEMO-03", date: "2026-10-28", description: "Egreso ficticio para ejemplo", reference: "REF-DEMO-03", amount: 148000, direction: "expense", status: "pending" },
  ],
  people: [
    { id: "FEL-DEMO-001", fullName: "Persona de muestra 01", email: "persona01@example.test", phone: "+57 300 000 0101 · ficticio", status: "active", familyId: "FAM-DEMO-01" },
    { id: "FEL-DEMO-002", fullName: "Persona de muestra 02", email: "persona02@example.test", phone: "+57 300 000 0102 · ficticio", status: "active", familyId: "FAM-DEMO-01" },
    { id: "FEL-DEMO-003", fullName: "Persona de muestra 03", email: "persona03@example.test", phone: "+57 300 000 0103 · ficticio", status: "pending", familyId: "FAM-DEMO-01" },
  ],
  requests: [
    { id: "SOL-DEMO-041", type: "Solicitud documental · muestra", requester: "Solicitante de muestra A", submittedAt: "2026-10-30", status: "pending" },
    { id: "SOL-DEMO-040", type: "Constancia parroquial · demo", requester: "Solicitante de muestra B", submittedAt: "2026-10-29", status: "approved" },
    { id: "SOL-DEMO-039", type: "Referencia documental ficticia", requester: "Solicitante de muestra C", submittedAt: "2026-10-27", status: "pending" },
  ],
};
