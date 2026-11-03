import { createFileRoute } from "@tanstack/react-router";
import { SacramentalScreen } from "@/components/modules/sacramental-screen";

export const Route = createFileRoute("/app/gestion-sacramental")({
  component: SacramentalScreen,
});
