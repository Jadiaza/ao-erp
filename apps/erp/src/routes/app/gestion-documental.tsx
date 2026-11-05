import { createFileRoute } from "@tanstack/react-router";
import { ArchiveManagementScreen } from "@/components/modules/archive-management-screen";

export const Route = createFileRoute("/app/gestion-documental")({
  component: ArchiveManagementScreen,
});
