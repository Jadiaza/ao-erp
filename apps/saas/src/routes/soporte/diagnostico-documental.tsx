import { createFileRoute } from "@tanstack/react-router";
import { SupportAreaScreen } from "../../components/support-area-screen";

export const Route = createFileRoute("/soporte/diagnostico-documental")({
  component: () => <SupportAreaScreen area="diagnostico-documental" />,
});
