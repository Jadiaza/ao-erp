import { isIsoCalendarDate } from "../shared/primitives";

export type InventoryMovementKind = "receipt" | "issue" | "transfer_in" | "transfer_out" | "adjustment_in" | "adjustment_out";
export type InventoryItem = { id: string; sku: string; name: string; unit: string; trackQuantity: boolean; reorderPoint: number; active: boolean };
export type StockMovement = { id: string; itemId: string; warehouseId: string; kind: InventoryMovementKind; quantity: number; unitCostMinor: number; occurredOn: string; sourceType: string; sourceId: string };
export type StockBalance = { itemId: string; warehouseId: string; quantity: number; averageCostMinor: number };

export function validateStockMovement(item: InventoryItem, movement: StockMovement): string[] {
  const errors: string[] = [];
  if (!item.active) errors.push("INVENTORY_ITEM_INACTIVE");
  if (item.id !== movement.itemId) errors.push("INVENTORY_ITEM_MISMATCH");
  if (!Number.isSafeInteger(movement.quantity) || movement.quantity <= 0) errors.push("INVENTORY_QUANTITY_INVALID");
  if (!Number.isSafeInteger(movement.unitCostMinor) || movement.unitCostMinor < 0) errors.push("INVENTORY_UNIT_COST_INVALID");
  if (!isIsoCalendarDate(movement.occurredOn)) errors.push("INVENTORY_MOVEMENT_DATE_INVALID");
  if (!movement.warehouseId.trim() || !movement.sourceType.trim() || !movement.sourceId.trim()) errors.push("INVENTORY_MOVEMENT_REFERENCE_REQUIRED");
  return errors;
}
export function applyStockMovement(balance: StockBalance, movement: StockMovement, item: InventoryItem): StockBalance {
  const validation = validateStockMovement(item, movement);
  if (validation.length) throw new Error(`STOCK_MOVEMENT_INVALID:${validation.join(",")}`);
  if (balance.itemId !== movement.itemId || balance.warehouseId !== movement.warehouseId) throw new Error("STOCK_BALANCE_SCOPE_MISMATCH");
  if (!Number.isSafeInteger(balance.quantity) || balance.quantity < 0 || !Number.isSafeInteger(balance.averageCostMinor) || balance.averageCostMinor < 0) throw new Error("STOCK_BALANCE_INVALID");
  const sign = movement.kind === "receipt" || movement.kind === "transfer_in" || movement.kind === "adjustment_in" ? 1 : -1;
  const nextQuantity = balance.quantity + sign * movement.quantity;
  if (nextQuantity < 0) throw new Error("INVENTORY_INSUFFICIENT_STOCK");
  if (sign > 0) {
    const totalCost = balance.quantity * balance.averageCostMinor + movement.quantity * movement.unitCostMinor;
    return { ...balance, quantity: nextQuantity, averageCostMinor: nextQuantity ? Math.round(totalCost / nextQuantity) : 0 };
  }
  return { ...balance, quantity: nextQuantity };
}
export function isBelowReorderPoint(item: InventoryItem, balance: StockBalance): boolean {
  return item.trackQuantity && balance.quantity <= item.reorderPoint;
}
export type AssetStatus = "active" | "under_maintenance" | "disposed" | "lost";
export type AssetRecord = { id: string; description: string; acquisitionCostMinor: number; residualValueMinor: number; usefulLifeMonths: number; accumulatedDepreciationMinor: number; status: AssetStatus };
export function monthlyStraightLineDepreciation(asset: AssetRecord): number {
  if (asset.status === "disposed" || asset.status === "lost") return 0;
  if (!Number.isSafeInteger(asset.acquisitionCostMinor) || asset.acquisitionCostMinor < 0 || !Number.isSafeInteger(asset.residualValueMinor) || asset.residualValueMinor < 0 || asset.residualValueMinor > asset.acquisitionCostMinor || !Number.isSafeInteger(asset.usefulLifeMonths) || asset.usefulLifeMonths <= 0 || !Number.isSafeInteger(asset.accumulatedDepreciationMinor) || asset.accumulatedDepreciationMinor < 0 || asset.accumulatedDepreciationMinor > asset.acquisitionCostMinor - asset.residualValueMinor) throw new Error("ASSET_DEPRECIATION_PARAMETERS_INVALID");
  const depreciable = asset.acquisitionCostMinor - asset.residualValueMinor;
  const remaining = depreciable - asset.accumulatedDepreciationMinor;
  return Math.max(0, Math.min(Math.round(depreciable / asset.usefulLifeMonths), remaining));
}
