import { createFileRoute } from "@tanstack/react-router";
import { PastoralCareScreen } from "@/components/modules/pastoral-care-screen";

export const Route = createFileRoute("/app/acompanamiento-pastoral")({
  component: PastoralCareScreen,
});