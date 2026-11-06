import { createFileRoute } from "@tanstack/react-router";
import { SupportAreaScreen } from "../../components/support-area-screen";

export const Route = createFileRoute("/soporte/sesiones-asistencia")({
  component: () => <SupportAreaScreen area="sesiones-asistencia" />,
});
