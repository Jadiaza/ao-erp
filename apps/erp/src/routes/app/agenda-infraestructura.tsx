import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalAgendaScreen } from "@/components/modules/institutional-agenda-screen";

export const Route = createFileRoute("/app/agenda-infraestructura")({
  component: InstitutionalAgendaScreen,
});
