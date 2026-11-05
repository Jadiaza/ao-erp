import { useEffect, useSyncExternalStore } from "react";

/** Contratos estables del escenario ERP. Los IDs de origen permiten migrar estas relaciones a FK en PostgreSQL. */
export type DemoModule = "purchase" | "inventory" | "payable" | "treasury" | "accounting" | "budget" | "document" | "audit";
export type DemoWorkflowEvent = {
  id: string; type: DemoModule; title: string; reference: string; amount: number;
  status: string; occurredAt: string; sourceId: string;
};
export type DemoPurchase = {
  id: string; supplierId: string; supplierName: string; requester: string; costCenterId: string;
  itemId: string; itemName: string; quantity: number; receivedQuantity: number; unitCost: number;
  total: number; status: "approved" | "received" | "invoiced" | "paid";
};
export type DemoStock = { itemId: string; itemName: string; warehouseId: string; warehouseName: string; openingQuantity: number; receivedQuantity: number; availableQuantity: number; unit: string };
export type DemoPayable = { id: string; supplierId: string; supplierName: string; invoiceNumber: string; purchaseId: string; issueDate: string; dueDate: string; total: number; paid: number; balance: number; status: "paid" | "partially_paid" | "pending" };
export type DemoCashMovement = { id: string; payableId: string; accountId: string; accountName: string; date: string; direction: "outflow"; amount: number; reference: string; status: "posted" };
export type DemoLedgerVoucher = { id: string; date: string; description: string; status: "draft" | "posted"; sourceId: string; lines: { accountCode: string; accountName: string; debit: number; credit: number; costCenter: string }[] };
export type DemoBudget = { id: string; code: string; name: string; costCenterId: string; approved: number; committed: number; accrued: number; paid: number; available: number };
export type DemoDocument = { id: string; name: string; type: string; sourceType: string; sourceId: string; folder: string; version: string; status: "available" | "review" };
export type DemoAudit = { id: string; date: string; actor: string; role: string; module: string; action: string; entityId: string; description: string; sourceId: string };
export type DemoState = {
  schemaVersion: 1; scenarioId: string; updatedAt: string;
  purchases: DemoPurchase[]; stock: DemoStock[]; payables: DemoPayable[];
  cashMovements: DemoCashMovement[]; vouchers: DemoLedgerVoucher[];
  budgets: DemoBudget[]; documents: DemoDocument[]; audit: DemoAudit[];
  events: DemoWorkflowEvent[];
};

