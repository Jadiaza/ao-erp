import { describe, expect, it } from "vitest";
import { applyStockMovement, monthlyStraightLineDepreciation, type StockBalance, type StockMovement } from "./inventory";
describe("inventario y activos", () => {
  it("calcula costo promedio ponderado al recibir", () => {
    const balance: StockBalance = { itemId: "i1", warehouseId: "w1", quantity: 10, averageCostMinor: 1000 };
    const receipt: StockMovement = { id: "m1", itemId: "i1", warehouseId: "w1", kind: "receipt", quantity: 10, unitCostMinor: 2000, occurredOn: "2026-11-05", sourceType: "purchase", sourceId: "po1" };
    expect(applyStockMovement(balance, receipt)).toMatchObject({ quantity: 20, averageCostMinor: 1500 });
  });
  it("no permite salidas superiores a existencias", () => {
    const balance: StockBalance = { itemId: "i1", warehouseId: "w1", quantity: 2, averageCostMinor: 1000 };
    const issue: StockMovement = { id: "m2", itemId: "i1", warehouseId: "w1", kind: "issue", quantity: 3, unitCostMinor: 1000, occurredOn: "2026-11-05", sourceType: "use", sourceId: "x1" };
    expect(() => applyStockMovement(balance, issue)).toThrow("INVENTORY_INSUFFICIENT_STOCK");
  });
  it("calcula depreciación lineal sin superar el valor depreciable", () => {
    expect(monthlyStraightLineDepreciation({ id: "a1", description: "Equipo", acquisitionCostMinor: 120000, residualValueMinor: 12000, usefulLifeMonths: 36, accumulatedDepreciationMinor: 108000, status: "active" })).toBe(0);
  });
});
