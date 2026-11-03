import { createFileRoute } from "@tanstack/react-router";
import { ProcurementScreen } from "@/components/modules/procurement-screen";

export const Route = createFileRoute("/app/compras-obligaciones")({
  component: ProcurementScreen,
});