const STORAGE_KEY = "ao-erp:integrated-demo:v2";
const DEMO_DATE = "2026-11-05";
const SOURCE = "COM-DEMO-001";
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function createInitialState(): DemoState {
  const purchase: DemoPurchase = {
    id: "OC-DEMO-001", supplierId: "PROV-DEMO-001", supplierName: "Suministros Pastorales del Caribe (ficticio)",
    requester: "Coordinación de formación", costCenterId: "CC-CATEQUESIS", itemId: "ITEM-PAPELERIA-001",
    itemName: "Kit de materiales para catequesis", quantity: 100, receivedQuantity: 100,
    unitCost: 14800, total: 1480000, status: "paid",
  };
  const payable: DemoPayable = {
    id: "CXP-DEMO-001", supplierId: purchase.supplierId, supplierName: purchase.supplierName,
    invoiceNumber: "FE-DEMO-8841", purchaseId: purchase.id, issueDate: DEMO_DATE,
    dueDate: "2026-12-05", total: purchase.total, paid: purchase.total, balance: 0, status: "paid",
  };
  const cash: DemoCashMovement = {
    id: "TES-DEMO-001", payableId: payable.id, accountId: "CTA-BANCO-001",
    accountName: "Cuenta bancaria parroquial · demo", date: DEMO_DATE,
    direction: "outflow", amount: payable.total, reference: "Pago factura FE-DEMO-8841", status: "posted",
  };
  const voucher: DemoLedgerVoucher = {
    id: "CMP-DEMO-INT-001", date: DEMO_DATE,
    description: "Pago de factura de materiales para catequesis · demostración",
    status: "draft", sourceId: SOURCE,
    lines: [
      { accountCode: "2205", accountName: "Proveedores nacionales", debit: payable.total, credit: 0, costCenter: "Catequesis" },
      { accountCode: "1110", accountName: "Bancos", debit: 0, credit: payable.total, costCenter: "Administración" },
    ],
  };
  const events: DemoWorkflowEvent[] = [
    ["purchase", "Orden de compra aprobada", purchase.id, purchase.total, "Aprobada"],
    ["inventory", "Recepción completa registrada", "REC-DEMO-001", purchase.total, "100 unidades recibidas"],
    ["payable", "Factura de proveedor reconocida", payable.id, payable.total, "Pagada · saldo cero"],
    ["treasury", "Egreso de tesorería registrado", cash.id, cash.amount, "Contabilizado · demo"],
    ["accounting", "Comprobante contable propuesto", voucher.id, voucher.lines[0].debit, "Borrador para revisión"],
    ["budget", "Ejecución presupuestal actualizada", "PRE-DEMO-02", purchase.total, "Comprometido, causado y pagado"],
    ["document", "Factura y recepción vinculadas", "DOC-DEMO-INT-001", purchase.total, "Disponibles · demo"],
    ["audit", "Ciclo financiero trazado", "AUD-DEMO-INT-001", purchase.total, "Registrado"],
  ].map(([type, title, reference, amount, status], index) => ({
    id: `EVT-DEMO-${String(index + 1).padStart(3, "0")}`, type: type as DemoModule,
    title: title as string, reference: reference as string, amount: amount as number,
    status: status as string, occurredAt: DEMO_DATE + "T10:00:00-05:00", sourceId: SOURCE,
  }));
  return {
    schemaVersion: 1, scenarioId: "PARROQUIA-DEMO-CO-001", updatedAt: DEMO_DATE + "T10:00:00-05:00",
    purchases: [purchase],
    stock: [{
      itemId: purchase.itemId, itemName: purchase.itemName, warehouseId: "ALM-CENTRAL",
      warehouseName: "Almacén parroquial", openingQuantity: 35, receivedQuantity: 100,
      availableQuantity: 135, unit: "unidades",
    }],
    payables: [payable], cashMovements: [cash], vouchers: [voucher],
    budgets: [{
      id: "PRE-DEMO-02", code: "5.1.02", name: "Formación y catequesis",
      costCenterId: purchase.costCenterId, approved: 6800000, committed: 0,
      accrued: purchase.total, paid: purchase.total, available: 5320000,
    }],
    documents: [
      { id: "DOC-DEMO-INT-001", name: "Factura proveedor FE-DEMO-8841.pdf", type: "Factura de compra", sourceType: "supplier_invoice", sourceId: payable.id, folder: "Economía / Compras", version: "v1.0", status: "available" },
      { id: "DOC-DEMO-INT-002", name: "Acta de recepción REC-DEMO-001.pdf", type: "Acta de recepción", sourceType: "inventory_receipt", sourceId: "REC-DEMO-001", folder: "Economía / Inventarios", version: "v1.0", status: "available" },
      { id: "DOC-DEMO-INT-003", name: "Comprobante CMP-DEMO-INT-001.pdf", type: "Comprobante contable propuesto", sourceType: "ledger_voucher", sourceId: voucher.id, folder: "Economía / Contabilidad", version: "v1.0", status: "review" },
    ],
    audit: events.map((event, index) => ({
      id: `AUD-DEMO-${String(index + 1).padStart(3, "0")}`, date: DEMO_DATE,
      actor: "Usuario demostrativo", role: "Administrador parroquial · demo",
      module: event.type, action: "Registro demostrativo", entityId: event.reference,
      description: event.title, sourceId: SOURCE,
    })),
    events,
  };
}

