import { describe, expect, it } from "vitest";
import { addMoney, assertTransition, canTransition, isIsoCalendarDate, money, subtractMoney, type StateTransition } from "./primitives";

describe("A&O ERP · primitives de dominio", () => {
  it("opera importes enteros y conserva moneda", () => {
    expect(addMoney(money(10000), money(2500))).toEqual({ amountMinor: 12500, currency: "COP" });
    expect(subtractMoney(money(10000), money(2500))).toEqual({ amountMinor: 7500, currency: "COP" });
  });
  it("rechaza importes inseguros y monedas diferentes", () => {
    expect(() => money(1.25)).toThrow("AO_MONEY_AMOUNT_MUST_BE_SAFE_INTEGER");
    expect(() => addMoney(money(100, "COP"), money(100, "USD"))).toThrow("AO_MONEY_CURRENCY_MISMATCH");
  });
  it("valida fechas reales y no acepta desbordamientos", () => {
    expect(isIsoCalendarDate("2026-11-05")).toBe(true);
    expect(isIsoCalendarDate("2026-02-31")).toBe(false);
  });
  it("aplica transiciones explícitas de estado", () => {
    const transitions: StateTransition<"draft" | "approved" | "cancelled">[] = [
      { from: "draft", to: "approved" },
      { from: "draft", to: "cancelled" },
    ];
    expect(canTransition("draft", "approved", transitions)).toBe(true);
    expect(canTransition("approved", "draft", transitions)).toBe(false);
    expect(() => assertTransition("approved", "draft", transitions, "voucher")).toThrow("AO_INVALID_STATE_TRANSITION");
  });
});
