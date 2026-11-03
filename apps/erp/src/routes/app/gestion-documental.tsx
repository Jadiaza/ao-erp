import { createFileRoute } from "@tanstack/react-router";
import { DocumentManagementScreen } from "@/components/modules/document-management-screen";

export const Route = createFileRoute("/app/gestion-documental")({
  component: DocumentManagementScreen,
});
