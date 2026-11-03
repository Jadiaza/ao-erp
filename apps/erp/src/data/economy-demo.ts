import type { RecordStatus } from "@/data/demo-types";
import { parishDemo, parishDemoAccountingEntity, parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

export type TreasuryMovement = { id: string; date: string; dateISO: string; concept: string; source: string; category: string; account: string; direction: "Ingreso" | "Egreso"; amount: number; status: RecordStatus; reference: string };
export const treasuryAccounts = [
  { id: "CTA-DEMO-01", name: "Caja parroquial · demo", kind: "Caja", balance: 2850000, entity: parishDemo.officialName },
  { id: "CTA-DEMO-02", name: "Cuenta corriente · demo", kind: "Banco", balance: 18450000, entity: parishDemo.officialName },
  { id: "CTA-DEMO-03", name: "Fondo pastoral · demo", kind: "Caja", balance: 1620000, entity: parishDemo.officialName },
];
export const treasuryMovements: TreasuryMovement[] = [
  { id: "MOV-DEMO-101", date: "30 oct. 2026", dateISO: "2026-10-30", concept: "Ofrenda dominical", source: "Colecta comunitaria", category: "Ofrendas", account: "Caja parroquial", direction: "Ingreso", amount: 845000, status: "approved", reference: "ING-DEMO-041" },
  { id: "MOV-DEMO-102", date: "29 oct. 2026", dateISO: "2026-10-29", concept: "Aporte solidario", source: "Donación de muestra", category: "Donaciones", account: "Cuenta corriente · muestra", direction: "Ingreso", amount: 1200000, status: "approved", reference: "ING-DEMO-040" },
  { id: "MOV-DEMO-103", date: "28 oct. 2026", dateISO: "2026-10-28", concept: "Actividad comunitaria", source: "Encuentro cultural", category: "Actividades", account: "Caja parroquial", direction: "Ingreso", amount: 460000, status: "pending", reference: "ING-DEMO-039" },
  { id: "MOV-DEMO-104", date: "27 oct. 2026", dateISO: "2026-10-27", concept: "Servicios públicos", source: "Proveedor de muestra", category: "Servicios", account: "Cuenta corriente · muestra", direction: "Egreso", amount: 326500, status: "paid", reference: "EGR-DEMO-028" },
  { id: "MOV-DEMO-105", date: "26 oct. 2026", dateISO: "2026-10-26", concept: "Material de formación", source: "Compra menor", category: "Pastoral", account: "Fondo pastoral", direction: "Egreso", amount: 148000, status: "approved", reference: "EGR-DEMO-027" },
  { id: "MOV-DEMO-106", date: "24 oct. 2026", dateISO: "2026-10-24", concept: "Mantenimiento de sede", source: "Servicio contratado", category: "Mantenimiento", account: "Cuenta corriente · muestra", direction: "Egreso", amount: 780000, status: "pending", reference: "EGR-DEMO-026" },
  { id: "MOV-DEMO-107", date: "22 oct. 2026", dateISO: "2026-10-22", concept: "Recaudo de actividad", source: "Inscripciones de muestra", category: "Actividades", account: "Caja parroquial", direction: "Ingreso", amount: 315000, status: "approved", reference: "ING-DEMO-038" },
];
export const treasuryPeriodSummaryDemo = {
  income: treasuryMovements.filter((movement) => movement.direction === "Ingreso").reduce((sum, movement) => sum + movement.amount, 0),
  expense: treasuryMovements.filter((movement) => movement.direction === "Egreso").reduce((sum, movement) => sum + movement.amount, 0),
  available: treasuryAccounts.reduce((sum, account) => sum + account.balance, 0),
};
export const treasuryIncomeSourcesDemo = [...new Set(treasuryMovements.filter((movement) => movement.direction === "Ingreso").map((movement) => movement.category))].map((label) => ({
  label,
  value: treasuryMovements.filter((movement) => movement.direction === "Ingreso" && movement.category === label).reduce((sum, movement) => sum + movement.amount, 0),
}));
export const reconciliationLines = [
  { id: "REC-DEMO-01", date: "30 oct. 2026", bankDescription: "Abono referencia 041", ledgerDescription: "Ofrenda dominical", amount: 845000, status: "Conciliado" },
  { id: "REC-DEMO-02", date: "29 oct. 2026", bankDescription: "Transferencia recibida", ledgerDescription: "Aporte solidario", amount: 1200000, status: "Conciliado" },
  { id: "REC-DEMO-03", date: "28 oct. 2026", bankDescription: "Cargo servicio", ledgerDescription: "Pendiente de identificación", amount: -326500, status: "Por revisar" },
];
export const cashFlow = [
  { month: "Jun", income: 2.1, expense: 1.4 }, { month: "Jul", income: 2.4, expense: 1.6 }, { month: "Ago", income: 2.2, expense: 1.5 }, { month: "Sep", income: 2.6, expense: 1.8 }, { month: "Oct", income: 2.82, expense: 1.2545 },
];

export type AccountingAccount = { code: string; name: string; type: string; parent?: string; debit: number; credit: number; balance: number; entityId: string; dimension: string };
export const accountingEntities = [
  parishDemoAccountingEntity,
];
export const accountingAccounts: AccountingAccount[] = [
  { code: "1", name: "Activos", type: "Clase", debit: 28450000, credit: 0, balance: 28450000, entityId: parishDemo.accountingEntityId, dimension: "Administrativa" },
  { code: "11", name: "Efectivo y equivalentes", type: "Grupo", parent: "1", debit: 22920000, credit: 0, balance: 22920000, entityId: parishDemo.accountingEntityId, dimension: "Tesorería" },
  { code: "1105", name: "Caja parroquial", type: "Cuenta", parent: "11", debit: 4210000, credit: 1360000, balance: 2850000, entityId: parishDemo.accountingEntityId, dimension: "Tesorería" },
  { code: "1110", name: "Cuenta bancaria · demo", type: "Cuenta", parent: "11", debit: 18710000, credit: 260000, balance: 18450000, entityId: parishDemo.accountingEntityId, dimension: "Tesorería" },
  { code: "1120", name: "Fondo pastoral · demo", type: "Cuenta", parent: "11", debit: 1620000, credit: 0, balance: 1620000, entityId: parishDemo.accountingEntityId, dimension: "Pastoral" },
  { code: "2", name: "Pasivos", type: "Clase", debit: 0, credit: 3480000, balance: -3480000, entityId: parishDemo.accountingEntityId, dimension: "Administrativa" },
  { code: "3", name: "Patrimonio institucional", type: "Clase", debit: 0, credit: 24970000, balance: -24970000, entityId: parishDemo.accountingEntityId, dimension: "Administrativa" },
  { code: "4", name: "Ingresos", type: "Clase", debit: 0, credit: 18450000, balance: -18450000, entityId: parishDemo.accountingEntityId, dimension: "Pastoral" },
  { code: "41", name: "Ofrendas y donaciones", type: "Grupo", parent: "4", debit: 0, credit: 11450000, balance: -11450000, entityId: parishDemo.accountingEntityId, dimension: "Pastoral" },
  { code: "5", name: "Gastos", type: "Clase", debit: 12420000, credit: 0, balance: 12420000, entityId: parishDemo.accountingEntityId, dimension: "Administrativa" },
  { code: "51", name: "Servicios y mantenimiento", type: "Grupo", parent: "5", debit: 3265000, credit: 0, balance: 3265000, entityId: parishDemo.accountingEntityId, dimension: "Administrativa" },
];
export const journalEntries = [
  { id: "CMP-DEMO-071", date: "30 oct. 2026", period: "2026-10", description: "Registro demostrativo de ofrenda comunitaria", account: "1105 · Caja parroquial", debit: 845000, credit: 0, dimension: "Pastoral", entityId: parishDemo.accountingEntityId },
  { id: "CMP-DEMO-071", date: "30 oct. 2026", period: "2026-10", description: "Registro demostrativo de ofrenda comunitaria", account: "4101 · Ofrendas", debit: 0, credit: 845000, dimension: "Pastoral", entityId: parishDemo.accountingEntityId },
  { id: "CMP-DEMO-070", date: "29 oct. 2026", period: "2026-10", description: "Pago demostrativo de servicios públicos", account: "5105 · Servicios", debit: 326500, credit: 0, dimension: "Administrativa", entityId: parishDemo.accountingEntityId },
  { id: "CMP-DEMO-070", date: "29 oct. 2026", period: "2026-10", description: "Pago demostrativo de servicios públicos", account: "1110 · Banco demo", debit: 0, credit: 326500, dimension: "Administrativa", entityId: parishDemo.accountingEntityId },
];

export type BudgetLine = { id: string; area: string; category: string; type: "Ingreso" | "Gasto"; budget: number; executed: number; period: string };
export const budgetLines: BudgetLine[] = [
  { id: "PRE-DEMO-01", area: "Pastoral", category: "Ofrendas ordinarias", type: "Ingreso", budget: 24000000, executed: 18600000, period: "Octubre" },
  { id: "PRE-DEMO-02", area: "Pastoral", category: "Formación y catequesis", type: "Gasto", budget: 6800000, executed: 5120000, period: "Octubre" },
  { id: "PRE-DEMO-03", area: "Administrativa", category: "Servicios y mantenimiento", type: "Gasto", budget: 9200000, executed: 10100000, period: "Octubre" },
  { id: "PRE-DEMO-04", area: "Acción social", category: "Aportes solidarios", type: "Ingreso", budget: 14500000, executed: 12300000, period: "Octubre" },
  { id: "PRE-DEMO-05", area: "Acción social", category: "Ayuda comunitaria", type: "Gasto", budget: 11800000, executed: 8900000, period: "Octubre" },
  { id: "PRE-DEMO-06", area: "Administrativa", category: "Ingresos por actividades", type: "Ingreso", budget: 7500000, executed: 5940000, period: "Octubre" },
];

export type AssetDemo = { id: string; name: string; kind: string; location: string; responsible: string; condition: string; acquisitionValue: number; acquisitionDate: string; maintenance: string; accountingCategory: string; carryingAmount: number; support: string; status: RecordStatus };
export const assets: AssetDemo[] = [
  { id: "PAT-DEMO-001", name: "Órgano de capilla · muestra", kind: "Elemento litúrgico", location: parishDemoSites.chapel.name, responsible: parishDemoPeople.inventoryCustodian.name, condition: "Bueno", acquisitionValue: 8400000, acquisitionDate: "12 mar. 2021 · ficha ficticia", maintenance: "Afinación preventiva · nov. 2026 · muestra", accountingCategory: "Equipo especializado · referencia", carryingAmount: 6200000, support: "Soporte ficticio PAT-DEMO-001", status: "active" },
  { id: "PAT-DEMO-002", name: "Sistema de sonido · muestra", kind: "Equipo tecnológico", location: parishDemoSites.temple.name, responsible: parishDemoPeople.inventoryCustodian.name, condition: "Requiere revisión", acquisitionValue: 5300000, acquisitionDate: "04 ago. 2022 · ficha ficticia", maintenance: "Diagnóstico técnico pendiente · demo", accountingCategory: "Equipo audiovisual · referencia", carryingAmount: 3710000, support: "Soporte ficticio PAT-DEMO-002", status: "pending" },
  { id: "PAT-DEMO-003", name: "Conjunto de bancas · muestra", kind: "Mueble", location: parishDemoSites.hall.name, responsible: parishDemoPeople.inventoryCustodian.name, condition: "Bueno", acquisitionValue: 6800000, acquisitionDate: "16 ene. 2020 · ficha ficticia", maintenance: "Inspección semestral · ene. 2027 · muestra", accountingCategory: "Mobiliario · referencia", carryingAmount: 3400000, support: "Soporte ficticio PAT-DEMO-003", status: "active" },
  { id: "PAT-DEMO-004", name: "Vehículo de servicio · muestra", kind: "Vehículo", location: parishDemoSites.parking.name, responsible: parishDemoPeople.inventoryCustodian.name, condition: "Bueno", acquisitionValue: 48900000, acquisitionDate: "09 jun. 2023 · ficha ficticia", maintenance: "Mantenimiento preventivo · dic. 2026 · muestra", accountingCategory: "Equipo de transporte · referencia", carryingAmount: 39120000, support: "Soporte ficticio PAT-DEMO-004", status: "active" },
  { id: "PAT-DEMO-005", name: "Pintura patrimonial · muestra", kind: "Bien cultural y artístico", location: parishDemoSites.archive.name, responsible: parishDemoPeople.heritageCustodian.name, condition: "Conservación especializada", acquisitionValue: 0, acquisitionDate: "Fecha de referencia · dato ficticio", maintenance: "Evaluación de conservación anual · demo", accountingCategory: "Registro patrimonial separado", carryingAmount: 0, support: "Ficha ficticia de conservación", status: "approved" },
];
export const inventoryMovements = [
  { id: "INV-MOV-01", date: "29 oct. 2026", asset: "Sistema de sonido · muestra", from: parishDemoSites.temple.name, to: parishDemoSites.workshop.name, kind: "Salida de muestra para revisión", status: "pending" as const },
  { id: "INV-MOV-02", date: "24 oct. 2026", asset: "Conjunto de bancas · muestra", from: parishDemoSites.storage.name, to: parishDemoSites.hall.name, kind: "Traslado interno demostrativo", status: "approved" as const },
];

export type ProcurementDemo = { id: string; title: string; vendor: string; requestedBy: string; amount: number; stage: "Solicitud" | "Cotizaciones" | "Orden" | "Recepción" | "Cuenta por pagar"; date: string; due: string; status: RecordStatus; items: string[]; offers: { vendor: string; amount: number; note: string }[]; support: string };
export const procurement: ProcurementDemo[] = [
  { id: "COM-DEMO-031", title: "Materiales de formación", vendor: "Suministros de muestra A", requestedBy: parishDemoPeople.pastoral.role, amount: 1480000, stage: "Cuenta por pagar", date: "18 oct. 2026", due: "18 nov. 2026", status: "pending", items: ["Cuadernos de trabajo", "Material pedagógico", "Papelería"], offers: [{ vendor: "Suministros de muestra A", amount: 1480000, note: "Entrega en 5 días" }, { vendor: "Distribuciones de muestra B", amount: 1590000, note: "Entrega en 3 días" }, { vendor: "Comercial de muestra C", amount: 1515000, note: "Entrega en 7 días" }], support: "Factura DEMO-F-031" },
  { id: "COM-DEMO-030", title: "Reparación de cubierta", vendor: "Servicios técnicos demo", requestedBy: "Administración", amount: 4280000, stage: "Recepción", date: "20 oct. 2026", due: "15 nov. 2026", status: "active", items: ["Revisión de cubierta", "Materiales de reparación"], offers: [{ vendor: "Servicios técnicos demo", amount: 4280000, note: "Garantía de muestra" }, { vendor: "Mantenimiento local demo", amount: 4650000, note: "Disponibilidad inmediata" }], support: "Acta de recepción DEMO-030" },
  { id: "COM-DEMO-029", title: "Equipo de proyección", vendor: "Tecnología parroquial demo", requestedBy: "Formación", amount: 2360000, stage: "Cotizaciones", date: "29 oct. 2026", due: "Por definir", status: "pending", items: ["Proyector de muestra", "Accesorios de montaje"], offers: [{ vendor: "Tecnología parroquial demo", amount: 2360000, note: "Oferta vigente" }, { vendor: "Soluciones audiovisuales demo", amount: 2490000, note: "Incluye instalación" }], support: "Solicitud COM-DEMO-029" },
  { id: "COM-DEMO-028", title: "Insumos de limpieza", vendor: "Abastecimiento demo", requestedBy: "Servicios generales", amount: 0, stage: "Solicitud", date: "31 oct. 2026", due: "Sin obligación", status: "draft", items: ["Insumos de limpieza institucional"], offers: [], support: "Solicitud COM-DEMO-028" },
];
