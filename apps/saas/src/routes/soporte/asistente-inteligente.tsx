import { createFileRoute } from "@tanstack/react-router";
import { SupportAreaScreen } from "../../components/support-area-screen";

export const Route = createFileRoute("/soporte/asistente-inteligente")({
  component: () => <SupportAreaScreen area="asistente-inteligente" />,
});
