import { describe, expect, it } from "vitest";
import { calculateFundBalance, validateFund, type Fund, type FundMovement } from "./funds";
import { approvePayable, registerPayablePayment, type Payable } from "./payables";
import { issueReceivable, registerCollection, type Receivable } from "./receivables";
describe("fondos, cuentas por pagar y cobrar", () => {
  it("controla restricciones y saldo de fondos", () => {
    const fund: Fund = { id: "f1", code: "DON-01", name: "Obra social", restriction: "purpose_restricted", purpose: "Ayuda alimentaria", status: "active" };
    const movements: FundMovement[] = [{ id: "m1", fundId: "f1", direction: "credit", amountMinor: 50000, date: "2026-11-05", sourceType: "donation", sourceId: "d1", description: "Donación" }];
    expect(validateFund(fund)).toEqual([]);
    expect(calculateFundBalance(fund, movements)).toBe(50000);
  });
  it("no permite pagar más de la obligación aprobada", () => {
    const payable: Payable = { id: "p1", supplierId: "s1", invoiceNumber: "F-1", issueDate: "2026-11-01", dueDate: "2026-11-30", currency: "COP", totalMinor: 10000, paidMinor: 0, status: "draft" };
    const approved = approvePayable(payable);
    expect(registerPayablePayment(approved, { id: "pay1", payableId: "p1", amountMinor: 10000, paidOn: "2026-11-05", cashMovementId: "cash1", reference: "Pago" }).payable.status).toBe("paid");
    expect(() => registerPayablePayment(approved, { id: "pay2", payableId: "p1", amountMinor: 11000, paidOn: "2026-11-05", cashMovementId: "cash2", reference: "Pago" })).toThrow("PAYABLE_PAYMENT_AMOUNT_INVALID");
  });
  it("registra recaudos sin exceder el saldo por cobrar", () => {
    const item: Receivable = { id: "r1", debtorId: "d1", concept: "Servicio", issueDate: "2026-11-01", dueDate: "2026-11-30", currency: "COP", totalMinor: 8000, collectedMinor: 0, status: "draft", sourceType: "service" };
    const issued = issueReceivable(item);
    expect(registerCollection(issued, { id: "c1", receivableId: "r1", amountMinor: 8000, collectedOn: "2026-11-05", cashMovementId: "cash1", reference: "Recibo" }).status).toBe("collected");
  });
});
