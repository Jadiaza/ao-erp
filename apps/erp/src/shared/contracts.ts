/** Contratos internos de contexto y eventos de A&O ERP. */
export type AoActorType = "user" | "service";
export interface AoRequestContext {
  readonly requestId: string;
  readonly actorId: string;
  readonly actorType: AoActorType;
  readonly organizationId: string;
  readonly institutionId?: string;
  readonly occurredAt: string;
}
export interface AoIntegrationEnvelope<TPayload> {
  readonly id: string;
  readonly eventType: string;
  readonly schemaVersion: 1;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly payload: TPayload;
}
export function assertTrustedRequestContext(context: AoRequestContext): void {
  if (!context.requestId.trim()) throw new Error("AO_CONTEXT_REQUEST_ID_REQUIRED");
  if (!context.actorId.trim()) throw new Error("AO_CONTEXT_ACTOR_REQUIRED");
  if (!context.organizationId.trim()) throw new Error("AO_CONTEXT_ORGANIZATION_REQUIRED");
  if (context.institutionId !== undefined && !context.institutionId.trim()) throw new Error("AO_CONTEXT_INSTITUTION_INVALID");
  if (Number.isNaN(Date.parse(context.occurredAt))) throw new Error("AO_CONTEXT_TIMESTAMP_INVALID");
}
