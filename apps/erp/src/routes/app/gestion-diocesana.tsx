import { createFileRoute } from "@tanstack/react-router";
import { DiocesanManagementScreen } from "@/components/modules/diocesan-management-screen";

export const Route = createFileRoute("/app/gestion-diocesana")({
  component: DiocesanManagementScreen,
});
