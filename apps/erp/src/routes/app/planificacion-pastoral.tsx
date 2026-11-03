import { createFileRoute } from "@tanstack/react-router";
import { PastoralPlanningScreen } from "@/components/modules/pastoral-planning-screen";

export const Route = createFileRoute("/app/planificacion-pastoral")({
  component: PastoralPlanningScreen,
});
