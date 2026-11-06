import { createFileRoute } from "@tanstack/react-router";
import { SupportAreaScreen } from "../../components/support-area-screen";

export const Route = createFileRoute("/soporte/indicadores-soporte")({
  component: () => <SupportAreaScreen area="indicadores-soporte" />,
});
