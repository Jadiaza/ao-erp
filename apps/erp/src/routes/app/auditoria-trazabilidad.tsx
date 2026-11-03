import { createFileRoute } from "@tanstack/react-router";
import { AuditTrailScreen } from "@/components/modules/audit-trail-screen";

export const Route = createFileRoute("/app/auditoria-trazabilidad")({
  component: AuditTrailScreen,
});
