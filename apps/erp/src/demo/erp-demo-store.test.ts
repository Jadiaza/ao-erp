import { describe, expect, it } from "vitest";
import { getIntegratedDemoSnapshot, resetIntegratedPurchaseDemo } from "./erp-demo-store";

describe("escenario integrado A&O ERP", () => {
  it("carga una operación completa relacionada entre módulos", () => {
    resetIntegratedPurchaseDemo();
    const state = getIntegratedDemoSnapshot();
    expect(state.purchases).toHaveLength(1);
    expect(state.stock[0]).toMatchObject({ openingQuantity: 35, receivedQuantity: 100, availableQuantity: 135 });
    expect(state.payables[0]).toMatchObject({ total: 1480000, paid: 1480000, balance: 0, status: "paid" });
    expect(state.cashMovements[0]).toMatchObject({ payableId: state.payables[0].id, amount: 1480000, status: "posted" });
    expect(state.budgets[0]).toMatchObject({ approved: 6800000, accrued: 1480000, paid: 1480000, available: 5320000 });
  });

  it("conserva partida doble balanceada sin contabilizar el borrador", () => {
    const state = getIntegratedDemoSnapshot();
    const voucher = state.vouchers[0];
    expect(voucher.status).toBe("draft");
    expect(voucher.lines.reduce((sum, line) => sum + line.debit, 0)).toBe(1480000);
    expect(voucher.lines.reduce((sum, line) => sum + line.credit, 0)).toBe(1480000);
  });

  it("vincula documentos y auditoría al mismo origen transversal", () => {
    const state = getIntegratedDemoSnapshot();
    expect(state.documents.length).toBeGreaterThanOrEqual(3);
    expect(state.documents.every((document) => Boolean(document.sourceId && document.sourceType))).toBe(true);
    expect(state.audit.length).toBeGreaterThanOrEqual(8);
    expect(state.audit.every((event) => event.sourceId === state.events[0].sourceId)).toBe(true);
    expect(new Set(state.events.map((event) => event.sourceId))).toEqual(new Set(["COM-DEMO-001"]));
  });

  it("permite restablecer el escenario completo sin crear duplicados", () => {
    const before = getIntegratedDemoSnapshot();
    resetIntegratedPurchaseDemo();
    const after = getIntegratedDemoSnapshot();
    expect(after.purchases).toHaveLength(before.purchases.length);
    expect(after.payables).toHaveLength(before.payables.length);
    expect(after.events).toHaveLength(before.events.length);
  });
});
