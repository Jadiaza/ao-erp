import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalAdministrationScreen } from "@/components/modules/institutional-administration-screen";

export const Route = createFileRoute("/app/administracion-institucional")({
  component: InstitutionalAdministrationScreen,
});
