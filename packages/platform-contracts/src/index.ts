/**
 * Contratos mínimos de interoperabilidad entre productos A&O.
 *
 * Estos contratos no comparten permisos ni datos de negocio. Cada producto
 * conserva su propio modelo de autorización y valida el contexto en servidor.
 */

export type AoProduct = "erp" | "saas" | "diocesano";

export type AoActorType = "user" | "service";

export interface AoRequestContext {
  readonly requestId: string;
  readonly product: AoProduct;
  readonly actorId: string;
  readonly actorType: AoActorType;
  readonly organizationId: string;
  readonly institutionId?: string;
  readonly occurredAt: string;
}

export interface AoIntegrationEnvelope<TPayload> {
  readonly id: string;
  readonly sourceProduct: AoProduct;
  readonly targetProduct: AoProduct;
  readonly eventType: string;
  readonly schemaVersion: 1;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly payload: TPayload;
}

export interface AoIntegrationAcknowledgement {
  readonly accepted: boolean;
  readonly eventId: string;
  readonly receivedAt: string;
  readonly rejectionCode?: string;
}

export interface AoHealthStatus {
  readonly product: AoProduct;
  readonly status: "ok" | "degraded" | "unavailable";
  readonly checkedAt: string;
  readonly version: string;
}

const products: readonly AoProduct[] = ["erp", "saas", "diocesano"];

export function isAoProduct(value: unknown): value is AoProduct {
  return typeof value === "string" && products.includes(value as AoProduct);
}

/**
 * Rechaza sobrescrituras de contexto desde payloads de cliente.
 * La aplicación receptora debe construir este contexto a partir de la sesión
 * autenticada y de la autorización del servidor, nunca confiar en el navegador.
 */
export function assertTrustedRequestContext(
  context: AoRequestContext,
): void {
  if (!context.requestId.trim()) throw new Error("AO_CONTEXT_REQUEST_ID_REQUIRED");
  if (!context.actorId.trim()) throw new Error("AO_CONTEXT_ACTOR_REQUIRED");
  if (!context.organizationId.trim()) {
    throw new Error("AO_CONTEXT_ORGANIZATION_REQUIRED");
  }
  if (!isAoProduct(context.product)) throw new Error("AO_CONTEXT_PRODUCT_INVALID");
  if (context.institutionId !== undefined && !context.institutionId.trim()) {
    throw new Error("AO_CONTEXT_INSTITUTION_INVALID");
  }
  if (Number.isNaN(Date.parse(context.occurredAt))) {
    throw new Error("AO_CONTEXT_TIMESTAMP_INVALID");
  }
}
