import { createFileRoute } from "@tanstack/react-router";
import { SupportAreaScreen } from "../../components/support-area-screen";

export const Route = createFileRoute("/soporte/diagnostico-postgresql")({
  component: () => <SupportAreaScreen area="diagnostico-postgresql" />,
});
