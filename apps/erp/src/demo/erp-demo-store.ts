import { useEffect, useSyncExternalStore } from "react";

export type DemoWorkflowEvent = {
  id: string;
  type: "purchase" | "inventory" | "payable" | "treasury" | "accounting" | "document" | "audit";
  title: string;
  reference: string;
  amount: number;
  status: string;
  occurredAt: string;
  sourceId: string;
};

type DemoState = { events: DemoWorkflowEvent[]; sequence: number };
const STORAGE_KEY = "ao-erp:integrated-demo:v1";
const initialState: DemoState = { events: [], sequence: 0 };
let state = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((listener) => listener()); }
function persist() {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage may be unavailable */ }
  }
}
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed && Array.isArray(parsed.events) && Number.isSafeInteger(parsed.sequence)) state = parsed;
    }
  } catch { state = initialState; }
  emit();
}
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
function getSnapshot() { return state; }

export function useIntegratedDemo() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => initialState);
  useEffect(() => { hydrate(); }, []);
  return snapshot;
}

export function runIntegratedPurchaseDemo() {
  const existing = state.events.find((event) => event.reference === "COM-DEMO-INTEGRADO-001");
  if (existing) return;
  const occurredAt = new Date().toISOString();
  const sourceId = "COM-DEMO-INTEGRADO-001";
  const amount = 1480000;
  const next = [
    ["purchase", "Orden de compra aprobada", "OC-DEMO-001", "Aprobada"],
    ["inventory", "Recepción registrada en inventario", "REC-DEMO-001", "Recibido"],
    ["payable", "Factura de proveedor reconocida", "CXP-DEMO-001", "Pendiente de pago"],
    ["treasury", "Pago de proveedor registrado", "TES-DEMO-001", "Contabilizado · demo"],
    ["accounting", "Comprobante contable propuesto", "CMP-DEMO-INT-001", "Borrador para revisión"],
    ["document", "Soporte documental vinculado", "DOC-DEMO-INT-001", "Disponible · demo"],
    ["audit", "Trazabilidad del ciclo financiero", "AUD-DEMO-INT-001", "Registrado"],
  ] as const;
  const events = next.map(([type, title, reference, status], index) => ({
    id: `DEMO-EVT-${state.sequence + index + 1}`,
    type, title, reference, amount, status, occurredAt, sourceId,
  }));
  state = { events: [...state.events, ...events], sequence: state.sequence + events.length };
  persist();
  emit();
}

export function resetIntegratedPurchaseDemo() {
  state = initialState;
  persist();
  emit();
}
