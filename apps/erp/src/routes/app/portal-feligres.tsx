import { createFileRoute } from "@tanstack/react-router";
import { ParishionerPortalScreen } from "@/components/modules/parishioner-portal-screen";

export const Route = createFileRoute("/app/portal-feligres")({
  component: ParishionerPortalScreen,
});
