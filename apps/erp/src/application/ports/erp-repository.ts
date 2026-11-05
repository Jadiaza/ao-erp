/**
 * Puerto de persistencia de A&O ERP.
 * Los casos de uso dependen de este contrato, nunca de localStorage ni del driver SQL.
 * El adaptador PostgreSQL futuro debe implementar transacciones atómicas y tenant scope.
 */
export type TenantScope = {
  organizationId: string;
  accountingEntityId: string;
  actorId: string;
  correlationId: string;
};

export type SourceReference = {
  sourceModule: string;
  sourceId: string;
};

export type WorkflowCommand =
  | { type: "purchase.approve"; purchaseId: string; expectedVersion: number }
  | { type: "purchase.receive"; purchaseId: string; receiptId: string; lines: { purchaseLineId: string; quantity: number }[]; warehouseId: string; receivedOn: string; expectedVersion: number }
  | { type: "supplier-invoice.register"; purchaseId: string; payableId: string; invoiceNumber: string; issueDate: string; dueDate: string; currency: string; allocations: { purchaseLineId: string; amountMinor: number }[]; expectedVersion: number }
  | { type: "payable.pay"; payableId: string; paymentId: string; cashMovementId: string; amountMinor: number; paidOn: string; reference: string; expectedVersion: number }
  | { type: "accounting.voucher.propose"; source: SourceReference; voucherId: string; periodId: string; accountMapping: { debitAccountId: string; creditAccountId: string } };

export type WorkflowResult<T = unknown> = {
  value: T;
  created: SourceReference[];
  auditEventIds: string[];
  idempotencyKey: string;
};

export type OperationalSnapshot = {
  purchases: unknown[];
  inventoryMovements: unknown[];
  payables: unknown[];
  cashMovements: unknown[];
  vouchers: unknown[];
  budgetExecutions: unknown[];
  documents: unknown[];
  auditEvents: unknown[];
};

export interface ErpUnitOfWork {
  execute<T>(command: WorkflowCommand, scope: TenantScope): Promise<WorkflowResult<T>>;
}

export interface ErpRepository {
  /** Carga un snapshot consistente y aislado por organización/entidad. */
  getOperationalSnapshot(scope: TenantScope): Promise<OperationalSnapshot>;
  /** Ejecuta el caso de uso en una transacción SQL; idempotencyKey evita dobles registros. */
  execute<T>(command: WorkflowCommand, scope: TenantScope, idempotencyKey: string): Promise<WorkflowResult<T>>;
  /** Recupera un flujo por cualquiera de sus referencias de origen. */
  getRelatedRecords(source: SourceReference, scope: TenantScope): Promise<OperationalSnapshot>;
}
