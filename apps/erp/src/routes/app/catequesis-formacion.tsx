import { createFileRoute } from "@tanstack/react-router";
import { FormationScreen } from "@/components/modules/formation-screen";

export const Route = createFileRoute("/app/catequesis-formacion")({
  component: FormationScreen,
});
