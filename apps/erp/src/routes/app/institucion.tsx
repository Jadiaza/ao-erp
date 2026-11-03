import { createFileRoute } from "@tanstack/react-router";
import { InstitutionScreen } from "@/components/modules/institution-screen";

export const Route = createFileRoute("/app/institucion")({
  component: InstitutionScreen,
});