const initialState = createInitialState();
let state: DemoState = clone(initialState);
let hydrated = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((listener) => listener()); }
function persist() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage is optional in demo mode. */ }
}
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.schemaVersion === 1 && parsed.scenarioId === initialState.scenarioId &&
        Array.isArray(parsed.purchases) && Array.isArray(parsed.events) &&
        Array.isArray(parsed.stock) && Array.isArray(parsed.payables) &&
        Array.isArray(parsed.cashMovements) && Array.isArray(parsed.vouchers) &&
        Array.isArray(parsed.budgets) && Array.isArray(parsed.documents) && Array.isArray(parsed.audit)) state = parsed;
    }
  } catch { state = clone(initialState); }
  emit();
}
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
function getSnapshot() { return state; }

export function useIntegratedDemo() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => initialState);
  useEffect(() => { hydrate(); }, []);
  return snapshot;
}
export function getIntegratedDemoSnapshot() { return state; }
export function resetIntegratedPurchaseDemo() {
  state = clone(initialState); persist(); emit();
}

/** Reglas de dominio de la demostración: una transición actualiza todos los módulos relacionados. */
export function approveDemoPurchase() {
  const purchase = state.purchases[0];
  if (purchase.status !== "approved") return;
  purchase.status = "approved";
  addAudit("Compras", "Aprobación", purchase.id, "Orden aprobada para demostración");
  commit();
}
export function receiveDemoPurchase(quantity = 100) {
  const purchase = state.purchases[0];
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > purchase.quantity - purchase.receivedQuantity) throw new Error("DEMO_RECEIPT_QUANTITY_INVALID");
  purchase.receivedQuantity += quantity;
  purchase.status = purchase.receivedQuantity === purchase.quantity ? "received" : "approved";
  const stock = state.stock.find((item) => item.itemId === purchase.itemId);
  if (!stock) throw new Error("DEMO_STOCK_ITEM_NOT_FOUND");
  stock.receivedQuantity += quantity; stock.availableQuantity += quantity;
  addEvent("inventory", "Recepción de compra aplicada al inventario", `REC-DEMO-${state.events.length + 1}`, quantity * purchase.unitCost, `${quantity} unidades recibidas`);
  addAudit("Inventarios", "Recepción", purchase.id, `Entrada de ${quantity} unidades`);
  commit();
}
export function invoiceDemoPurchase(invoiceNumber = "FE-DEMO-8841") {
  const purchase = state.purchases[0];
  if (purchase.receivedQuantity <= 0 || state.payables.some((item) => item.invoiceNumber === invoiceNumber)) throw new Error("DEMO_INVOICE_NOT_ALLOWED");
  const total = purchase.receivedQuantity * purchase.unitCost;
  const payable: DemoPayable = {
    id: `CXP-DEMO-${String(state.payables.length + 1).padStart(3, "0")}`,
    supplierId: purchase.supplierId, supplierName: purchase.supplierName, invoiceNumber,
    purchaseId: purchase.id, issueDate: DEMO_DATE, dueDate: "2026-12-05",
    total, paid: 0, balance: total, status: "pending",
  };
  state.payables.push(payable); purchase.status = "invoiced";
  const budget = state.budgets.find((item) => item.id === "PRE-DEMO-02");
  if (budget) { budget.committed = Math.max(0, budget.committed - total); budget.accrued += total; budget.available = budget.approved - budget.committed - budget.accrued; }
  addEvent("payable", "Factura registrada como obligación", payable.id, total, "Pendiente de pago");
  addEvent("budget", "Compromiso convertido en causación", "PRE-DEMO-02", total, "Obligación causada");
  addAudit("Cuentas por pagar", "Causación", payable.id, `Factura ${invoiceNumber} registrada`);
  commit();
  return payable;
}
export function payDemoPayable(payableId: string, amount: number) {
  const payable = state.payables.find((item) => item.id === payableId);
  if (!payable || !Number.isSafeInteger(amount) || amount <= 0 || amount > payable.balance) throw new Error("DEMO_PAYMENT_AMOUNT_INVALID");
  const cash: DemoCashMovement = {
    id: `TES-DEMO-${String(state.cashMovements.length + 1).padStart(3, "0")}`,
    payableId, accountId: "CTA-BANCO-001", accountName: "Cuenta bancaria parroquial · demo",
    date: DEMO_DATE, direction: "outflow", amount, reference: `Pago ${payable.invoiceNumber}`, status: "posted",
  };
  payable.paid += amount; payable.balance -= amount;
  payable.status = payable.balance === 0 ? "paid" : "partially_paid";
  state.cashMovements.push(cash);
  const budget = state.budgets.find((item) => item.id === "PRE-DEMO-02");
  if (budget) { budget.paid += amount; budget.available = budget.approved - budget.committed - budget.accrued; }
  addEvent("treasury", "Pago aplicado en tesorería", cash.id, amount, "Egreso contabilizado · demo");
  addEvent("payable", "Saldo de obligación actualizado", payable.id, amount, `Saldo pendiente: ${payable.balance}`);
  addEvent("budget", "Ejecución pagada actualizada", budget?.id ?? "PRE-DEMO-02", amount, "Pago aplicado");
  addAudit("Tesorería", "Pago a proveedor", cash.id, `Pago aplicado a ${payable.invoiceNumber}`);
  commit();
  return cash;
}
export function proposeDemoLedgerVoucher(payableId: string) {
  const payable = state.payables.find((item) => item.id === payableId);
  if (!payable) throw new Error("DEMO_PAYABLE_NOT_FOUND");
  const cash = state.cashMovements.filter((item) => item.payableId === payableId);
  const total = cash.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0) throw new Error("DEMO_PAYMENT_REQUIRED_FOR_VOUCHER");
  const voucher: DemoLedgerVoucher = {
    id: `CMP-DEMO-${String(state.vouchers.length + 1).padStart(3, "0")}`,
    date: DEMO_DATE, description: `Pago de proveedor · ${payable.invoiceNumber}`,
    status: "draft", sourceId: SOURCE,
    lines: [
      { accountCode: "2205", accountName: "Proveedores nacionales", debit: total, credit: 0, costCenter: "Catequesis" },
      { accountCode: "1110", accountName: "Bancos", debit: 0, credit: total, costCenter: "Administración" },
    ],
  };
  state.vouchers.push(voucher);
  addEvent("accounting", "Comprobante contable propuesto", voucher.id, total, "Borrador pendiente de revisión");
  state.documents.push({ id: `DOC-DEMO-${String(state.documents.length + 1).padStart(3, "0")}`, name: `Comprobante ${voucher.id}.pdf`, type: "Comprobante contable", sourceType: "ledger_voucher", sourceId: voucher.id, folder: "Economía / Contabilidad", version: "v1.0", status: "review" });
  addAudit("Contabilidad", "Propuesta de comprobante", voucher.id, "Comprobante en borrador; no contabilizado");
  commit();
  return voucher;
}
function addEvent(type: DemoModule, title: string, reference: string, amount: number, status: string) {
  state.events.push({ id: `EVT-DEMO-${String(state.events.length + 1).padStart(3, "0")}`, type, title, reference, amount, status, occurredAt: new Date().toISOString(), sourceId: SOURCE });
}
function addAudit(module: string, action: string, entityId: string, description: string) {
  state.audit.push({ id: `AUD-DEMO-${String(state.audit.length + 1).padStart(3, "0")}`, date: DEMO_DATE, actor: "Usuario demostrativo", role: "Administrador parroquial · demo", module, action, entityId, description, sourceId: SOURCE });
  addEvent("audit", "Trazabilidad: " + description, entityId, 0, "Registrado");
}
function commit() { state.updatedAt = new Date().toISOString(); persist(); emit(); }

/** Puerto que implementará el repositorio PostgreSQL sin modificar las pantallas ni los casos de uso. */
export interface ErpRepository {
  loadDemoState(): Promise<DemoState>;
  saveDemoState(state: DemoState): Promise<void>;
}
export const demoRepository: ErpRepository = {
  async loadDemoState() { return clone(state); },
  async saveDemoState(next) { state = clone(next); commit(); },
};
